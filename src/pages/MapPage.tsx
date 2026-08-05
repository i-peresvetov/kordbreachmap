import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { MapSelector } from '../components/MapSelector'
import { MapView } from '../components/MapView'
import { AddPointPanel, type DraftCoords } from '../components/AddPointPanel'
import { ExportPointsButton } from '../components/ExportPointsButton'
import { getMapById, isMapId, type MapId } from '../data/maps'
import type { DocumentTypeId } from '../data/documentTypes'
import { useGetPointsQuery } from '../features/points/pointsApi'
import { isRepoPoint } from '../lib/pointsStorage'
import { APP_VERSION } from '../version'

function parsePointRest(rest: string | undefined): {
  pointId: string | undefined
  shotOpen: boolean
} {
  const segments = (rest ?? '').split('/').filter(Boolean)
  const pointId = segments[0]
  const shotOpen = segments[1] === 'shot'
  return { pointId, shotOpen }
}

export function MapPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const pathRef = useRef(location.pathname)
  pathRef.current = location.pathname

  const { mapId: mapIdParam, '*': rest } = useParams<{
    mapId: string
    '*': string
  }>()
  const { pointId, shotOpen } = parsePointRest(rest)

  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState<DraftCoords | null>(null)
  const [draftDocumentType, setDraftDocumentType] =
    useState<DocumentTypeId | null>(null)

  const mapValid = !!mapIdParam && isMapId(mapIdParam)
  const mapId: MapId = mapValid ? mapIdParam : 'customs'
  const map = useMemo(() => getMapById(mapId), [mapId])
  const { data: points = [], isLoading } = useGetPointsQuery(mapId)

  const selectedPoint = pointId
    ? points.find((p) => p.id === pointId)
    : undefined

  useEffect(() => {
    if (!mapValid || !pointId || isLoading) return
    if (!selectedPoint) {
      navigate(`/${mapId}`, { replace: true })
      return
    }
    if (shotOpen && !isRepoPoint(selectedPoint.id)) {
      navigate(`/${mapId}/${pointId}`, { replace: true })
    }
  }, [
    mapValid,
    pointId,
    selectedPoint,
    isLoading,
    shotOpen,
    mapId,
    navigate,
  ])

  const onDocumentTypeChange = useCallback((type: DocumentTypeId | null) => {
    setDraftDocumentType(type)
  }, [])

  const clearDraft = useCallback(() => {
    setDraft(null)
    setDraftDocumentType(null)
  }, [])

  const handleMapChange = useCallback(
    (id: MapId) => {
      // Eagerly update so popupclose on old map teardown won't navigate back
      pathRef.current = `/${id}`
      navigate(`/${id}`)
      setAdding(false)
      clearDraft()
    },
    [navigate, clearDraft],
  )

  const onSelectPoint = useCallback(
    (id: string) => {
      // Keep /shot if this point is already selected (popupopen must not strip it)
      if (pointId === id) return
      navigate(`/${mapId}/${id}`)
    },
    [navigate, mapId, pointId],
  )

  const onDeselectPoint = useCallback(
    (id: string) => {
      // Read live path: popupclose on map remount must not undo navigate(`/${newMap}`)
      const segments = pathRef.current.replace(/^\//, '').split('/').filter(Boolean)
      const pathMapId = segments[0]
      const pathPointId = segments[1]
      if (pathPointId === id && pathMapId) {
        navigate(`/${pathMapId}`)
      }
    },
    [navigate],
  )

  const onOpenShot = useCallback(
    (id: string) => {
      navigate(`/${mapId}/${id}/shot`)
    },
    [navigate, mapId],
  )

  const onCloseShot = useCallback(
    (id: string) => {
      navigate(`/${mapId}/${id}`)
    },
    [navigate, mapId],
  )

  if (!mapValid) {
    return <Navigate to="/customs" replace />
  }

  return (
    <div className="app">
      <header className="toolbar">
        <div className="toolbar__brand">
          Доки Kord Breach
          <span className="toolbar__version" title={`Версия ${APP_VERSION}`}>
            v{APP_VERSION}
          </span>
        </div>
        <MapSelector value={mapId} onChange={handleMapChange} />
        <button
          type="button"
          className={`btn ${adding ? 'btn--active' : 'btn--primary'}`}
          onClick={() => {
            setAdding((v) => !v)
            clearDraft()
          }}
        >
          {adding ? 'Отменить добавление' : 'Добавить точку'}
        </button>
        <ExportPointsButton />
        <span className="toolbar__hint">
          {adding && !draft
            ? 'Кликните по карте, чтобы поставить точку'
            : adding && draft && !draftDocumentType
              ? 'Выберите тип документации'
              : isLoading
                ? 'Загрузка точек…'
                : `На карте: ${points.length}`}
        </span>
      </header>

      <main className="workspace">
        <div className="workspace__map">
          <MapView
            map={map}
            points={points}
            adding={adding && !draft}
            draft={
              draft
                ? { ...draft, documentType: draftDocumentType }
                : null
            }
            selectedPointId={pointId ?? null}
            shotOpen={shotOpen}
            onSelectPoint={onSelectPoint}
            onDeselectPoint={onDeselectPoint}
            onOpenShot={onOpenShot}
            onCloseShot={onCloseShot}
            onMapClick={(coords) => {
              setDraft(coords)
              setDraftDocumentType(null)
            }}
          />
        </div>
        <AddPointPanel
          mapId={mapId}
          draft={draft}
          documentType={draftDocumentType}
          onDocumentTypeChange={onDocumentTypeChange}
          onCancel={clearDraft}
          onSaved={() => {
            clearDraft()
            setAdding(false)
          }}
        />
      </main>
    </div>
  )
}
