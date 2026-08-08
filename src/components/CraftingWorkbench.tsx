import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import {
  BadgeCheck,
  Boxes,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Copy,
  ExternalLink,
  FolderOpen,
  Gem,
  GitBranch,
  Hammer,
  Minus,
  PackageCheck,
  Plus,
  Save,
  Search,
  Share2,
  Trash2,
  Wrench,
} from 'lucide-react'
import catalogJson from '../data/catalog'
import spriteDataUri from '../data/sprite'
import type { CatalogData, ItemEntry, MaterialEntry, RecipeEntry } from '../types'
import {
  buildCraftingTrees,
  calculateCraftingPlan,
  calculateInventoryAwarePlan,
  calculateNaiveRawRequirements,
  type CraftTreeNode,
  type InventoryRecord,
  type PlanSelection,
} from '../lib/crafting'

const catalog = catalogJson as CatalogData
const norm = (s: string) => s.toLowerCase().replace(/\+1/g, '').replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ')
const byMaterial = new Map(catalog.materials.map((material) => [norm(material.name), material]))
const byItemName = new Map(catalog.items.map((item) => [norm(item.name), item]))
const recipeByName = new Map(catalog.recipes.map((recipe) => [norm(recipe.name), recipe]))
const iconIndexByName = new Map<string, number>()
for (const item of catalog.items) if (item.iconIndex != null) iconIndexByName.set(norm(item.name), item.iconIndex)
for (const material of catalog.materials) if (material.iconIndex != null) iconIndexByName.set(norm(material.name), material.iconIndex)

const INVENTORY_KEY = 'masterwork-vault.inventory.v1'
const SAVED_PLANS_KEY = 'masterwork-vault.saved-plans.v1'

interface SavedPlan {
  id: string
  name: string
  createdAt: string
  items: Array<[string, number]>
}

function loadJson<T>(key: string, fallback: T): T {
  try {
    const value = window.localStorage.getItem(key)
    return value ? JSON.parse(value) as T : fallback
  } catch {
    return fallback
  }
}

function cleanInventory(value: InventoryRecord): InventoryRecord {
  const next: InventoryRecord = {}
  for (const material of catalog.materials) {
    const amount = Math.max(0, Math.floor(Number(value[material.name]) || 0))
    if (amount > 0) next[material.name] = amount
  }
  return next
}

function Icon({ src, alt, size = 44 }: { src?: string | null; alt: string; size?: number }) {
  const [directFailed, setDirectFailed] = useState(false)
  const index = iconIndexByName.get(norm(alt))

  useEffect(() => setDirectFailed(false), [src, index])

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

  if (index == null) return <span className="sprite fallback" style={{ width: size, height: size }} role="img" aria-label={`${alt}, image unavailable`} />

  const columns = catalog.meta.sprite.columns || 10
  const rows = Math.ceil(catalog.meta.sprite.count / columns)
  const col = index % columns
  const row = Math.floor(index / columns)

  return (
    <span className="sprite atlas-icon" role="img" aria-label={alt} style={{ width: size, height: size, position: 'relative', overflow: 'hidden' }}>
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

function SourceBadge({ value }: { value: string }) {
  const label = value === 'latest-user-screenshot'
    ? 'Latest screenshot'
    : value === 'spreadsheet-supplemental'
      ? 'Spreadsheet supplement'
      : value.includes('final-zip')
        ? 'Final ZIP'
        : value
  return <span className={`source ${value === 'spreadsheet-supplemental' ? 'supplemental' : ''}`}>{label}</span>
}

function VerificationBadge({ recipe }: { recipe?: RecipeEntry }) {
  if (!recipe) return null
  const screenshotBacked = recipe.quantityExplicit && (recipe.sourceStatus.includes('final-zip') || recipe.sourceStatus === 'latest-user-screenshot')
  return (
    <span className={`verification-badge ${screenshotBacked ? 'verified' : 'supplemental'}`}>
      <BadgeCheck size={13} aria-hidden="true" />
      {screenshotBacked ? 'Screenshot-backed' : 'Supplemental'}
    </span>
  )
}

function InventoryInput({ material, inventory, setInventory }: { material: MaterialEntry; inventory: InventoryRecord; setInventory: (next: InventoryRecord) => void }) {
  const amount = inventory[material.name] ?? 0
  return (
    <label className="inventory-input">
      <span>Owned</span>
      <input
        aria-label={`Owned quantity of ${material.name}`}
        type="number"
        min="0"
        step="1"
        inputMode="numeric"
        value={amount}
        onChange={(event) => {
          const value = Math.max(0, Math.floor(Number(event.target.value) || 0))
          const next = { ...inventory }
          if (value > 0) next[material.name] = value
          else delete next[material.name]
          setInventory(next)
        }}
      />
    </label>
  )
}

function InventoryEditor({ inventory, setInventory }: { inventory: InventoryRecord; setInventory: (next: InventoryRecord) => void }) {
  const [query, setQuery] = useState('')
  const filtered = catalog.materials.filter((material) => material.name.toLowerCase().includes(query.toLowerCase()))

  return (
    <section className="panel inventory-panel">
      <div className="section-head workbench-section-head">
        <div><small>YOUR MATERIALS</small><h2>Inventory</h2></div>
        <button className="ghost" onClick={() => setInventory({})}>Clear inventory</button>
      </div>
      <label className="search compact-search"><Search size={16} /><input aria-label="Search inventory materials" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find material…" /></label>
      <div className="inventory-list">
        {filtered.map((material) => (
          <div className="inventory-row" key={material.name}>
            <Icon src={material.icon} alt={material.name} size={38} />
            <div className="grow"><strong>{material.name}</strong><small>{material.craftable ? `Craftable · yields ${material.outputQuantity || 1}` : 'Raw material'}</small></div>
            <InventoryInput material={material} inventory={inventory} setInventory={setInventory} />
          </div>
        ))}
      </div>
    </section>
  )
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return <div className="empty-inline workbench-empty"><Boxes size={30} /><h3>{title}</h3><p>{body}</p></div>
}

function TreeNode({ node, depth = 0 }: { node: CraftTreeNode; depth?: number }) {
  const [open, setOpen] = useState(depth < 1)
  const hasChildren = node.children.length > 0
  const material = node.kind === 'material' ? byMaterial.get(norm(node.name)) : undefined
  const style = { '--tree-depth': depth } as CSSProperties

  return (
    <div className={`craft-tree-node ${node.craftable ? 'craftable' : 'raw'}`} style={style}>
      <div className="craft-tree-row">
        {hasChildren ? (
          <button className="tree-toggle" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={`${open ? 'Collapse' : 'Expand'} ${node.name}`}>
            {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        ) : <span className="tree-toggle-spacer" />}
        {node.kind === 'item' ? <Wrench size={18} aria-hidden="true" /> : <Icon src={material?.icon} alt={node.name} size={34} />}
        <div className="grow tree-copy">
          <strong>{node.name}</strong>
          <small>
            {node.kind === 'item'
              ? `${node.required} final craft${node.required === 1 ? '' : 's'}`
              : node.craftable
                ? `${node.crafts} craft${node.crafts === 1 ? '' : 's'} · yield ${node.outputPerCraft} · ${node.leftover || 0} leftover`
                : 'Raw material'}
          </small>
        </div>
        <div className="tree-quantity"><span>{node.kind === 'item' ? 'Qty' : 'Need'}</span><strong>×{node.required}</strong></div>
      </div>
      {open && hasChildren && <div className="craft-tree-children">{node.children.map((child, index) => <TreeNode node={child} depth={depth + 1} key={`${child.id}:${index}`} />)}</div>}
    </div>
  )
}

function RecipeRows({ rows, onOpenMaterial }: { rows: Array<{ name: string; required: number }>; onOpenMaterial?: (name: string) => void }) {
  return (
    <div className="recipe-list">
      {rows.map((row) => {
        const material = byMaterial.get(norm(row.name))
        const canOpen = Boolean(material?.craftable && recipeByName.has(norm(row.name)) && onOpenMaterial)
        return (
          <div className={`recipe-row ${canOpen ? 'has-drilldown' : ''}`} key={row.name}>
            <Icon src={material?.icon} alt={row.name} size={42} />
            <div className="recipe-row-copy"><strong>{row.name}</strong><small>{material?.craftable ? `${material.profession || 'Crafted'} · yields ${material.outputQuantity || 1}` : 'Raw material'}</small></div>
            <div className="recipe-row-actions"><b>×{row.required}</b>{canOpen && <button className="craftable-indicator" onClick={() => onOpenMaterial?.(row.name)}><Hammer size={13} />Craftable<ChevronRight size={14} /></button>}</div>
          </div>
        )
      })}
    </div>
  )
}

function selectedEntries(selected: Map<string, number>): PlanSelection[] {
  return [...selected]
    .map(([id, quantity]) => ({ item: catalog.items.find((item) => item.id === id), quantity }))
    .filter((entry): entry is PlanSelection => Boolean(entry.item && entry.quantity > 0))
}

export function CraftingWorkbench({ selected, setSelected }: { selected: Map<string, number>; setSelected: (next: Map<string, number>) => void }) {
  const [tab, setTab] = useState<'overview' | 'tree' | 'ready' | 'checklist' | 'professions' | 'saved'>('overview')
  const [inventory, setInventoryState] = useState<InventoryRecord>(() => loadJson(INVENTORY_KEY, {}))
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>(() => loadJson(SAVED_PLANS_KEY, []))
  const [saveName, setSaveName] = useState('')
  const [shareUrl, setShareUrl] = useState('')
  const [shareStatus, setShareStatus] = useState('')
  const [checklist, setChecklist] = useState<Record<string, boolean>>({})

  const setInventory = (next: InventoryRecord) => {
    const clean = cleanInventory(next)
    setInventoryState(clean)
    window.localStorage.setItem(INVENTORY_KEY, JSON.stringify(clean))
  }

  useEffect(() => window.localStorage.setItem(SAVED_PLANS_KEY, JSON.stringify(savedPlans)), [savedPlans])

  const entries = useMemo(() => selectedEntries(selected), [selected])
  const selectionKey = entries.map(({ item, quantity }) => `${item.id}:${quantity}`).join('|')
  const inventoryKey = catalog.materials.map((material) => `${material.name}:${inventory[material.name] || 0}`).join('|')
  const combined = useMemo(() => calculateCraftingPlan(entries, catalog.recipes), [selectionKey])
  const inventoryPlan = useMemo(() => calculateInventoryAwarePlan(entries, catalog.recipes, inventory), [selectionKey, inventoryKey])
  const naiveRaw = useMemo(() => calculateNaiveRawRequirements(entries, catalog.recipes), [selectionKey])
  const trees = useMemo(() => buildCraftingTrees(entries, catalog.recipes), [selectionKey])

  useEffect(() => setChecklist({}), [selectionKey])

  const optimizedRaw = new Map(combined.raw.map((row) => [norm(row.name), row.required]))
  const savings = naiveRaw
    .map((row) => ({ name: row.name, saved: row.required - (optimizedRaw.get(norm(row.name)) || 0) }))
    .filter((row) => row.saved > 0)
    .sort((a, b) => b.saved - a.saved || a.name.localeCompare(b.name))
  const totalSaved = savings.reduce((sum, row) => sum + row.saved, 0)

  const readiness = useMemo(() => catalog.items.map((item) => {
    const plan = calculateInventoryAwarePlan([{ item, quantity: 1 }], catalog.recipes, inventory)
    const missingUnits = plan.missingRaw.reduce((sum, row) => sum + row.required, 0)
    return { item, plan, missingUnits, ready: plan.missingRaw.length === 0 }
  }).sort((a, b) => Number(b.ready) - Number(a.ready) || a.missingUnits - b.missingUnits || a.item.name.localeCompare(b.item.name)), [inventoryKey])

  const readyItems = readiness.filter((row) => row.ready)
  const nearItems = readiness.filter((row) => !row.ready).slice(0, 12)

  const changeQuantity = (id: string, quantity: number) => {
    const next = new Map(selected)
    if (quantity <= 0) next.delete(id)
    else next.set(id, quantity)
    setSelected(next)
  }

  const saveCurrentPlan = () => {
    if (!entries.length) return
    const fallback = `Crafting plan ${new Date().toLocaleDateString()}`
    const plan: SavedPlan = {
      id: `${Date.now()}`,
      name: saveName.trim() || fallback,
      createdAt: new Date().toISOString(),
      items: entries.map(({ item, quantity }) => [item.id, quantity]),
    }
    setSavedPlans((plans) => [plan, ...plans])
    setSaveName('')
  }

  const loadPlan = (plan: SavedPlan) => {
    const next = new Map<string, number>()
    for (const [id, quantity] of plan.items) {
      if (catalog.items.some((item) => item.id === id) && Number.isInteger(quantity) && quantity > 0) next.set(id, quantity)
    }
    setSelected(next)
    setTab('overview')
  }

  const sharePlan = async () => {
    if (!entries.length) return
    const url = new URL(window.location.href)
    url.searchParams.set('plan', JSON.stringify(entries.map(({ item, quantity }) => [item.id, quantity])))
    url.hash = ''
    const value = url.toString()
    setShareUrl(value)
    try {
      await navigator.clipboard.writeText(value)
      setShareStatus('Share link copied')
    } catch {
      setShareStatus('Share link ready below')
    }
  }

  const professionGroups = useMemo(() => {
    const groups = new Map<string, Array<{ name: string; crafts: number; note: string; final: boolean }>>()
    const add = (profession: string | null | undefined, row: { name: string; crafts: number; note: string; final: boolean }) => {
      const key = profession || 'Unspecified profession'
      groups.set(key, [...(groups.get(key) || []), row])
    }
    for (const { item, quantity } of entries) add(item.profession, { name: item.name, crafts: quantity, note: 'Final craft', final: true })
    for (const batch of inventoryPlan.batches) add(batch.profession, { name: batch.name, crafts: batch.crafts, note: `produce ${batch.produced}${batch.leftover ? ` · ${batch.leftover} leftover` : ''}`, final: false })
    return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b))
  }, [selectionKey, inventoryKey])

  const shoppingRows = inventoryPlan.availability.filter((row) => row.missing > 0)
  const checkedCount = shoppingRows.filter((row) => checklist[row.name]).length

  return (
    <div className="crafting-workbench enter">
      <section className="panel workbench-header">
        <div>
          <small className="eyebrow">CRAFTING WORKBENCH</small>
          <h1>Plan the whole dependency chain.</h1>
          <p>Shared batches, inventory-aware shortages, recipe trees and saved plans all use the same verified recipe graph.</p>
        </div>
        <div className="workbench-tabs" role="tablist" aria-label="Crafting workbench views">
          {([
            ['overview', 'Overview'],
            ['tree', 'Craft tree'],
            ['ready', 'Craftable now'],
            ['checklist', 'Checklist'],
            ['professions', 'Professions'],
            ['saved', 'Saved'],
          ] as const).map(([value, label]) => <button role="tab" aria-selected={tab === value} className={tab === value ? 'active' : ''} onClick={() => setTab(value)} key={value}>{label}</button>)}
        </div>
      </section>

      {tab === 'overview' && (
        <div className="workbench-grid overview-grid enter">
          <section className="panel">
            <div className="section-head workbench-section-head"><div><small>PLAN</small><h2>Selected craftables</h2></div>{entries.length > 0 && <button className="ghost" onClick={() => setSelected(new Map())}>Clear</button>}</div>
            {!entries.length ? <EmptyState title="No craftables selected" body="Add items from Catalog, or load a saved plan." /> : entries.map(({ item, quantity }) => (
              <div className="plan-row spacious" key={item.id}>
                <Icon src={item.icon} alt={item.name} size={48} />
                <div className="grow"><strong>{item.name}</strong><small>{item.profession || item.kind} · {item.classes.join(' · ')}</small></div>
                <div className="qty"><button onClick={() => changeQuantity(item.id, quantity - 1)} aria-label={`Decrease ${item.name}`}><Minus size={15} /></button><b>{quantity}</b><button onClick={() => changeQuantity(item.id, quantity + 1)} aria-label={`Increase ${item.name}`}><Plus size={15} /></button></div>
              </div>
            ))}
          </section>

          <section className="panel">
            <div className="section-head workbench-section-head"><div><small>OPTIMIZED COST</small><h2>Shared-batch plan</h2></div><span className="optimization-chip"><GitBranch size={14} />{totalSaved > 0 ? `${totalSaved} raw units saved` : 'Already optimal'}</span></div>
            {!entries.length ? <EmptyState title="Nothing to optimize yet" body="The planner combines demand before rounding intermediate craft batches." /> : (
              <>
                <div className="workbench-metrics">
                  <div><span>Final craftables</span><strong>{entries.reduce((sum, row) => sum + row.quantity, 0)}</strong></div>
                  <div><span>Intermediate batches</span><strong>{inventoryPlan.batches.reduce((sum, row) => sum + row.crafts, 0)}</strong></div>
                  <div><span>Raw types missing</span><strong>{inventoryPlan.missingRaw.length}</strong></div>
                  <div><span>Inventory units used</span><strong>{inventoryPlan.inventoryUsed.reduce((sum, row) => sum + row.required, 0)}</strong></div>
                </div>
                {savings.length > 0 && <div className="optimization-savings"><strong>Saved by combining batches</strong>{savings.map((row) => <span key={row.name}>{row.name}<b>−{row.saved}</b></span>)}</div>}
                <h3 className="subhead">Raw-material availability</h3>
                <div className="availability-list">
                  {inventoryPlan.availability.map((row) => <div className="availability-row" key={row.name}><div><strong>{row.name}</strong><small>required {row.required} · inventory used {row.owned}</small></div><b className={row.missing > 0 ? 'missing' : 'ready'}>{row.missing > 0 ? `${row.missing} missing` : 'Ready'}</b></div>)}
                </div>
              </>
            )}
          </section>
        </div>
      )}

      {tab === 'tree' && (
        <section className="panel tree-panel enter">
          <div className="section-head workbench-section-head"><div><small>DEPENDENCY GRAPH</small><h2>Interactive crafting tree</h2></div><span className="quiet-note">Per-item tree · shared optimization remains in Overview</span></div>
          {!trees.length ? <EmptyState title="No tree to show" body="Add one or more craftables to the plan first." /> : <div className="craft-tree">{trees.map((tree) => <TreeNode node={tree} key={tree.id} />)}</div>}
        </section>
      )}

      {tab === 'ready' && (
        <div className="workbench-grid inventory-ready-grid enter">
          <InventoryEditor inventory={inventory} setInventory={setInventory} />
          <section className="panel ready-panel">
            <div className="section-head workbench-section-head"><div><small>INVENTORY CHECK</small><h2>What can I craft now?</h2></div><span className="ready-count"><PackageCheck size={15} />{readyItems.length} ready</span></div>
            {readyItems.length === 0 ? <EmptyState title="Nothing is fully craftable yet" body="Enter the materials you own. Intermediate materials in inventory are consumed before the planner expands their recipes." /> : (
              <div className="ready-list">{readyItems.map(({ item }) => <div className="ready-card" key={item.id}><Icon src={item.icon} alt={item.name} size={44} /><div className="grow"><strong>{item.name}</strong><small>{item.profession || item.kind}</small></div><span><Check size={14} />Ready</span><button onClick={() => changeQuantity(item.id, Math.max(1, selected.get(item.id) || 0) + (selected.has(item.id) ? 1 : 0))}>{selected.has(item.id) ? '+1 to plan' : 'Add to plan'}</button></div>)}</div>
            )}
            <h3 className="subhead">Closest to craftable</h3>
            <div className="near-ready-list">{nearItems.map(({ item, plan, missingUnits }) => <div className="near-ready-row" key={item.id}><Icon src={item.icon} alt={item.name} size={38} /><div className="grow"><strong>{item.name}</strong><small>{plan.missingRaw.slice(0, 3).map((row) => `${row.name} ×${row.required}`).join(' · ')}</small></div><b>{missingUnits} units short</b></div>)}</div>
          </section>
        </div>
      )}

      {tab === 'checklist' && (
        <section className="panel checklist-panel enter">
          <div className="section-head workbench-section-head"><div><small>SHOPPING / FARMING</small><h2>Acquisition checklist</h2></div><span className="checklist-progress"><ClipboardCheck size={15} />{checkedCount}/{shoppingRows.length}</span></div>
          {!entries.length ? <EmptyState title="No shopping list yet" body="Add craftables to the plan first." /> : shoppingRows.length === 0 ? <EmptyState title="Everything required is already covered" body="Your current inventory covers the optimized raw-material requirement." /> : (
            <div className="shopping-list">{shoppingRows.map((row) => <label className={`shopping-row ${checklist[row.name] ? 'checked' : ''}`} key={row.name}><input type="checkbox" checked={Boolean(checklist[row.name])} onChange={(event) => setChecklist((state) => ({ ...state, [row.name]: event.target.checked }))} /><span className="checkbox-ui"><Check size={14} /></span><div className="grow"><strong>{row.name}</strong><small>need {row.required} · inventory covers {row.owned}</small></div><b>Acquire ×{row.missing}</b></label>)}</div>
          )}
        </section>
      )}

      {tab === 'professions' && (
        <section className="panel professions-panel enter">
          <div className="section-head workbench-section-head"><div><small>CRAFT ORDER</small><h2>Profession dashboard</h2></div><span className="quiet-note">Inventory-aware intermediate batches</span></div>
          {!entries.length ? <EmptyState title="No profession work queued" body="Add craftables to generate the profession sequence." /> : <div className="profession-grid">{professionGroups.map(([profession, rows]) => <section className="profession-card" key={profession}><div className="profession-card-head"><Hammer size={18} /><div><strong>{profession}</strong><small>{rows.reduce((sum, row) => sum + row.crafts, 0)} craft actions</small></div></div>{rows.map((row) => <div className="profession-step" key={`${profession}:${row.name}:${row.final}`}><div><strong>{row.name}</strong><small>{row.note}</small></div><b>×{row.crafts}</b></div>)}</section>)}</div>}
        </section>
      )}

      {tab === 'saved' && (
        <div className="workbench-grid saved-grid enter">
          <section className="panel">
            <div className="section-head workbench-section-head"><div><small>LOCAL PLANS</small><h2>Save this plan</h2></div><Save size={20} /></div>
            <label className="saved-name-field"><span>Plan name</span><input value={saveName} onChange={(event) => setSaveName(event.target.value)} placeholder="Barbarian armor set" /></label>
            <button className="primary full-width" disabled={!entries.length} onClick={saveCurrentPlan}><Save size={15} />Save on this device</button>
            <div className="share-box"><div><strong>Shareable link</strong><p>Encodes item IDs and quantities only. Inventory stays private on this device.</p></div><button className="ghost-button" disabled={!entries.length} onClick={sharePlan}><Share2 size={15} />Create link</button>{shareStatus && <small>{shareStatus}</small>}{shareUrl && <div className="share-url"><input readOnly value={shareUrl} aria-label="Shareable plan URL" /><button aria-label="Copy shareable plan URL" onClick={() => navigator.clipboard.writeText(shareUrl)}><Copy size={15} /></button></div>}</div>
          </section>
          <section className="panel">
            <div className="section-head workbench-section-head"><div><small>SAVED ON DEVICE</small><h2>Saved plans</h2></div><FolderOpen size={20} /></div>
            {!savedPlans.length ? <EmptyState title="No saved plans" body="Saved plans use browser storage, so no account or backend is required." /> : <div className="saved-plan-list">{savedPlans.map((plan) => <div className="saved-plan-row" key={plan.id}><div className="grow"><strong>{plan.name}</strong><small>{plan.items.reduce((sum, [, quantity]) => sum + quantity, 0)} craftables · saved {new Date(plan.createdAt).toLocaleDateString()}</small></div><button onClick={() => loadPlan(plan)}><FolderOpen size={14} />Load</button><button className="danger-ghost" aria-label={`Delete ${plan.name}`} onClick={() => setSavedPlans((plans) => plans.filter((row) => row.id !== plan.id))}><Trash2 size={15} /></button></div>)}</div>}
          </section>
        </div>
      )}
    </div>
  )
}

export function MaterialsWorkbench({ onOpenItem }: { onOpenItem: (item: ItemEntry) => void }) {
  const [query, setQuery] = useState('')
  const [name, setName] = useState(catalog.materials[0]?.name || '')
  const [history, setHistory] = useState<string[]>([])
  const [inventory, setInventoryState] = useState<InventoryRecord>(() => loadJson(INVENTORY_KEY, {}))

  const setInventory = (next: InventoryRecord) => {
    const clean = cleanInventory(next)
    setInventoryState(clean)
    window.localStorage.setItem(INVENTORY_KEY, JSON.stringify(clean))
  }

  const filtered = catalog.materials.filter((material) => material.name.toLowerCase().includes(query.toLowerCase()))
  const material = catalog.materials.find((row) => row.name === name) || filtered[0]
  const recipe = material ? recipeByName.get(norm(material.name)) : undefined

  const openMaterial = (nextName: string) => {
    if (material && material.name !== nextName) setHistory((trail) => [...trail, material.name])
    setName(nextName)
  }
  const chooseMaterial = (nextName: string) => { setHistory([]); setName(nextName) }
  const goBack = () => {
    const previous = history[history.length - 1]
    if (!previous) return
    setHistory((trail) => trail.slice(0, -1))
    setName(previous)
  }

  if (!material) return <EmptyState title="No material selected" body="Search the material catalog." />

  const finalUses = material.usedBy.map((target) => byItemName.get(norm(target))).filter((item): item is ItemEntry => Boolean(item))
  const materialUses = material.usedBy.map((target) => byMaterial.get(norm(target))).filter((row): row is MaterialEntry => Boolean(row))
  const screenshotBacked = Boolean(recipe?.quantityExplicit && (recipe.sourceStatus.includes('final-zip') || recipe.sourceStatus === 'latest-user-screenshot'))

  return (
    <div className="materials materials-workbench enter">
      <section className="panel materials-browser">
        <label className="search"><Search size={17} /><input aria-label="Search materials" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search materials…" /></label>
        <div className="material-list">{filtered.map((row) => <button key={row.name} className={material.name === row.name ? 'active' : ''} onClick={() => chooseMaterial(row.name)}><Icon src={row.icon} alt={row.name} size={40} /><span><strong>{row.name}</strong><small>{row.craftable ? `${row.profession || 'Crafted'} · yield ${row.outputQuantity || 1}` : 'Raw material'}</small></span></button>)}</div>
      </section>

      <section className="panel material-intelligence">
        {history.length > 0 && <div className="drilldown-nav"><button className="drilldown-back" onClick={goBack}><ChevronLeft size={18} />Back</button><span>Back to {history[history.length - 1]}</span></div>}
        <div className="material-intelligence-head">
          <div className="detail-head"><Icon src={material.icon} alt={material.name} size={76} /><div className="grow"><div className="pills"><SourceBadge value={material.sourceStatus} />{recipe && <VerificationBadge recipe={recipe} />}</div><h2>{material.name}</h2><p>{material.craftable ? `${material.profession || recipe?.profession || 'Crafted material'} · output ${material.outputQuantity || recipe?.outputQuantity || 1}` : 'Raw / acquired material'}</p></div></div>
          <InventoryInput material={material} inventory={inventory} setInventory={setInventory} />
        </div>

        {recipe ? <><div className="section-head workbench-section-head"><div><small>EXACT RECIPE</small><h3>Inputs for one craft</h3></div><span className="yield-chip">Produces ×{recipe.outputQuantity}</span></div><RecipeRows rows={recipe.materials} onOpenMaterial={openMaterial} /></> : <div className="callout"><Gem size={18} /><p>Base material in the current dependency graph. No crafting recipe is recorded for it.</p></div>}

        <details className="evidence-card" open={Boolean(recipe)}>
          <summary><span><BadgeCheck size={17} />Recipe verification & evidence</span><ChevronRight size={16} /></summary>
          <div className="evidence-body">
            <div className="evidence-grid"><div><span>Recipe state</span><strong>{recipe ? (screenshotBacked ? 'Screenshot-backed' : 'Supplemental') : 'No recipe'}</strong></div><div><span>Output quantity</span><strong>{recipe ? `×${recipe.outputQuantity}` : 'N/A'}</strong></div><div><span>Quantity explicit</span><strong>{recipe ? (recipe.quantityExplicit ? 'Yes' : 'No') : 'N/A'}</strong></div><div><span>Source</span><strong>{recipe ? recipe.sourceStatus : material.sourceStatus}</strong></div></div>
            {recipe?.evidence?.length ? <ul>{recipe.evidence.map((line) => <li key={line}>{line}</li>)}</ul> : <p>No recipe-specific evidence record is attached.</p>}
            {material.name === 'Soul Bead' && catalog.meta.soulBeadResolution && <div className="evidence-conflict"><strong>Soul Bead conflict resolution</strong><p>{catalog.meta.soulBeadResolution}</p></div>}
          </div>
        </details>

        <div className="reverse-lookup">
          <div className="section-head workbench-section-head"><div><small>REVERSE LOOKUP</small><h3>Where this material is used</h3></div><span className="quiet-note">{material.usedBy.length} relationships</span></div>
          <div className="reverse-grid">
            <section><h4>Final craftables</h4>{finalUses.length ? <div className="reverse-list">{finalUses.map((item) => <button onClick={() => onOpenItem(item)} key={item.id}><Icon src={item.icon} alt={item.name} size={34} /><span><strong>{item.name}</strong><small>{item.profession || item.kind}</small></span><ExternalLink size={14} /></button>)}</div> : <p className="quiet-note">No final craftable directly uses this material.</p>}</section>
            <section><h4>Crafted materials</h4>{materialUses.length ? <div className="reverse-list">{materialUses.map((row) => <button onClick={() => openMaterial(row.name)} key={row.name}><Icon src={row.icon} alt={row.name} size={34} /><span><strong>{row.name}</strong><small>{row.profession || 'Crafted material'}</small></span><ChevronRight size={14} /></button>)}</div> : <p className="quiet-note">No intermediate material directly uses this material.</p>}</section>
          </div>
        </div>
      </section>
    </div>
  )
}
