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

function pointNameKey(mapId: MapId, name: string): string {
  return `${mapId}::${name.trim().toLocaleLowerCase('ru')}`
}

function loadSeed(): MapPoint[] {
  return (seedPoints as MapPoint[]).filter(isMapPoint).map(normalizePoint)
}

/** Points shipped in src/data/points.json cannot be deleted in the UI. */
export function isRepoPoint(id: string): boolean {
  return loadSeed().some((p) => p.id === id)
}

function loadRawLocal(): MapPoint[] {
  const raw = localStorage.getItem(POINTS_STORAGE_KEY)
  if (raw === null) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isMapPoint).map(normalizePoint)
  } catch {
    return []
  }
}

/**
 * Drop local entries that are already in the repo seed (same id, or same
 * name on the same map). Keeps only truly local in-progress points.
 */
function pruneLocalAgainstSeed(seed: MapPoint[], local: MapPoint[]): MapPoint[] {
  const seedIds = new Set(seed.map((p) => p.id))
  const seedNames = new Set(seed.map((p) => pointNameKey(p.mapId, p.name)))
  return local.filter((p) => {
    if (seedIds.has(p.id)) return false
    if (seedNames.has(pointNameKey(p.mapId, p.name))) return false
    return true
  })
}

function writeCustom(points: MapPoint[]): void {
  localStorage.setItem(POINTS_STORAGE_KEY, JSON.stringify(points))
}

/** Seed + local-only customs. Syncs localStorage to drop points now in the repo. */
function readAll(): MapPoint[] {
  const seed = loadSeed()
  const localOnly = pruneLocalAgainstSeed(seed, loadRawLocal())
  const stored = JSON.stringify(localOnly)
  if (localStorage.getItem(POINTS_STORAGE_KEY) !== stored) {
    writeCustom(localOnly)
  }
  return [...seed, ...localOnly]
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
  if (isPointNameTaken(point.mapId, name)) {
    throw new Error('Точка с таким названием уже есть на этой карте')
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
  const seed = loadSeed()
  const localOnly = pruneLocalAgainstSeed(seed, loadRawLocal())
  writeCustom([...localOnly, record])
  return record
}

export function deletePoint(id: string): string {
  if (isRepoPoint(id)) {
    throw new Error('Точки из репозитория нельзя удалить здесь')
  }
  const seed = loadSeed()
  const localOnly = pruneLocalAgainstSeed(seed, loadRawLocal()).filter((p) => p.id !== id)
  writeCustom(localOnly)
  return id
}

export function getCustomPoints(): MapPoint[] {
  // Ensures prune + localStorage sync even if getAllPoints wasn't called yet
  readAll()
  const seed = loadSeed()
  return pruneLocalAgainstSeed(seed, loadRawLocal()).slice().sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt),
  )
}

export function isPointNameTaken(mapId: MapId, name: string): boolean {
  const normalized = name.trim().toLocaleLowerCase('ru')
  if (!normalized) return false
  return getPointsByMap(mapId).some(
    (p) => p.name.trim().toLocaleLowerCase('ru') === normalized,
  )
}

/** Removes all locally added points; keeps points from points.json. */
export function clearCustomPoints(): number {
  const before = getCustomPoints().length
  writeCustom([])
  return before
}

/** Pretty JSON of only locally added points (not already in the repo seed). */
export function exportPointsJson(): string {
  const custom = getCustomPoints().map(
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
  return `${JSON.stringify(custom, null, 2)}\n`
}
