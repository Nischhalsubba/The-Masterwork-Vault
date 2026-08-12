import { useEffect, useMemo, useState } from 'react'
import { BarChart3, Copy, Search, Share2 } from 'lucide-react'
import catalogJson from '../data/catalog'
import type { CatalogData, ItemEntry } from '../types'
import { calculateCraftingPlan } from '../lib/crafting'
import { OverlayDialog } from './OverlayDialog'

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

function parseSharedIds() {
  try {
    const raw = new URLSearchParams(window.location.search).get('compare')
    return raw ? raw.split(',').map(decodeURIComponent).filter((id) => catalog.items.some((item) => item.id === id)).slice(0, MAX_COMPARE) : []
  } catch { return [] }
}

export function CompareWorkbench() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [ids, setIds] = useState<string[]>(() => parseSharedIds())
  const [copied, setCopied] = useState(false)

  useEffect(() => { if (ids.length >= 2 && new URLSearchParams(window.location.search).has('compare')) setOpen(true) }, [])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return catalog.items.filter((item) => !q || `${item.name} ${item.kind} ${item.campaign || ''} ${item.classes.join(' ')} ${item.profession || ''}`.toLowerCase().includes(q)).slice(0, 100)
  }, [query])
  const selected = ids.map((id) => catalog.items.find((item) => item.id === id)).filter((item): item is ItemEntry => Boolean(item))
  const stats = statRows(selected)
  const analysis = useMemo(() => selected.map((item) => {
    const plan = item.recipeKnown === false ? null : calculateCraftingPlan([{ item, quantity: 1 }], catalog.recipes)
    return {
      item,
      rawUnits: plan?.raw.reduce((sum, row) => sum + row.required, 0) ?? null,
      rawKinds: plan?.raw.length ?? null,
      craftedBatches: plan?.batches.length ?? null,
      directInputs: item.materials.length,
      setName: (item.set as { name?: string } | null | undefined)?.name || null,
    }
  }), [selected.map((item) => item.id).join('|')])
  const bestRaw = Math.min(...analysis.map((row) => row.rawUnits ?? Number.POSITIVE_INFINITY))

  const toggle = (id: string) => setIds((current) => current.includes(id) ? current.filter((value) => value !== id) : current.length < MAX_COMPARE ? [...current, id] : current)
  const statValue = (item: ItemEntry, stat: string) => {
    const variant = item.variants[item.variants.length - 1]
    return (variant?.stats || item.stats || {})[stat]
  }
  const bestNumeric = (stat: string) => Math.max(...selected.map((item) => typeof statValue(item, stat) === 'number' ? Number(statValue(item, stat)) : Number.NEGATIVE_INFINITY))

  const share = async () => {
    const url = new URL(window.location.href)
    url.searchParams.set('compare', ids.map(encodeURIComponent).join(','))
    try { await navigator.clipboard.writeText(url.toString()); setCopied(true); setTimeout(() => setCopied(false), 1800) }
    catch { setCopied(false) }
  }

  return <>
    <button className="compare-launcher" type="button" onClick={() => setOpen(true)} aria-haspopup="dialog"><BarChart3 size={17} aria-hidden="true" />Compare items{ids.length > 0 && <b>{ids.length}</b>}</button>
    <OverlayDialog open={open} onClose={() => setOpen(false)} title="Compare craftables" description="Stats, crafting burden, restrictions, and progression context side by side." className="mw-compare-dialog">
      <div className="mw-compare-body">
        <aside>
          <label className="mw-command-search"><Search size={16} /><span className="sr-only">Search items to compare</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a craftable…" /></label>
          <div className="mw-compare-picker" aria-label="Choose items to compare">{visible.map((item) => { const active = ids.includes(item.id); const disabled = !active && ids.length >= MAX_COMPARE; return <button key={item.id} className={active ? 'active' : ''} disabled={disabled} onClick={() => toggle(item.id)} aria-pressed={active}><span><strong>{item.name}</strong><small>{item.campaign || 'Unknown'} · {item.kind} · {item.profession || 'No profession'}</small></span><b>{active ? 'Added' : 'Add'}</b></button> })}</div>
        </aside>
        <main>
          {selected.length < 2 ? <div className="compare-empty"><BarChart3 size={34} /><h3>Select at least two items</h3><p>Select two or more craftables to compare their stats, crafting burden, restrictions, and progression context.</p></div> : <>
            <div className="mw-compare-actions"><span>{selected.length}/{MAX_COMPARE} selected</span><button type="button" onClick={share}><Share2 size={15} />{copied ? 'Link copied' : 'Share comparison'}{copied && <Copy size={13} />}</button></div>
            <div className="compare-table-wrap"><table className="compare-table"><thead><tr><th>Attribute</th>{selected.map((item) => <th key={item.id}>{item.name}</th>)}</tr></thead><tbody>
              <tr><th>Campaign</th>{analysis.map(({item}) => <td key={item.id}>{item.campaign || 'Unknown'}</td>)}</tr>
              <tr><th>Profession</th>{analysis.map(({item}) => <td key={item.id}>{item.profession || 'Not recorded'}</td>)}</tr>
              <tr><th>Classes</th>{analysis.map(({item}) => <td key={item.id}>{item.classes.includes('All') ? 'All classes' : item.classes.join(', ') || 'Not captured'}</td>)}</tr>
              <tr><th>Set</th>{analysis.map(({item,setName}) => <td key={item.id}>{setName || 'None recorded'}</td>)}</tr>
              <tr><th>Direct inputs</th>{analysis.map(({item,directInputs}) => <td key={item.id}>{item.recipeKnown === false ? 'Recipe unknown' : directInputs}</td>)}</tr>
              <tr><th>Raw material units</th>{analysis.map(({item,rawUnits}) => <td className={rawUnits != null && rawUnits === bestRaw ? 'mw-best' : ''} key={item.id}>{rawUnits == null ? 'Unknown' : rawUnits.toLocaleString()}</td>)}</tr>
              <tr><th>Raw material kinds</th>{analysis.map(({item,rawKinds}) => <td key={item.id}>{rawKinds ?? 'Unknown'}</td>)}</tr>
              <tr><th>Crafted intermediates</th>{analysis.map(({item,craftedBatches}) => <td key={item.id}>{craftedBatches ?? 'Unknown'}</td>)}</tr>
              {stats.map((stat) => { const best = bestNumeric(stat); return <tr key={stat}><th>{stat}</th>{selected.map((item) => { const value = statValue(item, stat); const winner = typeof value === 'number' && value === best; return <td className={winner ? 'mw-best' : ''} key={item.id}>{value == null ? '—' : typeof value === 'number' ? value.toLocaleString() : String(value)}</td> })}</tr> })}
            </tbody></table></div>
          </>}
        </main>
      </div>
    </OverlayDialog>
  </>
}
