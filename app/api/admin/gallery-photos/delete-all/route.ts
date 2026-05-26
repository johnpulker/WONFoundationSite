import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabaseAdmin'
import { validateAdminSession } from '@/lib/adminSessionServer'

// Allow longer execution time for bulk deletions
export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes

async function checkAdminAuth(request: NextRequest): Promise<{ valid: boolean }> {
  // Try session-based auth first (preferred)
  const sessionAuth = await validateAdminSession(request)
  if (sessionAuth.valid) {
    return { valid: true }
  }
  
  // Fallback to password-based auth for backward compatibility
  const password = request.headers.get('x-admin-password')
  const adminPassword = process.env.ADMIN_PASSWORD
  return { valid: !!(adminPassword && password === adminPassword) }
}

// GET - Test if route is accessible
export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'Delete all route is accessible' })
}

// DELETE - Delete all gallery photos
export async function DELETE(request: NextRequest) {
  console.log('[Delete All] Request received')
  try {
    const auth = await checkAdminAuth(request)
    if (!auth.valid) {
      console.error('[Delete All] Authentication failed')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    console.log('[Delete All] Authentication successful, creating admin client...')
    const adminClient = createAdminClient()

    // First, get all photos to delete their files from storage
    console.log('[Delete All] Fetching all photos from database...')
    const { data: photos, error: fetchError } = await adminClient
      .from('gallery_photos')
      .select('image_url')

    if (fetchError) {
      console.error('[Delete All] Error fetching gallery photos for deletion:', fetchError)
      return NextResponse.json({ 
        error: fetchError.message || 'Failed to fetch photos',
        details: fetchError 
      }, { status: 500 })
    }

    console.log(`[Delete All] Found ${photos?.length || 0} photos to delete`)

    // Delete files from Supabase Storage in batches for better performance
    if (photos && photos.length > 0) {
      const storageErrors: string[] = []
      const fileNames: string[] = []
      
      // Extract all filenames first
      for (const photo of photos) {
        try {
          const urlParts = photo.image_url.split('/gallery-photos/')
          if (urlParts.length > 1) {
            const fileName = urlParts[1].split('?')[0]
            fileNames.push(fileName)
          } else {
            console.warn(`[Delete All] Could not extract filename from URL: ${photo.image_url}`)
            storageErrors.push(photo.image_url)
          }
        } catch (err: any) {
          console.error(`Error extracting filename from ${photo.image_url}:`, err)
          storageErrors.push(photo.image_url)
        }
      }

      // Delete files in batches of 100 for better performance
      const BATCH_SIZE = 100
      console.log(`[Delete All] Deleting ${fileNames.length} files in batches of ${BATCH_SIZE}...`)
      
      for (let i = 0; i < fileNames.length; i += BATCH_SIZE) {
        const batch = fileNames.slice(i, i + BATCH_SIZE)
        const batchNumber = Math.floor(i / BATCH_SIZE) + 1
        const totalBatches = Math.ceil(fileNames.length / BATCH_SIZE)
        
        console.log(`[Delete All] Processing batch ${batchNumber}/${totalBatches} (${batch.length} files)`)
        
        try {
          const { error: storageError, data } = await adminClient.storage
            .from('gallery-photos')
            .remove(batch)
          
          if (storageError) {
            console.error(`[Delete All] Error deleting batch ${batchNumber}:`, storageError)
            storageErrors.push(...batch)
          } else {
            console.log(`[Delete All] Successfully deleted batch ${batchNumber} (${batch.length} files)`)
          }
        } catch (err: any) {
          console.error(`[Delete All] Exception deleting batch ${batchNumber}:`, err)
          storageErrors.push(...batch)
        }
      }

      if (storageErrors.length > 0) {
        console.warn(`[Delete All] Failed to delete ${storageErrors.length} files from storage`)
      } else {
        console.log(`[Delete All] Successfully deleted all ${fileNames.length} files from storage`)
      }
    }

    // Delete all records from database
    // Use a condition that always matches (created_at >= 1970-01-01 will match all records)
    console.log('[Delete All] Deleting all records from database...')
    const { error: deleteError } = await adminClient
      .from('gallery_photos')
      .delete()
      .gte('created_at', '1970-01-01') // This will match all records since created_at is always after 1970

    if (deleteError) {
      console.error('[Delete All] Error deleting gallery photos from database:', deleteError)
      console.error('[Delete All] Delete error details:', JSON.stringify(deleteError, null, 2))
      return NextResponse.json({ 
        error: deleteError.message || 'Failed to delete photos from database',
        details: deleteError 
      }, { status: 500 })
    }

    console.log('[Delete All] Successfully deleted all photos')
    return NextResponse.json({ 
      success: true, 
      deleted: photos?.length || 0,
      message: `Successfully deleted ${photos?.length || 0} photos`
    })
  } catch (error: any) {
    console.error('Error in delete all gallery photos:', error)
    console.error('Error stack:', error?.stack)
    console.error('Error details:', JSON.stringify(error, null, 2))
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error?.message || 'Unknown error occurred',
      errorType: error?.name || 'Unknown'
    }, { status: 500 })
  }
}

