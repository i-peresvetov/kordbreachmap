import { useState } from 'react'
import { exportPointsJson, getCustomPoints } from '../lib/pointsStorage'

export function ExportPointsButton() {
  const [status, setStatus] = useState<string | null>(null)

  async function copyToClipboard() {
    const custom = getCustomPoints()
    if (custom.length === 0) {
      setStatus('Нет новых точек для выгрузки')
      window.setTimeout(() => setStatus(null), 3500)
      return
    }
    const json = exportPointsJson()
    try {
      await navigator.clipboard.writeText(json)
      setStatus(`Скопировано новых: ${custom.length} — добавь в points.json`)
    } catch {
      downloadFile(json)
      setStatus('Буфер недоступен — скачан файл')
    }
    window.setTimeout(() => setStatus(null), 3500)
  }

  function downloadFile(json = exportPointsJson()) {
    const custom = getCustomPoints()
    if (custom.length === 0) {
      setStatus('Нет новых точек для выгрузки')
      window.setTimeout(() => setStatus(null), 3500)
      return
    }
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'custom-points.json'
    a.click()
    URL.revokeObjectURL(url)
    setStatus(`Скачано новых: ${custom.length} — смержи с points.json`)
    window.setTimeout(() => setStatus(null), 3500)
  }

  return (
    <div className="export-points">
      <button type="button" className="btn btn--ghost" onClick={() => void copyToClipboard()}>
        Копировать новые точки
      </button>
      <button type="button" className="btn btn--ghost" onClick={() => downloadFile()}>
        Скачать новые точки
      </button>
      {status ? <span className="export-points__status">{status}</span> : null}
    </div>
  )
}
