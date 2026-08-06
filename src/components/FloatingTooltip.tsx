import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'

type Tip = {
  text: string
  x: number
  y: number
}

type Placement = 'top' | 'bottom'

type Props = {
  text: string
  children: ReactNode
  className?: string
  /** Where the tip sits relative to the anchor. Default: top. */
  placement?: Placement
  /** Delay before showing, in ms. Default: 0 (instant). */
  delayMs?: number
}

/** Tooltip rendered in a portal so overflow parents cannot clip it. */
export function FloatingTooltip({
  text,
  children,
  className,
  placement = 'top',
  delayMs = 0,
}: Props) {
  const [tip, setTip] = useState<Tip | null>(null)
  const anchorRef = useRef<HTMLSpanElement>(null)
  const timerRef = useRef<number | null>(null)

  const clearTimer = useCallback(() => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const showNow = useCallback(() => {
    const el = anchorRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    setTip({
      text,
      x: rect.left + rect.width / 2,
      y: placement === 'bottom' ? rect.bottom : rect.top,
    })
  }, [text, placement])

  const show = useCallback(() => {
    clearTimer()
    if (delayMs <= 0) {
      showNow()
      return
    }
    timerRef.current = window.setTimeout(showNow, delayMs)
  }, [clearTimer, delayMs, showNow])

  const hide = useCallback(() => {
    clearTimer()
    setTip(null)
  }, [clearTimer])

  useEffect(() => () => clearTimer(), [clearTimer])

  useEffect(() => {
    if (!tip) return
    function onScroll() {
      hide()
    }
    window.addEventListener('scroll', onScroll, true)
    return () => window.removeEventListener('scroll', onScroll, true)
  }, [tip, hide])

  return (
    <>
      <span
        ref={anchorRef}
        className={className}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
      >
        {children}
      </span>
      {tip
        ? createPortal(
            <div
              className={`floating-tooltip floating-tooltip--${placement}`}
              style={{ left: tip.x, top: tip.y }}
              role="tooltip"
            >
              {tip.text}
            </div>,
            document.body,
          )
        : null}
    </>
  )
}
