import { useEffect, useState } from 'react'
import { classIconSource, NW_HUB_CLASSES_SOURCE } from '../data/classIcons'

export function ClassIcon({ className, all = false }: { className: string; all?: boolean }) {
  const src = all ? null : classIconSource(className)
  const [failed, setFailed] = useState(false)

  useEffect(() => setFailed(false), [src])

  return (
    <span className={`mw-class-icon${all ? ' all' : ''}`} aria-hidden="true" title={all ? undefined : `Class artwork source: ${NW_HUB_CLASSES_SOURCE}`}>
      {src && !failed
        ? <img src={src} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setFailed(true)} />
        : <span>{all ? 'ALL' : className.slice(0, 2).toUpperCase()}</span>}
    </span>
  )
}
