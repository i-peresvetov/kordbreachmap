import { useEffect, useMemo } from 'react'
import {
  ImageOverlay,
  MapContainer,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import L from 'leaflet'
import type { TarkovMap } from '../data/maps'
import type { MapPoint } from '../lib/pointsStorage'
import type { DocumentTypeId } from '../data/documentTypes'
import { fitZoom, latLngToWiki, mapLatLngBounds, wikiToLatLng } from '../lib/mapCoords'
import { PointMarker } from './PointMarker'
import { DraftPointMarker } from './DraftPointMarker'
import type { DraftCoords } from './AddPointPanel'

export type DraftPlacement = DraftCoords & {
  documentType: DocumentTypeId | null
}

type Props = {
  map: TarkovMap
  points: MapPoint[]
  adding: boolean
  draft: DraftPlacement | null
  selectedPointId: string | null
  shotOpen: boolean
  onSelectPoint: (id: string) => void
  onDeselectPoint: (id: string) => void
  onOpenShot: (id: string) => void
  onCloseShot: (id: string) => void
  onMapClick: (coords: DraftCoords) => void
}

function MapController({
  map,
  adding,
  onMapClick,
}: {
  map: TarkovMap
  adding: boolean
  onMapClick: (coords: DraftCoords) => void
}) {
  const leafletMap = useMap()
  const bounds = useMemo(() => mapLatLngBounds(map), [map])

  useEffect(() => {
    const b = L.latLngBounds(bounds[0], bounds[1])
    leafletMap.setMaxBounds(b.pad(0.05))
    const el = leafletMap.getContainer()
    const z = fitZoom(map, el.clientWidth, el.clientHeight)
    leafletMap.setMinZoom(z - 1)
    leafletMap.setMaxZoom(Math.max(z + 4, 2))
    leafletMap.setView(wikiToLatLng(map.width / 2, map.height / 2), z, {
      animate: false,
    })
  }, [leafletMap, map, bounds])

  useMapEvents({
    click(e) {
      if (!adding) return
      const { x, y } = latLngToWiki(e.latlng.lat, e.latlng.lng)
      if (x < 0 || y < 0 || x > map.width || y > map.height) return
      onMapClick({ x, y })
    },
  })

  useEffect(() => {
    const el = leafletMap.getContainer()
    el.style.cursor = adding ? 'crosshair' : ''
    return () => {
      el.style.cursor = ''
    }
  }, [adding, leafletMap])

  return null
}

export function MapView({
  map,
  points,
  adding,
  draft,
  selectedPointId,
  shotOpen,
  onSelectPoint,
  onDeselectPoint,
  onOpenShot,
  onCloseShot,
  onMapClick,
}: Props) {
  const bounds = useMemo(() => mapLatLngBounds(map), [map])
  const center = useMemo(
    () => wikiToLatLng(map.width / 2, map.height / 2),
    [map],
  )

  return (
    <MapContainer
      key={map.id}
      className="map-view"
      crs={L.CRS.Simple}
      center={center}
      zoom={-2}
      minZoom={-5}
      maxZoom={4}
      zoomControl
      attributionControl={false}
      maxBoundsViscosity={1}
    >
      <ImageOverlay url={map.image} bounds={bounds} />
      <MapController map={map} adding={adding} onMapClick={onMapClick} />
      {points.map((p) => (
        <PointMarker
          key={p.id}
          point={p}
          selected={selectedPointId === p.id}
          shotOpen={shotOpen && selectedPointId === p.id}
          onSelect={() => onSelectPoint(p.id)}
          onDeselect={() => onDeselectPoint(p.id)}
          onOpenShot={() => onOpenShot(p.id)}
          onCloseShot={() => onCloseShot(p.id)}
        />
      ))}
      {draft ? (
        <DraftPointMarker
          x={draft.x}
          y={draft.y}
          documentType={draft.documentType}
        />
      ) : null}
    </MapContainer>
  )
}
