import { useCallback, useMemo, useState } from 'react'
import { MapSelector } from './components/MapSelector'
import { MapView } from './components/MapView'
import { AddPointPanel, type DraftCoords } from './components/AddPointPanel'
import { ExportPointsButton } from './components/ExportPointsButton'
import { getMapById, type MapId } from './data/maps'
import type { DocumentTypeId } from './data/documentTypes'
import { useGetPointsQuery } from './features/points/pointsApi'
import { APP_VERSION } from './version'

export default function App() {
  const [mapId, setMapId] = useState<MapId>('customs')
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState<DraftCoords | null>(null)
  const [draftDocumentType, setDraftDocumentType] =
    useState<DocumentTypeId | null>(null)

  const map = useMemo(() => getMapById(mapId), [mapId])
  const { data: points = [], isLoading } = useGetPointsQuery(mapId)

  const onDocumentTypeChange = useCallback((type: DocumentTypeId | null) => {
    setDraftDocumentType(type)
  }, [])

  function clearDraft() {
    setDraft(null)
    setDraftDocumentType(null)
  }

  function handleMapChange(id: MapId) {
    setMapId(id)
    setAdding(false)
    clearDraft()
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
