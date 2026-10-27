import { useEffect, useState } from 'react'
import catalogData from '../data/catalog'
import spriteDataUri from '../data/sprite'
import type { CatalogData } from '../types'

const catalog = catalogData as CatalogData
const materialByName = new Map(catalog.materials.map(material => [material.name.toLowerCase(), material]))
const spriteColumns = catalog.meta.sprite.columns || 10
const spriteRows = Math.ceil(catalog.meta.sprite.count / spriteColumns)

export function MaterialArtwork({ name }: { name: string }) {
  const material = materialByName.get(name.toLowerCase())
  const [failed, setFailed] = useState(false)
  const src = material?.icon || null

  useEffect(() => setFailed(false), [src, name])

  const representative = material?.artwork?.provenance === 'reference-derived' || material?.artwork?.provenance === 'placeholder'
  const label = representative ? `${name} — illustrative category icon` : `${name} material icon`

  if (src && !failed) {
    return <img className={representative ? 'forge-material-icon is-reference' : 'forge-material-icon'}
      src={src} alt="" loading="lazy" decoding="async" title={label}
      onError={() => setFailed(true)} aria-hidden="true" />
  }

  const idx = material?.iconIndex
  if (idx != null && idx >= 0 && idx < catalog.meta.sprite.count) {
    const size = 34
    return <span className="forge-material-icon forge-material-atlas" title={label} role="img" aria-label={label}>
      <img src={spriteDataUri} alt="" draggable={false} style={{
        width: spriteColumns * size, height: spriteRows * size,
        maxWidth: 'none', position: 'absolute',
        left: -(idx % spriteColumns) * size,
        top: -Math.floor(idx / spriteColumns) * size,
        pointerEvents: 'none',
      }} />
    </span>
  }

  return <span className="forge-material-icon forge-material-fallback" role="img" title={name + ': exact artwork unavailable'} aria-label={name + ': icon unavailable'}>?</span>
}
