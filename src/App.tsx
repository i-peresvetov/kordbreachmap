import { useMemo, useState } from 'react'
import { MapSelector } from './components/MapSelector'
import { MapView } from './components/MapView'
import { AddPointPanel, type DraftCoords } from './components/AddPointPanel'
import { ExportPointsButton } from './components/ExportPointsButton'
import { getMapById, type MapId } from './data/maps'
import { useGetPointsQuery } from './features/points/pointsApi'

export default function App() {
  const [mapId, setMapId] = useState<MapId>('customs')
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState<DraftCoords | null>(null)

  const map = useMemo(() => getMapById(mapId), [mapId])
  const { data: points = [], isLoading } = useGetPointsQuery(mapId)

  function handleMapChange(id: MapId) {
    setMapId(id)
    setAdding(false)
    setDraft(null)
  }

  return (
    <div className="app">
      <header className="toolbar">
        <div className="toolbar__brand">Карты Таркова</div>
        <MapSelector value={mapId} onChange={handleMapChange} />
        <button
          type="button"
          className={`btn ${adding ? 'btn--active' : 'btn--primary'}`}
          onClick={() => {
            setAdding((v) => !v)
            setDraft(null)
          }}
        >
          {adding ? 'Отменить добавление' : 'Добавить точку'}
        </button>
        <ExportPointsButton />
        <span className="toolbar__hint">
          {adding
            ? 'Кликните по карте, чтобы поставить точку'
            : isLoading
              ? 'Загрузка точек…'
              : `Точек: ${points.length}`}
        </span>
      </header>

      <main className="workspace">
        <div className="workspace__map">
          <MapView
            map={map}
            points={points}
            adding={adding && !draft}
            onMapClick={(coords) => {
              setDraft(coords)
            }}
          />
        </div>
        <AddPointPanel
          mapId={mapId}
          draft={draft}
          onCancel={() => setDraft(null)}
          onSaved={() => {
            setDraft(null)
            setAdding(false)
          }}
        />
      </main>
    </div>
  )
}
