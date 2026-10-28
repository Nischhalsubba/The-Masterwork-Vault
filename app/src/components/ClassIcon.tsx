import { useEffect, useRef, useState } from 'react'
import { classIconSource, NW_HUB_CLASSES_SOURCE } from '../data/classIcons'

export function ClassIcon({ className, all = false }: { className: string; all?: boolean }) {
  const src = all ? null : classIconSource(className)
  const rootRef = useRef<HTMLSpanElement>(null)
  const [failed, setFailed] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [nearViewport, setNearViewport] = useState(false)

  useEffect(() => {
    setFailed(false)
    setLoaded(false)
    setNearViewport(false)
    if (!src) return
    const element = rootRef.current
    if (!element || typeof IntersectionObserver === 'undefined') {
      setNearViewport(true)
      return
    }
    // Native loading=lazy may still fetch every 300px source near a horizontally
    // scrolling filter on a 390px phone. Request only icons actually approaching
    // the visible area; keep source URL, provenance and fallback unchanged.
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setNearViewport(true)
        observer.disconnect()
      }
    }, { rootMargin: '64px' })
    observer.observe(element)
    return () => observer.disconnect()
  }, [src])

  return (
    <span ref={rootRef} className={`mw-class-icon${all ? ' all' : ''}`} aria-hidden="true" title={all ? undefined : `Class artwork source: ${NW_HUB_CLASSES_SOURCE}`}>
      {(all || !src || failed || !loaded) && (
        <span className="mw-class-icon-fallback">{all ? 'ALL' : className.slice(0, 2).toUpperCase()}</span>
      )}
      {src && nearViewport && !failed && (
        <img src={src} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer"
          onLoad={() => setLoaded(true)}
          onError={() => { setFailed(true); setLoaded(false) }}
          style={{ visibility: loaded ? 'visible' : 'hidden' }} />
      )}
    </span>
  )
}
