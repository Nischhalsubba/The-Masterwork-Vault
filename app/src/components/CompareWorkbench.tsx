import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { AlertTriangle, BarChart3, CheckCircle2, Copy, Search, Share2, X } from 'lucide-react'
import catalogJson from '../data/catalog'
import type { CatalogData, ItemEntry } from '../types'
import { calculateCraftingPlan } from '../lib/crafting'
import { OverlayDialog } from './OverlayDialog'

const catalog = catalogJson as CatalogData
const MAX_COMPARE = 4

type AnalysisRow = {
  item: ItemEntry
  rawUnits: number | null
  rawKinds: number | null
  craftedBatches: number | null
  directInputs: number
  setName: string | null
}

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

function allowedClasses(item: ItemEntry) {
  return item.classes.includes('All') ? null : new Set(item.classes)
}

function professionSummary(items: ItemEntry[]) {
  const professions = [...new Set(items.map((item) => item.profession).filter((value): value is string => Boolean(value)))].sort()
  if (!professions.length) return 'Crafting professions are not recorded for the selected items.'
  return professions.length === 1 ? `Crafting profession: ${professions[0]}.` : `Crafting spans ${professions.length} professions: ${professions.join(', ')}.`
}

function compatibilitySummary(items: ItemEntry[]) {
  if (items.length < 2) return null
  const restricted = items.map(allowedClasses).filter((value): value is Set<string> => Boolean(value))
  if (!restricted.length) return { compatible: true, label: 'All selected items support all classes.' }
  let common = new Set(restricted[0])
  for (const set of restricted.slice(1)) common = new Set([...common].filter((value) => set.has(value)))
  if (!common.size) return { compatible: false, label: 'No recorded class can equip every selected item.' }
  return { compatible: true, label: `Shared recorded classes: ${[...common].sort().join(', ')}` }
}

export function CompareWorkbench() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [ids, setIds] = useState<string[]>(() => parseSharedIds())
  const [copied, setCopied] = useState(false)
  const [differencesOnly, setDifferencesOnly] = useState(false)
  const deferredQuery = useDeferredValue(query)

  useEffect(() => { if (ids.length >= 2 && new URLSearchParams(window.location.search).has('compare')) setOpen(true) }, [])

  const visible = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase()
    return catalog.items.filter((item) => !q || `${item.name} ${item.kind} ${item.campaign || ''} ${item.classes.join(' ')} ${item.profession || ''}`.toLowerCase().includes(q)).slice(0, 100)
  }, [deferredQuery])

  const selected = ids.map((id) => catalog.items.find((item) => item.id === id)).filter((item): item is ItemEntry => Boolean(item))
  const stats = statRows(selected)
  const analysis = useMemo<AnalysisRow[]>(() => selected.map((item) => {
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

  const compatibility = compatibilitySummary(selected)
  const professions = professionSummary(selected)
  const bestRaw = Math.min(...analysis.map((row) => row.rawUnits ?? Number.POSITIVE_INFINITY))
  const toggle = (id: string) => setIds((current) => current.includes(id) ? current.filter((value) => value !== id) : current.length < MAX_COMPARE ? [...current, id] : current)
  const statValue = (item: ItemEntry, stat: string) => {
    const variant = item.variants[item.variants.length - 1]
    return (variant?.stats || item.stats || {})[stat]
  }
  const bestNumeric = (stat: string) => Math.max(...selected.map((item) => typeof statValue(item, stat) === 'number' ? Number(statValue(item, stat)) : Number.NEGATIVE_INFINITY))
  const isDifferent = (values: Array<string | number | null | undefined>) => new Set(values.map((value) => String(value ?? '—'))).size > 1

  const rows = [
    { key: 'campaign', label: 'Campaign', values: analysis.map(({ item }) => item.campaign || 'Unknown') },
    { key: 'profession', label: 'Profession', values: analysis.map(({ item }) => item.profession || 'Not recorded') },
    { key: 'classes', label: 'Classes', values: analysis.map(({ item }) => item.classes.includes('All') ? 'All classes' : item.classes.join(', ') || 'Not captured') },
    { key: 'set', label: 'Set', values: analysis.map(({ setName }) => setName || 'None recorded') },
    { key: 'direct', label: 'Direct inputs', values: analysis.map(({ item, directInputs }) => item.recipeKnown === false ? 'Recipe unknown' : directInputs) },
    { key: 'raw', label: 'Raw material units', values: analysis.map(({ rawUnits }) => rawUnits) },
    { key: 'rawKinds', label: 'Raw material kinds', values: analysis.map(({ rawKinds }) => rawKinds) },
    { key: 'batches', label: 'Crafted intermediates', values: analysis.map(({ craftedBatches }) => craftedBatches) },
  ]

  const share = async () => {
    const url = new URL(window.location.href)
    url.searchParams.set('compare', ids.map(encodeURIComponent).join(','))
    try { await navigator.clipboard.writeText(url.toString()); setCopied(true); window.setTimeout(() => setCopied(false), 1800) }
    catch { setCopied(false) }
  }

  return <>
    <button className="compare-launcher" type="button" onClick={() => setOpen(true)} aria-haspopup="dialog"><BarChart3 size={17} aria-hidden="true" />Compare items{ids.length > 0 && <b>{ids.length}</b>}</button>
    <OverlayDialog open={open} onClose={() => setOpen(false)} title="Compare craftables" description="Stats, crafting burden, restrictions, and progression context side by side." className="mw-compare-dialog">
      <div className="mw-compare-body">
        <aside>
          <label className="mw-command-search"><Search size={16} /><span className="sr-only">Search items to compare</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a craftable…" /></label>
          <div className="mw-compare-picker" aria-label="Choose items to compare">{visible.map((item) => {
            const active = ids.includes(item.id)
            const disabled = !active && ids.length >= MAX_COMPARE
            return <button key={item.id} className={active ? 'active' : ''} disabled={disabled} onClick={() => toggle(item.id)} aria-pressed={active}><span><strong>{item.name}</strong><small>{item.campaign || 'Unknown'} · {item.kind} · {item.profession || 'No profession'}</small></span><b>{active ? 'Added' : 'Add'}</b></button>
          })}</div>
        </aside>
        <main>
          {selected.length < 2 ? <div className="compare-empty"><BarChart3 size={34} /><h3>Select at least two items</h3><p>Select two or more craftables to compare their stats, crafting burden, restrictions, and progression context.</p></div> : <>
            <div className="mw-compare-actions"><span>{selected.length}/{MAX_COMPARE} selected</span><label className="mw-differences-toggle"><input type="checkbox" checked={differencesOnly} onChange={(event) => setDifferencesOnly(event.target.checked)} />Differences only</label><button type="button" onClick={share}><Share2 size={15} />{copied ? 'Link copied' : 'Share comparison'}{copied && <Copy size={13} />}</button></div>
            {compatibility && <div className={`mw-compatibility-note ${compatibility.compatible ? 'compatible' : 'warning'}`}>{compatibility.compatible ? <CheckCircle2 size={17} /> : <AlertTriangle size={17} />}<span><b>{compatibility.label}</b><small>{professions}</small></span></div>}
            <p className="mw-compare-legend"><strong>Best</strong> marks the lowest known raw-material burden or the highest recorded numeric stat. It does not imply the best build for every character.</p>
            <div className="compare-table-wrap"><table className="compare-table"><thead><tr><th>Attribute</th>{selected.map((item) => <th key={item.id}><span>{item.name}</span><button type="button" onClick={() => toggle(item.id)} aria-label={`Remove ${item.name} from comparison`}><X size={13} /></button></th>)}</tr></thead><tbody>
              {rows.filter((row) => !differencesOnly || isDifferent(row.values)).map((row) => <tr key={row.key}><th>{row.label}</th>{row.values.map((value, index) => {
                const winner = row.key === 'raw' && typeof value === 'number' && value === bestRaw
                return <td className={winner ? 'mw-best' : ''} key={selected[index].id}>{value == null ? 'Unknown' : typeof value === 'number' ? value.toLocaleString() : value}{winner && <small>Best</small>}</td>
              })}</tr>)}
              {stats.filter((stat) => !differencesOnly || isDifferent(selected.map((item) => statValue(item, stat)))).map((stat) => {
                const best = bestNumeric(stat)
                return <tr key={stat}><th>{stat}</th>{selected.map((item) => {
                  const value = statValue(item, stat)
                  const winner = typeof value === 'number' && value === best
                  return <td className={winner ? 'mw-best' : ''} key={item.id}>{value == null ? '—' : typeof value === 'number' ? value.toLocaleString() : String(value)}{winner && <small>Best</small>}</td>
                })}</tr>
              })}
            </tbody></table></div>
            <div className="mw-compare-mobile" aria-label="Mobile comparison cards">{analysis.map((row) => <article key={row.item.id}>
              <header><div><small>{row.item.campaign || 'Unknown'} · {row.item.kind}</small><h3>{row.item.name}</h3></div><button type="button" onClick={() => toggle(row.item.id)} aria-label={`Remove ${row.item.name} from comparison`}><X size={15} /></button></header>
              <dl><div><dt>Profession</dt><dd>{row.item.profession || 'Not recorded'}</dd></div><div><dt>Classes</dt><dd>{row.item.classes.includes('All') ? 'All classes' : row.item.classes.join(', ') || 'Not captured'}</dd></div><div><dt>Direct inputs</dt><dd>{row.item.recipeKnown === false ? 'Unknown' : row.directInputs}</dd></div><div><dt>Raw units</dt><dd className={row.rawUnits != null && row.rawUnits === bestRaw ? 'mw-best' : ''}>{row.rawUnits?.toLocaleString() ?? 'Unknown'}</dd></div><div><dt>Crafted intermediates</dt><dd>{row.craftedBatches ?? 'Unknown'}</dd></div></dl>
              {stats.length > 0 && <details><summary>Recorded stats</summary><dl>{stats.map((stat) => { const value = statValue(row.item, stat); return <div key={stat}><dt>{stat}</dt><dd>{value == null ? '—' : typeof value === 'number' ? value.toLocaleString() : String(value)}</dd></div> })}</dl></details>}
            </article>)}</div>
          </>}
        </main>
      </div>
    </OverlayDialog>
  </>
}
