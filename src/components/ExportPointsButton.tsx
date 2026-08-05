import { useState } from 'react'
import { exportPointsJson } from '../lib/pointsStorage'

export function ExportPointsButton() {
  const [status, setStatus] = useState<string | null>(null)

  async function copyToClipboard() {
    const json = exportPointsJson()
    try {
      await navigator.clipboard.writeText(json)
      setStatus('Скопировано — вставь в src/data/points.json')
    } catch {
      downloadFile(json)
      setStatus('Буфер недоступен — скачан points.json')
    }
    window.setTimeout(() => setStatus(null), 3500)
  }

  function downloadFile(json = exportPointsJson()) {
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'points.json'
    a.click()
    URL.revokeObjectURL(url)
    setStatus('Скачан points.json → положи в src/data/')
    window.setTimeout(() => setStatus(null), 3500)
  }

  return (
    <div className="export-points">
      <button type="button" className="btn btn--ghost" onClick={() => void copyToClipboard()}>
        Копировать точки
      </button>
      <button type="button" className="btn btn--ghost" onClick={() => downloadFile()}>
        Скачать points.json
      </button>
      {status ? <span className="export-points__status">{status}</span> : null}
    </div>
  )
}
