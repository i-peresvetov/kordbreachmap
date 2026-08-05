import { useMemo, useState } from 'react'
import { Marker, Popup, Tooltip } from 'react-leaflet'
import L from 'leaflet'
import { isRepoPoint, type MapPoint } from '../lib/pointsStorage'
import { getDocumentType } from '../data/documentTypes'
import { wikiToLatLng } from '../lib/mapCoords'
import { useDeletePointMutation } from '../features/points/pointsApi'
import { ImageLightbox } from './ImageLightbox'
import { PointScreenshot } from './PointScreenshot'

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
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)
  const doc = getDocumentType(point.documentType)
  const icon = useMemo(() => documentMarkerIcon(doc.icon), [doc.icon])
  const canDelete = !isRepoPoint(point.id)

  return (
    <>
      <Marker position={wikiToLatLng(point.x, point.y)} icon={icon}>
        <Tooltip direction="top" offset={[0, -18]} opacity={1} className="point-tooltip">
          {point.name}
        </Tooltip>
        <Popup>
          <div className="point-popup">
            <div className="point-popup__header">
              <img className="point-popup__icon" src={doc.icon} alt="" />
              <div>
                <div className="point-popup__name">{point.name}</div>
                <div className="point-popup__type">{doc.name}</div>
              </div>
            </div>
            {!canDelete ? (
              <PointScreenshot
                mapId={point.mapId}
                name={point.name}
                alt={point.name}
                className="point-popup__shot"
                onOpen={setLightboxSrc}
              />
            ) : null}
            {canDelete ? (
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
            ) : null}
          </div>
        </Popup>
      </Marker>
      {lightboxSrc ? (
        <ImageLightbox
          src={lightboxSrc}
          alt={point.name}
          onClose={() => setLightboxSrc(null)}
        />
      ) : null}
    </>
  )
}
