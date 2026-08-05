import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { useAddPointMutation } from '../features/points/pointsApi'
import type { MapId } from '../data/maps'
import {
  getDocumentTypesForMap,
  type DocumentTypeId,
} from '../data/documentTypes'

export type DraftCoords = { x: number; y: number }

type Props = {
  mapId: MapId
  draft: DraftCoords | null
  onCancel: () => void
  onSaved: () => void
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error ?? new Error('read failed'))
    reader.readAsDataURL(file)
  })
}

export function AddPointPanel({ mapId, draft, onCancel, onSaved }: Props) {
  const [documentType, setDocumentType] = useState<DocumentTypeId | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [addPoint, { isLoading }] = useAddPointMutation()

  const availableTypes = useMemo(
    () => getDocumentTypesForMap(mapId),
    [mapId],
  )

  useEffect(() => {
    setDocumentType(null)
    setPreview(null)
    setError(null)
    if (fileRef.current) fileRef.current.value = ''
  }, [draft?.x, draft?.y, mapId])

  useEffect(() => {
    if (
      documentType &&
      !availableTypes.some((t) => t.id === documentType)
    ) {
      setDocumentType(null)
    }
  }, [availableTypes, documentType])

  if (!draft) return null

  async function onFileChange(file: File | undefined) {
    setError(null)
    if (!file) {
      setPreview(null)
      return
    }
    if (!file.type.startsWith('image/')) {
      setError('Нужен файл изображения')
      setPreview(null)
      return
    }
    const dataUrl = await readFileAsDataUrl(file)
    setPreview(dataUrl)
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!draft) return
    if (!documentType) {
      setError('Выберите тип документа')
      return
    }
    try {
      await addPoint({
        mapId,
        x: draft.x,
        y: draft.y,
        documentType,
        screenshot: preview ?? undefined,
      }).unwrap()
      setDocumentType(null)
      setPreview(null)
      if (fileRef.current) fileRef.current.value = ''
      onSaved()
    } catch (err) {
      setError(String(err))
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
                  onClick={() => setDocumentType(type.id)}
                >
                  <img src={type.icon} alt="" className="doc-type-option__icon" />
                </button>
              )
            })}
          </div>
        </fieldset>
        <label className="field">
          <span>
            Скриншот <em className="field__optional">(необязательно)</em>
          </span>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={(e) => void onFileChange(e.target.files?.[0])}
          />
        </label>
        {preview ? (
          <div className="add-panel__preview-wrap">
            <img className="add-panel__preview" src={preview} alt="Превью" />
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => {
                setPreview(null)
                if (fileRef.current) fileRef.current.value = ''
              }}
            >
              Убрать картинку
            </button>
          </div>
        ) : null}
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
