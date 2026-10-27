import { useEffect, useMemo, useState } from 'react'
import type { MaterialNeed } from '../types'

const KEY = 'masterwork-vault.ad-prices.v1'
interface StoredPrices { materials: Record<string, string>; finished: Record<string, string> }
const empty: StoredPrices = { materials: {}, finished: {} }
const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
const read = (): StoredPrices => {
  try {
    const val = JSON.parse(window.localStorage.getItem(KEY) || '{}')
    if (!val || typeof val !== 'object') return empty
    return {
      materials: val.materials && typeof val.materials === 'object' ? val.materials : {},
      finished: val.finished && typeof val.finished === 'object' ? val.finished : {},
    }
  } catch { return empty }
}
const priceOf = (raw?: string): number | null => {
  if (raw == null || raw.trim() === '') return null
  const n = Number(raw)
  return Number.isFinite(n) && n >= 0 && n <= 999999999 ? Math.floor(n) : null
}
const ad = (n: number) => n.toLocaleString('en-US') + ' AD'

export function ForgeEconomics({
  itemName, quantity, missing, unresolved,
}: {
  itemName: string
  quantity: number
  missing: MaterialNeed[]
  unresolved: MaterialNeed[]
}) {
  const [prices, setPrices] = useState<StoredPrices>(read)
  const itemKey = normalize(itemName)
  useEffect(() => {
    try { window.localStorage.setItem(KEY, JSON.stringify(prices)) } catch { /* browser private mode */ }
  }, [prices])
  const details = useMemo(() => missing.map(row => ({
    ...row, price: priceOf(prices.materials[normalize(row.name)]),
  })), [missing, prices.materials])
  const known = details.filter(row => row.price !== null)
  const subtotal = known.reduce((sum, row) => sum + row.required * (row.price ?? 0), 0)
  const unpriced = details.filter(row => row.price === null).length
  const complete = unpriced === 0 && unresolved.length === 0
  const buyEach = priceOf(prices.finished[itemKey])
  const buyTotal = buyEach === null ? null : buyEach * quantity
  const diff = complete && buyTotal !== null ? buyTotal - subtotal : null

  const writeMaterial = (name: string, value: string) => setPrices(current => ({
    ...current, materials: { ...current.materials, [normalize(name)]: value },
  }))
  const writeFinished = (value: string) => setPrices(current => ({
    ...current, finished: { ...current.finished, [itemKey]: value },
  }))

  return (
    <details className="forge-economics">
      <summary>Estimate Astral Diamond costs <span>Optional · manual prices</span></summary>
      <div className="forge-economics-body">
        <p>Enter your own prices. The Vault does not connect to live Auction House listings.</p>
        <div className="forge-order-section-title"><span>Missing materials</span><small>AD per unit</small></div>
        {missing.length === 0 && <p>No new raw materials needed according to your recorded inventory.</p>}
        {missing.map(row => <label key={row.name} className="forge-price-row">
          <span>{row.name}<small>×{row.required} missing</small></span>
          <input type="number" min="0" max="999999999" step="1" inputMode="numeric"
            aria-label={'Estimated AD per unit of ' + row.name} placeholder="Not set"
            value={prices.materials[normalize(row.name)] ?? ''}
            onChange={event => writeMaterial(row.name, event.target.value)} />
        </label>)}
        <div className="forge-price-result">
          <span>{complete ? 'Estimated remaining raw-material cost' : 'Priced-material subtotal (incomplete)'}</span>
          <strong>{known.length || !missing.length ? ad(subtotal) : '—'}</strong>
        </div>
        {unpriced > 0 && <p className="forge-price-warning">{unpriced} material type{unpriced === 1 ? '' : 's'} still require price estimates.</p>}
        {unresolved.length > 0 && <p className="forge-price-warning">Unverified crafting yields prevent a complete cost estimate.</p>}
        <label className="forge-price-row forge-finished-price">
          <span>Finished item purchase estimate<small>AD per completed item</small></span>
          <input type="number" min="0" max="999999999" step="1" inputMode="numeric"
            aria-label={'Estimated AD to buy ' + itemName} placeholder="Not set"
            value={prices.finished[itemKey] ?? ''}
            onChange={event => writeFinished(event.target.value)} />
        </label>
        {buyTotal !== null && <div className="forge-price-result"><span>Buy {quantity} finished</span><strong>{ad(buyTotal)}</strong></div>}
        {diff !== null && <p className="forge-price-comparison">
          {diff > 0 ? 'Raw materials cost ' + ad(diff) + ' less than buying finished.' :
           diff < 0 ? 'Buying finished costs ' + ad(-diff) + ' less than raw materials.' :
           'Raw materials and finished purchase totals are equal.'}
        </p>}
        <p className="forge-price-disclaimer">Estimates exclude artisan commission, supplements, failure risk, selling fees, and the value of existing inventory. This is not a verified profit calculation.</p>
      </div>
    </details>
  )
}
