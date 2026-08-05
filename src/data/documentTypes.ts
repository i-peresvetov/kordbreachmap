import type { MapId } from './maps'

export type DocumentTypeId =
  | 'financial'
  | 'black-folder'
  | 'tan-folder'
  | 'intel-folder'
  | 'letter'
  | 'handbook'
  | 'medical'
  | 'classified'

export type DocumentType = {
  id: DocumentTypeId
  name: string
  icon: string
  /** Maps where this document type can be placed. */
  maps: MapId[]
}

export const DOCUMENT_TYPES: DocumentType[] = [
  {
    id: 'financial',
    name: 'Финансовая документация',
    icon: '/documents/financial.png',
    maps: ['customs', 'streets', 'interchange'],
  },
  {
    id: 'black-folder',
    name: 'Личные данные ЧВК',
    icon: '/documents/black-folder.png',
    maps: ['reserve', 'lighthouse', 'terminal'],
  },
  {
    id: 'tan-folder',
    name: 'Проектная документация',
    icon: '/documents/tan-folder.png',
    maps: ['factory', 'reserve', 'customs'],
  },
  {
    id: 'intel-folder',
    name: 'Чертежи и тех. документация',
    icon: '/documents/intel-folder.png',
    maps: ['interchange', 'factory', 'the-labyrinth'],
  },
  {
    id: 'letter',
    name: 'Тестовая документация',
    icon: '/documents/letter.png',
    maps: ['shoreline', 'woods', 'terminal'],
  },
  {
    id: 'handbook',
    name: 'Пользовательская документация',
    icon: '/documents/handbook.png',
    maps: ['ground-zero', 'streets', 'the-lab'],
  },
  {
    id: 'medical',
    name: 'Медицинская документация',
    icon: '/documents/medical.png',
    maps: ['the-lab', 'ground-zero', 'the-labyrinth'],
  },
  {
    id: 'classified',
    name: 'Эксплуатационная документация',
    icon: '/documents/classified.png',
    maps: ['shoreline', 'woods', 'lighthouse'],
  },
]

const byId = Object.fromEntries(
  DOCUMENT_TYPES.map((t) => [t.id, t]),
) as Record<DocumentTypeId, DocumentType>

export function isDocumentTypeId(value: unknown): value is DocumentTypeId {
  return typeof value === 'string' && value in byId
}

export function getDocumentType(id: DocumentTypeId): DocumentType {
  return byId[id]
}

export function getDocumentTypesForMap(mapId: MapId): DocumentType[] {
  return DOCUMENT_TYPES.filter((t) => t.maps.includes(mapId))
}

export function isDocumentTypeAllowedOnMap(
  documentType: DocumentTypeId,
  mapId: MapId,
): boolean {
  return byId[documentType].maps.includes(mapId)
}
