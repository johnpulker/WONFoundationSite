import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabaseAdmin'
import { 
  validateAdminSession, 
  logAdminAction,
  getClientIP 
} from '@/lib/adminSessionServer'
import { sendMembershipConfirmationEmail, sendAdminMembershipNotificationEmail } from '@/lib/emails'

/**
 * Calculate membership end date based on registration date
 * - If registered in first 6 months (Jan-Jun), expire on June 30th of the following year
 * - Otherwise, expire exactly one year from registration date
 */
function calculateMembershipEndDate(startDate: Date): Date {
  const month = startDate.getMonth(); // 0-11 (Jan = 0, Jun = 5)
  const endDate = new Date(startDate);
  
  // Set time to midnight to avoid timezone issues
  endDate.setHours(0, 0, 0, 0);
  
  if (month <= 5) {
    // Registered in Jan-Jun: expire on June 30th of the following year
    // Set date to 1 first to avoid month rollover issues (e.g., Jan 31 -> June 30)
    endDate.setDate(1);
    endDate.setFullYear(startDate.getFullYear() + 1);
    endDate.setMonth(5); // June (0-indexed)
    endDate.setDate(30);
  } else {
    // Registered in Jul-Dec: expire exactly one year from registration
    endDate.setFullYear(startDate.getFullYear() + 1);
  }
  
  return endDate;
}

const membershipPrices: Record<string, number> = {
  'General': 35,
  'Sustaining': 100,
  'Youth': 10,
}

// Helper to check admin session (server-side validation)
async function checkAdminAuth(request: NextRequest): Promise<{ 
  valid: boolean; 
  sessionId?: string 
}> {
  return await validateAdminSession(request)
}

// GET - Fetch all members
export async function GET(request: NextRequest) {
  try {
    const auth = await checkAdminAuth(request)
    if (!auth.valid) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Log access to sensitive member data (includes addresses) - database audit trail
    await logAdminAction(
      auth.sessionId,
      'VIEW',
      'members',
      null,
      request,
      true
    )

    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        email,
        full_name,
        first_name,
        last_name,
        profile_photo_url,
        role,
        created_at,
        notes,
        profile:profiles(
          phone,
          city,
          state,
          postal_code,
          address_line1,
          address_line2,
          job_title,
          organization,
          occupation,
          bio,
          show_in_directory,
          show_email_public,
          show_phone_public,
          linkedin_url,
          website_url
        ),
        memberships(
          level,
          status,
          start_date,
          end_date,
          is_complimentary
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching members:', error)
      return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 })
    }

    // Transform profile and membership from array to single object
    const transformedData = (data || []).map((member: any) => ({
      ...member,
      profile: Array.isArray(member.profile) ? member.profile[0] : member.profile,
      membership: Array.isArray(member.memberships) && member.memberships.length > 0
        ? member.memberships.sort((a: any, b: any) => 
            new Date(b.end_date).getTime() - new Date(a.end_date).getTime()
          )[0] // Get most recent membership
        : null
    }))

    return NextResponse.json({ members: transformedData })
  } catch (error) {
    console.error('Error in admin members GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update member details
export async function PUT(request: NextRequest) {
  try {
    const auth = await checkAdminAuth(request)
    if (!auth.valid) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    
    // Log modification of sensitive member data - database audit trail
    await logAdminAction(
      auth.sessionId,
      'UPDATE',
      'members',
      body.id,
      request,
      true,
      undefined,
      { 
        fields_updated: Object.keys(body).filter(k => k !== 'id'),
        member_id: body.id 
      }
    )
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Separate user and profile updates
    const userUpdates: any = {}
    const profileUpdates: any = {}

    // User table fields
    if (updateData.full_name !== undefined) userUpdates.full_name = updateData.full_name
    if (updateData.first_name !== undefined) userUpdates.first_name = updateData.first_name
    if (updateData.last_name !== undefined) userUpdates.last_name = updateData.last_name
    if (updateData.email !== undefined) userUpdates.email = updateData.email
    if (updateData.role !== undefined) userUpdates.role = updateData.role
    if (updateData.profile_photo_url !== undefined) userUpdates.profile_photo_url = updateData.profile_photo_url
    if (updateData.notes !== undefined) userUpdates.notes = updateData.notes || null

    // Profile table fields
    if (updateData.phone !== undefined) profileUpdates.phone = updateData.phone || null
    if (updateData.city !== undefined) profileUpdates.city = updateData.city || null
    if (updateData.state !== undefined) profileUpdates.state = updateData.state || null
    if (updateData.postal_code !== undefined) profileUpdates.postal_code = updateData.postal_code || null
    if (updateData.address_line1 !== undefined) profileUpdates.address_line1 = updateData.address_line1 || null
    if (updateData.address_line2 !== undefined) profileUpdates.address_line2 = updateData.address_line2 || null
    if (updateData.job_title !== undefined) profileUpdates.job_title = updateData.job_title || null
    if (updateData.organization !== undefined) profileUpdates.organization = updateData.organization || null
    if (updateData.occupation !== undefined) profileUpdates.occupation = updateData.occupation || null
    if (updateData.bio !== undefined) profileUpdates.bio = updateData.bio || null
    if (updateData.show_in_directory !== undefined) profileUpdates.show_in_directory = updateData.show_in_directory
    if (updateData.show_email_public !== undefined) profileUpdates.show_email_public = updateData.show_email_public
    if (updateData.show_phone_public !== undefined) profileUpdates.show_phone_public = updateData.show_phone_public
    if (updateData.linkedin_url !== undefined) profileUpdates.linkedin_url = updateData.linkedin_url || null
    if (updateData.website_url !== undefined) profileUpdates.website_url = updateData.website_url || null

    // Update user table if there are user fields to update
    if (Object.keys(userUpdates).length > 0) {
      userUpdates.updated_at = new Date().toISOString()
      const { error: userError } = await supabase
        .from('users')
        .update(userUpdates)
        .eq('id', id)

      if (userError) {
        console.error('Error updating user:', userError)
        return NextResponse.json({ error: userError.message }, { status: 500 })
      }
    }

    // Update or insert profile
    if (Object.keys(profileUpdates).length > 0) {
      profileUpdates.updated_at = new Date().toISOString()
      
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', id)
        .single()

      if (existingProfile) {
        // Update existing profile
        const { error: profileError } = await supabase
          .from('profiles')
          .update(profileUpdates)
          .eq('id', id)

        if (profileError) {
          console.error('Error updating profile:', profileError)
          return NextResponse.json({ error: profileError.message }, { status: 500 })
        }
      } else {
        // Insert new profile
        profileUpdates.id = id
        const { error: profileError } = await supabase
          .from('profiles')
          .insert(profileUpdates)

        if (profileError) {
          console.error('Error creating profile:', profileError)
          return NextResponse.json({ error: profileError.message }, { status: 500 })
        }
      }
    }

    // Handle membership updates
    if (updateData.membership_level !== undefined || updateData.is_complimentary !== undefined || updateData.membership_expiration_year !== undefined) {
      // Get the most recent membership (active or pending) to update
      const { data: existingMemberships } = await supabase
        .from('memberships')
        .select('id, level, status, is_complimentary, start_date, end_date')
        .eq('user_id', id)
        .in('status', ['active', 'pending'])
        .order('end_date', { ascending: false })
        .limit(1)

      if (updateData.membership_level === '') {
        // Remove membership (set status to expired)
        if (existingMemberships && existingMemberships.length > 0) {
          await supabase
            .from('memberships')
            .update({ status: 'expired' })
            .eq('id', existingMemberships[0].id)
        }
      } else if (updateData.membership_level && ['General', 'Sustaining', 'Youth'].includes(updateData.membership_level)) {
        // Calculate end date: use selected year if provided, otherwise auto-calculate
        let endDate: Date
        if (updateData.membership_expiration_year && !isNaN(parseInt(updateData.membership_expiration_year))) {
          // Use selected year - set to June 30 of that year
          const selectedYear = parseInt(updateData.membership_expiration_year)
          endDate = new Date(selectedYear, 5, 30) // June 30 (month is 0-indexed)
        } else {
          // Auto-calculate based on registration date
          const startDate = new Date()
          endDate = calculateMembershipEndDate(startDate)
        }
        
        // Update or create membership
        if (existingMemberships && existingMemberships.length > 0) {
          // Update existing membership
          const membershipUpdates: any = {
            level: updateData.membership_level,
            updated_at: new Date().toISOString(),
          }
          if (updateData.is_complimentary !== undefined) {
            membershipUpdates.is_complimentary = updateData.is_complimentary
          }
          if (updateData.membership_expiration_year !== undefined && updateData.membership_expiration_year !== '') {
            membershipUpdates.end_date = endDate.toISOString().split('T')[0]
          }
          const { error: updateError } = await supabase
            .from('memberships')
            .update(membershipUpdates)
            .eq('id', existingMemberships[0].id)
          
          if (updateError) {
            console.error('Error updating membership:', updateError)
            return NextResponse.json({ error: `Failed to update membership: ${updateError.message}` }, { status: 500 })
          }

          // If is_complimentary was updated, also update the corresponding payment record(s)
          if (updateData.is_complimentary !== undefined) {
            // Update payments that match THIS specific membership (by date range)
            const membership = existingMemberships[0]
            
            // Get the membership's date range to match payments precisely
            const { data: membershipWithDates } = await supabase
              .from('memberships')
              .select('start_date, end_date, created_at')
              .eq('id', membership.id)
              .single()
            
            if (membershipWithDates) {
              const membershipStart = new Date(membershipWithDates.start_date || membershipWithDates.created_at)
              const membershipEnd = new Date(membershipWithDates.end_date || new Date())
              membershipEnd.setHours(23, 59, 59, 999)
              
              // Use a flexible date range: 7 days before membership start to membership end
              // This catches payments created slightly before the membership
              const sevenDaysBefore = new Date(membershipStart)
              sevenDaysBefore.setDate(sevenDaysBefore.getDate() - 7)
              
              // Update payments that match this specific membership
              const { data: updatedPayments, error: paymentUpdateError } = await supabase
                .from('payments')
                .update({ 
                  is_complimentary: updateData.is_complimentary,
                  updated_at: new Date().toISOString()
                })
                .eq('user_id', id)
                .eq('type', 'membership')
                .eq('membership_level', membership.level)
                .gte('created_at', sevenDaysBefore.toISOString())
                .lte('created_at', membershipEnd.toISOString())
                .select('id')
              
              if (paymentUpdateError) {
                console.error('Error updating payment complimentary status:', paymentUpdateError)
                // Don't fail the whole request, but log it
              } else {
                console.log(`Updated ${updatedPayments?.length || 0} payment(s) complimentary status to ${updateData.is_complimentary} for user ${id}, level ${membership.level}, membership ${membership.id}`)
              }
            }
          }
        } else {
          // Create new membership
          const startDate = new Date()
          await supabase
            .from('memberships')
            .insert({
              user_id: id,
              level: updateData.membership_level,
              start_date: startDate.toISOString().split('T')[0],
              end_date: endDate.toISOString().split('T')[0],
              status: 'active',
              auto_renew: false,
              is_complimentary: updateData.is_complimentary || false,
            })
        }
      } else if (updateData.is_complimentary !== undefined && existingMemberships && existingMemberships.length > 0) {
        // Just update the complimentary flag
        const membership = existingMemberships[0]
        await supabase
          .from('memberships')
          .update({ 
            is_complimentary: updateData.is_complimentary,
            updated_at: new Date().toISOString(),
          })
          .eq('id', membership.id)

        // Also update the corresponding payment record(s)
        // Get the membership's date range to match payments to THIS specific membership
        const { data: membershipWithDates } = await supabase
          .from('memberships')
          .select('start_date, end_date, created_at')
          .eq('id', membership.id)
          .single()

        if (membershipWithDates) {
          const membershipStart = new Date(membershipWithDates.start_date || membershipWithDates.created_at)
          const membershipEnd = new Date(membershipWithDates.end_date || new Date())
          membershipEnd.setHours(23, 59, 59, 999)
          
          // Use a flexible date range: 7 days before membership start to membership end
          // This catches payments created slightly before the membership
          const sevenDaysBefore = new Date(membershipStart)
          sevenDaysBefore.setDate(sevenDaysBefore.getDate() - 7)
          
          // Update payments that match this specific membership
          const { data: updatedPayments, error: paymentUpdateError } = await supabase
            .from('payments')
            .update({ 
              is_complimentary: updateData.is_complimentary,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', id)
            .eq('type', 'membership')
            .eq('membership_level', membership.level)
            .gte('created_at', sevenDaysBefore.toISOString())
            .lte('created_at', membershipEnd.toISOString())
            .select('id')
          
          if (paymentUpdateError) {
            console.error('Error updating payment complimentary status:', paymentUpdateError)
            // Don't fail the whole request, but log it
          } else {
            console.log(`Updated ${updatedPayments?.length || 0} payment(s) complimentary status to ${updateData.is_complimentary} for user ${id}, level ${membership.level}, membership ${membership.id}`)
          }
        }
      } else if (updateData.membership_expiration_year !== undefined && existingMemberships && existingMemberships.length > 0) {
        // Just update the expiration year
        let endDate: Date
        if (updateData.membership_expiration_year && !isNaN(parseInt(updateData.membership_expiration_year))) {
          const selectedYear = parseInt(updateData.membership_expiration_year)
          endDate = new Date(selectedYear, 5, 30) // June 30
        } else {
          const startDate = new Date()
          endDate = calculateMembershipEndDate(startDate)
        }
        const { error: updateError } = await supabase
          .from('memberships')
          .update({ 
            end_date: endDate.toISOString().split('T')[0],
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingMemberships[0].id)
        
        if (updateError) {
          console.error('Error updating membership expiration:', updateError)
          return NextResponse.json({ error: `Failed to update membership expiration: ${updateError.message}` }, { status: 500 })
        }
      }
    }

    // Fetch updated member data
    const { data: updatedMember, error: fetchError } = await supabase
      .from('users')
      .select(`
        id,
        email,
        full_name,
        first_name,
        last_name,
        profile_photo_url,
        role,
        created_at,
        notes,
        profile:profiles(
          phone,
          city,
          state,
          postal_code,
          address_line1,
          address_line2,
          job_title,
          organization,
          occupation,
          bio,
          show_in_directory,
          show_email_public,
          show_phone_public,
          linkedin_url,
          website_url
        ),
        memberships(
          level,
          status,
          start_date,
          end_date,
          is_complimentary
        )
      `)
      .eq('id', id)
      .single()

    if (fetchError) {
      console.error('Error fetching updated member:', fetchError)
      return NextResponse.json({ error: 'Member updated but failed to fetch updated data' }, { status: 500 })
    }

    // Transform profile and membership from array to single object
    const transformedMember = {
      ...updatedMember,
      profile: Array.isArray(updatedMember.profile) ? updatedMember.profile[0] : updatedMember.profile,
      membership: Array.isArray(updatedMember.memberships) && updatedMember.memberships.length > 0
        ? updatedMember.memberships.sort((a: any, b: any) => 
            new Date(b.end_date).getTime() - new Date(a.end_date).getTime()
          )[0] // Get most recent membership
        : null
    }

    return NextResponse.json({ member: transformedMember })
  } catch (error) {
    console.error('Error in admin members PUT:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create a new member
export async function POST(request: NextRequest) {
  try {
    const auth = await checkAdminAuth(request)
    if (!auth.valid) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()

    // Validate required fields
    if (!body.email || !body.first_name || !body.last_name) {
      return NextResponse.json({ error: 'Email, first name, and last name are required' }, { status: 400 })
    }

    // Log creation of new member - database audit trail
    await logAdminAction(
      auth.sessionId,
      'CREATE',
      'members',
      null,
      request,
      true,
      undefined,
      { 
        email: body.email,
        full_name: `${body.first_name} ${body.last_name}`
      }
    )

    const supabase = createAdminClient()

    // Generate a temporary password (user will need to reset it)
    const tempPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12) + 'A1!'

    // Step 1: Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: body.email,
      password: tempPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: `${body.first_name} ${body.last_name}`,
        first_name: body.first_name,
        last_name: body.last_name,
      },
    })

    if (authError) {
      console.error('Auth error:', authError)
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    const userId = authData.user.id

    // Step 2: Create user record
    const { error: userError } = await supabase
      .from('users')
      .upsert({
        id: userId,
        email: body.email,
        full_name: `${body.first_name} ${body.last_name}`,
        first_name: body.first_name,
        last_name: body.last_name,
        role: body.role || 'member',
        notes: body.notes || null,
      })

    if (userError) {
      console.error('User record error:', userError)
      // Try to clean up auth user if user record creation fails
      await supabase.auth.admin.deleteUser(userId)
      return NextResponse.json({ error: userError.message }, { status: 500 })
    }

    // Step 3: Create profile if profile data provided
    if (body.phone || body.city || body.state || body.postal_code || body.address_line1) {
      const profileData: any = {
        id: userId,
        phone: body.phone || null,
        address_line1: body.address_line1 || null,
        address_line2: body.address_line2 || null,
        city: body.city || null,
        state: body.state || null,
        postal_code: body.postal_code || null,
        job_title: body.job_title || null,
        organization: body.organization || null,
        occupation: body.occupation || null,
        bio: body.bio || null,
        show_in_directory: body.show_in_directory ?? true,
        show_email_public: body.show_email_public ?? false,
        show_phone_public: body.show_phone_public ?? false,
        linkedin_url: body.linkedin_url || null,
        website_url: body.website_url || null,
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(profileData)

      if (profileError) {
        console.error('Profile error:', profileError)
        // Don't fail - profile is optional
      }
    }

    // Step 4: Create membership if membership level provided
    let membershipCreated = false
    if (body.membership_level && ['General', 'Sustaining', 'Youth'].includes(body.membership_level)) {
      const startDate = new Date()
      
      // Calculate end date: use selected year if provided, otherwise auto-calculate
      let endDate: Date
      if (body.membership_expiration_year && !isNaN(parseInt(body.membership_expiration_year))) {
        // Use selected year - set to June 30 of that year
        const selectedYear = parseInt(body.membership_expiration_year)
        endDate = new Date(selectedYear, 5, 30) // June 30 (month is 0-indexed)
      } else {
        // Auto-calculate based on registration date
        endDate = calculateMembershipEndDate(startDate)
      }
      
      const membershipPrice = membershipPrices[body.membership_level] || 0

      const { error: membershipError } = await supabase
        .from('memberships')
        .insert({
          user_id: userId,
          level: body.membership_level,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          status: 'active',
          auto_renew: false,
          is_complimentary: body.is_complimentary || false,
        })

      if (membershipError) {
        console.error('Membership creation error:', membershipError)
        // Don't fail the whole request, but log it
      } else {
        membershipCreated = true
        
        // Create payment record for admin tracking (so it shows up in Payments view)
        const paymentAmount = body.is_complimentary ? 0 : membershipPrice
        const adminOrderId = `ADMIN-${userId.substring(0, 8).toUpperCase()}-${Date.now()}`
        
        const { error: paymentError } = await supabase
          .from('payments')
          .insert({
            user_id: userId,
            amount: paymentAmount,
            status: 'completed',
            provider: 'admin',
            provider_tx_id: adminOrderId,
            type: 'membership',
            membership_level: body.membership_level,
            is_complimentary: body.is_complimentary || false,
          })
        
        if (paymentError) {
          console.error('Payment record creation error:', paymentError)
          // Don't fail the whole request, but log it
        }
      }
    }

    // Fetch the created member
    const { data: newMember, error: fetchError } = await supabase
      .from('users')
      .select(`
        id,
        email,
        full_name,
        first_name,
        last_name,
        profile_photo_url,
        role,
        created_at,
        notes,
        profile:profiles(
          phone,
          city,
          state,
          postal_code,
          address_line1,
          address_line2,
          job_title,
          organization,
          occupation,
          bio,
          show_in_directory,
          show_email_public,
          show_phone_public,
          linkedin_url,
          website_url
        ),
        memberships(
          level,
          status,
          start_date,
          end_date,
          is_complimentary
        )
      `)
      .eq('id', userId)
      .single()

    if (fetchError) {
      console.error('Error fetching new member:', fetchError)
      return NextResponse.json({ error: 'Member created but failed to fetch data' }, { status: 500 })
    }

    // Transform profile and membership from array to single object
    const transformedMember = {
      ...newMember,
      profile: Array.isArray(newMember.profile) ? newMember.profile[0] : newMember.profile,
      membership: Array.isArray(newMember.memberships) && newMember.memberships.length > 0
        ? newMember.memberships.sort((a: any, b: any) => 
            new Date(b.end_date).getTime() - new Date(a.end_date).getTime()
          )[0] // Get most recent membership
        : null
    }

    // Step 5: Send welcome email if membership was created and not skipped
    if (membershipCreated && body.membership_level && !body.skip_welcome_email) {
      const transactionDate = new Date()
      const startDate = new Date()
      const endDate = calculateMembershipEndDate(startDate)
      // Set price to 0 for complimentary memberships
      const membershipPrice = body.is_complimentary ? 0 : (membershipPrices[body.membership_level] || 0)
      const orderId = `ADMIN-${userId.substring(0, 8).toUpperCase()}-${Date.now()}`

      // Send emails (non-blocking)
      Promise.all([
        sendMembershipConfirmationEmail({
          firstName: body.first_name,
          lastName: body.last_name,
          email: body.email,
          membershipLevel: body.membership_level as 'General' | 'Sustaining' | 'Youth',
          membershipPrice: membershipPrice,
          orderId: orderId,
          transactionDate: transactionDate,
          endDate: endDate.toISOString().split('T')[0],
        }),
        sendAdminMembershipNotificationEmail({
          firstName: body.first_name,
          lastName: body.last_name,
          email: body.email,
          membershipLevel: body.membership_level as 'General' | 'Sustaining' | 'Youth',
          membershipPrice: membershipPrice,
          orderId: orderId,
          transactionDate: transactionDate,
          endDate: endDate.toISOString().split('T')[0],
        }),
      ]).catch((error) => {
        console.error('Email sending error:', error)
        // Don't fail the request if emails fail
      })
    }

    const welcomeEmailMessage = body.skip_welcome_email 
      ? ' (Welcome email skipped)'
      : membershipCreated 
        ? ' A welcome email has been sent.'
        : ''

    return NextResponse.json({ 
      member: transformedMember,
      message: membershipCreated 
        ? `Member created successfully with active membership.${welcomeEmailMessage} A temporary password has been generated. The user should reset their password on first login.`
        : `Member created successfully.${welcomeEmailMessage} A temporary password has been generated. The user should reset their password on first login.`
    })
  } catch (error) {
    console.error('Error in admin members POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete a member
export async function DELETE(request: NextRequest) {
  try {
    const auth = await checkAdminAuth(request)
    if (!auth.valid) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('id')

    if (!memberId) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 })
    }

    // Log deletion of member - database audit trail
    await logAdminAction(
      auth.sessionId,
      'DELETE',
      'members',
      memberId,
      request,
      true,
      undefined,
      { member_id: memberId }
    )

    const supabase = createAdminClient()

    // Fetch member details before deletion for logging
    const { data: memberData } = await supabase
      .from('users')
      .select('email, full_name')
      .eq('id', memberId)
      .single()

    // Delete auth user (this will cascade delete user record via trigger)
    const { error: authError } = await supabase.auth.admin.deleteUser(memberId)

    if (authError) {
      console.error('Error deleting auth user:', authError)
      // Try to delete user record directly if auth deletion fails
      const { error: userError } = await supabase
        .from('users')
        .delete()
        .eq('id', memberId)

      if (userError) {
        console.error('Error deleting user record:', userError)
        return NextResponse.json({ error: 'Failed to delete member' }, { status: 500 })
      }
    }

    // Delete profile if it exists
    await supabase
      .from('profiles')
      .delete()
      .eq('id', memberId)

    return NextResponse.json({ 
      success: true,
      message: `Member ${memberData?.full_name || memberData?.email || memberId} deleted successfully`
    })
  } catch (error) {
    console.error('Error in admin members DELETE:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
