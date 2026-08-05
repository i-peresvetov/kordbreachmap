import type { MapId } from '../data/maps'
import { assetUrl } from './assetUrl'

const SCREENSHOT_EXTS = ['png', 'jpg', 'jpeg', 'webp', 'gif'] as const

/** Folder for map screenshots: public/screenshots/{mapId}/ */
export function screenshotDir(mapId: MapId): string {
  return `public/screenshots/${mapId}`
}

/**
 * Possible screenshot URLs for a point name.
 * File must be named exactly like the point name, e.g. `My Point.png`
 * in `public/screenshots/{mapId}/`.
 */
export function screenshotUrls(mapId: MapId, name: string): string[] {
  const trimmed = name.trim()
  if (!trimmed) return []
  const encoded = encodeURIComponent(trimmed)
  return SCREENSHOT_EXTS.map((ext) =>
    assetUrl(`screenshots/${mapId}/${encoded}.${ext}`),
  )
}
