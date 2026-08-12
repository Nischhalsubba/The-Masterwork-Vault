import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'

const FOCUSABLE = 'button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'

export function OverlayDialog({ open, onClose, title, description, children, className = '' }: {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  className?: string
}) {
  const dialogRef = useRef<HTMLElement>(null)
  const returnFocus = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return
    returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    requestAnimationFrame(() => dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus({ preventScroll: true }))

    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); onClose(); return }
      if (event.key !== 'Tab' || !dialogRef.current) return
      const nodes = [...dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((node) => node.getClientRects().length > 0)
      if (!nodes.length) return
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', keydown)
    return () => {
      document.removeEventListener('keydown', keydown)
      document.body.style.overflow = previousOverflow
      requestAnimationFrame(() => returnFocus.current?.isConnected && returnFocus.current.focus({ preventScroll: true }))
    }
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="mw-dialog-layer" role="presentation" onMouseDown={(event) => event.currentTarget === event.target && onClose()}>
      <section ref={dialogRef} className={`mw-dialog ${className}`} role="dialog" aria-modal="true" aria-labelledby="mw-dialog-title" aria-describedby={description ? 'mw-dialog-description' : undefined}>
        <header className="mw-dialog-head">
          <div><h2 id="mw-dialog-title">{title}</h2>{description && <p id="mw-dialog-description">{description}</p>}</div>
          <button type="button" onClick={onClose} aria-label={`Close ${title}`}><X size={19} aria-hidden="true" /></button>
        </header>
        {children}
      </section>
    </div>
  )
}
