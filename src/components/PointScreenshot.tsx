import { useEffect, useState } from 'react'
import type { MapId } from '../data/maps'
import { screenshotUrls } from '../lib/screenshotPath'

type Props = {
  mapId: MapId
  name: string
  alt: string
  className?: string
  onOpen?: (src: string) => void
}

type Status = 'loading' | 'ready' | 'missing'

/** Loads screenshot from public/screenshots/{mapId}/{name}.{ext} if the file exists. */
export function PointScreenshot({ mapId, name, alt, className, onOpen }: Props) {
  const candidates = screenshotUrls(mapId, name)
  const [index, setIndex] = useState(0)
  const [status, setStatus] = useState<Status>(
    candidates.length === 0 ? 'missing' : 'loading',
  )

  useEffect(() => {
    setIndex(0)
    setStatus(candidates.length === 0 ? 'missing' : 'loading')
  }, [mapId, name, candidates.length])

  const src = candidates[index]

  function onError() {
    const next = index + 1
    if (next < candidates.length) {
      setIndex(next)
      setStatus('loading')
    } else {
      setStatus('missing')
    }
  }

  if (status === 'missing' || !src) return null

  const image = (
    <img
      className={`point-screenshot__img${className ? ` ${className}` : ''}${
        status === 'ready' ? ' is-ready' : ''
      }`}
      src={src}
      alt={alt}
      onLoad={() => setStatus('ready')}
      onError={onError}
    />
  )

  return (
    <div
      className={`point-screenshot${status === 'loading' ? ' is-loading' : ''}`}
    >
      {status === 'loading' ? (
        <div className="point-screenshot__skeleton" aria-hidden="true" />
      ) : null}
      {onOpen ? (
        <button
          type="button"
          className="point-popup__shot-btn"
          title="Открыть на весь экран"
          disabled={status !== 'ready'}
          onClick={() => {
            if (status === 'ready') onOpen(src)
          }}
        >
          {image}
        </button>
      ) : (
        image
      )}
    </div>
  )
}
