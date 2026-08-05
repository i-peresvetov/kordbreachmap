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
}

/** Instant tooltip rendered in a portal so overflow parents cannot clip it. */
export function FloatingTooltip({
  text,
  children,
  className,
  placement = 'top',
}: Props) {
  const [tip, setTip] = useState<Tip | null>(null)
  const anchorRef = useRef<HTMLSpanElement>(null)

  const show = useCallback(() => {
    const el = anchorRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    setTip({
      text,
      x: rect.left + rect.width / 2,
      y: placement === 'bottom' ? rect.bottom : rect.top,
    })
  }, [text, placement])

  const hide = useCallback(() => setTip(null), [])

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
