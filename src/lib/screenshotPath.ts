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

/** Probe candidate URLs until one loads; returns null if none exist. */
export function resolveScreenshotUrl(
  mapId: MapId,
  name: string,
): Promise<string | null> {
  const candidates = screenshotUrls(mapId, name)
  if (candidates.length === 0) return Promise.resolve(null)

  return new Promise((resolve) => {
    let index = 0

    function tryNext() {
      const src = candidates[index]
      if (!src) {
        resolve(null)
        return
      }
      const img = new Image()
      img.onload = () => resolve(src)
      img.onerror = () => {
        index += 1
        tryNext()
      }
      img.src = src
    }

    tryNext()
  })
}
