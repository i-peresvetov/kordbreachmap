import { useMemo, useState } from 'react'
import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import type { MapPoint } from '../lib/pointsStorage'
import { getDocumentType } from '../data/documentTypes'
import { wikiToLatLng } from '../lib/mapCoords'
import { useDeletePointMutation } from '../features/points/pointsApi'
import { ImageLightbox } from './ImageLightbox'

function documentMarkerIcon(iconUrl: string) {
  return L.divIcon({
    className: 'point-marker',
    html: `<img class="point-marker__icon" src="${iconUrl}" alt="" />`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  })
}

type Props = {
  point: MapPoint
}

export function PointMarker({ point }: Props) {
  const [deletePoint, { isLoading }] = useDeletePointMutation()
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const doc = getDocumentType(point.documentType)
  const icon = useMemo(() => documentMarkerIcon(doc.icon), [doc.icon])

  return (
    <>
      <Marker position={wikiToLatLng(point.x, point.y)} icon={icon}>
        <Popup>
          <div className="point-popup">
            <div className="point-popup__header">
              <img className="point-popup__icon" src={doc.icon} alt="" />
              <div className="point-popup__type">{doc.name}</div>
            </div>
            {point.screenshot ? (
              <button
                type="button"
                className="point-popup__shot-btn"
                title="Открыть на весь экран"
                onClick={() => setLightboxOpen(true)}
              >
                <img
                  className="point-popup__shot"
                  src={point.screenshot}
                  alt={doc.name}
                />
              </button>
            ) : null}
            <button
              type="button"
              className="point-popup__delete"
              disabled={isLoading}
              onClick={() => {
                void deletePoint({ id: point.id, mapId: point.mapId })
              }}
            >
              Удалить
            </button>
          </div>
        </Popup>
      </Marker>
      {lightboxOpen && point.screenshot ? (
        <ImageLightbox
          src={point.screenshot}
          alt={doc.name}
          onClose={() => setLightboxOpen(false)}
        />
      ) : null}
    </>
  )
}
