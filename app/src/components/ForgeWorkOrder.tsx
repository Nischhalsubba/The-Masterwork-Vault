import { useEffect, useMemo, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { Check, ClipboardList, Download, Minus, Plus, ShieldCheck } from 'lucide-react'
import catalogData from '../data/catalog'
import type { CatalogData, ItemEntry } from '../types'
import { calculateInventoryAwarePlan, type InventoryRecord } from '../lib/crafting'

const catalog = catalogData as CatalogData
const INVENTORY_KEY = 'masterwork-vault.inventory.v1'
const clamp = (value: number) => Math.min(999, Math.max(1, Math.floor(value) || 1))

function readInventory(): InventoryRecord {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(INVENTORY_KEY) || '{}')
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
    const names = new Set(catalog.materials.map((material) => material.name))
    return Object.fromEntries(Object.entries(parsed).filter(([name, amount]) =>
      names.has(name) && typeof amount === 'number' && Number.isInteger(amount) && amount > 0
    )) as InventoryRecord
  } catch { return {} }
}

function exportList(item: ItemEntry, quantity: number, missing: Array<{ name: string; required: number }>, unresolved: Array<{ name: string; required: number }>) {
  const rows = [
    ['Crafting goal', item.name], ['Output quantity', String(quantity)], ['Data source', item.sourceStatus],
    [], ['Status', 'Material', 'Quantity'],
    ...missing.map((row) => ['Acquire', row.name, String(row.required)]),
    ...unresolved.map((row) => ['Unresolved yield', row.name, String(row.required)]),
  ]
  const csv = rows.map((row) => row.map((value) => '"' + String(value || '').replaceAll('"', '""') + '"').join(',')).join('\r\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'masterwork-acquisition-list.csv'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

interface Props {
  item: ItemEntry
  quantity: number
  onQuantityChange: (value: number) => void
  onAddToPlan: () => void
  onOpenPlan: () => void
  inPlan: boolean
}

export function ForgeWorkOrder({ item, quantity, onQuantityChange, onAddToPlan, onOpenPlan, inPlan }: Props) {
  const [inventory, setInventory] = useState<InventoryRecord>(readInventory)
  const itemHeadlineRef = useRef<HTMLHeadingElement>(null)
  const progressRef = useRef<HTMLSpanElement>(null)
  const hasRecipe = item.recipeKnown !== false && item.materials.length > 0
  useEffect(() => {
    const onStorage = (event: StorageEvent) => { if (event.key === INVENTORY_KEY || event.key === null) setInventory(readInventory()) }
    const onLocal = () => setInventory(readInventory())
    window.addEventListener('storage', onStorage)
    document.addEventListener('masterwork:inventory-updated', onLocal)
    return () => { window.removeEventListener('storage', onStorage); document.removeEventListener('masterwork:inventory-updated', onLocal) }
  }, [])
  const plan = useMemo(() => hasRecipe ? calculateInventoryAwarePlan([{ item, quantity }], catalog.recipes, inventory) : null, [item, quantity, inventory, hasRecipe])
  const rows = plan?.availability ?? []
  const required = rows.reduce((sum, row) => sum + row.required, 0)
  const owned = rows.reduce((sum, row) => sum + Math.min(row.owned, row.required), 0)
  const missing = rows.reduce((sum, row) => sum + row.missing, 0)
  const unresolved = plan?.unresolved ?? []
  const ready = required > 0 && missing === 0 && unresolved.length === 0
  const percent = required === 0 ? 0 : Math.round(owned / required * 100)
  const pending = rows.filter((row) => row.missing > 0)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !itemHeadlineRef.current) return
    const tween = gsap.fromTo(itemHeadlineRef.current,
      { autoAlpha: .55, y: 8 },
      { autoAlpha: 1, y: 0, duration: .24, ease: 'power2.out', clearProps: 'all' })
    return () => { tween.kill(); gsap.set(itemHeadlineRef.current, { clearProps: 'all' }) }
  }, [item.id])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !progressRef.current) return
    const tween = gsap.fromTo(progressRef.current,
      { scaleX: .85, transformOrigin: 'left center' },
      { scaleX: 1, duration: .3, ease: 'power2.out', clearProps: 'transform' })
    return () => { tween.kill(); gsap.set(progressRef.current, { clearProps: 'transform' }) }
  }, [percent])

  const updateOwned = (name: string, amount: number) => {
    const value = Math.max(0, Math.min(999999, Math.floor(amount) || 0))
    const next = { ...inventory }
    if (value) next[name] = value
    else delete next[name]
    setInventory(next)
    try { window.localStorage.setItem(INVENTORY_KEY, JSON.stringify(next)) } catch { /* Optional storage */ }
    document.dispatchEvent(new Event('masterwork:inventory-updated'))
  }

  return <aside className="forge-work-order" aria-label="Selected recipe work order">
    <div className="forge-order-heading">
      <span className="forge-overline">WORK ORDER / MATERIAL PLAN</span>
      <h2 ref={itemHeadlineRef}>{item.name}</h2>
      <p>{item.campaign || 'Collection unknown'} · {item.profession || 'Profession unrecorded'}</p>
    </div>
    <div className="forge-order-body">
      <div className="forge-order-quantity">
        <div><strong>Craft quantity</strong><small>Preview before adding to your plan</small></div>
        <div className="forge-quantity-control">
          <button type="button" disabled={quantity <= 1} onClick={() => onQuantityChange(clamp(quantity - 1))} aria-label="Decrease craft quantity"><Minus size={15}/></button>
          <output aria-label="Craft quantity">{quantity}</output>
          <button type="button" disabled={quantity >= 999} onClick={() => onQuantityChange(clamp(quantity + 1))} aria-label="Increase craft quantity"><Plus size={15}/></button>
        </div>
      </div>
      {!hasRecipe ? <div className="forge-order-empty" role="status"><ShieldCheck size={22} aria-hidden="true"/><strong>Recipe not yet captured</strong><p>This item remains in the catalog, but its materials cannot be planned until its recipe is sourced.</p></div> : <>
        <div className="forge-order-stat"><span>Raw units required</span><strong>{required.toLocaleString()}</strong></div>
        <div className="forge-order-stat"><span>Available in inventory</span><strong>{owned.toLocaleString()}</strong></div>
        <div className="forge-order-stat forge-order-stat-emphasis"><span>Still to acquire</span><strong>{missing.toLocaleString()}</strong></div>
        <div className="forge-readiness" aria-label="Inventory readiness"><div><span>INVENTORY READINESS</span><strong>{percent}%</strong></div><div className="forge-readiness-track" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label="Materials available"><span ref={progressRef} style={{ width: percent + '%' }}/></div></div>
        {unresolved.length > 0 && <p className="forge-unresolved" role="status">Incomplete total: {unresolved.map((row) => row.name + ' ×' + row.required).join(' · ')} has an unverified output yield.</p>}
        <div className="forge-order-acquire">
          <div className="forge-order-section-title"><span>ACQUIRE NEXT</span><small>{pending.length} material types</small></div>
          {ready && <p className="forge-order-ready"><Check size={15} aria-hidden="true"/>All materials accounted for</p>}
          {!pending.length && !ready && <p className="forge-order-hint">No raw materials marked missing.</p>}
          {pending.map((row) => <div className="forge-acquire-row" key={row.name}><span>{row.name}</span><strong>×{row.missing}</strong></div>)}
        </div>
        <div className="forge-order-inventory">
          <div className="forge-order-section-title"><span>INVENTORY ON HAND</span><small>Edit quantities</small></div>
          {rows.map((row) => <label className="forge-inventory-row" key={row.name}><span>{row.name}<small>Need {row.required}</small></span><input type="number" inputMode="numeric" step="1" min="0" max="999999" value={inventory[row.name] || 0} aria-label={'Owned ' + row.name} onChange={(event) => updateOwned(row.name, Number(event.target.value))}/></label>)}
        </div>
      </>}
    </div>
    <div className="forge-order-actions">
      <button type="button" className="forge-order-primary" disabled={!hasRecipe} onClick={onAddToPlan}><ClipboardList size={16} aria-hidden="true"/>{inPlan ? 'Update crafting plan' : 'Add to crafting plan'}</button>
      {inPlan && <button type="button" className="forge-order-secondary" onClick={onOpenPlan}>Open complete plan</button>}
      <button type="button" className="forge-order-secondary" disabled={!plan} onClick={() => { if (plan) exportList(item, quantity, plan.missingRaw, plan.unresolved) }}><Download size={15} aria-hidden="true"/>Export acquisition list</button>
      <p>Uses recorded raw materials, not unverified Auction House prices.</p>
    </div>
  </aside>
}
