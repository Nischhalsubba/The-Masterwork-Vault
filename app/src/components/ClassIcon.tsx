import { useEffect, useState } from 'react'
import { classIconSource, NW_HUB_CLASSES_SOURCE } from '../data/classIcons'

export function ClassIcon({ className, all = false }: { className: string; all?: boolean }) {
  const src = all ? null : classIconSource(className)
  const [failed, setFailed] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setFailed(false)
    setLoaded(false)
  }, [src])

  return (
    <span className={`mw-class-icon${all ? ' all' : ''}`} aria-hidden="true" title={all ? undefined : `Class artwork source: ${NW_HUB_CLASSES_SOURCE}`}>
      {(all || !src || failed || !loaded) && (
        <span className="mw-class-icon-fallback">{all ? 'ALL' : className.slice(0, 2).toUpperCase()}</span>
      )}
      {src && !failed && (
        <img src={src} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer"
          onLoad={() => setLoaded(true)}
          onError={() => { setFailed(true); setLoaded(false) }}
          style={{ visibility: loaded ? 'visible' : 'hidden' }} />
      )}
    </span>
  )
}
