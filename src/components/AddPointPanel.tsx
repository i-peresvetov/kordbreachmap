import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useAddPointMutation } from '../features/points/pointsApi'
import type { MapId } from '../data/maps'
import {
  getDocumentTypesForMap,
  type DocumentTypeId,
} from '../data/documentTypes'
import { isPointNameTaken } from '../lib/pointsStorage'
import { screenshotDir } from '../lib/screenshotPath'

export type DraftCoords = { x: number; y: number }

type Props = {
  mapId: MapId
  draft: DraftCoords | null
  documentType: DocumentTypeId | null
  onDocumentTypeChange: (type: DocumentTypeId | null) => void
  onCancel: () => void
  onSaved: () => void
}

export function AddPointPanel({
  mapId,
  draft,
  documentType,
  onDocumentTypeChange,
  onCancel,
  onSaved,
}: Props) {
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [addPoint, { isLoading }] = useAddPointMutation()

  const availableTypes = useMemo(
    () => getDocumentTypesForMap(mapId),
    [mapId],
  )

  useEffect(() => {
    setName('')
    setError(null)
  }, [draft?.x, draft?.y, mapId])

  useEffect(() => {
    if (
      documentType &&
      !availableTypes.some((t) => t.id === documentType)
    ) {
      onDocumentTypeChange(null)
    }
  }, [availableTypes, documentType, onDocumentTypeChange])

  if (!draft) return null

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!draft) return
    if (!documentType) {
      setError('Выберите тип документа')
      return
    }
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Укажите название точки')
      return
    }
    if (isPointNameTaken(mapId, trimmed)) {
      setError('Точка с таким названием уже есть на этой карте')
      return
    }
    try {
      await addPoint({
        mapId,
        x: draft.x,
        y: draft.y,
        documentType,
        name: trimmed,
      }).unwrap()
      setName('')
      onSaved()
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'error' in err
          ? String((err as { error: string }).error)
          : String(err)
      setError(message)
    }
  }

  return (
    <aside className="add-panel">
      <h2 className="add-panel__title">Новая точка</h2>
      <p className="add-panel__coords">
        x: {draft.x.toFixed(1)}, y: {draft.y.toFixed(1)}
      </p>
      <form className="add-panel__form" onSubmit={(e) => void onSubmit(e)}>
        <fieldset className="field doc-type-field">
          <legend>Тип документа</legend>
          <div className="doc-type-grid" role="radiogroup" aria-label="Тип документа">
            {availableTypes.map((type) => {
              const selected = documentType === type.id
              return (
                <button
                  key={type.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={type.name}
                  data-tooltip={type.name}
                  className={`doc-type-option${selected ? ' is-selected' : ''}`}
                  onClick={() => onDocumentTypeChange(type.id)}
                >
                  <img src={type.icon} alt="" className="doc-type-option__icon" />
                </button>
              )
            })}
          </div>
        </fieldset>
        <label className="field">
          <span>Название точки</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Например: офис 2 этаж"
            autoFocus
          />
        </label>
        <p className="add-panel__hint">
          Скриншот: файл с таким же именем в{' '}
          <code>{screenshotDir(mapId)}/</code>
          {' '}(png / jpg / webp)
        </p>
        {error ? <p className="add-panel__error">{error}</p> : null}
        <div className="add-panel__actions">
          <button type="button" className="btn btn--ghost" onClick={onCancel}>
            Отмена
          </button>
          <button type="submit" className="btn btn--primary" disabled={isLoading}>
            {isLoading ? 'Сохранение…' : 'Сохранить'}
          </button>
        </div>
      </form>
    </aside>
  )
}
