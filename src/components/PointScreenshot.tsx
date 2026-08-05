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

/** Loads screenshot from public/screenshots/{mapId}/{name}.{ext} if the file exists. */
export function PointScreenshot({ mapId, name, alt, className, onOpen }: Props) {
  const candidates = screenshotUrls(mapId, name)
  const [index, setIndex] = useState(0)
  const [missing, setMissing] = useState(candidates.length === 0)

  useEffect(() => {
    setIndex(0)
    setMissing(candidates.length === 0)
  }, [mapId, name, candidates.length])

  if (missing || !candidates[index]) return null

  const src = candidates[index]

  if (onOpen) {
    return (
      <button
        type="button"
        className="point-popup__shot-btn"
        title="Открыть на весь экран"
        onClick={() => onOpen(src)}
      >
        <img
          className={className}
          src={src}
          alt={alt}
          onError={() => {
            const next = index + 1
            if (next < candidates.length) setIndex(next)
            else setMissing(true)
          }}
        />
      </button>
    )
  }

  return (
    <img
      className={className}
      src={src}
      alt={alt}
      onError={() => {
        const next = index + 1
        if (next < candidates.length) setIndex(next)
        else setMissing(true)
      }}
    />
  )
}
