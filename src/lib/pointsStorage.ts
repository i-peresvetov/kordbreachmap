import type { MapId } from '../data/maps'
import {
  isDocumentTypeAllowedOnMap,
  isDocumentTypeId,
  type DocumentTypeId,
} from '../data/documentTypes'
import seedPoints from '../data/points.json'

export type MapPoint = {
  id: string
  mapId: MapId
  x: number
  y: number
  documentType: DocumentTypeId
  /** Point title; screenshot file in public/screenshots/{mapId}/{name}.{ext} */
  name: string
  createdAt: string
}

export const POINTS_STORAGE_KEY = 'tarkov-maps-points-v2'

function isMapPoint(value: unknown): value is MapPoint {
  if (!value || typeof value !== 'object') return false
  const p = value as Record<string, unknown>
  return (
    typeof p.id === 'string' &&
    typeof p.mapId === 'string' &&
    typeof p.x === 'number' &&
    typeof p.y === 'number' &&
    isDocumentTypeId(p.documentType) &&
    typeof p.name === 'string' &&
    p.name.trim().length > 0 &&
    typeof p.createdAt === 'string'
  )
}

function normalizePoint(p: MapPoint): MapPoint {
  return {
    id: p.id,
    mapId: p.mapId,
    x: p.x,
    y: p.y,
    documentType: p.documentType,
    name: p.name.trim(),
    createdAt: p.createdAt,
  }
}

function readAll(): MapPoint[] {
  const raw = localStorage.getItem(POINTS_STORAGE_KEY)
  if (raw === null) {
    const seeded = (seedPoints as MapPoint[]).filter(isMapPoint).map(normalizePoint)
    writeAll(seeded)
    return seeded
  }
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isMapPoint).map(normalizePoint)
  } catch {
    return []
  }
}

function writeAll(points: MapPoint[]): void {
  localStorage.setItem(POINTS_STORAGE_KEY, JSON.stringify(points))
}

export function getAllPoints(): MapPoint[] {
  return readAll().slice().sort((a, b) => a.createdAt.localeCompare(b.createdAt))
}

export function getPointsByMap(mapId: MapId): MapPoint[] {
  return getAllPoints().filter((p) => p.mapId === mapId)
}

export function addPoint(
  point: Omit<MapPoint, 'id' | 'createdAt'> & { id?: string; createdAt?: string },
): MapPoint {
  if (!isDocumentTypeAllowedOnMap(point.documentType, point.mapId)) {
    throw new Error('Этот тип документа недоступен на выбранной карте')
  }
  const name = point.name.trim()
  if (!name) {
    throw new Error('Укажите название точки')
  }
  const record = normalizePoint({
    id: point.id ?? crypto.randomUUID(),
    mapId: point.mapId,
    x: point.x,
    y: point.y,
    documentType: point.documentType,
    name,
    createdAt: point.createdAt ?? new Date().toISOString(),
  })
  const all = readAll()
  all.push(record)
  writeAll(all)
  return record
}

export function deletePoint(id: string): string {
  writeAll(readAll().filter((p) => p.id !== id))
  return id
}

/** Pretty JSON for pasting into src/data/points.json */
export function exportPointsJson(): string {
  const forRepo = getAllPoints().map(
    ({ id, mapId, x, y, documentType, name, createdAt }) => ({
      id,
      mapId,
      x,
      y,
      documentType,
      name,
      createdAt,
    }),
  )
  return `${JSON.stringify(forRepo, null, 2)}\n`
}
