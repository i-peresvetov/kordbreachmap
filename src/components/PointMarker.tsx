import { useEffect, useMemo, useRef, useState } from 'react'
import { Marker, Popup, Tooltip } from 'react-leaflet'
import L from 'leaflet'
import { isRepoPoint, type MapPoint } from '../lib/pointsStorage'
import { getDocumentType } from '../data/documentTypes'
import { wikiToLatLng } from '../lib/mapCoords'
import { resolveScreenshotUrl } from '../lib/screenshotPath'
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
  selected: boolean
  shotOpen: boolean
  onSelect: () => void
  onDeselect: () => void
  onOpenShot: () => void
  onCloseShot: () => void
}

export function PointMarker({
  point,
  selected,
  shotOpen,
  onSelect,
  onDeselect,
  onOpenShot,
  onCloseShot,
}: Props) {
  const markerRef = useRef<L.Marker | null>(null)
  const [deletePoint, { isLoading }] = useDeletePointMutation()
  const [shotSrc, setShotSrc] = useState<string | null>(null)
  const doc = getDocumentType(point.documentType)
  const icon = useMemo(() => documentMarkerIcon(doc.icon), [doc.icon])
  const canDelete = !isRepoPoint(point.id)

  useEffect(() => {
    const marker = markerRef.current
    if (!marker) return
    if (selected) {
      marker.openPopup()
    } else {
      marker.closePopup()
    }
  }, [selected])

  useEffect(() => {
    if (!selected) setShotSrc(null)
  }, [selected])

  useEffect(() => {
    if (shotOpen && canDelete) onCloseShot()
  }, [shotOpen, canDelete, onCloseShot])

  // Resolve shot URL from the route itself (works on refresh / before popup content mounts)
  useEffect(() => {
    if (!shotOpen || canDelete) return
    let cancelled = false
    void resolveScreenshotUrl(point.mapId, point.name).then((src) => {
      if (cancelled) return
      if (src) setShotSrc(src)
      else onCloseShot()
    })
    return () => {
      cancelled = true
    }
  }, [shotOpen, canDelete, point.mapId, point.name, onCloseShot])

  return (
    <>
      <Marker
        ref={markerRef}
        position={wikiToLatLng(point.x, point.y)}
        icon={icon}
        eventHandlers={{
          popupopen: () => onSelect(),
          popupclose: () => onDeselect(),
        }}
      >
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
                onReady={setShotSrc}
                onMissing={() => {
                  setShotSrc(null)
                  if (shotOpen) onCloseShot()
                }}
                onOpen={onOpenShot}
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
      {shotOpen && shotSrc ? (
        <ImageLightbox
          src={shotSrc}
          alt={point.name}
          onClose={onCloseShot}
        />
      ) : null}
    </>
  )
}
