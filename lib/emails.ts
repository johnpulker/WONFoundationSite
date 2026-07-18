import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = process.env.FROM_EMAIL || 'events@mydomain.com'
const ORGANIZER_EMAIL = process.env.ORGANIZER_EMAIL || 'organizer@mydomain.com'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'administrator@wonfoundation.net'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

interface Event {
  id: string
  name: string
  date: string
  venue_name?: string | null
  venue_address?: string | null
  city?: string | null
  state?: string | null
  postal_code?: string | null
  notes?: string | null
}

interface Registration {
  id: string
  full_name: string
  email: string
  phone?: string | null
  tickets: number
  payment_status: string
  payment_id?: string | null
}

/**
 * Send confirmation email to user after registration
 */
export async function sendUserConfirmationEmail(
  registration: Registration,
  event: Event,
  isPaid: boolean,
  orderId?: string
): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set, skipping email send')
    return
  }

  if (!FROM_EMAIL || FROM_EMAIL === 'events@mydomain.com') {
    console.error('FROM_EMAIL not properly configured:', FROM_EMAIL)
    console.error('Cannot send user confirmation email - FROM_EMAIL is missing or invalid')
    return
  }

  // Parse event date - handle timestamps with proper timezone conversion
  // Event dates are stored as timestamptz, so they should include timezone info
  const eventDate = new Date(event.date)
  
  // Ensure we're working with a valid date
  if (isNaN(eventDate.getTime())) {
    console.error('Invalid event date:', event.date)
    throw new Error('Invalid event date format')
  }
  
  // Format date and time in US Eastern time
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/New_York',
  })
  const formattedTime = eventDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
    timeZone: 'America/New_York',
  })

  const venueLines = [
    event.venue_name,
    event.venue_address,
    [event.city, event.state, event.postal_code].filter(Boolean).join(', '),
  ].filter(Boolean)

  const venueInfoText = venueLines.join('\n')
  const venueInfoHtml = venueLines.map(l => `<div>${l}</div>`).join('')

  const paymentInfoText = isPaid && orderId
    ? `Payment Status: Paid via PayPal\nOrder ID: ${orderId}`
    : 'This is a free event. No payment required.'

  const paymentInfoHtml = isPaid && orderId
    ? `<tr><td style="padding:8px 0;color:#6b7280;">Payment Status:</td><td style="padding:8px 0;font-weight:bold;">Paid via PayPal</td></tr>
       <tr><td style="padding:8px 0;color:#6b7280;">Order ID:</td><td style="padding:8px 0;font-weight:bold;">${orderId}</td></tr>`
    : `<tr><td colspan="2" style="padding:8px 0;color:#6b7280;">This is a free event. No payment required.</td></tr>`

  const siteUrl = SITE_URL || 'https://wonfoundation.net'

  const htmlContent = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f9fafb; line-height: 1.6; color: #374151;">
    <div style="max-width: 700px; margin: 0 auto; padding: 20px;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #871c1c 0%, #a02323 100%); padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="color: #E7C418; margin: 0; font-size: 28px; font-weight: bold;">
          Women Officials Network Foundation
        </h1>
      </div>

      <!-- Main Content -->
      <div style="background: white; padding: 40px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <p style="font-size: 16px; margin: 0 0 20px 0;">
          Dear ${registration.full_name},
        </p>

        <p style="font-size: 16px; margin: 0 0 20px 0;">
          Thank you for registering for <strong>${event.name}</strong>! We look forward to seeing you at the event.
        </p>

        <!-- Event Details -->
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
          <h2 style="font-size: 18px; font-weight: bold; margin: 0 0 15px 0; color: #1f2937;">Event Details:</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280; width: 40%;">Event:</td>
              <td style="padding: 8px 0; font-weight: bold;">${event.name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Date &amp; Time:</td>
              <td style="padding: 8px 0; font-weight: bold;">${formattedDate} at ${formattedTime}</td>
            </tr>
            ${venueLines.length > 0 ? `<tr>
              <td style="padding: 8px 0; color: #6b7280; vertical-align: top;">Venue:</td>
              <td style="padding: 8px 0; font-weight: bold;">${venueInfoHtml}</td>
            </tr>` : ''}
          </table>
        </div>

        <!-- Registration Details -->
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
          <h2 style="font-size: 18px; font-weight: bold; margin: 0 0 15px 0; color: #1f2937;">Registration Details:</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280; width: 40%;">Tickets:</td>
              <td style="padding: 8px 0; font-weight: bold;">${registration.tickets}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Email:</td>
              <td style="padding: 8px 0; font-weight: bold;">${registration.email}</td>
            </tr>
            ${registration.phone ? `<tr>
              <td style="padding: 8px 0; color: #6b7280;">Phone:</td>
              <td style="padding: 8px 0; font-weight: bold;">${registration.phone}</td>
            </tr>` : ''}
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Registration ID:</td>
              <td style="padding: 8px 0; font-weight: bold;">${registration.id}</td>
            </tr>
            ${paymentInfoHtml}
          </table>
        </div>

        ${event.notes ? `
        <!-- Event Notes -->
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 24px; border-left: 4px solid #871c1c;">
          <h2 style="font-size: 18px; font-weight: bold; margin: 0 0 10px 0; color: #1f2937;">Event Notes:</h2>
          <p style="margin: 0; font-size: 15px; color: #374151;">${event.notes}</p>
        </div>
        ` : ''}

        <p style="font-size: 16px; margin: 0 0 30px 0; font-weight: bold;">
          Here's to a WONderful event!
        </p>

        <!-- Contact & Social -->
        <div style="margin-bottom: 30px;">
          <h2 style="font-size: 18px; font-weight: bold; margin: 0 0 15px 0; color: #1f2937;">Organization Contact Information:</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Name:</td>
              <td style="padding: 8px 0; font-weight: bold;">Women Officials Network Foundation</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Address:</td>
              <td style="padding: 8px 0; font-weight: bold;">6725 Daly Road, Ste. 252572, West Bloomfield, MI 48325</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Contact Email:</td>
              <td style="padding: 8px 0; font-weight: bold;"><a href="mailto:${ADMIN_EMAIL}" style="color: #871c1c; text-decoration: underline;">${ADMIN_EMAIL}</a></td>
            </tr>
          </table>

          <!-- Social Media Links -->
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
            <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">Follow us:</p>
            <div style="display: inline-flex; gap: 15px; align-items: center;">
              <a href="https://www.facebook.com/womenofficialsmi" target="_blank" rel="noopener noreferrer" style="display: inline-block; text-decoration: none;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style="color: #1877F2; vertical-align: middle;">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="https://www.instagram.com/thewonfoundation/#" target="_blank" rel="noopener noreferrer" style="display: inline-block; text-decoration: none;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style="color: #E4405F; vertical-align: middle;">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        <p style="font-size: 16px; margin: 30px 0 0 0; text-align: center; color: #871c1c; font-weight: bold;">
          Thanks again for supporting Women Officials Network Foundation!
        </p>

        <div style="border-top: 1px solid #e5e7eb; margin-top: 40px; padding-top: 20px; text-align: center; color: #6b7280; font-size: 12px;">
          <p style="margin: 0;">
            Copyright © ${new Date().getFullYear()} Women Officials Network Foundation. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  </body>
</html>
  `.trim()

  const textContent = `
Hello ${registration.full_name},

Thank you for registering for ${event.name}! We look forward to seeing you at the event.

Event Details:
${event.name}
${formattedDate} at ${formattedTime}
${venueInfoText}

Registration Details:
- Tickets: ${registration.tickets}
- Email: ${registration.email}${registration.phone ? `\n- Phone: ${registration.phone}` : ''}
- Registration ID: ${registration.id}
- ${paymentInfoText}

${event.notes ? `Event Notes:\n${event.notes}\n\n` : ''}Here's to a WONderful event!

Organization Contact Information:
Name: Women Officials Network Foundation
Address: 6725 Daly Road, Ste. 252572, West Bloomfield, MI 48325
Contact Email: ${ADMIN_EMAIL}

Follow us:
Facebook: https://www.facebook.com/womenofficialsmi
Instagram: https://www.instagram.com/thewonfoundation/#

Thanks again for supporting Women Officials Network Foundation!

Copyright © ${new Date().getFullYear()} Women Officials Network Foundation. All rights reserved.
  `.trim()

  try {
    console.log('Attempting to send user confirmation email:', {
      to: registration.email,
      from: FROM_EMAIL,
      eventName: event.name
    })

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: registration.email,
      subject: `Registration Confirmation: ${event.name}`,
      html: htmlContent,
      text: textContent,
    })

    if (result.error) {
      console.error('Resend API returned an error for user confirmation email:', {
        error: result.error,
        errorMessage: result.error?.message,
        errorName: result.error?.name,
        fullError: JSON.stringify(result.error, null, 2),
        to: registration.email,
        from: FROM_EMAIL,
        eventName: event.name,
        organizerEmail: ORGANIZER_EMAIL
      })
      // Don't throw - email failure shouldn't break registration
      return
    }

    console.log('User confirmation email sent successfully:', {
      emailId: result.data?.id,
      to: registration.email,
      eventName: event.name
    })
  } catch (error: any) {
    console.error('Failed to send user confirmation email:', {
      error: error?.message || error,
      stack: error?.stack,
      to: registration.email,
      from: FROM_EMAIL,
      hasResendKey: !!process.env.RESEND_API_KEY,
      fromEmailSet: !!FROM_EMAIL,
      eventName: event.name
    })
    // Don't throw - email failure shouldn't break registration
  }
}

/**
 * Send notification email to organizer about new registration
 */
export async function sendOrganizerNotificationEmail(
  registration: Registration,
  event: Event,
  isPaid: boolean,
  orderId?: string
): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set, skipping email send')
    return
  }

  // Parse event date - handle timestamps with proper timezone conversion
  // Event dates are stored as timestamptz, so they should include timezone info
  const eventDate = new Date(event.date)
  
  // Ensure we're working with a valid date
  if (isNaN(eventDate.getTime())) {
    console.error('Invalid event date:', event.date)
    throw new Error('Invalid event date format')
  }
  
  // Format date and time in US Eastern time
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/New_York',
  })
  const formattedTime = eventDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
    timeZone: 'America/New_York',
  })

  const paymentInfo = isPaid && orderId
    ? `Payment Status: Paid via PayPal\nOrder ID: ${orderId}`
    : 'Payment Status: Free Event'

  const emailContent = `
New Registration Received

Event: ${event.name}
Date: ${formattedDate} at ${formattedTime}

Registration Details:
- Name: ${registration.full_name}
- Email: ${registration.email}${registration.phone ? `\n- Phone: ${registration.phone}` : ''}
- Tickets: ${registration.tickets}
- ${paymentInfo}
- Registration ID: ${registration.id}

Please review this registration in your admin panel.
  `.trim()

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ORGANIZER_EMAIL,
      subject: `New Registration: ${event.name} - ${registration.full_name}`,
      text: emailContent,
    })
  } catch (error) {
    console.error('Failed to send organizer notification email:', error)
    // Don't throw - email failure shouldn't break registration
  }
}

/**
 * Send password reset email via Resend
 */
export async function sendPasswordResetEmail(
  email: string,
  resetLink: string
): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY not set, cannot send password reset email')
    throw new Error('Email service is not configured. RESEND_API_KEY is missing.')
  }

  if (!FROM_EMAIL || FROM_EMAIL === 'events@mydomain.com') {
    console.error('FROM_EMAIL not properly configured:', FROM_EMAIL)
    throw new Error('Email service is not configured. FROM_EMAIL is missing or invalid.')
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const siteName = 'WON Foundation'

  console.log('Attempting to send password reset email:', {
    to: email,
    from: FROM_EMAIL,
    resetLink: resetLink.substring(0, 50) + '...'
  })

  const htmlContent = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f9fafb;">
    <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #871c1c 0%, #a02323 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
        <h1 style="color: #E7C418; margin: 0; font-size: 24px; font-weight: bold;">
          Reset Your Password
        </h1>
      </div>
      
      <!-- Content -->
      <div style="background: white; padding: 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
          Hello,
        </p>
        
        <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
          We received a request to reset your password for your ${siteName} account. Click the button below to create a new password:
        </p>
        
        <!-- CTA Button -->
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #E7C418 0%, #C9A814 100%); color: #1F2937; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
            Reset Password
          </a>
        </div>
        
        <p style="color: #6B7280; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0;">
          Or copy and paste this link into your browser:
        </p>
        <p style="color: #6B7280; font-size: 12px; line-height: 1.6; margin: 8px 0 24px 0; word-break: break-all;">
          ${resetLink}
        </p>
        
        <p style="color: #6B7280; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0;">
          For security, this reset link is valid for a limited time. If it doesn't work, please request a new password reset email.
        </p>
        
        <p style="color: #6B7280; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0;">
          If you didn&apos;t request a password reset, you can safely ignore this email. Your password will remain unchanged.
        </p>
        
        <div style="border-top: 1px solid #e5e7eb; margin-top: 32px; padding-top: 24px;">
          <p style="color: #6B7280; font-size: 14px; line-height: 1.6; margin: 0;">
            Best regards,<br>
            <strong style="color: #871c1c;">The ${siteName} Team</strong>
          </p>
        </div>
      </div>
    </div>
  </body>
</html>
  `.trim()

  const textContent = `
Reset Your Password

Hello,

We received a request to reset your password for your ${siteName} account. 

Click the link below to create a new password:
${resetLink}

For security, this reset link is valid for a limited time. If it doesn't work, please request a new password reset email.

If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.

Best regards,
The ${siteName} Team
  `.trim()

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Reset Your Password - ${siteName}`,
      html: htmlContent,
      text: textContent,
    })
    
    if (result.error) {
      console.error('Resend API returned an error:', result.error)
      throw new Error(`Failed to send email: ${result.error.message || JSON.stringify(result.error)}`)
    }
    
    console.log('Password reset email sent successfully:', {
      emailId: result.data?.id,
      to: email
    })
  } catch (error: any) {
    console.error('Failed to send password reset email:', {
      error: error?.message || error,
      stack: error?.stack,
      to: email,
      from: FROM_EMAIL,
      hasResendKey: !!process.env.RESEND_API_KEY,
      fromEmailSet: !!FROM_EMAIL
    })
    throw error
  }
}

interface MembershipEmailData {
  firstName: string
  lastName: string
  email: string
  membershipLevel: 'General' | 'Sustaining' | 'Youth'
  membershipPrice: number
  orderId: string
  transactionDate: Date
  endDate: string
  paymentMethod?: string
}

/**
 * Get membership level details for emails
 */
function getMembershipLevelDetails(level: 'General' | 'Sustaining' | 'Youth') {
  const levels = {
    General: {
      name: 'GENERAL MEMBERSHIP',
      description: 'Collaborate with women who share our vision. A network of experienced leaders at all levels of public service. Support and mentor women who serve in the public sector.',
      benefits: [
        'Premium training and programs',
        'Access to the Membership Directory',
        'Reduced price for networking breakfasts, workshops and other WONF events',
        'Timely notification of additional resources and events',
      ],
    },
    Sustaining: {
      name: 'SUSTAINING MEMBERSHIP',
      description: 'Support WONF\'s long-term strategies to advance women in leadership.',
      benefits: [
        'All General Membership Benefits',
        'Sneak peeks to special events',
        'Acknowledgement of additional support in the membership directory',
        'Acknowledgement of additional support on the website',
      ],
    },
    Youth: {
      name: 'YOUTH MEMBERSHIP',
      description: 'For college and high school students. 25 years of age and under.',
      benefits: [
        'All General Membership Benefits',
      ],
    },
  }
  return levels[level]
}

/**
 * Send membership confirmation email with receipt
 */
export async function sendMembershipConfirmationEmail(
  data: MembershipEmailData
): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set, skipping email send')
    return
  }

  if (!FROM_EMAIL || FROM_EMAIL === 'events@mydomain.com') {
    console.error('FROM_EMAIL not properly configured:', FROM_EMAIL)
    return
  }

  const levelDetails = getMembershipLevelDetails(data.membershipLevel)
  const fullName = `${data.firstName} ${data.lastName}`
  const transactionDate = new Date(data.transactionDate)
  const formattedDate = transactionDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const formattedTime = transactionDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
  })

  // Calculate year range for membership
  const startYear = transactionDate.getFullYear()
  const endYear = new Date(data.endDate).getFullYear()
  const yearRange = startYear === endYear ? `${startYear}` : `${startYear}-${endYear}`

  const directoryLink = `${SITE_URL}/directory`
  const profileLink = `${SITE_URL}/portal`

  const htmlContent = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f9fafb; line-height: 1.6; color: #374151;">
    <div style="max-width: 700px; margin: 0 auto; padding: 20px;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #871c1c 0%, #a02323 100%); padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="color: #E7C418; margin: 0; font-size: 28px; font-weight: bold;">
          Women Officials Network Foundation
        </h1>
      </div>
      
      <!-- Main Content -->
      <div style="background: white; padding: 40px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <p style="font-size: 16px; margin: 0 0 20px 0;">
          Dear ${data.firstName},
        </p>
        
        <p style="font-size: 16px; margin: 0 0 20px 0;">
          Thanks so much for supporting the Women Officials Network Foundation through your membership!
        </p>
        
        <p style="font-size: 16px; margin: 0 0 20px 0;">
          We truly appreciate it and look forward to working with you throughout the ${yearRange} year.
        </p>
        
        <p style="font-size: 16px; margin: 0 0 20px 0;">
          If you have not provided us with your biographical information for use in the Membership Directory, be sure and do so <a href="${profileLink}" style="color: #871c1c; text-decoration: underline;">here</a>. To view the members only Directory, <a href="${directoryLink}" style="color: #871c1c; text-decoration: underline;">click this link</a>.
        </p>
        
        <p style="font-size: 16px; margin: 0 0 30px 0;">
          For questions, please contact the WONF administrator at: <a href="mailto:${ADMIN_EMAIL}" style="color: #871c1c; text-decoration: underline;">${ADMIN_EMAIL}</a>.
        </p>
        
        <p style="font-size: 16px; margin: 0 0 30px 0; font-weight: bold;">
          Here's to a WONderful year!
        </p>

        ${data.paymentMethod?.toLowerCase().includes('check') ? `
        <!-- Check Payment Instructions -->
        <div style="background: #fff8e1; border: 2px solid #E7C418; border-radius: 8px; padding: 24px; margin-bottom: 30px;">
          <h2 style="font-size: 18px; font-weight: bold; margin: 0 0 12px 0; color: #871c1c;">Action Required: Mail Your Check</h2>
          <p style="font-size: 15px; margin: 0 0 12px 0; color: #374151;">
            We&apos;ve recorded your membership to be paid by check. Please mail your check within 7 days, made payable to <strong>Women Officials Network Foundation</strong>, to:
          </p>
          <p style="font-size: 15px; font-weight: bold; margin: 0 0 12px 0; color: #1f2937; line-height: 1.8;">
            Women Officials Network Foundation<br/>
            6725 Daly Road, Ste 252572<br/>
            West Bloomfield, MI 48325
          </p>
          <p style="font-size: 14px; margin: 0; color: #6b7280;">
            Your membership will be fully activated once your check is received and processed.
          </p>
        </div>
        ` : ''}

        <div style="border-top: 2px solid #871c1c; padding-top: 30px; margin-top: 30px;">
          <p style="font-size: 18px; font-weight: bold; margin: 0 0 20px 0; color: #871c1c;">
            THIS IS YOUR TRANSACTION RECEIPT. Please save this receipt for your records.
          </p>
          
          <!-- Activity Summary -->
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <h2 style="font-size: 18px; font-weight: bold; margin: 0 0 15px 0; color: #1f2937;">Activity Summary:</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Membership Total:</td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold;">$${data.membershipPrice.toFixed(2)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Total Transaction Amount:</td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold;">$${data.membershipPrice.toFixed(2)}</td>
              </tr>
            </table>
          </div>
          
          <!-- Your Details -->
          <div style="margin-bottom: 30px;">
            <h2 style="font-size: 18px; font-weight: bold; margin: 0 0 15px 0; color: #1f2937;">Your Details:</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Name:</td>
                <td style="padding: 8px 0; font-weight: bold;">${fullName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Email:</td>
                <td style="padding: 8px 0; font-weight: bold;">${data.email}</td>
              </tr>
            </table>
          </div>
          
          <!-- Order Details -->
          <div style="margin-bottom: 30px;">
            <h2 style="font-size: 18px; font-weight: bold; margin: 0 0 15px 0; color: #1f2937;">Order Details:</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Transaction ID:</td>
                <td style="padding: 8px 0; font-weight: bold;">${data.orderId}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Campaign Title/ID:</td>
                <td style="padding: 8px 0; font-weight: bold;">Annual Membership Dues ${yearRange}/${data.orderId.substring(0, 8)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Transaction Day/Date/Time:</td>
                <td style="padding: 8px 0; font-weight: bold;">${formattedDate} ${formattedTime}</td>
              </tr>
            </table>
          </div>
          
          <!-- Payment Details -->
          <div style="margin-bottom: 30px;">
            <h2 style="font-size: 18px; font-weight: bold; margin: 0 0 15px 0; color: #1f2937;">Payment Details:</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Payment Method:</td>
                <td style="padding: 8px 0; font-weight: bold;">${data.paymentMethod || 'Online (PayPal or Admin)'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Transaction Subtotal:</td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold;">$${data.membershipPrice.toFixed(2)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Total Transaction Amount:</td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold;">$${data.membershipPrice.toFixed(2)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Total Charged Amount:</td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold;">$${data.membershipPrice.toFixed(2)}</td>
              </tr>
            </table>
          </div>
          
          <!-- Membership Details -->
          <div style="margin-bottom: 30px;">
            <h2 style="font-size: 18px; font-weight: bold; margin: 0 0 15px 0; color: #1f2937;">Membership Details:</h2>
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px;">
              <p style="margin: 0 0 15px 0; font-weight: bold; font-size: 16px;">${levelDetails.name}</p>
              <p style="margin: 0 0 15px 0; color: #6b7280;">${levelDetails.description}</p>
              <ul style="margin: 0; padding-left: 20px; color: #6b7280;">
                ${levelDetails.benefits.map(benefit => `<li style="margin-bottom: 8px;">${benefit}</li>`).join('')}
              </ul>
              <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280;">Quantity:</td>
                    <td style="padding: 8px 0; font-weight: bold;">1</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280;">Price:</td>
                    <td style="padding: 8px 0; font-weight: bold;">$${data.membershipPrice.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280;">Amount Paid:</td>
                    <td style="padding: 8px 0; font-weight: bold;">$${data.membershipPrice.toFixed(2)}</td>
                  </tr>
                </table>
              </div>
            </div>
          </div>
          
          <!-- Organization Contact Information -->
          <div style="margin-bottom: 30px;">
            <h2 style="font-size: 18px; font-weight: bold; margin: 0 0 15px 0; color: #1f2937;">Organization Contact Information:</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Name:</td>
                <td style="padding: 8px 0; font-weight: bold;">Women Officials Network Foundation</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Address:</td>
                <td style="padding: 8px 0; font-weight: bold;">6725 Daly Road, Ste. 252572, West Bloomfield, MI 48325</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Organization Contact Email:</td>
                <td style="padding: 8px 0; font-weight: bold;"><a href="mailto:${ADMIN_EMAIL}" style="color: #871c1c; text-decoration: underline;">${ADMIN_EMAIL}</a></td>
              </tr>
            </table>
            <!-- Social Media Links -->
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">Follow us:</p>
              <div style="display: inline-flex; gap: 15px; align-items: center;">
                <a href="https://www.facebook.com/womenofficialsmi" target="_blank" rel="noopener noreferrer" style="display: inline-block; text-decoration: none;">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style="color: #1877F2; vertical-align: middle;">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="https://www.instagram.com/thewonfoundation/#" target="_blank" rel="noopener noreferrer" style="display: inline-block; text-decoration: none;">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style="color: #E4405F; vertical-align: middle;">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          
          <p style="font-size: 16px; margin: 30px 0 0 0; text-align: center; color: #871c1c; font-weight: bold;">
            Thanks again for supporting Women Officials Network Foundation!
          </p>
        </div>
        
        <div style="border-top: 1px solid #e5e7eb; margin-top: 40px; padding-top: 20px; text-align: center; color: #6b7280; font-size: 12px;">
          <p style="margin: 0;">
            Copyright © ${new Date().getFullYear()} Women Officials Network Foundation. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  </body>
</html>
  `.trim()

  const textContent = `
Dear ${data.firstName},

Thanks so much for supporting the Women Officials Network Foundation through your membership!
We truly appreciate it and look forward to working with you throughout the ${yearRange} year.

If you have not provided us with your biographical information for use in the Membership Directory, be sure and do so here: ${profileLink}
To view the members only Directory, click this link: ${directoryLink}

For questions, please contact the WONF administrator at: ${ADMIN_EMAIL}

Here's to a WONderful year!

${data.paymentMethod?.toLowerCase().includes('check') ? `ACTION REQUIRED: MAIL YOUR CHECK
------------------------------------
We've recorded your membership to be paid by check. Please mail your check within 7 days, made payable to Women Officials Network Foundation, to:

Women Officials Network Foundation
6725 Daly Road, Ste 252572
West Bloomfield, MI 48325

Your membership will be fully activated once your check is received and processed.

` : ''}THIS IS YOUR TRANSACTION RECEIPT. Please save this receipt for your records.

Activity Summary:
Membership Total: $${data.membershipPrice.toFixed(2)}
Total Transaction Amount: $${data.membershipPrice.toFixed(2)}

Your Details:
Name: ${fullName}
Email: ${data.email}

Order Details:
Transaction ID: ${data.orderId}
Campaign Title/ID: Annual Membership Dues ${yearRange}/${data.orderId.substring(0, 8)}
Transaction Day/Date/Time: ${formattedDate} ${formattedTime}

Payment Details:
Payment Method: PayPal
Transaction Subtotal: $${data.membershipPrice.toFixed(2)}
Total Transaction Amount: $${data.membershipPrice.toFixed(2)}
Total Charged Amount: $${data.membershipPrice.toFixed(2)}

Membership Details:
Membership 1: ${levelDetails.name}
Sponsorship Description:
${levelDetails.description}
${levelDetails.benefits.map(b => `- ${b}`).join('\n')}

Total Order for ${levelDetails.name}:
1 x ${levelDetails.name}
Quantity: 1
Price: $${data.membershipPrice.toFixed(2)}
Amount Paid: $${data.membershipPrice.toFixed(2)}

Organization Contact Information:
Name: Women Officials Network Foundation
Address: 6725 Daly Road, Ste. 252572, West Bloomfield, MI 48325
Organization Contact Email: ${ADMIN_EMAIL}

Follow us:
Facebook: https://www.facebook.com/womenofficialsmi
Instagram: https://www.instagram.com/thewonfoundation/#

Thanks again for supporting Women Officials Network Foundation!

Copyright © ${new Date().getFullYear()} Women Officials Network Foundation. All rights reserved.
  `.trim()

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject: `Membership Confirmation - WON Foundation ${yearRange}`,
      html: htmlContent,
      text: textContent,
    })

    if (result.error) {
      console.error('Resend API returned an error for membership confirmation email:', result.error)
      return
    }

    console.log('Membership confirmation email sent successfully:', {
      emailId: result.data?.id,
      to: data.email,
      membershipLevel: data.membershipLevel,
    })
  } catch (error: any) {
    console.error('Failed to send membership confirmation email:', {
      error: error?.message || error,
      to: data.email,
      membershipLevel: data.membershipLevel,
    })
  }
}

/**
 * Send admin notification email when new member joins
 */
export async function sendAdminMembershipNotificationEmail(
  data: MembershipEmailData
): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set, skipping email send')
    return
  }

  if (!FROM_EMAIL || FROM_EMAIL === 'events@mydomain.com') {
    console.error('FROM_EMAIL not properly configured:', FROM_EMAIL)
    return
  }

  const fullName = `${data.firstName} ${data.lastName}`
  const transactionDate = new Date(data.transactionDate)
  const formattedDate = transactionDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const emailContent = `
New Member Joined WON Foundation

A new person has joined WON Foundation:

Name: ${fullName}
Email: ${data.email}
Membership Level: ${data.membershipLevel}
Membership Price: $${data.membershipPrice.toFixed(2)}
Transaction ID: ${data.orderId}
Payment Method: ${data.paymentMethod || 'Online (PayPal or Admin)'}
Date: ${formattedDate}
Membership Valid Until: ${new Date(data.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

Please review this membership in your admin panel.
  `.trim()

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `New Member Joined: ${fullName} - ${data.membershipLevel} Membership`,
      text: emailContent,
    })
    console.log('Admin membership notification email sent successfully')
  } catch (error) {
    console.error('Failed to send admin membership notification email:', error)
  }
}

/**
 * Send donation thank you email to donor
 */
export async function sendDonationThankYouEmail(
  data: {
    email: string
    name: string
    amount: number
    orderId: string
    dedicationType?: 'honor' | 'memory' | null
    dedicationName?: string | null
  }
): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set, skipping email send')
    return
  }

  if (!FROM_EMAIL || FROM_EMAIL === 'events@mydomain.com') {
    console.error('FROM_EMAIL not properly configured:', FROM_EMAIL)
    return
  }

  const transactionDate = new Date()
  const formattedDate = transactionDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const formattedTime = transactionDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  })

  const dedicationText = data.dedicationType && data.dedicationName
    ? ` ${data.dedicationType === 'honor' ? 'in honor of' : 'in memory of'} ${data.dedicationName}`
    : ''

  const htmlContent = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f9fafb; line-height: 1.6; color: #374151;">
    <div style="max-width: 700px; margin: 0 auto; padding: 20px;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #871c1c 0%, #a02323 100%); padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="color: #E7C418; margin: 0; font-size: 28px; font-weight: bold;">
          Women Officials Network Foundation
        </h1>
      </div>
      
      <!-- Main Content -->
      <div style="background: white; padding: 40px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <p style="font-size: 16px; margin: 0 0 20px 0;">
          Dear ${data.name},
        </p>
        
        <p style="font-size: 16px; margin: 0 0 20px 0;">
          Thank you so much for your generous donation${dedicationText} to the Women Officials Network Foundation!
        </p>
        
        <p style="font-size: 16px; margin: 0 0 20px 0;">
          Your gift of <strong>$${data.amount.toFixed(2)}</strong> makes a real difference in our mission to empower women leaders of today and mentor women leaders of tomorrow. Your support helps us:
        </p>
        
        <ul style="font-size: 16px; margin: 0 0 20px 0; padding-left: 20px; color: #374151;">
          <li style="margin-bottom: 10px;">Provide leadership development and mentoring programs</li>
          <li style="margin-bottom: 10px;">Create networking opportunities that connect trailblazing women</li>
          <li style="margin-bottom: 10px;">Recognize and celebrate women who make a difference through our WONder Women awards</li>
          <li style="margin-bottom: 10px;">Support the next generation of women leaders</li>
        </ul>
        
        <p style="font-size: 16px; margin: 0 0 20px 0;">
          We are truly grateful for your generosity and commitment to advancing women in leadership. Together, we are creating lasting change in our communities.
        </p>
        
        <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f59e0b;">
          <p style="margin: 0 0 10px 0; font-weight: bold; color: #1f2937;">Donation Receipt</p>
          <p style="margin: 0 0 5px 0; color: #6b7280;">Amount: <strong>$${data.amount.toFixed(2)}</strong></p>
          <p style="margin: 0 0 5px 0; color: #6b7280;">Transaction ID: ${data.orderId}</p>
          <p style="margin: 0; color: #6b7280;">Date: ${formattedDate} ${formattedTime}</p>
          ${data.dedicationType && data.dedicationName ? `<p style="margin: 10px 0 0 0; color: #6b7280;">Dedication: ${data.dedicationType === 'honor' ? 'In Honor of' : 'In Memory of'} ${data.dedicationName}</p>` : ''}
        </div>
        
        <p style="font-size: 16px; margin: 30px 0 0 0; text-align: center; color: #871c1c; font-weight: bold;">
          Thank you for being part of our mission!
        </p>
        
        <p style="font-size: 14px; margin: 20px 0 0 0; color: #6b7280;">
          With gratitude,<br>
          The Women Officials Network Foundation Team
        </p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
          <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">Follow us:</p>
          <div style="display: inline-flex; gap: 15px; align-items: center;">
            <a href="https://www.facebook.com/womenofficialsmi" target="_blank" rel="noopener noreferrer" style="display: inline-block; text-decoration: none;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style="color: #1877F2; vertical-align: middle;">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            <a href="https://www.instagram.com/thewonfoundation/#" target="_blank" rel="noopener noreferrer" style="display: inline-block; text-decoration: none;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style="color: #E4405F; vertical-align: middle;">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
      
      <div style="border-top: 1px solid #e5e7eb; margin-top: 40px; padding-top: 20px; text-align: center; color: #6b7280; font-size: 12px;">
        <p style="margin: 0;">
          Copyright © ${new Date().getFullYear()} Women Officials Network Foundation. All rights reserved.
        </p>
        <p style="margin: 5px 0 0 0;">
          Women Officials Network Foundation is a 501(c)(3) nonprofit organization.
        </p>
      </div>
    </div>
  </body>
</html>
  `.trim()

  const textContent = `
Dear ${data.name},

Thank you so much for your generous donation${dedicationText} to the Women Officials Network Foundation!

Your gift of $${data.amount.toFixed(2)} makes a real difference in our mission to empower women leaders of today and mentor women leaders of tomorrow. Your support helps us:

• Provide leadership development and mentoring programs
• Create networking opportunities that connect trailblazing women
• Recognize and celebrate women who make a difference through our WONder Women awards
• Support the next generation of women leaders

We are truly grateful for your generosity and commitment to advancing women in leadership. Together, we are creating lasting change in our communities.

DONATION RECEIPT
Amount: $${data.amount.toFixed(2)}
Transaction ID: ${data.orderId}
Date: ${formattedDate} ${formattedTime}
${data.dedicationType && data.dedicationName ? `Dedication: ${data.dedicationType === 'honor' ? 'In Honor of' : 'In Memory of'} ${data.dedicationName}` : ''}

Thank you for being part of our mission!

With gratitude,
The Women Officials Network Foundation Team

Follow us:
Facebook: https://www.facebook.com/womenofficialsmi
Instagram: https://www.instagram.com/thewonfoundation/#

Copyright © ${new Date().getFullYear()} Women Officials Network Foundation. All rights reserved.
Women Officials Network Foundation is a 501(c)(3) nonprofit organization.
  `.trim()

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject: `Thank You for Your Generous Donation - WON Foundation`,
      html: htmlContent,
      text: textContent,
    })

    if (result.error) {
      console.error('Resend API returned an error for donation thank you email:', result.error)
      return
    }

    console.log('Donation thank you email sent successfully:', {
      emailId: result.data?.id,
      to: data.email,
      amount: data.amount,
    })
  } catch (error: any) {
    console.error('Failed to send donation thank you email:', {
      error: error?.message || error,
      to: data.email,
      amount: data.amount,
    })
  }
}

/**
 * Send admin notification email for a donation (used for check/mail-in pledges)
 */
export async function sendAdminDonationNotificationEmail(
  data: {
    email: string
    name: string
    amount: number
    orderId: string
    paymentMethod: string
  }
): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set, skipping email send')
    return
  }

  if (!FROM_EMAIL || FROM_EMAIL === 'events@mydomain.com') {
    console.error('FROM_EMAIL not properly configured:', FROM_EMAIL)
    return
  }

  const formattedAmount = data.amount.toFixed(2)

  const emailContent = `
New Donation Recorded

Name: ${data.name}
Email: ${data.email}
Amount: $${formattedAmount}
Payment Method: ${data.paymentMethod}
Reference ID: ${data.orderId}

This donation was recorded as a check/mail-in pledge. Please expect a check within approximately 7 days.
  `.trim()

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `New Donation (Check): ${data.name} - $${formattedAmount}`,
      text: emailContent,
    })
    console.log('Admin donation notification email sent successfully')
  } catch (error) {
    console.error('Failed to send admin donation notification email:', error)
  }
}

/**
 * Send admin alert when a PayPal membership payment is received but the buyer's
 * browser dropped before account creation could complete (new member / guest flow).
 * Admin must manually create the account and activate the membership.
 */
export async function sendAdminOrphanedPaymentAlertEmail(data: {
  paypalOrderId: string
  guestEmail: string
  membershipLevel: string
  amountPaid: number
}): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set, skipping orphaned payment alert')
    return
  }

  if (!FROM_EMAIL || FROM_EMAIL === 'events@mydomain.com') {
    console.error('FROM_EMAIL not properly configured — cannot send orphaned payment alert')
    return
  }

  const subject = `⚠️ ACTION REQUIRED: Membership payment received but account not created — ${data.guestEmail}`

  const text = `
ACTION REQUIRED — Membership Payment Without Account Creation
=============================================================

A PayPal payment for a new membership was successfully captured, but the buyer's
browser disconnected before their account could be created on the website. The
money has been received by PayPal; the member just needs to be set up manually.

Payment Details
---------------
PayPal Order ID : ${data.paypalOrderId}
Buyer Email     : ${data.guestEmail}
Membership Level: ${data.membershipLevel}
Amount Paid     : $${data.amountPaid.toFixed(2)}

Steps to Resolve
----------------
1. Log into the WON Foundation admin panel.
2. Create a new member account using the buyer's email (${data.guestEmail}).
3. Activate a ${data.membershipLevel} membership for that account.
4. Notify the member that their account is ready and send them a temporary password.

Do NOT ask the buyer to pay again — payment has already been received.
  `.trim()

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject,
      text,
    })
    console.log('[emails] orphaned payment alert sent for order', data.paypalOrderId)
  } catch (error) {
    console.error('[emails] failed to send orphaned payment alert:', error)
  }
}

/**
 * Send account activation notification to a member when admin changes their status from pending → active
 */
export async function sendMemberActivationEmail(data: {
  email: string
  firstName: string
  lastName: string
  membershipLevel: string
}): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set, skipping member activation email')
    return
  }

  if (!FROM_EMAIL || FROM_EMAIL === 'events@mydomain.com') {
    console.error('FROM_EMAIL not properly configured, skipping member activation email')
    return
  }

  const fullName = `${data.firstName} ${data.lastName}`.trim() || data.email
  const siteUrl = SITE_URL || 'https://wonfoundation.net'

  const htmlContent = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f9fafb; line-height: 1.6; color: #374151;">
    <div style="max-width: 700px; margin: 0 auto; padding: 20px;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #871c1c 0%, #a02323 100%); padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="color: #E7C418; margin: 0; font-size: 28px; font-weight: bold;">
          Women Officials Network Foundation
        </h1>
      </div>

      <!-- Main Content -->
      <div style="background: white; padding: 40px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <p style="font-size: 16px; margin: 0 0 20px 0;">
          Dear ${data.firstName || fullName},
        </p>

        <p style="font-size: 16px; margin: 0 0 20px 0;">
          Great news! The WON Foundation has received your payment and your membership account is now <strong>active</strong>.
        </p>

        <p style="font-size: 16px; margin: 0 0 20px 0;">
          We truly appreciate your support and look forward to working with you as a valued member of our community.
        </p>

        <!-- Membership Details Box -->
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <h2 style="font-size: 18px; font-weight: bold; margin: 0 0 15px 0; color: #1f2937;">Membership Details:</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Membership Level:</td>
              <td style="padding: 8px 0; font-weight: bold;">${data.membershipLevel}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Status:</td>
              <td style="padding: 8px 0; font-weight: bold; color: #16a34a;">Active</td>
            </tr>
          </table>
        </div>

        <p style="font-size: 16px; margin: 0 0 20px 0;">
          You can now log in to your account on our website to access your member benefits, update your profile, and connect with the WON Foundation community.
        </p>

        <!-- Login Button -->
        <div style="text-align: center; margin: 30px 0;">
          <a href="${siteUrl}/login"
             style="display: inline-block; background: linear-gradient(135deg, #871c1c, #a02323); color: white; text-decoration: none; padding: 14px 36px; border-radius: 6px; font-size: 16px; font-weight: bold;">
            Log In to Your Account
          </a>
        </div>

        <p style="font-size: 16px; margin: 0 0 30px 0; font-weight: bold;">
          Here's to a WONderful year!
        </p>

        <!-- Contact & Social -->
        <div style="margin-bottom: 30px;">
          <h2 style="font-size: 18px; font-weight: bold; margin: 0 0 15px 0; color: #1f2937;">Organization Contact Information:</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Name:</td>
              <td style="padding: 8px 0; font-weight: bold;">Women Officials Network Foundation</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Address:</td>
              <td style="padding: 8px 0; font-weight: bold;">6725 Daly Road, Ste. 252572, West Bloomfield, MI 48325</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Contact Email:</td>
              <td style="padding: 8px 0; font-weight: bold;"><a href="mailto:${ADMIN_EMAIL}" style="color: #871c1c; text-decoration: underline;">${ADMIN_EMAIL}</a></td>
            </tr>
          </table>

          <!-- Social Media Links -->
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
            <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">Follow us:</p>
            <div style="display: inline-flex; gap: 15px; align-items: center;">
              <a href="https://www.facebook.com/womenofficialsmi" target="_blank" rel="noopener noreferrer" style="display: inline-block; text-decoration: none;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style="color: #1877F2; vertical-align: middle;">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="https://www.instagram.com/thewonfoundation/#" target="_blank" rel="noopener noreferrer" style="display: inline-block; text-decoration: none;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style="color: #E4405F; vertical-align: middle;">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        <p style="font-size: 16px; margin: 30px 0 0 0; text-align: center; color: #871c1c; font-weight: bold;">
          Thanks again for supporting Women Officials Network Foundation!
        </p>

        <div style="border-top: 1px solid #e5e7eb; margin-top: 40px; padding-top: 20px; text-align: center; color: #6b7280; font-size: 12px;">
          <p style="margin: 0;">
            Copyright © ${new Date().getFullYear()} Women Officials Network Foundation. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  </body>
</html>
  `.trim()

  const textContent = `
Dear ${data.firstName || fullName},

Great news! The WON Foundation has received your payment and your membership account is now active.

We truly appreciate your support and look forward to working with you as a valued member of our community.

Membership Level: ${data.membershipLevel}
Status: Active

You can now log in to your account at ${siteUrl}/login to access your member benefits, update your profile, and connect with the WON Foundation community.

Here's to a WONderful year!

Organization Contact Information:
Name: Women Officials Network Foundation
Address: 6725 Daly Road, Ste. 252572, West Bloomfield, MI 48325
Contact Email: ${ADMIN_EMAIL}

Follow us:
Facebook: https://www.facebook.com/womenofficialsmi
Instagram: https://www.instagram.com/thewonfoundation/#

Thanks again for supporting Women Officials Network Foundation!

Copyright © ${new Date().getFullYear()} Women Officials Network Foundation. All rights reserved.
  `.trim()

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject: 'Your WON Foundation Membership is Now Active',
      html: htmlContent,
      text: textContent,
    })
    console.log('[emails] member activation email sent to', data.email)
  } catch (error) {
    console.error('[emails] failed to send member activation email:', error)
  }
}

