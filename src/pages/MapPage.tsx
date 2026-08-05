import { useCallback, useEffect, useMemo, useState } from 'react'
import { Navigate, useMatch, useNavigate, useParams } from 'react-router-dom'
import { MapSelector } from '../components/MapSelector'
import { MapView } from '../components/MapView'
import { AddPointPanel, type DraftCoords } from '../components/AddPointPanel'
import { ExportPointsButton } from '../components/ExportPointsButton'
import { getMapById, isMapId, type MapId } from '../data/maps'
import type { DocumentTypeId } from '../data/documentTypes'
import { useGetPointsQuery } from '../features/points/pointsApi'
import { isRepoPoint } from '../lib/pointsStorage'
import { APP_VERSION } from '../version'

export function MapPage() {
  const navigate = useNavigate()
  const { mapId: mapIdParam, pointId } = useParams<{
    mapId: string
    pointId?: string
  }>()
  const shotOpen = !!useMatch({ path: '/:mapId/:pointId/shot', end: true })

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
      navigate(`/${id}`)
      setAdding(false)
      clearDraft()
    },
    [navigate, clearDraft],
  )

  const onSelectPoint = useCallback(
    (id: string) => {
      navigate(`/${mapId}/${id}`)
    },
    [navigate, mapId],
  )

  const onDeselectPoint = useCallback(
    (id: string) => {
      if (pointId === id) navigate(`/${mapId}`)
    },
    [navigate, mapId, pointId],
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
