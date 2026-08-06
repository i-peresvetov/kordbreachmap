import { useEffect, useRef, useState } from 'react'
import type { MapId } from '../data/maps'
import { screenshotUrl } from '../lib/screenshotPath'

type Props = {
  mapId: MapId
  name: string
  alt: string
  className?: string
  onOpen?: () => void
  onReady?: (src: string) => void
  onMissing?: () => void
}

type Status = 'loading' | 'ready' | 'missing'

/** Loads the known screenshot file for a point (single request). */
export function PointScreenshot({
  mapId,
  name,
  alt,
  className,
  onOpen,
  onReady,
  onMissing,
}: Props) {
  const src = screenshotUrl(mapId, name)
  const [status, setStatus] = useState<Status>(src ? 'loading' : 'missing')
  const onReadyRef = useRef(onReady)
  const onMissingRef = useRef(onMissing)
  onReadyRef.current = onReady
  onMissingRef.current = onMissing

  useEffect(() => {
    setStatus(src ? 'loading' : 'missing')
  }, [src])

  useEffect(() => {
    if (status === 'ready' && src) onReadyRef.current?.(src)
    if (status === 'missing') onMissingRef.current?.()
  }, [status, src])

  function markReady() {
    setStatus('ready')
  }

  function bindImg(img: HTMLImageElement | null) {
    if (!img || status === 'ready') return
    if (img.complete && img.naturalWidth > 0) {
      markReady()
    }
  }

  if (status === 'missing' || !src) return null

  const image = (
    <img
      ref={bindImg}
      className={`point-screenshot__img${className ? ` ${className}` : ''}${
        status === 'ready' ? ' is-ready' : ''
      }`}
      src={src}
      alt={alt}
      onLoad={markReady}
      onError={() => setStatus('missing')}
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
            if (status === 'ready') onOpen()
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
