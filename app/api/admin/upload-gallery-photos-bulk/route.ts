import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabaseAdmin'
import { validateAdminSession } from '@/lib/adminSessionServer'
import sharp from 'sharp'

// Configure route to handle large file uploads (up to 2GB per file)
export const runtime = 'nodejs'
export const maxDuration = 900 // 15 minutes for bulk uploads

// Helper to check admin auth
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

export async function POST(request: NextRequest) {
  try {
    console.log('[Bulk Upload] Request received')
    
    const auth = await checkAdminAuth(request)
    if (!auth.valid) {
      console.error('[Bulk Upload] Authentication failed')
      return NextResponse.json({ error: 'Forbidden - Invalid or expired session' }, { status: 403 })
    }

    console.log('[Bulk Upload] Authentication passed, parsing formData...')
    
    let formData: FormData
    try {
      formData = await request.formData()
      console.log('[Bulk Upload] FormData parsed successfully')
    } catch (error: any) {
      console.error('[Bulk Upload] Error parsing formData:', error)
      console.error('[Bulk Upload] FormData error stack:', error?.stack)
      return NextResponse.json(
        { 
          error: 'Failed to parse request body',
          details: error?.message || 'Request body may be too large. Try uploading fewer files at once.',
        },
        { status: 400 }
      )
    }

    const files = formData.getAll('files') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    // Get category from formData (default to '2025-ww' if not provided)
    const category = (formData.get('category') as string) || '2025-ww'
    const validCategories = ['2025-ww', '2024-ww', '2023-ww', '2022-ww', 'networking', 'events', 'speaker']
    const selectedCategory = validCategories.includes(category) ? category : '2025-ww'

    // Get year from formData (default to current year if not provided)
    const yearStr = formData.get('year') as string
    const selectedYear = yearStr ? parseInt(yearStr) : new Date().getFullYear()

    // Get caption from formData (optional, defaults to empty string)
    const caption = (formData.get('caption') as string) || ''

    console.log(`[Bulk Upload] Starting upload of ${files.length} files with category: ${selectedCategory}, year: ${selectedYear}, caption: ${caption || '(none)'}`)
    
    // Log total size for debugging
    const totalSize = files.reduce((sum, file) => sum + file.size, 0)
    console.log(`[Bulk Upload] Total size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`)

    // Validate file types and sizes
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const maxSize = 2 * 1024 * 1024 * 1024 // 2GB per file

    let adminClient
    try {
      adminClient = createAdminClient()
    } catch (error: any) {
      console.error('[Bulk Upload] Error creating admin client:', error)
      return NextResponse.json(
        { 
          error: 'Failed to initialize database connection',
          details: error.message || 'Supabase client initialization failed',
        },
        { status: 500 }
      )
    }

    // Get max display order once
    let displayOrder = 0
    try {
      const { data: existing, error: queryError } = await adminClient
        .from('gallery_photos')
        .select('display_order')
        .order('display_order', { ascending: false })
        .limit(1)

      if (queryError) {
        console.error('[Bulk Upload] Error querying display order:', queryError)
        // Continue with displayOrder = 0 if query fails
      } else {
        displayOrder = existing && existing.length > 0 ? existing[0].display_order : 0
      }
    } catch (error: any) {
      console.error('[Bulk Upload] Error getting display order:', error)
      // Continue with displayOrder = 0 if query fails
    }

    interface UploadResult {
      fileName: string
      url: string
      photoId: string
    }

    interface UploadError {
      fileName: string
      error: string
    }

    const uploadResults: UploadResult[] = []
    const errors: UploadError[] = []

    // Process files in batches to avoid memory issues and timeouts
    const BATCH_SIZE = 3 // Reduced to 3 files at a time to avoid body size limits
    for (let batchStart = 0; batchStart < files.length; batchStart += BATCH_SIZE) {
      const batch = files.slice(batchStart, batchStart + BATCH_SIZE)
      const batchNumber = Math.floor(batchStart / BATCH_SIZE) + 1
      const totalBatches = Math.ceil(files.length / BATCH_SIZE)
      console.log(`[Bulk Upload] Processing batch ${batchNumber}/${totalBatches} (${batch.length} files)`)
      
      // Log batch size for debugging
      const batchSize = batch.reduce((sum, file) => sum + file.size, 0)
      console.log(`[Bulk Upload] Batch ${batchNumber} total size: ${(batchSize / 1024 / 1024).toFixed(2)} MB`)

      // Process batch in parallel
      const batchPromises = batch.map(async (file, index) => {
        const globalIndex = batchStart + index
        
        try {
          // Validate file type
          if (!validTypes.includes(file.type)) {
            console.error(`[Bulk Upload] Invalid file type for ${file.name}: ${file.type}`)
            return { success: false, fileName: file.name, error: `Invalid file type: ${file.type}. Allowed: ${validTypes.join(', ')}` }
          }

          // Validate file size
          if (file.size > maxSize) {
            console.error(`[Bulk Upload] File too large: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`)
            return { success: false, fileName: file.name, error: `File too large: ${(file.size / 1024 / 1024).toFixed(2)} MB (max 2GB)` }
          }
          
          // Check if file is empty
          if (file.size === 0) {
            console.error(`[Bulk Upload] Empty file: ${file.name}`)
            return { success: false, fileName: file.name, error: 'File is empty' }
          }

          // Generate unique filename
          const timestamp = Date.now()
          const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
          const fileName = `gallery-${timestamp}-${globalIndex}-${sanitizedName}`

          // Upload to Supabase Storage
          let uploadError: any = null
          let uploadData: any = null
          
          try {
            const uploadResult = await adminClient.storage
              .from('gallery-photos')
              .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false,
              })
            uploadData = uploadResult.data
            uploadError = uploadResult.error
          } catch (storageError: any) {
            console.error(`[Bulk Upload] Storage upload exception for ${file.name}:`, storageError)
            return { success: false, fileName: file.name, error: storageError.message || 'Storage upload exception' }
          }

          if (uploadError) {
            console.error(`[Bulk Upload] Upload error for ${file.name}:`, uploadError)
            return { success: false, fileName: file.name, error: uploadError.message || 'Upload failed' }
          }

          const { data: { publicUrl } } = adminClient.storage
            .from('gallery-photos')
            .getPublicUrl(fileName)

          // Auto-detect aspect ratio from image dimensions
          let aspectRatio: 'landscape' | 'portrait' | 'square' = 'landscape'
          try {
            // Read the file buffer to get image metadata
            const arrayBuffer = await file.arrayBuffer()
            const buffer = Buffer.from(arrayBuffer)
            const metadata = await sharp(buffer).metadata()
            
            if (metadata.width && metadata.height) {
              const ratio = metadata.width / metadata.height
              
              // Determine aspect ratio:
              // - Square: ratio between 0.95 and 1.05 (allowing small tolerance)
              // - Portrait: height > width (ratio < 1)
              // - Landscape: width > height (ratio > 1)
              if (ratio >= 0.95 && ratio <= 1.05) {
                aspectRatio = 'square'
              } else if (ratio < 1) {
                aspectRatio = 'portrait'
              } else {
                aspectRatio = 'landscape'
              }
              
              console.log(`[Bulk Upload] ${file.name}: ${metadata.width}x${metadata.height} (ratio: ${ratio.toFixed(2)}) → ${aspectRatio}`)
            } else {
              console.warn(`[Bulk Upload] Could not get dimensions for ${file.name}, defaulting to landscape`)
            }
          } catch (dimensionError: any) {
            console.warn(`[Bulk Upload] Error detecting aspect ratio for ${file.name}:`, dimensionError.message)
            // Default to landscape if detection fails
            aspectRatio = 'landscape'
          }

          displayOrder += 1
          const { data: photoData, error: insertError } = await adminClient
            .from('gallery_photos')
            .insert({
              image_url: publicUrl,
              caption: caption,
              year: selectedYear,
              category: selectedCategory,
              aspect_ratio: aspectRatio,
              display_order: displayOrder,
            })
            .select()
            .single()

          if (insertError) {
            console.error(`[Bulk Upload] Insert error for ${file.name}:`, insertError)
            return { success: false, fileName: file.name, error: insertError.message || 'Database insert failed' }
          }

          return {
            success: true,
            fileName: file.name,
            url: publicUrl,
            photoId: photoData.id,
          }
        } catch (error: any) {
          console.error(`[Bulk Upload] Error processing ${file.name}:`, error)
          return {
            success: false,
            fileName: file.name,
            error: error.message || 'Unknown error',
          }
        }
      })

      let batchResults
      try {
        batchResults = await Promise.all(batchPromises)
      } catch (batchError: any) {
        console.error(`[Bulk Upload] Error processing batch ${batchNumber}:`, batchError)
        // Mark all files in this batch as errors
        batch.forEach(file => {
          errors.push({
            fileName: file.name,
            error: batchError.message || 'Batch processing failed',
          })
        })
        continue
      }
      
      // Separate successes and errors
      batchResults.forEach(result => {
        if (result.success && result.photoId) {
          uploadResults.push({
            fileName: result.fileName,
            url: result.url || '',
            photoId: result.photoId,
          })
        } else if (!result.success) {
          errors.push({
            fileName: result.fileName,
            error: result.error || 'Unknown error',
          })
        }
      })

      console.log(`[Bulk Upload] Batch ${batchNumber} complete: ${uploadResults.length} successful, ${errors.length} errors so far`)
    }

    console.log(`[Bulk Upload] Complete: ${uploadResults.length}/${files.length} uploaded successfully`)

    return NextResponse.json({
      success: true,
      uploaded: uploadResults.length,
      total: files.length,
      results: uploadResults,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error: any) {
    console.error('[Bulk Upload] Fatal error:', error)
    console.error('[Bulk Upload] Error stack:', error?.stack)
    console.error('[Bulk Upload] Error name:', error?.name)
    
    // Return detailed error for debugging
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error?.message || 'Unknown error occurred',
        errorType: error?.name || 'Unknown',
        ...(process.env.NODE_ENV === 'development' && { stack: error?.stack }),
      },
      { status: 500 }
    )
  }
}

