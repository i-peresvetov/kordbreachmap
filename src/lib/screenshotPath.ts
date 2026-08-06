import type { MapId } from '../data/maps'
import screenshotIndex from 'virtual:screenshot-index'
import { assetUrl } from './assetUrl'

/** Folder for map screenshots: public/screenshots/{mapId}/ */
export function screenshotDir(mapId: MapId): string {
  return `public/screenshots/${mapId}`
}

function screenshotKey(mapId: MapId, name: string): string {
  return `${mapId}/${name.trim()}`
}

/**
 * Exact screenshot URL if the file exists in public/screenshots
 * (extension taken from the build-time file index — one request, no 404 probing).
 */
export function screenshotUrl(mapId: MapId, name: string): string | null {
  const trimmed = name.trim()
  if (!trimmed) return null
  const ext = screenshotIndex[screenshotKey(mapId, trimmed)]
  if (!ext) return null
  return assetUrl(`screenshots/${mapId}/${encodeURIComponent(trimmed)}.${ext}`)
}

/** @deprecated Prefer screenshotUrl — kept for call sites that still expect a list. */
export function screenshotUrls(mapId: MapId, name: string): string[] {
  const url = screenshotUrl(mapId, name)
  return url ? [url] : []
}

export function resolveScreenshotUrl(
  mapId: MapId,
  name: string,
): Promise<string | null> {
  return Promise.resolve(screenshotUrl(mapId, name))
}
