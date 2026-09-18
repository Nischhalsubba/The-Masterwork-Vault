import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowUpRight, ChevronDown, Search } from 'lucide-react'
import {
  filterProfessionRecipes, parseProfessionReference, professionReferenceHref, REFERENCE_PROFESSIONS,
  type ProfessionRecipeReference, type ProfessionReferenceSnapshot, type ReferenceMaterial,
} from '../domain/professionReference'
import { GATHERING_COMPRESSION_SOURCE_URL, GATHERING_MAPPING_STATUS, GATHERING_REVIEWED_AT, GATHERING_SOURCE_SCALE, gatheringReferenceTasks } from '../data/gatheringReference'
import './profession-reference.css'

const snapshotUrl = new URL('../data/professionReference.snapshot.json', import.meta.url).href
const pageSize = 30

function ReferenceRow({ row, materials, onSearch }: {
  row: ProfessionRecipeReference; materials: ReadonlyMap<string, ReferenceMaterial>; onSearch: (name: string) => void
}) {
  const [open, setOpen] = useState(false)
  return <details className="journey-output profession-reference-row" onToggle={event => setOpen(event.currentTarget.open)}>
    <summary>
      <span><small>{row.profession} / {row.level === null ? 'Level not recorded' : `Recorded level ${row.level}`}</small><strong>{row.name}</strong></span>
      <span className="journey-recipe-state">Community reference</span><ChevronDown size={18} aria-hidden="true" />
    </summary>
    {open && <div className="journey-output-detail">
      <dl className="journey-output-meta">
        <div><dt>Output yield</dt><dd>Not recorded in this source</dd></div>
        <div><dt>Planner eligibility</dt><dd>Reference only; not used in calculations</dd></div>
        <div><dt>Source version</dt><dd>Community v1, introduced April 2024</dd></div>
      </dl>
      {row.categoryConflict && <p className="journey-data-note" role="note">Source conflict: the Level field says {row.level}, but the source groups this task under {row.category}. Confirm the task in-game before using it as a leveling target.</p>}
      <h4>Recorded inputs for one task</h4>
      <ul className="profession-reference-inputs">{row.inputs.map((input,index) => {
        const material = materials.get(input.materialId)
        return <li key={`${input.materialId}-${index}`}>
          <div className="profession-reference-input-name"><strong>{input.name}</strong><b>{input.quantity === null ? 'Quantity unknown' : `\u00d7${input.quantity}`}</b></div>
          {material?.gatherable ? <p>Source route: Workshop → Gathering → {material.name}.{material.gatheringLevel !== null && ` Recorded Gathering level ${material.gatheringLevel}.`} Check the current task, tool and Adventurer requirements.</p> : <p>The linked record does not mark this input as gatherable. A crafting, vendor or other route needs separate confirmation.</p>}
          <div className="profession-reference-input-actions"><button type="button" onClick={() => onSearch(input.name)}>Search this ingredient</button><a href={professionReferenceHref(input.materialId)} target="_blank" rel="noopener noreferrer">Material source<ArrowUpRight size={14} aria-hidden="true" /><span className="acquisition-sr-only"> (opens in a new tab)</span></a></div>
        </li>
      })}</ul>
      {!row.inputs.length && <p className="journey-data-note">No ingredient list was recorded. This is not a zero-cost recipe.</p>}
      <details className="profession-reference-values"><summary>Recorded task values — incomplete and not live-verified</summary>
        <dl className="journey-output-meta">{[
          ['Morale',row.morale],['Experience',row.xp],['Proficiency',row.proficiency],['Minimum focus',row.focusMinimum],['Focus goal',row.focusGoal],
        ].map(([label,value]) => <div key={label}><dt>{label}</dt><dd>{value === null ? 'Not recorded' : Number(value).toLocaleString('en-US')}</dd></div>)}</dl>
        <p>These are source-table values, not a success-chance calculation or a current leveling recommendation. Missing fields, commission units, timings and output yields are not inferred.</p>
      </details>
      <div className="journey-output-actions"><a href={professionReferenceHref(row.id)} target="_blank" rel="noopener noreferrer">Open the original task record<ArrowUpRight size={16} aria-hidden="true" /><span className="acquisition-sr-only"> (opens in a new tab)</span></a></div>
    </div>}
  </details>
}

export function ProfessionReference() {
  const [data,setData] = useState<ProfessionReferenceSnapshot | null>(null)
  const [error,setError] = useState(false)
  const [attempt,setAttempt] = useState(0)
  const [mode,setMode] = useState<'crafting'|'gathering'>('crafting')
  const [query,setQuery] = useState('')
  const [profession,setProfession] = useState('All')
  const [level,setLevel] = useState('All')
  const [limit,setLimit] = useState(pageSize)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const controller = new AbortController()
    setError(false)
    void fetch(snapshotUrl,{ signal:controller.signal })
      .then(response => { if (!response.ok) throw new Error('Reference download failed'); return response.json() as Promise<unknown> })
      .then(parseProfessionReference)
      .then(value => { if (!controller.signal.aborted) setData(value) })
      .catch(() => { if (!controller.signal.aborted) setError(true) })
    return () => controller.abort()
  },[attempt])

  const materials = useMemo(() => new Map(data?.materials.map(material => [material.id,material]) ?? []),[data])
  const visible = useMemo(() => filterProfessionRecipes(data?.recipes ?? [],{ query,profession,level }),[data,query,profession,level])
  const update = (setter: (value:string)=>void,value:string) => { setter(value);setLimit(pageSize) }
  const reset = () => { setQuery('');setProfession('All');setLevel('All');setLimit(pageSize);searchRef.current?.focus() }
  const searchIngredient = (name:string) => {
    setQuery(name);setProfession('All');setLevel('All');setLimit(pageSize)
    searchRef.current?.focus({ preventScroll:true })
    searchRef.current?.scrollIntoView({ block:'center',behavior:'instant' })
  }

  return <section className="profession-reference" aria-labelledby="profession-reference-heading">
    <div className="journey-section-intro"><span className="journey-kicker">STANDARD PROFESSIONS / REFERENCE COLLECTION</span><h2 id="profession-reference-heading">From your first craft to level 20.</h2><p>Explore the published community task lists across all seven crafting professions. Gathering is kept as a separate legacy evidence sample because its source table still uses the old 1–80 profession scale.</p></div>
    <p className="journey-data-note"><strong>Reference, not verified planner data.</strong> The crafting database was introduced in April 2024, and its author asks for error checks. The Gathering rows come from a different community table that retains the pre-2021 level scale. The snapshot review date is not a live-game certification. Missing output yields, task conflicts, and post-compression mappings are never inferred.</p>
    {error ? <div className="profession-reference-load-error" role="alert"><p>The reference could not be loaded or validated. Your saved plans and the Masterwork catalog have not changed.</p><button type="button" onClick={() => setAttempt(value=>value+1)}>Retry reference</button></div> : !data ? <p role="status">Loading the profession reference…</p> : <>
      <div className="journey-coverage" aria-label="Standard profession reference coverage"><span><strong>{data.recipes.length + gatheringReferenceTasks.length}</strong> source task records</span><span><strong>{REFERENCE_PROFESSIONS.length + 1}</strong> professions including Gathering</span><span><strong>{data.materials.length}</strong> linked crafting ingredients</span><span><strong>{data.recipes.reduce((sum,row)=>sum+row.inputs.length,0).toLocaleString('en-US')}</strong> resolved crafting input links</span></div>
      <div className="profession-reference-mode" role="group" aria-label="Standard profession reference view">
        <button type="button" aria-pressed={mode==='crafting'} onClick={()=>setMode('crafting')}>Crafting tasks ({data.recipes.length})</button>
        <button type="button" aria-pressed={mode==='gathering'} onClick={()=>setMode('gathering')}>Gathering evidence ({gatheringReferenceTasks.length})</button>
      </div>
      {mode==='crafting' ? <>
        <div className="journey-library-filters profession-reference-filters">
          <label className="journey-library-search"><span>Search standard tasks or ingredients</span><span><Search size={17} aria-hidden="true" /><input ref={searchRef} type="search" value={query} onChange={event=>update(setQuery,event.target.value)} placeholder="Try Honey or Beehive Chip" /></span></label>
          <label><span>Reference profession</span><select aria-label="Reference profession" value={profession} onChange={event=>update(setProfession,event.target.value)}><option value="All">All professions</option>{REFERENCE_PROFESSIONS.map(name=><option key={name} value={name}>{name} ({data.professionCounts[name]})</option>)}</select></label>
          <label><span>Recorded task level</span><select aria-label="Recorded task level" value={level} onChange={event=>update(setLevel,event.target.value)}><option value="All">All levels</option>{Array.from({length:20},(_,index)=><option key={index+1} value={index+1}>Level {index+1}</option>)}<option value="unknown">Not recorded</option></select></label>
        </div>
        <div className="journey-library-result"><p role="status" aria-atomic="true">{visible.length} matching crafting tasks / {data.recipes.length} source records</p>{(query || profession!=='All' || level!=='All') && <button type="button" onClick={reset}>Reset reference filters</button>}</div>
        {visible.length ? <div className="profession-reference-list">{visible.slice(0,limit).map(row=><ReferenceRow key={row.id} row={row} materials={materials} onSearch={searchIngredient} />)}</div> : <p className="journey-data-note">No reference tasks match. Reset filters or try another ingredient name.</p>}
        {visible.length>limit && <button className="journey-load-more" type="button" onClick={()=>setLimit(value=>value+pageSize)}>Show {Math.min(pageSize,visible.length-limit)} more tasks ({limit} of {visible.length} shown)</button>}
        <div className="journey-output-actions"><a href={data.sourceUrl} target="_blank" rel="noopener noreferrer">Browse original community database<ArrowUpRight size={16} aria-hidden="true" /></a><a href={data.sourceAnnouncementUrl} target="_blank" rel="noopener noreferrer">Author’s release notes and limitations<ArrowUpRight size={16} aria-hidden="true" /></a></div>
      </> : <>
        <div className="profession-reference-legacy-note" role="note">
          <span className="journey-kicker">LEGACY EVIDENCE / MODERN MAPPING UNRESOLVED</span>
          <h3>Legacy pre-compression Gathering sample</h3>
          <p>The community Gathering table uses the old 1–80 profession scale. Neverwinter's 2021 profession update compressed those levels into 20 four-level buckets, so these first 25 source rows are <strong>not</strong> a complete modern Level 1–20 Gathering route.</p>
          <p>Source scale: <code>{GATHERING_SOURCE_SCALE}</code> · mapping status: <code>{GATHERING_MAPPING_STATUS}</code> · reviewed {GATHERING_REVIEWED_AT}.</p>
          <div className="journey-output-actions"><a href={GATHERING_COMPRESSION_SOURCE_URL} target="_blank" rel="noopener noreferrer">Read the 2021 profession compression<ArrowUpRight size={14} aria-hidden="true" /></a><a href={gatheringReferenceTasks[0]?.sourceUrl} target="_blank" rel="noopener noreferrer">Open the legacy Gathering table<ArrowUpRight size={14} aria-hidden="true" /></a></div>
        </div>
        <div className="journey-library-result"><p role="status" aria-atomic="true">{gatheringReferenceTasks.length} legacy-source rows / modern Level 1–20 mapping unresolved</p></div>
        <div className="gathering-reference-list">{gatheringReferenceTasks.map(row=><article className="gathering-reference-row" key={row.id}>
          <div><small>Gathering / legacy source level {row.level}</small><h3>{row.name}</h3></div>
          <dl><div><dt>Historical recorded yield</dt><dd>×{row.outputQuantity}</dd></div><div><dt>Planner eligibility</dt><dd>Reference only</dd></div></dl>
          <p>{row.platformContext}</p>
          <a href={row.sourceUrl} target="_blank" rel="noopener noreferrer">Legacy Gathering source<ArrowUpRight size={14} aria-hidden="true" /></a>
        </article>)}</div>
      </>}

    </>}
  </section>
}
