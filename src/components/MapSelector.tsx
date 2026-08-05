import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { MAPS, type MapId } from '../data/maps'
import {
  DOCUMENT_TYPES,
  getDocumentTypesForMap,
  type DocumentTypeId,
} from '../data/documentTypes'
import { FloatingTooltip } from './FloatingTooltip'

type Props = {
  value: MapId
  onChange: (id: MapId) => void
}

export function MapSelector({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [docFilter, setDocFilter] = useState<DocumentTypeId | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const listId = useId()
  const selected = MAPS.find((m) => m.id === value) ?? MAPS[0]
  const selectedDocs = getDocumentTypesForMap(selected.id)

  const filteredMaps = useMemo(() => {
    if (!docFilter) return MAPS
    return MAPS.filter((m) =>
      getDocumentTypesForMap(m.id).some((t) => t.id === docFilter),
    )
  }, [docFilter])

  useEffect(() => {
    if (!open) return

    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="map-selector" ref={rootRef}>
      <span className="map-selector__label" id={`${listId}-label`}>
        Локация
      </span>
      <div className="map-selector__dropdown">
        <button
          type="button"
          className={`map-selector__trigger${open ? ' is-open' : ''}`}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          aria-labelledby={`${listId}-label`}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="map-selector__trigger-name">{selected.name}</span>
          <span className="map-selector__docs-list" aria-hidden="true">
            {selectedDocs.map((type) => (
              <FloatingTooltip key={type.id} text={type.name} className="map-selector__doc">
                <img
                  src={type.icon}
                  alt=""
                  className="map-selector__doc-icon"
                />
              </FloatingTooltip>
            ))}
          </span>
          <span className="map-selector__chevron" aria-hidden="true" />
        </button>

        {open ? (
          <div id={listId} className="map-selector__panel">
            <div className="map-selector__filter">
              <div className="map-selector__filter-label">Фильтр по документации</div>
              <div
                className="map-selector__filter-grid"
                role="radiogroup"
                aria-label="Фильтр по типу документации"
              >
                {DOCUMENT_TYPES.map((type) => {
                  const active = docFilter === type.id
                  return (
                    <FloatingTooltip key={type.id} text={type.name}>
                      <button
                        type="button"
                        role="radio"
                        aria-checked={active}
                        aria-label={type.name}
                        className={`map-selector__filter-tile${active ? ' is-selected' : ''}`}
                        onClick={() =>
                          setDocFilter((prev) => (prev === type.id ? null : type.id))
                        }
                      >
                        <img
                          src={type.icon}
                          alt=""
                          className="map-selector__filter-icon"
                        />
                      </button>
                    </FloatingTooltip>
                  )
                })}
              </div>
            </div>

            <ul
              className="map-selector__list"
              role="listbox"
              aria-labelledby={`${listId}-label`}
            >
              {filteredMaps.length === 0 ? (
                <li className="map-selector__empty">Нет локаций с этим типом</li>
              ) : (
                filteredMaps.map((m) => {
                  const docs = getDocumentTypesForMap(m.id)
                  const isSelected = m.id === value
                  return (
                    <li key={m.id} role="presentation">
                      <button
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        className={`map-selector__option${isSelected ? ' is-selected' : ''}`}
                        onClick={() => {
                          onChange(m.id)
                          setOpen(false)
                        }}
                      >
                        <span className="map-selector__option-name">{m.name}</span>
                        <span
                          className="map-selector__docs-list"
                          onClick={(e) => e.stopPropagation()}
                          onMouseDown={(e) => e.stopPropagation()}
                        >
                          {docs.map((type) => (
                            <FloatingTooltip
                              key={type.id}
                              text={type.name}
                              className="map-selector__doc"
                            >
                              <img
                                src={type.icon}
                                alt=""
                                className="map-selector__doc-icon"
                                aria-label={type.name}
                              />
                            </FloatingTooltip>
                          ))}
                        </span>
                      </button>
                    </li>
                  )
                })
              )}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  )
}
