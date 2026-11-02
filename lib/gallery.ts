// Shared gallery helpers (safe to use in both browser and server code)

export type AspectRatio = 'landscape' | 'portrait' | 'square'

export interface GalleryCategory {
  id: string
  label: string
  sort_order: number
  photo_count?: number
}

/** Same rule for single and bulk uploads: within 5% of square = square. */
export function aspectRatioFromSize(width: number, height: number): AspectRatio {
  if (!width || !height) return 'landscape'
  const ratio = width / height
  if (ratio >= 0.95 && ratio <= 1.05) return 'square'
  return ratio < 1 ? 'portrait' : 'landscape'
}

/** Turns a label like "2026 WW" into the short code "2026-ww". */
export function categoryIdFromLabel(label: string): string {
  return label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50)
}
