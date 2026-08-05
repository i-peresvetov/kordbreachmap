import { useEffect, useRef, useState } from 'react'
import type { MapId } from '../data/maps'
import { screenshotUrls } from '../lib/screenshotPath'

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

/** Loads screenshot from public/screenshots/{mapId}/{name}.{ext} if the file exists. */
export function PointScreenshot({
  mapId,
  name,
  alt,
  className,
  onOpen,
  onReady,
  onMissing,
}: Props) {
  const candidates = screenshotUrls(mapId, name)
  const [index, setIndex] = useState(0)
  const [status, setStatus] = useState<Status>(
    candidates.length === 0 ? 'missing' : 'loading',
  )
  const onReadyRef = useRef(onReady)
  const onMissingRef = useRef(onMissing)
  onReadyRef.current = onReady
  onMissingRef.current = onMissing

  useEffect(() => {
    setIndex(0)
    setStatus(candidates.length === 0 ? 'missing' : 'loading')
  }, [mapId, name, candidates.length])

  const src = candidates[index]

  useEffect(() => {
    if (status === 'ready' && src) onReadyRef.current?.(src)
    if (status === 'missing') onMissingRef.current?.()
  }, [status, src])

  function onError() {
    const next = index + 1
    if (next < candidates.length) {
      setIndex(next)
      setStatus('loading')
    } else {
      setStatus('missing')
    }
  }

  function markReady() {
    setStatus('ready')
  }

  /** Cached images may skip onLoad — check complete after mount. */
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
