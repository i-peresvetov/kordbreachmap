import type { TarkovMap } from '../data/maps'

/** Leaflet LatLngBounds for CRS.Simple image with wiki bottom-left origin. */
export function mapLatLngBounds(map: TarkovMap): [[number, number], [number, number]] {
  return [
    [0, 0],
    [map.height, map.width],
  ]
}

/** Wiki (x, y) bottom-left → Leaflet LatLng [lat=y, lng=x]. */
export function wikiToLatLng(x: number, y: number): [number, number] {
  return [y, x]
}

/** Leaflet LatLng → wiki (x, y). */
export function latLngToWiki(lat: number, lng: number): { x: number; y: number } {
  return { x: lng, y: lat }
}

/** Initial zoom so the map roughly fits the viewport. */
export function fitZoom(map: TarkovMap, containerWidth: number, containerHeight: number): number {
  const pad = 40
  const zx = Math.log2((containerWidth - pad) / map.width)
  const zy = Math.log2((containerHeight - pad) / map.height)
  return Math.min(zx, zy)
}
