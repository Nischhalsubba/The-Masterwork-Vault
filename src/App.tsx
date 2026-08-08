import { useEffect, useMemo, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { BookOpen, Boxes, ChevronLeft, ChevronRight, CircleHelp, Gem, Hammer, Minus, Plus, Search, Shield, Sparkles, Sword } from 'lucide-react'
import catalogJson from './data/catalog'
import spriteDataUri from './data/sprite'
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

function Icon({ src, alt, size = 48 }: { src?: string | null; alt: string; size?: number }) {
  const [directFailed, setDirectFailed] = useState(false)
  const index = iconIndexByName.get(norm(alt))

  useEffect(() => {
    setDirectFailed(false)
  }, [src, index])

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

  if (index == null) {
    return <span className="sprite fallback" style={{ width: size, height: size }} role="img" aria-label={`${alt}, image unavailable`} />
  }

  const columns = catalog.meta.sprite.columns || 10
  const rows = Math.ceil(catalog.meta.sprite.count / columns)
  const col = index % columns
  const row = Math.floor(index / columns)

  return (
    <span
      className="sprite atlas-icon"
      role="img"
      aria-label={alt}
      style={{ width: size, height: size, position: 'relative', overflow: 'hidden' }}
    >
      <img
        src={spriteDataUri}
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

function Source({ value }: { value: string }) {
  const label = value === 'latest-user-screenshot' ? 'Latest screenshot' : value === 'spreadsheet-supplemental' ? 'Spreadsheet supplement' : value.includes('final-zip') ? 'Final ZIP' : value
  return <span className={`source ${value === 'spreadsheet-supplemental' ? 'supplemental' : ''}`}>{label}</span>
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
              <small>{material?.craftable ? `${material.profession || 'Crafted'} · yields ${material.outputQuantity || 1}` : 'Raw material'}</small>
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
          <div className="pills"><Source value={material.sourceStatus} /><span className="craftable-pill"><Hammer size={12} />Craftable material</span></div>
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
  const [mode, setMode] = useState<'direct'|'scratch'>('direct')
  const [materialTrail, setMaterialTrail] = useState<MaterialTarget[]>([])

  useEffect(() => {
    setVariant(Math.max(0, item.variants.length - 1))
    setMaterialTrail([])
  }, [item.id])

  const calc = useMemo(() => calculateCraftingPlan([{ item, quantity: 1 }], catalog.recipes), [item])
  const v = item.variants[variant]
  const stats = v?.stats || item.stats || {}
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

  return <section className="detail panel enter">
    <div className="detail-head"><Icon src={item.icon} alt={item.name} size={88} /><div className="grow"><div className="pills"><Source value={item.sourceStatus} /><span>{item.profession || item.kind}</span></div><h2>{item.name}</h2><p>{item.classes.includes('All') ? 'Global' : item.classes.join(' · ')} · {item.slot || item.kind}</p></div><button className="primary" onClick={togglePlan}>{inPlan ? 'Remove from plan' : 'Add to plan'}</button></div>
    {item.variants.length > 1 && <div className="seg">{item.variants.map((x,i) => <button key={i} className={i===variant?'active':''} onClick={() => setVariant(i)}>{x.quality || x.name}</button>)}</div>}
    <div className="stats">{(v?.itemLevel || item.itemLevel) && <div><span>Item level</span><strong>{Number(v?.itemLevel || item.itemLevel).toLocaleString()}</strong></div>}{Object.entries(stats).map(([k,val]) => <div key={k}><span>{k}</span><strong>{typeof val === 'number' ? `+${val.toLocaleString()}` : val}</strong></div>)}</div>
    {setData && <div className="callout"><Sparkles size={18}/><div><strong>{setData.name || 'Set bonus'}</strong><p>{Array.isArray(setData.twoPiece) ? setData.twoPiece.join(' · ') : setData.note}</p></div></div>}
    {item.equipPower?.text && <div className="callout"><Shield size={18}/><div><strong>{item.equipPower.name || 'Equip power'}</strong><p>{item.equipPower.text}</p></div></div>}
    <div className="section-head"><div><small>RAW-MATERIAL COST</small><h3>{mode==='direct'?'Direct recipe':'From-scratch requirements'}</h3></div><div className="seg"><button className={mode==='direct'?'active':''} onClick={() => setMode('direct')}>Direct</button><button className={mode==='scratch'?'active':''} onClick={() => setMode('scratch')}>From scratch</button></div></div>
    <Recipe rows={mode==='direct'?calc.direct:calc.raw} onOpenCraftable={mode === 'direct' ? openCraftable : undefined}/>
    {mode==='scratch' && calc.batches.length>0 && <><h3 className="subhead">Craft batches & leftovers</h3><div className="batches">{calc.batches.map(b => <div key={b.name}><strong>{b.name}</strong><span>{b.crafts} craft{b.crafts===1?'':'s'}</span><small>need {b.needed} · produce {b.produced}{b.leftover?` · ${b.leftover} leftover`:''}</small></div>)}</div></>}
    <ItemRecipeEvidence item={item}/>
  </section>
}

function Planner({ selected, setSelected }: { selected: Map<string,number>; setSelected: (m:Map<string,number>)=>void }) {
  const entries = [...selected].map(([id,quantity]) => ({ item: catalog.items.find(i=>i.id===id)!, quantity })).filter(x=>x.item)
  const calc = useMemo(() => calculateCraftingPlan(entries, catalog.recipes), [entries.map(x=>`${x.item.id}:${x.quantity}`).join('|')])
  const change = (id:string,n:number) => { const m=new Map(selected); n<=0?m.delete(id):m.set(id,n); setSelected(m) }
  if (!entries.length) return <div className="empty panel enter"><Boxes size={34}/><h2>Your crafting plan is empty</h2><p>Add gear from the Catalog to combine its requirements.</p></div>
  return <div className="planner enter"><section className="panel"><div className="section-head"><div><small>MULTI-ITEM PLAN</small><h2>Selected craftables</h2></div><button className="ghost" onClick={()=>setSelected(new Map())}>Clear</button></div>{entries.map(({item,quantity}) => <div className="plan-row" key={item.id}><Icon src={item.icon} alt={item.name} size={46}/><div className="grow"><strong>{item.name}</strong><small>{item.classes.join(' · ')}</small></div><div className="qty"><button onClick={()=>change(item.id,quantity-1)} aria-label={`Decrease ${item.name}`}><Minus size={15}/></button><b>{quantity}</b><button onClick={()=>change(item.id,quantity+1)} aria-label={`Increase ${item.name}`}><Plus size={15}/></button></div></div>)}</section><section className="panel"><small className="eyebrow">COMBINED COST</small><h2>From-scratch raw materials</h2><Recipe rows={calc.raw}/><h3 className="subhead">Batch plan</h3><div className="batches">{calc.batches.map(b=><div key={b.name}><strong>{b.name}</strong><span>{b.crafts} crafts</span><small>{b.leftover} leftover</small></div>)}</div></section></div>
}

function Materials() {
  const [q,setQ]=useState('')
  const [name,setName]=useState(catalog.materials[0]?.name || '')
  const [history,setHistory]=useState<string[]>([])
  const filtered=catalog.materials.filter(m=>m.name.toLowerCase().includes(q.toLowerCase()))
  const m=catalog.materials.find(x=>x.name===name) || filtered[0]
  const recipe=recipeByName.get(norm(m?.name||''))
  const openFromRecipe: OpenCraftable = (material) => {
    if (m) setHistory((trail) => [...trail, m.name])
    setName(material.name)
  }
  const chooseMaterial = (next: string) => { setHistory([]); setName(next) }
  const goBack = () => {
    const previous = history[history.length - 1]
    if (!previous) return
    setHistory((trail) => trail.slice(0, -1))
    setName(previous)
  }

  return <div className="materials enter"><section className="panel"><label className="search"><Search size={17}/><input aria-label="Search materials" value={q} onChange={e=>setQ(e.target.value)} placeholder="Search materials…"/></label><div className="material-list">{filtered.map(x=><button key={x.name} className={m?.name===x.name?'active':''} onClick={()=>chooseMaterial(x.name)}><Icon src={x.icon} alt={x.name} size={40}/><span><strong>{x.name}</strong><small>{x.craftable?`${x.profession} · yield ${x.outputQuantity}`:'Raw material'}</small></span></button>)}</div></section>{m&&<section className="panel material-detail">{history.length>0&&<div className="drilldown-nav"><button className="drilldown-back" onClick={goBack}><ChevronLeft size={18}/>Back</button><span>Back to {history[history.length-1]}</span></div>}<div className="detail-head"><Icon src={m.icon} alt={m.name} size={76}/><div><Source value={m.sourceStatus}/><h2>{m.name}</h2><p>{m.craftable?`${m.profession} · output ${m.outputQuantity}`:'Raw / acquired material'}</p></div></div>{recipe?<><h3>Inputs for one craft</h3><Recipe rows={recipe.materials} onOpenCraftable={openFromRecipe}/></>:<div className="callout"><Gem size={18}/><p>Base material in the current dependency graph.</p></div>}<h3 className="subhead">Used by</h3><div className="tags">{m.usedBy.slice(0,20).map(x=><span key={x}>{x}</span>)}</div></section>}</div>
}

function Reference() { return <div className="reference enter"><section className="panel"><CircleHelp/><small className="eyebrow">SOURCE POLICY</small><h2>What wins when sources disagree</h2><ol>{catalog.meta.sourcePriority.map(x=><li key={x}>{x}</li>)}</ol><p>Commission, proficiency and focus are intentionally excluded. Cost means raw materials required.</p></section><section className="panel"><Gem/><small className="eyebrow">ACQUISITION</small><h2>Workbook source channels</h2><div className="tags">{catalog.reference.acquisitionChannels.map(x=><span key={x}>{x}</span>)}</div><p>{catalog.reference.acquisitionNote}</p></section><section className="panel"><Hammer/><small className="eyebrow">TOOLS & SUPPLEMENTS</small><h2>Supplemental workbook relationships</h2><p>{catalog.reference.spreadsheetTools.length} tool references · {catalog.reference.supplements.length} supplement references. Current ZIP values supersede older sheet values.</p></section></div> }

export default function App() {
  const root=useRef<HTMLDivElement>(null)
  const [view,setView]=useState<'catalog'|'plan'|'materials'|'reference'>('catalog')
  const [cls,setCls]=useState('All')
  const [kind,setKind]=useState('All')
  const [q,setQ]=useState('')
  const initial=catalog.items.find(i=>i.classes.includes('Cleric')&&i.name.includes('Steel Symbol'))?.id || catalog.items[0].id
  const [id,setId]=useState(initial)
  const [plan,setPlan]=useState<Map<string,number>>(new Map())
  const [materialFocus,setMaterialFocus]=useState<string | undefined>()

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
        if (!catalog.items.some((candidate) => candidate.id === itemId)) continue
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

  const filtered=useMemo(()=>catalog.items.filter(i=>{
    const globalKind=i.kind==='Accessory'||i.kind==='Profession Tool'
    const classMatch=cls==='All'||i.classes.includes(cls)||((kind==='Accessory'||kind==='Profession Tool')&&globalKind&&i.kind===kind)
    const kindMatch=kind==='All'||i.kind===kind
    const queryMatch=[i.name,i.slot,i.profession,...i.classes,...i.materials.map(m=>m.name)].join(' ').toLowerCase().includes(q.toLowerCase())
    return classMatch&&kindMatch&&queryMatch
  }),[cls,kind,q])
  const item=filtered.find(i=>i.id===id)||filtered[0]||catalog.items[0]
  useEffect(()=>{if(filtered.length&&!filtered.some(x=>x.id===id))setId(filtered[0].id)},[filtered,id])
  const selectClass=(next:string)=>{setCls(next);setKind('All')}
  const resultContext=cls==='All'?'All classes & global craftables':kind==='Accessory'?'Global accessories':kind==='Profession Tool'?'Global profession tools':`${cls} gear`
  useEffect(()=>{if(!root.current)return;const mm=window.matchMedia('(prefers-reduced-motion: reduce)');if(mm.matches)return;const ctx=gsap.context(()=>gsap.fromTo('.enter',{y:12,autoAlpha:0},{y:0,autoAlpha:1,duration:.36,ease:'power3.out',clearProps:'transform,opacity,visibility'}),root);return()=>ctx.revert()},[view,id])
  const toggle=(x:ItemEntry)=>{const m=new Map(plan);m.has(x.id)?m.delete(x.id):m.set(x.id,1);setPlan(m)}
  const openCatalogItem=(target: ItemEntry)=>{setCls('All');setKind('All');setQ('');setId(target.id);setView('catalog')}
  const openMaterialFromPlan=(name:string)=>{setMaterialFocus(name);setView('materials')}
  const IconFor=({k}:{k:string})=>k==='Weapon'?<Sword size={15}/>:k==='Armor'?<Shield size={15}/>:k==='Accessory'?<Gem size={15}/>:<Hammer size={15}/>
  return <div ref={root} className="app"><header><a href={import.meta.env.BASE_URL} className="brand"><img src={asset('assets/brand/masterwork-vault-mark.svg')} alt=""/><span><strong>The Masterwork Vault</strong><small>Menzoberranzan Masterwork</small></span></a><nav>{([['catalog',BookOpen,'Catalog'],['plan',Boxes,'Plan'],['materials',Gem,'Materials'],['reference',CircleHelp,'Reference']] as const).map(([v,I,l])=><button className={view===v?'active':''} onClick={()=>setView(v)} key={v}><I size={17}/>{l}{v==='plan'&&<b className="badge">{plan.size}</b>}</button>)}</nav></header><main id="main-content"><section className="hero"><AmbientVault/><div><span className="hero-kicker"><Sparkles size={15}/> RAW-MATERIAL CRAFTING INTELLIGENCE</span><h1>Know exactly what the forge demands.</h1><p>Direct recipes, full from-scratch expansion, batch-aware leftovers, class-specific gear and screenshot-grounded icons.</p><div className="metrics"><span><b>{catalog.items.length}</b> craftables</span><span><b>{catalog.materials.length}</b> materials</span><span><b>{catalog.recipes.length}</b> recipe records</span></div></div></section>{view==='catalog'&&<div className="catalog"><aside><small>CLASSES</small><button className={cls==='All'?'active':''} onClick={()=>selectClass('All')}>All craftables</button>{catalog.classes.map(c=><button className={cls===c?'active':''} onClick={()=>selectClass(c)} key={c}>{c}</button>)}</aside><div className="workspace"><div className="toolbar panel"><label className="search"><Search size={17}/><input aria-label="Search catalog" value={q} onChange={e=>setQ(e.target.value)} placeholder="Search gear, material, profession…"/></label><div className="filters">{['All','Weapon','Armor','Accessory','Profession Tool'].map(k=><button className={kind===k?'active':''} onClick={()=>setKind(k)} key={k}>{k}</button>)}</div></div><div className="split"><section className="items"><div className="result-meta"><b>{filtered.length} results</b><small>{resultContext}</small></div>{filtered.map(x=><article className={x.id===item.id?'selected':''} key={x.id}><button className="item-main" onClick={()=>setId(x.id)}><Icon src={x.icon} alt={x.name}/><div className="grow"><small><IconFor k={x.kind}/>{x.slot||x.kind}</small><strong>{x.name}</strong><span>{x.classes.includes('All')?'All classes':x.classes.join(' · ')}</span></div></button><div className="item-foot"><Source value={x.sourceStatus}/><button onClick={()=>toggle(x)}>{plan.has(x.id)?'In plan':'+ Plan'}</button></div></article>)}</section><Detail item={item} inPlan={plan.has(item.id)} togglePlan={()=>toggle(item)}/></div></div></div>}{view==='plan'&&<div className="page workbench-page"><CraftingWorkbench selected={plan} setSelected={setPlan} onOpenMaterial={openMaterialFromPlan}/></div>}{view==='materials'&&<div className="page"><MaterialsWorkbench onOpenItem={openCatalogItem} selected={plan} initialMaterialName={materialFocus}/></div>}{view==='reference'&&<div className="page"><Reference/></div>}</main><footer><img src={asset('assets/brand/masterwork-vault-mark.svg')} alt=""/><p><strong>The Masterwork Vault</strong> · Community crafting reference. Screenshot evidence remains the source of truth.</p></footer></div>
}