import { useMemo } from 'react'
import { Marker } from 'react-leaflet'
import L from 'leaflet'
import type { DocumentTypeId } from '../data/documentTypes'
import { getDocumentType } from '../data/documentTypes'
import { wikiToLatLng } from '../lib/mapCoords'

function placeholderIcon() {
  return L.divIcon({
    className: 'point-marker draft-marker',
    html: '<span class="draft-marker__dot"></span>',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })
}

function documentIcon(iconUrl: string) {
  return L.divIcon({
    className: 'point-marker draft-marker',
    html: `<img class="point-marker__icon draft-marker__icon" src="${iconUrl}" alt="" />`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  })
}

type Props = {
  x: number
  y: number
  documentType: DocumentTypeId | null
}

export function DraftPointMarker({ x, y, documentType }: Props) {
  const icon = useMemo(() => {
    if (!documentType) return placeholderIcon()
    return documentIcon(getDocumentType(documentType).icon)
  }, [documentType])

  return (
    <Marker
      position={wikiToLatLng(x, y)}
      icon={icon}
      interactive={false}
      zIndexOffset={1000}
    />
  )
}
