import { useEffect, useMemo, useRef, useState } from 'react'
import { gsap } from 'gsap'
import {
  BarChart3,
  BadgeCheck,
  BookOpen,
  Boxes,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  ExternalLink,
  Gem,
  Hammer,
  Minus,
  Plus,
  Search,
  Shield,
  Sparkles,
  Sword,
  X,
} from 'lucide-react'
import catalogJson from './data/catalog'
import spriteDataUri from './data/sprite'
import { sharandarIconIndex, sharandarSprite } from './data/sharandarSprite'
import { sharandarWorkshopReference } from './data/sharandarSupplement'
import type { CatalogData, ItemEntry, MaterialEntry } from './types'
import { calculateCraftingPlan, expandSingleMaterial } from './lib/crafting'
import { AmbientVault } from './components/AmbientVault'
import { CraftingWorkbench, ItemRecipeEvidence, MaterialsWorkbench } from './components/CraftingWorkbench'

const catalog = catalogJson as CatalogData
const norm = (s: string) => s.toLowerCase().replace(/\+1/g, '').replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ')
const byMaterial = new Map(catalog.materials.map((m) => [norm(m.name), m]))
const recipeByName = new Map(catalog.recipes.map((r) => [norm(r.name), r]))
const iconIndexByName = new Map<string, number>()
for (const item of catalog.items) if (item.iconIndex != null) iconIndexByName.set(norm(item.name), item.iconIndex)
for (const material of catalog.materials) if (material.iconIndex != null) iconIndexByName.set(norm(material.name), material.iconIndex)
const asset = (p: string) => `${import.meta.env.BASE_URL}${p}`

type MaterialTarget = { name: string; required: number }
type OpenCraftable = (material: MaterialEntry, required: number) => void
type CampaignFilter = 'Sharandar' | 'Underdark' | 'All'

function AtlasIcon({ dataUri, index, columns, count, alt, size }: { dataUri: string; index: number; columns: number; count: number; alt: string; size: number }) {
  const rows = Math.ceil(count / columns)
  const col = index % columns
  const row = Math.floor(index / columns)
  return (
    <span className="sprite atlas-icon" role="img" aria-label={alt} style={{ width: size, height: size, position: 'relative', overflow: 'hidden' }}>
      <img
        src={dataUri}
        alt=""
        aria-hidden="true"
        draggable={false}
        style={{
          position: 'absolute',
          width: columns * size,
          height: rows * size,
          maxWidth: 'none',
          left: -col * size,
          top: -row * size,
          pointerEvents: 'none',
        }}
      />
    </span>
  )
}

function Icon({ src, alt, size = 48 }: { src?: string | null; alt: string; size?: number }) {
  const [directFailed, setDirectFailed] = useState(false)
  const sharandarIndex = sharandarIconIndex(alt)
  const verifiedIndex = iconIndexByName.get(norm(alt))

  useEffect(() => {
    setDirectFailed(false)
  }, [src, sharandarIndex, verifiedIndex])

  if (src && !directFailed) {
    return (
      <img
        className="sprite thumb"
        src={src}
        alt={alt}
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        style={{ width: size, height: size, objectFit: 'cover' }}
        onError={() => setDirectFailed(true)}
      />
    )
  }

  if (sharandarIndex != null) {
    return <AtlasIcon dataUri={sharandarSprite.dataUri} index={sharandarIndex} columns={sharandarSprite.columns} count={sharandarSprite.count} alt={alt} size={size} />
  }

  if (verifiedIndex == null) {
    return <span className="sprite fallback" style={{ width: size, height: size }} role="img" aria-label={`${alt}, image unavailable`} />
  }

  return <AtlasIcon dataUri={spriteDataUri} index={verifiedIndex} columns={catalog.meta.sprite.columns || 10} count={catalog.meta.sprite.count} alt={alt} size={size} />
}

function Source({ value }: { value: string }) {
  const isSharandar = value.startsWith('sharandar-screenshot')
  const label = isSharandar
    ? 'Sharandar ZIP'
    : value === 'latest-user-screenshot'
      ? 'Latest screenshot'
      : value === 'spreadsheet-supplemental'
        ? 'Supplemental'
        : value.includes('final-zip')
          ? 'Underdark ZIP'
          : value
  return <span className={`source ${value === 'spreadsheet-supplemental' ? 'supplemental' : ''} ${isSharandar ? 'sharandar-source' : ''}`}>{label}</span>
}

function CampaignBadge({ value }: { value?: string | null }) {
  return <span className={`campaign-badge ${(value || 'Unknown').toLowerCase()}`}>{value || 'Collection unknown'}</span>
}

function Recipe({ rows, onOpenCraftable }: { rows: { name: string; required: number }[]; onOpenCraftable?: OpenCraftable }) {
  return (
    <div className="recipe-list">
      {rows.map((r) => {
        const material = byMaterial.get(norm(r.name))
        const hasRecipe = Boolean(material && recipeByName.has(norm(material.name)))
        const canDrill = Boolean(onOpenCraftable && material?.craftable && hasRecipe)
        return (
          <div className={`recipe-row ${canDrill ? 'has-drilldown' : ''}`} key={r.name}>
            <Icon src={material?.icon} alt={r.name} size={42} />
            <div className="recipe-row-copy">
              <strong>{r.name}</strong>
              <small>{material?.craftable ? `${material.profession || 'Crafted'} · yields ${material.outputQuantity || 1}` : 'Raw / acquired material'}</small>
            </div>
            <div className="recipe-row-actions">
              <b>×{r.required}</b>
              {canDrill && material && (
                <button className="craftable-indicator" onClick={() => onOpenCraftable?.(material, r.required)} aria-label={`Show crafting recipe for ${r.name}`}>
                  <Hammer size={13} aria-hidden="true" />
                  <span>Craftable</span>
                  <ChevronRight size={14} aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function MaterialDrilldown({ target, backLabel, onBack, onOpenCraftable }: { target: MaterialTarget; backLabel: string; onBack: () => void; onOpenCraftable: OpenCraftable }) {
  const [mode, setMode] = useState<'direct' | 'scratch'>('direct')
  const material = byMaterial.get(norm(target.name))
  const recipe = recipeByName.get(norm(target.name))
  const expanded = useMemo(() => expandSingleMaterial(target.name, target.required, catalog.recipes), [target.name, target.required])

  if (!material || !recipe) {
    return (
      <div className="material-drilldown">
        <button className="drilldown-back" onClick={onBack}><ChevronLeft size={18} />Back</button>
        <div className="empty-inline"><h3>Recipe unavailable</h3><p>This material does not have a craft recipe in the current catalog.</p></div>
      </div>
    )
  }

  const outputPerCraft = Math.max(1, recipe.outputQuantity || material.outputQuantity || 1)
  const crafts = Math.ceil(target.required / outputPerCraft)
  const produced = crafts * outputPerCraft
  const leftover = produced - target.required
  const directRows = recipe.materials.map((row) => ({ ...row, required: row.required * crafts }))
  const rows = mode === 'direct' ? directRows : expanded.raw

  return (
    <div className="material-drilldown enter" key={`${material.name}:${target.required}`}>
      <div className="drilldown-nav">
        <button className="drilldown-back" onClick={onBack}><ChevronLeft size={18} />Back</button>
        <span>Back to {backLabel}</span>
      </div>

      <div className="detail-head drilldown-head">
        <Icon src={material.icon} alt={material.name} size={78} />
        <div className="grow">
          <div className="pills"><Source value={material.sourceStatus} /><CampaignBadge value={recipe.campaign || material.campaign} /><span className="craftable-pill"><Hammer size={12} />Craftable material</span></div>
          <h2>{material.name}</h2>
          <p>{material.profession || recipe.profession || 'Crafted material'} · yields {outputPerCraft} per craft</p>
        </div>
      </div>

      <div className="drilldown-summary" aria-label="Crafting requirement summary">
        <div><span>Needed here</span><strong>×{target.required}</strong></div>
        <div><span>Crafts required</span><strong>{crafts}</strong></div>
        <div><span>Will produce</span><strong>{produced}</strong></div>
        <div><span>Leftover</span><strong>{leftover}</strong></div>
      </div>

      {!recipe.quantityExplicit && (
        <div className="callout data-caveat"><CircleHelp size={18} /><p>The supplied screenshot does not show this recipe's output quantity. The planner currently uses ×{outputPerCraft} as a conservative fallback until a source shows the yield.</p></div>
      )}

      <div className="section-head drilldown-section-head">
        <div><small>CRAFTING RECIPE</small><h3>{mode === 'direct' ? `Materials for ${crafts} craft${crafts === 1 ? '' : 's'}` : 'From-scratch raw materials'}</h3></div>
        <div className="seg">
          <button className={mode === 'direct' ? 'active' : ''} onClick={() => setMode('direct')}>Direct</button>
          <button className={mode === 'scratch' ? 'active' : ''} onClick={() => setMode('scratch')}>From scratch</button>
        </div>
      </div>

      <Recipe rows={rows} onOpenCraftable={mode === 'direct' ? onOpenCraftable : undefined} />

      {mode === 'scratch' && expanded.batches.length > 0 && (
        <>
          <h3 className="subhead">Craft batches & leftovers</h3>
          <div className="batches">
            {expanded.batches.map((batch) => (
              <div key={batch.name}>
                <strong>{batch.name}</strong>
                <span>{batch.crafts} craft{batch.crafts === 1 ? '' : 's'}</span>
                <small>need {batch.needed} · produce {batch.produced}{batch.leftover ? ` · ${batch.leftover} leftover` : ''}</small>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function Detail({ item, inPlan, togglePlan }: { item: ItemEntry; inPlan: boolean; togglePlan: () => void }) {
  const [variant, setVariant] = useState(Math.max(0, item.variants.length - 1))
  const [mode, setMode] = useState<'direct' | 'scratch'>('direct')
  const [materialTrail, setMaterialTrail] = useState<MaterialTarget[]>([])
  const [statsOpen, setStatsOpen] = useState(false)

  useEffect(() => {
    setVariant(Math.max(0, item.variants.length - 1))
    setMaterialTrail([])
    setStatsOpen(false)
  }, [item.id])

  useEffect(() => {
    if (!statsOpen) return
    const previousOverflow = document.body.style.overflow
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setStatsOpen(false)
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [statsOpen])

  const hasRecipe = item.recipeKnown !== false && item.materials.length > 0
  const calc = useMemo(() => hasRecipe ? calculateCraftingPlan([{ item, quantity: 1 }], catalog.recipes) : { direct: [], raw: [], batches: [] }, [item, hasRecipe])
  const v = item.variants[variant]
  const stats = v?.stats || item.stats || {}
  const itemLevel = v?.itemLevel || item.itemLevel
  const statEntries = Object.entries(stats)
  const statCount = (itemLevel ? 1 : 0) + statEntries.length
  const hasStats = statCount > 0
  const setData = item.set as { name?: string; twoPiece?: string[]; note?: string } | null | undefined
  const openCraftable: OpenCraftable = (material, required) => setMaterialTrail((trail) => [...trail, { name: material.name, required }])

  if (materialTrail.length > 0) {
    const target = materialTrail[materialTrail.length - 1]
    const previous = materialTrail.length > 1 ? materialTrail[materialTrail.length - 2].name : item.name
    return (
      <section className="detail panel enter">
        <MaterialDrilldown
          target={target}
          backLabel={previous}
          onBack={() => setMaterialTrail((trail) => trail.slice(0, -1))}
          onOpenCraftable={openCraftable}
        />
      </section>
    )
  }

  const classLabel = item.classes.includes('All') ? 'All classes' : item.classes.length ? item.classes.join(' · ') : 'Class restriction not captured'

  return (
    <section className="detail panel enter">
      <div className="detail-head">
        <Icon src={item.icon} alt={item.name} size={88} />
        <div className="grow">
          <div className="pills"><Source value={item.sourceStatus} /><CampaignBadge value={item.campaign} /><span>{item.profession || item.kind}</span></div>
          <h2>{item.name}</h2>
          <p>{classLabel} · {item.slot || item.kind}</p>
        </div>
        <button className="primary" disabled={!hasRecipe} onClick={togglePlan}>{!hasRecipe ? 'Recipe needed' : inPlan ? 'Remove from plan' : 'Add to plan'}</button>
      </div>

      <div className="detail-controls">
        {item.variants.length > 1 && <div className="seg">{item.variants.map((x, i) => <button key={i} className={i === variant ? 'active' : ''} onClick={() => setVariant(i)}>{x.quality || x.name}</button>)}</div>}
        <button className="stats-trigger" aria-expanded={statsOpen} aria-controls="item-stats-drawer" onClick={() => setStatsOpen(true)}><BarChart3 size={16} aria-hidden="true" />Details{hasStats && <span>{statCount}</span>}<ChevronRight size={14} aria-hidden="true" /></button>
      </div>

      {setData && <div className="callout"><Sparkles size={18} /><div><strong>{setData.name || 'Set bonus'}</strong><p>{Array.isArray(setData.twoPiece) ? setData.twoPiece.join(' · ') : setData.note}</p></div></div>}
      {item.equipPower?.text && <div className="callout"><Shield size={18} /><div><strong>{item.equipPower.name || 'Equip power'}</strong><p>{item.equipPower.text}</p></div></div>}

      {!hasRecipe ? (
        <div className="missing-recipe-state">
          <CircleHelp size={22} aria-hidden="true" />
          <div><strong>Recipe not captured yet</strong><p>The supplied Sharandar screenshot identifies this craftable, but its input recipe is not visible. It stays searchable and documented, but it cannot enter the planner until the recipe is sourced.</p></div>
        </div>
      ) : (
        <>
          <div className="section-head"><div><small>RAW-MATERIAL COST</small><h3>{mode === 'direct' ? 'Direct recipe' : 'From-scratch requirements'}</h3></div><div className="seg"><button className={mode === 'direct' ? 'active' : ''} onClick={() => setMode('direct')}>Direct</button><button className={mode === 'scratch' ? 'active' : ''} onClick={() => setMode('scratch')}>From scratch</button></div></div>
          <Recipe rows={mode === 'direct' ? calc.direct : calc.raw} onOpenCraftable={mode === 'direct' ? openCraftable : undefined} />
          {mode === 'scratch' && calc.batches.length > 0 && <><h3 className="subhead">Craft batches & leftovers</h3><div className="batches">{calc.batches.map((b) => <div key={b.name}><strong>{b.name}</strong><span>{b.crafts} craft{b.crafts === 1 ? '' : 's'}</span><small>need {b.needed} · produce {b.produced}{b.leftover ? ` · ${b.leftover} leftover` : ''}</small></div>)}</div></>}
        </>
      )}

      <div className={`stats-drawer-layer ${statsOpen ? 'open' : ''}`} aria-hidden={!statsOpen}>
        <button className="stats-drawer-scrim" tabIndex={statsOpen ? 0 : -1} onClick={() => setStatsOpen(false)} aria-label="Close item details" />
        <aside id="item-stats-drawer" className="stats-drawer" role="dialog" aria-modal="true" aria-label={`${item.name} details`}>
          <div className="stats-drawer-head"><div><small>ITEM DETAILS</small><h3>{item.name}</h3><p>{v?.quality || v?.name || item.kind}</p></div><button className="stats-drawer-close" autoFocus={statsOpen} onClick={() => setStatsOpen(false)} aria-label="Close item details"><X size={18} aria-hidden="true" /></button></div>
          <section className="stats-drawer-section"><div className="stats-drawer-section-head"><small>STATS</small><h4>Weapon & item stats</h4></div>{hasStats ? <div className="stats-drawer-grid">{itemLevel && <div><span>Item level</span><strong>{Number(itemLevel).toLocaleString()}</strong></div>}{statEntries.map(([key, value]) => <div key={key}><span>{key}</span><strong>{typeof value === 'number' ? `+${value.toLocaleString()}` : value}</strong></div>)}</div> : <p className="stats-drawer-empty">No stat fields are recorded for this item.</p>}{hasStats && <p className="stats-drawer-note">Stats reflect the currently selected quality variant. Recipe quantities remain unchanged.</p>}</section>
          <div className="stats-drawer-evidence"><ItemRecipeEvidence item={item} /></div>
        </aside>
      </div>
    </section>
  )
}

function Reference() {
  const [tab, setTab] = useState<'workshop' | 'artisans' | 'south-seas' | 'sources'>('workshop')
  const currentSources = sharandarWorkshopReference

  return (
    <div className="reference workshop-reference enter">
      <section className="panel reference-hero">
        <div><small className="eyebrow">WORKSHOP REFERENCE</small><h2>Crafting context beyond the recipe tree</h2><p>Workshop progression, artisan mechanics, South Seas commissions, and source caveats live here so the Sharandar collection does not have to hide important context inside individual weapon cards.</p></div>
        <div className="reference-tabs" role="tablist" aria-label="Workshop reference sections">
          <button className={tab === 'workshop' ? 'active' : ''} onClick={() => setTab('workshop')}>Workshop</button>
          <button className={tab === 'artisans' ? 'active' : ''} onClick={() => setTab('artisans')}>Artisans</button>
          <button className={tab === 'south-seas' ? 'active' : ''} onClick={() => setTab('south-seas')}>South Seas</button>
          <button className={tab === 'sources' ? 'active' : ''} onClick={() => setTab('sources')}>Sources</button>
        </div>
      </section>

      {tab === 'workshop' && (
        <div className="reference-grid">
          <section className="panel"><BookOpen /><small className="eyebrow">FRESH START</small><h3>Workshop basics</h3><ul className="reference-list">{currentSources.workshopBasics.map((line) => <li key={line}>{line}</li>)}</ul></section>
          <section className="panel"><Hammer /><small className="eyebrow">ARTISAN STATS</small><h3>What each stat changes</h3><div className="mechanic-list">{currentSources.artisanMechanics.map((row) => <div key={row.key}><strong>{row.key}</strong><p>{row.text}</p></div>)}</div></section>
          <section className="panel source-pack-card"><Gem /><small className="eyebrow">COLLECTIONS</small><h3>Two source packs, one planner</h3><div className="source-pack-row"><CampaignBadge value="Sharandar" /><p>User-supplied Sharandar screenshots supply new masterwork weapons, armor, materials, potions, supplements, recipes, tooltips, and extracted icons.</p></div><div className="source-pack-row"><CampaignBadge value="Underdark" /><p>The existing Menzoberranzan / Underdark ZIP remains intact as a separate collection rather than being overwritten by the Sharandar pack.</p></div></section>
        </div>
      )}

      {tab === 'artisans' && (
        <>
          <section className="panel"><BadgeCheck /><small className="eyebrow">LEVEL-80 SUMMARY</small><h3>Current source highlights by profession</h3><p className="quiet-note">The source explicitly notes that only 74 of 210 artisan rows were verified; the remainder were inferred from the verified pattern. The app preserves that caveat instead of presenting every number as equally certain.</p><div className="artisan-grid">{currentSources.artisanHighlights.map((row) => <article key={row.profession}><h4>{row.profession}</h4><dl><div><dt>Most proficient</dt><dd>{row.mostProficient}</dd></div><div><dt>Most focused</dt><dd>{row.mostFocused}</dd></div><div><dt>Least expensive</dt><dd>{row.leastExpensive}</dd></div><div><dt>Fastest</dt><dd>{row.fastest}</dd></div></dl><p><strong>Top three:</strong> {row.topThree.join(', ')}</p></article>)}</div></section>
          <section className="panel"><CircleHelp /><small className="eyebrow">HISTORICAL MASTERWORK GUIDE</small><h3>Module 15 recommendations, kept separate</h3><p>These recommendations come from the older Neverwinter:Unblogged artisan guide. They are useful historical strategy notes, not replacements for the newer TBotR level-80 values.</p><div className="legacy-artisan-table">{currentSources.legacyMasterworkRecommendations.map(([name, profession, proficiency, focus, skill]) => <div key={`${profession}:${name}`}><strong>{name}</strong><span>{profession}</span><span>{proficiency} proficiency</span><span>{focus} focus</span><span>{skill}</span></div>)}</div><h4 className="subhead">Gathering recommendations</h4><div className="legacy-artisan-table compact">{currentSources.gatheringRecommendations.map(([name, proficiency, focus, speed, skill]) => <div key={String(name)}><strong>{name}</strong><span>{proficiency} proficiency</span><span>{focus} focus</span><span>{speed} speed</span><span>{skill}</span></div>)}</div></section>
        </>
      )}

      {tab === 'south-seas' && (
        <section className="panel south-seas-panel">
          <Gem /><small className="eyebrow">WORKSHOP UPGRADES</small><h3>South Seas Trading Company cycle</h3><p>{currentSources.southSeas.note}</p><div className="south-seas-cycle">{currentSources.southSeas.listDays.map((row) => <article key={row.list}><span>List {row.list}</span><strong>{row.days.map((day) => `Day ${day}`).join(' · ')}</strong></article>)}</div><p className="quiet-note">The source's full commission tables remain linked below. They are workshop-upgrade commission data, not Sharandar masterwork recipes, so they are intentionally kept out of the crafting dependency graph.</p>
        </section>
      )}

      {tab === 'sources' && (
        <div className="reference-grid">
          <section className="panel"><CircleHelp /><small className="eyebrow">SOURCE POLICY</small><h3>What wins when sources disagree</h3><ol>{catalog.meta.sourcePriority.map((x) => <li key={x}>{x}</li>)}</ol><p>Recipe quantities shown directly in the user's screenshots stay authoritative for this app. Unknown class restrictions, professions, or output yields remain unknown rather than being inferred.</p></section>
          <section className="panel"><ExternalLink /><small className="eyebrow">WEB REFERENCES</small><h3>Workshop and artisan sources</h3><div className="source-link-list">{currentSources.sourceUrls.map((url) => <a href={url} target="_blank" rel="noreferrer" key={url}><span>{new URL(url).hostname}</span><strong>{url}</strong><ExternalLink size={15} /></a>)}</div></section>
          <section className="panel"><BadgeCheck /><small className="eyebrow">CAVEATS</small><h3>What the sources do not prove</h3><ul className="reference-list">{currentSources.sourceCaveats.map((line) => <li key={line}>{line}</li>)}</ul></section>
          <section className="panel"><Gem /><small className="eyebrow">UNDERDARK REFERENCE</small><h3>Existing workbook channels</h3><div className="tags">{catalog.reference.acquisitionChannels.map((x) => <span key={x}>{x}</span>)}</div><p>{catalog.reference.acquisitionNote}</p><p>{catalog.reference.spreadsheetTools.length} tool references · {catalog.reference.supplements.length} supplement references remain available from the older collection.</p></section>
        </div>
      )}
    </div>
  )
}

export default function App() {
  const root = useRef<HTMLDivElement>(null)
  const [view, setView] = useState<'catalog' | 'plan' | 'materials' | 'reference'>('catalog')
  const [campaign, setCampaign] = useState<CampaignFilter>('Sharandar')
  const [cls, setCls] = useState('All')
  const [kind, setKind] = useState('All')
  const [q, setQ] = useState('')
  const initial = catalog.items.find((i) => i.campaign === 'Sharandar' && i.recipeKnown !== false)?.id || catalog.items[0].id
  const [id, setId] = useState(initial)
  const [plan, setPlan] = useState<Map<string, number>>(new Map())
  const [materialFocus, setMaterialFocus] = useState<string | undefined>()

  useEffect(() => {
    const encoded = new URLSearchParams(window.location.search).get('plan')
    if (!encoded) return
    try {
      const rows = JSON.parse(encoded) as Array<[string, number]>
      if (!Array.isArray(rows)) return
      const next = new Map<string, number>()
      for (const row of rows) {
        if (!Array.isArray(row) || row.length !== 2) continue
        const [itemId, quantity] = row
        if (typeof itemId !== 'string' || !Number.isInteger(quantity) || quantity <= 0) continue
        const candidate = catalog.items.find((item) => item.id === itemId)
        if (!candidate || candidate.recipeKnown === false || !candidate.materials.length) continue
        next.set(itemId, Math.min(quantity, 999))
      }
      if (next.size > 0) {
        setPlan(next)
        setView('plan')
      }
    } catch {
      // Ignore malformed shared-plan payloads and keep the normal app state.
    }
  }, [])

  const collectionItems = useMemo(() => catalog.items.filter((item) => campaign === 'All' || item.campaign === campaign), [campaign])
  const availableClasses = useMemo(() => Array.from(new Set(collectionItems.flatMap((item) => item.classes).filter((name) => name && name !== 'All'))).sort((a, b) => a.localeCompare(b)), [collectionItems])
  const availableKinds = useMemo(() => ['All', ...Array.from(new Set(collectionItems.map((item) => item.kind))).sort((a, b) => a.localeCompare(b))], [collectionItems])

  useEffect(() => {
    if (cls !== 'All' && !availableClasses.includes(cls)) setCls('All')
    if (kind !== 'All' && !availableKinds.includes(kind)) setKind('All')
  }, [availableClasses, availableKinds, cls, kind])

  const filtered = useMemo(() => collectionItems.filter((item) => {
    const classMatch = cls === 'All' || item.classes.includes(cls)
    const kindMatch = kind === 'All' || item.kind === kind
    const queryMatch = [item.name, item.slot, item.profession, item.campaign, ...item.classes, ...item.categories, ...item.materials.map((m) => m.name)].filter(Boolean).join(' ').toLowerCase().includes(q.toLowerCase())
    return classMatch && kindMatch && queryMatch
  }), [collectionItems, cls, kind, q])

  const item = filtered.find((candidate) => candidate.id === id) || filtered[0] || collectionItems[0] || catalog.items[0]
  useEffect(() => {
    if (filtered.length && !filtered.some((candidate) => candidate.id === id)) setId(filtered[0].id)
  }, [filtered, id])

  const selectCampaign = (next: CampaignFilter) => {
    setCampaign(next)
    setCls('All')
    setKind('All')
    setQ('')
  }
  const selectClass = (next: string) => {
    setCls(next)
    setKind('All')
  }

  const resultContext = `${campaign === 'All' ? 'All collections' : campaign} · ${cls === 'All' ? 'all classes' : cls} · ${kind === 'All' ? 'all craftables' : kind}`

  useEffect(() => {
    if (!root.current) return
    const mm = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mm.matches) return
    const ctx = gsap.context(() => gsap.fromTo('.enter', { y: 12, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .36, ease: 'power3.out', clearProps: 'transform,opacity,visibility' }), root)
    return () => ctx.revert()
  }, [view, id, campaign])

  const toggle = (target: ItemEntry) => {
    if (target.recipeKnown === false || !target.materials.length) return
    const next = new Map(plan)
    next.has(target.id) ? next.delete(target.id) : next.set(target.id, 1)
    setPlan(next)
  }

  const openCatalogItem = (target: ItemEntry) => {
    setCampaign((target.campaign as CampaignFilter) || 'All')
    setCls('All')
    setKind('All')
    setQ('')
    setId(target.id)
    setView('catalog')
  }
  const openMaterialFromPlan = (name: string) => {
    setMaterialFocus(name)
    setView('materials')
  }

  const IconFor = ({ k }: { k: string }) => k === 'Weapon' ? <Sword size={15} /> : k === 'Armor' ? <Shield size={15} /> : k === 'Accessory' || k === 'Consumable' || k === 'Supplement' ? <Gem size={15} /> : <Hammer size={15} />
  const sharandarCount = catalog.items.filter((entry) => entry.campaign === 'Sharandar').length
  const underdarkCount = catalog.items.filter((entry) => entry.campaign === 'Underdark').length
  const activeRecipes = catalog.recipes.filter((entry) => campaign === 'All' || entry.campaign === campaign).length
  const activeMaterials = catalog.materials.filter((entry) => campaign === 'All' || entry.campaigns?.includes(campaign) || entry.campaign === campaign).length

  return (
    <div ref={root} className="app">
      <header>
        <a href={import.meta.env.BASE_URL} className="brand"><img src={asset('assets/brand/masterwork-vault-mark.svg')} alt="" /><span><strong>The Masterwork Vault</strong><small>Underdark + Sharandar Masterwork</small></span></a>
        <nav>{([['catalog', BookOpen, 'Catalog'], ['plan', Boxes, 'Plan'], ['materials', Gem, 'Materials'], ['reference', CircleHelp, 'Reference']] as const).map(([v, I, l]) => <button className={view === v ? 'active' : ''} onClick={() => setView(v)} key={v}><I size={17} />{l}{v === 'plan' && <b className="badge">{plan.size}</b>}</button>)}</nav>
      </header>

      <main id="main-content">
        <section className="hero">
          <AmbientVault />
          <div><span className="hero-kicker"><Sparkles size={15} /> MASTERWORK COLLECTIONS</span><h1>Two Masterwork eras. One crafting dependency graph.</h1><p>Switch between the existing Underdark catalogue and the new Sharandar screenshot pack without mixing source claims. Direct recipes, from-scratch expansion, workshop context, and extracted item art stay traceable to their evidence.</p><div className="metrics"><span><b>{sharandarCount}</b> Sharandar craftables</span><span><b>{underdarkCount}</b> Underdark craftables</span><span><b>{catalog.recipes.length}</b> recipe records</span></div></div>
        </section>

        {view === 'catalog' && (
          <div className="catalog">
            <aside>
              <small>CLASSES</small>
              <button className={cls === 'All' ? 'active' : ''} onClick={() => selectClass('All')}>All craftables</button>
              {availableClasses.map((className) => <button className={cls === className ? 'active' : ''} onClick={() => selectClass(className)} key={className}>{className}</button>)}
            </aside>

            <div className="workspace">
              <section className="collection-switcher panel" aria-label="Masterwork collection">
                <div><small>COLLECTION</small><strong>{campaign === 'All' ? 'All Masterwork' : `${campaign} Masterwork`}</strong><span>{collectionItems.length} craftables · {activeMaterials} materials · {activeRecipes} recipes</span></div>
                <div className="collection-seg" role="group" aria-label="Choose source collection">
                  {(['Sharandar', 'Underdark', 'All'] as CampaignFilter[]).map((value) => <button className={campaign === value ? 'active' : ''} aria-pressed={campaign === value} onClick={() => selectCampaign(value)} key={value}>{value === 'All' ? 'All' : value}</button>)}
                </div>
              </section>

              <div className="toolbar panel">
                <label className="search"><Search size={17} /><input aria-label="Search catalog" value={q} onChange={(event) => setQ(event.target.value)} placeholder="Search item, material, profession…" /></label>
                <div className="filters">{availableKinds.map((value) => <button className={kind === value ? 'active' : ''} onClick={() => setKind(value)} key={value}>{value}</button>)}</div>
              </div>

              <div className="split">
                <section className="items">
                  <div className="result-meta"><b>{filtered.length} results</b><small>{resultContext}</small></div>
                  {filtered.map((entry) => {
                    const canPlan = entry.recipeKnown !== false && entry.materials.length > 0
                    return <article className={entry.id === item.id ? 'selected' : ''} key={entry.id}>
                      <button className="item-main" onClick={() => setId(entry.id)}>
                        <Icon src={entry.icon} alt={entry.name} />
                        <div className="grow"><small><IconFor k={entry.kind} />{entry.slot || entry.kind}</small><strong>{entry.name}</strong><span>{entry.classes.includes('All') ? 'All classes' : entry.classes.length ? entry.classes.join(' · ') : 'Class not captured'}</span></div>
                      </button>
                      <div className="item-foot"><div className="item-source-line"><Source value={entry.sourceStatus} /><CampaignBadge value={entry.campaign} /></div>{canPlan ? <button onClick={() => toggle(entry)}>{plan.has(entry.id) ? 'In plan' : '+ Plan'}</button> : <span className="recipe-needed">Recipe needed</span>}</div>
                    </article>
                  })}
                </section>
                <Detail item={item} inPlan={plan.has(item.id)} togglePlan={() => toggle(item)} />
              </div>
            </div>
          </div>
        )}

        {view === 'plan' && <div className="page workbench-page"><CraftingWorkbench selected={plan} setSelected={setPlan} onOpenMaterial={openMaterialFromPlan} /></div>}
        {view === 'materials' && <div className="page"><MaterialsWorkbench onOpenItem={openCatalogItem} selected={plan} initialMaterialName={materialFocus} /></div>}
        {view === 'reference' && <div className="page"><Reference /></div>}
      </main>

      <footer><img src={asset('assets/brand/masterwork-vault-mark.svg')} alt="" /><p><strong>The Masterwork Vault</strong> · Underdark and Sharandar Masterwork reference. Screenshot evidence remains the source of truth for item and recipe data.</p></footer>
    </div>
  )
}
