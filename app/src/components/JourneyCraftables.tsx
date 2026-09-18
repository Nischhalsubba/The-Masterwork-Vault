import { useMemo, useState } from 'react'
import { ArrowUpRight, ChevronDown, Search } from 'lucide-react'
import catalogJson from '../data/catalog'
import type { CatalogData } from '../types'
import { buildJourneyCraftables, journeyItemHref, matchesJourneyCraftable, type JourneyCraftable } from '../domain/journeyCatalog'
import { MaterialSourceButton } from './MaterialSources'
import { ProfessionReference } from './ProfessionReference'
import { MasterworkResearchReference } from './MasterworkResearchReference'

const catalog = catalogJson as CatalogData
const pageSize = 30
const materialNames = new Set(catalog.materials.map((material) => material.name.toLowerCase()))
const recipeNames = new Set(catalog.recipes.map((recipe) => recipe.name.toLowerCase()))
function CraftableRow({ row }: { row: JourneyCraftable }) {
  const [open, setOpen] = useState(false)
  return <details className="journey-output" onToggle={(event) => setOpen(event.currentTarget.open)}>
    <summary><span><small>{row.campaign} / {row.kind}</small><strong>{row.name}</strong><small>{row.profession === 'Not recorded' ? 'Profession not recorded' : row.profession}</small></span><span className={`journey-recipe-state ${row.recipeCaptured ? '' : 'missing'}`}>{row.recipeCaptured ? 'Recipe captured' : 'Recipe missing'}</span><ChevronDown size={18} aria-hidden="true" /></summary>
    {open && <div className="journey-output-detail">
      <dl className="journey-output-meta"><div><dt>Recorded yield</dt><dd>{row.outputQuantity == null ? 'Not explicitly captured' : `${row.outputQuantity} per successful craft`}</dd></div><div><dt>Evidence</dt><dd>{row.sourceStatus}</dd></div>{row.item && <div><dt>Classes</dt><dd>{row.item.classes.join(', ') || 'Not captured'}</dd></div>}</dl>
      {row.recipeCaptured ? <><h4>Direct inputs for one craft</h4><ul className="journey-input-list">{row.inputs.map((input) => <li key={input.name}><span><strong>{input.name}</strong><b>&times;{input.required}</b></span>{recipeNames.has(input.name.toLowerCase()) && materialNames.has(input.name.toLowerCase()) ? <a href={`/materials?material=${encodeURIComponent(input.name)}`}>Inspect crafting recipe<ArrowUpRight size={14} aria-hidden="true" /></a> : !recipeNames.has(input.name.toLowerCase()) ? <MaterialSourceButton name={input.name} /> : <span className="journey-input-note">Crafted input; search its name in this library.</span>}</li>)}</ul></> : <p className="journey-data-note">This item is identified in the catalog, but its recipe was not captured. No ingredients, yield or crafting readiness have been invented.</p>}
      {!!row.item?.variants.length && <details className="journey-variant-records"><summary>Recorded quality variants and stats ({row.item.variants.length})</summary>{row.item.variants.map((variant, index) => <section key={index}><h4>{variant.quality || variant.name || `Variant ${index + 1}`}</h4><dl>{variant.itemLevel != null && <div><dt>Item level</dt><dd>{variant.itemLevel}</dd></div>}{Object.entries(variant.stats || {}).map(([name,value]) => <div key={name}><dt>{name}</dt><dd>{String(value)}</dd></div>)}</dl></section>)}</details>}
      <div className="journey-output-actions">{row.item ? <a href={journeyItemHref(row.item)}>Open item in Catalog<ArrowUpRight size={16} aria-hidden="true" /></a> : materialNames.has(row.name.toLowerCase()) ? <a href={`/materials?material=${encodeURIComponent(row.name)}`}>Find in Materials<ArrowUpRight size={16} aria-hidden="true" /></a> : null}{row.item && row.recipeCaptured && <a href={`/graph?item=${encodeURIComponent(row.item.id)}`}>Open dependency graph<ArrowUpRight size={16} aria-hidden="true" /></a>}</div>
    </div>}
  </details>
}

function CapturedCraftables() {
  const rows = useMemo(() => buildJourneyCraftables(catalog), [])
  const [query, setQuery] = useState('')
  const [campaign, setCampaign] = useState('All')
  const [profession, setProfession] = useState('All')
  const [kind, setKind] = useState('All')
  const [limit, setLimit] = useState(pageSize)
  const professions = useMemo(() => [...new Set(rows.map((row) => row.profession))].sort(), [rows])
  const kinds = useMemo(() => [...new Set(rows.map((row) => row.kind))].sort(), [rows])
  const visible = rows.filter((row) => (campaign === 'All' || campaign === row.campaign) && (profession === 'All' || profession === row.profession) && (kind === 'All' || kind === row.kind) && matchesJourneyCraftable(row, query))
  const update = (setter: (value: string) => void, value: string) => { setter(value); setLimit(pageSize) }
  const missing = rows.filter((row) => !row.recipeCaptured).length
  const reset = () => { setQuery(''); setCampaign('All'); setProfession('All'); setKind('All'); setLimit(pageSize) }
  return <section className="journey-library" aria-labelledby="journey-library-heading">
    <div className="journey-section-intro"><span className="journey-kicker">CRAFTABLE LIBRARY</span><h2 id="journey-library-heading">Every output captured in this Vault.</h2><p>Browse final items, intermediate materials, tools, potions and supplements. Expand a record for its inputs, yield and source status.</p></div>
    <div className="journey-coverage" aria-label="Craftable coverage"><span><strong>{catalog.items.length}</strong> item records</span><span><strong>{catalog.recipes.length}</strong> recipe records</span><span><strong>{rows.length}</strong> distinct named outputs</span><span><strong>{missing}</strong> missing recipes</span></div>
    <p className="journey-data-note">Coverage is the current Underdark and Sharandar catalog, not every recipe in the game. The Standard professions collection is a separate community reference. An exhaustive current Chultan inventory is not yet verified. Unrecorded professions and yields stay visible as unknown; the catalog is not a live patch certification.</p>
    <div className="journey-library-filters"><label className="journey-library-search"><span>Search craftables or ingredients</span><span><Search size={17} aria-hidden="true" /><input type="search" value={query} onChange={(event) => update(setQuery,event.target.value)} placeholder="Item, ingredient or class" /></span></label><label><span>Collection</span><select aria-label="Collection" value={campaign} onChange={(event) => update(setCampaign,event.target.value)}><option>All</option><option>Underdark</option><option>Sharandar</option></select></label><label><span>Crafting profession</span><select aria-label="Crafting profession" value={profession} onChange={(event) => update(setProfession,event.target.value)}><option>All</option>{professions.map((name) => <option key={name}>{name}</option>)}</select></label><label><span>Output type</span><select aria-label="Output type" value={kind} onChange={(event) => update(setKind,event.target.value)}><option>All</option>{kinds.map((name) => <option key={name}>{name}</option>)}</select></label></div>
    <div className="journey-library-result"><p role="status">{visible.length} matching outputs / {rows.length} captured</p>{(query || campaign !== 'All' || profession !== 'All' || kind !== 'All') && <button type="button" onClick={reset}>Reset craftable filters</button>}</div>
    {visible.length ? <div className="journey-output-list">{visible.slice(0,limit).map((row) => <CraftableRow key={row.key} row={row} />)}</div> : <p className="journey-data-note">No captured outputs match these filters. Reset filters or search an ingredient name.</p>}
    {visible.length > limit && <button className="journey-load-more" type="button" onClick={() => setLimit((value) => value + pageSize)}>Show {Math.min(pageSize,visible.length-limit)} more outputs ({limit} of {visible.length} shown)</button>}
  </section>
}

export function JourneyCraftables() {
  const [collection,setCollection] = useState<'vault' | 'standard' | 'research'>('vault')
  return <section id="journey-craftables" className="journey-library journey-library-collection" aria-label="Craftable library collections">
    <div className="journey-library-switch" role="group" aria-label="Recipe library collection">
      <button type="button" aria-pressed={collection==='vault'} onClick={()=>setCollection('vault')}>Masterwork catalog</button>
      <button type="button" aria-pressed={collection==='standard'} onClick={()=>setCollection('standard')}>Standard professions + Gathering evidence</button>
      <button type="button" aria-pressed={collection==='research'} onClick={()=>setCollection('research')}>Masterwork research</button>
    </div>
    {collection==='vault' ? <CapturedCraftables /> : collection==='standard' ? <ProfessionReference /> : <MasterworkResearchReference />}
  </section>
}
