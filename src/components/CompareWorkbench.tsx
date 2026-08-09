import { useMemo, useRef, useState } from 'react'
import { BarChart3, Search, X } from 'lucide-react'
import catalogJson from '../data/catalog'
import type { CatalogData, ItemEntry } from '../types'

const catalog = catalogJson as CatalogData
const MAX_COMPARE = 4

function statRows(items: ItemEntry[]) {
  const keys = new Set<string>()
  for (const item of items) {
    const variant = item.variants[item.variants.length - 1]
    Object.keys(variant?.stats || item.stats || {}).forEach((key) => keys.add(key))
  }
  return [...keys].sort((a, b) => a.localeCompare(b))
}

export function CompareWorkbench() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [ids, setIds] = useState<string[]>([])
  const closeRef = useRef<HTMLButtonElement>(null)

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return catalog.items
      .filter((item) => !q || `${item.name} ${item.kind} ${item.campaign || ''} ${item.classes.join(' ')}`.toLowerCase().includes(q))
      .slice(0, 80)
  }, [query])
  const selected = ids.map((id) => catalog.items.find((item) => item.id === id)).filter((item): item is ItemEntry => Boolean(item))
  const stats = statRows(selected)

  const toggle = (id: string) => {
    setIds((current) => current.includes(id) ? current.filter((value) => value !== id) : current.length < MAX_COMPARE ? [...current, id] : current)
  }

  return (
    <>
      <button className="compare-launcher" type="button" onClick={() => { setOpen(true); requestAnimationFrame(() => closeRef.current?.focus()) }} aria-haspopup="dialog">
        <BarChart3 size={17} aria-hidden="true" />Compare items{ids.length > 0 && <b>{ids.length}</b>}
      </button>
      {open && (
        <div className="compare-layer" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) setOpen(false) }}>
          <section className="compare-dialog" role="dialog" aria-modal="true" aria-labelledby="compare-title">
            <header>
              <div><small>CATALOG COMPARE</small><h2 id="compare-title">Compare up to four craftables</h2><p>Stats, restrictions, campaign, and recipe size side by side.</p></div>
              <button ref={closeRef} onClick={() => setOpen(false)} aria-label="Close item comparison"><X size={20} /></button>
            </header>
            <div className="compare-body">
              <aside>
                <label className="search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search items to compare" placeholder="Find a craftable…" /></label>
                <div className="compare-picker" aria-label="Choose items to compare">
                  {visible.map((item) => {
                    const active = ids.includes(item.id)
                    const disabled = !active && ids.length >= MAX_COMPARE
                    return <button key={item.id} className={active ? 'active' : ''} disabled={disabled} onClick={() => toggle(item.id)} aria-pressed={active}><span><strong>{item.name}</strong><small>{item.campaign || 'Unknown'} · {item.kind}</small></span><b>{active ? 'Added' : 'Add'}</b></button>
                  })}
                </div>
              </aside>
              <main>
                {selected.length < 2 ? <div className="compare-empty"><BarChart3 size={34} /><h3>Select at least two items</h3><p>Use the list to build a focused comparison instead of juggling four item drawers like a particularly inefficient wizard.</p></div> : (
                  <div className="compare-table-wrap">
                    <table className="compare-table">
                      <thead><tr><th>Attribute</th>{selected.map((item) => <th key={item.id}>{item.name}</th>)}</tr></thead>
                      <tbody>
                        <tr><th>Campaign</th>{selected.map((item) => <td key={item.id}>{item.campaign || 'Unknown'}</td>)}</tr>
                        <tr><th>Type</th>{selected.map((item) => <td key={item.id}>{item.kind}</td>)}</tr>
                        <tr><th>Slot</th>{selected.map((item) => <td key={item.id}>{item.slot || 'Not recorded'}</td>)}</tr>
                        <tr><th>Classes</th>{selected.map((item) => <td key={item.id}>{item.classes.includes('All') ? 'All classes' : item.classes.join(', ') || 'Not captured'}</td>)}</tr>
                        <tr><th>Profession</th>{selected.map((item) => <td key={item.id}>{item.profession || 'Not recorded'}</td>)}</tr>
                        <tr><th>Item level</th>{selected.map((item) => { const variant = item.variants[item.variants.length - 1]; return <td key={item.id}>{variant?.itemLevel || item.itemLevel || 'Not recorded'}</td> })}</tr>
                        <tr><th>Direct ingredients</th>{selected.map((item) => <td key={item.id}>{item.recipeKnown === false ? 'Recipe unknown' : item.materials.length}</td>)}</tr>
                        {stats.map((stat) => <tr key={stat}><th>{stat}</th>{selected.map((item) => { const variant = item.variants[item.variants.length - 1]; const value = (variant?.stats || item.stats || {})[stat]; return <td key={item.id}>{value == null ? '—' : typeof value === 'number' ? value.toLocaleString() : String(value)}</td> })}</tr>)}
                      </tbody>
                    </table>
                  </div>
                )}
              </main>
            </div>
          </section>
        </div>
      )}
    </>
  )
}
