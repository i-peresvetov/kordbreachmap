import { MAPS, type MapId } from '../data/maps'

type Props = {
  value: MapId
  onChange: (id: MapId) => void
}

export function MapSelector({ value, onChange }: Props) {
  return (
    <label className="map-selector">
      <span className="map-selector__label">Локация</span>
      <select
        className="map-selector__select"
        value={value}
        onChange={(e) => onChange(e.target.value as MapId)}
      >
        {MAPS.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
      </select>
    </label>
  )
}
