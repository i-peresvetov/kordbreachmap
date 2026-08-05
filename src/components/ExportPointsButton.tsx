import { useState } from 'react'
import { createPortal } from 'react-dom'
import { exportPointsJson, getCustomPoints } from '../lib/pointsStorage'
import {
  useClearCustomPointsMutation,
  useGetCustomCountQuery,
} from '../features/points/pointsApi'

export function ExportPointsButton() {
  const [status, setStatus] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const { data: customCount = 0 } = useGetCustomCountQuery()
  const [clearCustomPoints, { isLoading: clearing }] =
    useClearCustomPointsMutation()

  function flash(message: string) {
    setStatus(message)
    window.setTimeout(() => setStatus(null), 3500)
  }

  async function copyToClipboard() {
    const custom = getCustomPoints()
    if (custom.length === 0) {
      flash('Нет новых точек для выгрузки')
      return
    }
    const json = exportPointsJson()
    try {
      await navigator.clipboard.writeText(json)
      flash(`Скопировано новых: ${custom.length}`)
    } catch {
      downloadFile(json)
      flash('Буфер недоступен — скачан файл')
    }
  }

  function downloadFile(json = exportPointsJson()) {
    const custom = getCustomPoints()
    if (custom.length === 0) {
      flash('Нет новых точек для выгрузки')
      return
    }
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'custom-points.json'
    a.click()
    URL.revokeObjectURL(url)
    flash(`Скачано новых: ${custom.length}`)
  }

  async function confirmClear() {
    const removed = await clearCustomPoints().unwrap()
    setConfirmOpen(false)
    flash(removed > 0 ? `Удалено локальных: ${removed}` : 'Локальных точек не было')
  }

  return (
    <div className="export-points">
      <span className="export-points__count">
        Локально: <strong>{customCount}</strong>
      </span>
      <button type="button" className="btn btn--ghost" onClick={() => void copyToClipboard()}>
        Копировать новые точки
      </button>
      <button type="button" className="btn btn--ghost" onClick={() => downloadFile()}>
        Скачать новые точки
      </button>
      <button
        type="button"
        className="btn btn--danger"
        disabled={customCount === 0 || clearing}
        onClick={() => setConfirmOpen(true)}
      >
        Очистить локальные
      </button>

      {status
        ? createPortal(
            <div className="status-toast" role="status">
              {status}
            </div>,
            document.body,
          )
        : null}

      {confirmOpen
        ? createPortal(
            <div
              className="confirm-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="clear-local-title"
            >
              <div
                className="confirm-dialog__backdrop"
                onClick={() => !clearing && setConfirmOpen(false)}
              />
              <div className="confirm-dialog__card">
                <h2 id="clear-local-title" className="confirm-dialog__title">
                  Очистить локальные точки?
                </h2>
                <p className="confirm-dialog__text">
                  Будет удалено локальных точек: <strong>{customCount}</strong>.
                  Точки из репозитория останутся. Это действие нельзя отменить.
                </p>
                <div className="confirm-dialog__actions">
                  <button
                    type="button"
                    className="btn btn--ghost"
                    disabled={clearing}
                    onClick={() => setConfirmOpen(false)}
                  >
                    Отмена
                  </button>
                  <button
                    type="button"
                    className="btn btn--danger"
                    disabled={clearing}
                    onClick={() => void confirmClear()}
                  >
                    {clearing ? 'Удаление…' : 'Удалить'}
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}
