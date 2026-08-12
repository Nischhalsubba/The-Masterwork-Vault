import catalogJson from '../data/catalog'
import { masterworkProgression, professionMechanics, workshopProgressionKnowledge } from '../data/craftingKnowledgePool'
import type { CatalogData, ItemEntry, MaterialEntry, RecipeEntry } from '../types'

const catalog = catalogJson as CatalogData
const norm = (value: string) => value.toLowerCase().replace(/\+1/g, '').replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ')

export type VerificationStatus = 'verified' | 'strong-current' | 'screenshot-backed' | 'supplemental' | 'historical' | 'unknown'
export type ArtworkProvenance = 'screenshot-extracted' | 'verified-game-asset' | 'reference-derived' | 'placeholder' | 'missing' | 'rejected'

export interface VerificationLedgerEntry {
  id: string
  label: string
  value: string
  status: VerificationStatus
  lastVerified: string
  note?: string
}

export const verificationLedger: VerificationLedgerEntry[] = [
  { id: 'profession-cap', label: 'Profession level cap', value: String(professionMechanics.maxLevel), status: 'strong-current', lastVerified: '2026-08-11' },
  { id: 'daily-morale', label: 'Daily Workshop Morale', value: String(professionMechanics.dailyMorale), status: 'strong-current', lastVerified: '2026-08-11' },
  { id: 'morale-cost', label: 'Morale refill base rate', value: `${professionMechanics.moraleRefillAdPerPoint} AD / Morale`, status: 'strong-current', lastVerified: '2026-08-11' },
  { id: 'maker-manual', label: "Maker's Training Manual", value: '+100% Professions XP', status: 'strong-current', lastVerified: '2026-08-11' },
  { id: 'philosopher-manual', label: "Philosopher's Training Manual", value: '+200% Professions XP', status: 'strong-current', lastVerified: '2026-08-11' },
  { id: 'focus', label: 'Focus → HQ chance', value: professionMechanics.highQualityChance.formula, status: 'strong-current', lastVerified: '2026-08-11' },
  { id: 'speed', label: 'Speed → crafting time', value: professionMechanics.craftingTime.formula, status: 'strong-current', lastVerified: '2026-08-11' },
  { id: 'artisan-capacity', label: 'Workshop artisan capacities', value: Object.entries(workshopProgressionKnowledge.artisanCapacityByRank).map(([rank, count]) => `R${rank}:${count}`).join(' · '), status: 'strong-current', lastVerified: '2026-08-11' },
  { id: 'xp-curve', label: 'Profession XP curve Level 1→20', value: 'Unknown / excluded', status: 'unknown', lastVerified: '2026-08-11', note: 'Obsolete pre-2021 XP tables must not be reused.' },
  { id: 'chultan-bind', label: 'Modern Chultan Choice Pack binding', value: 'Unknown / excluded', status: 'unknown', lastVerified: '2026-08-11' },
  { id: 'stronghold-gate', label: 'Exact modern Stronghold purchase gate', value: 'Unknown / excluded', status: 'unknown', lastVerified: '2026-08-11' },
]

export function artworkProvenance(entity: ItemEntry | MaterialEntry): ArtworkProvenance {
  if (entity.artwork?.provenance) return entity.artwork.provenance
  if (!entity.icon && entity.iconIndex == null) return 'missing'
  const status = String(entity.sourceStatus || '')
  if (status.includes('screenshot') || status.includes('final-zip') || status === 'latest-user-screenshot') return 'screenshot-extracted'
  if (status === 'spreadsheet-supplemental') return 'reference-derived'
  return 'verified-game-asset'
}

function findDuplicates(names: string[]) {
  const seen = new Map<string, string[]>()
  for (const name of names) {
    const key = norm(name)
    const rows = seen.get(key) ?? []
    rows.push(name)
    seen.set(key, rows)
  }
  return [...seen.entries()].filter(([, rows]) => rows.length > 1).map(([key, rows]) => ({ key, rows }))
}

function findRecipeCycles(recipes: RecipeEntry[]) {
  const recipeMap = new Map(recipes.map((recipe) => [norm(recipe.name), recipe]))
  const visiting = new Set<string>()
  const visited = new Set<string>()
  const cycles = new Set<string>()
  const visit = (name: string) => {
    const key = norm(name)
    if (visiting.has(key)) { cycles.add(name); return }
    if (visited.has(key)) return
    visiting.add(key)
    for (const row of recipeMap.get(key)?.materials ?? []) if (recipeMap.has(norm(row.name))) visit(row.name)
    visiting.delete(key)
    visited.add(key)
  }
  for (const recipe of recipes) visit(recipe.name)
  return [...cycles].sort()
}

function findIconCollisions(entities: Array<ItemEntry | MaterialEntry>) {
  const byAsset = new Map<string, string[]>()
  for (const entity of entities) {
    const key = entity.icon ? `path:${entity.icon}` : entity.iconIndex != null ? `sprite:${entity.iconIndex}` : ''
    if (!key) continue
    const rows = byAsset.get(key) ?? []
    rows.push(entity.name)
    byAsset.set(key, rows)
  }
  return [...byAsset.entries()].filter(([, names]) => new Set(names.map(norm)).size > 1).map(([asset, names]) => ({ asset, names }))
}

function findVariantReviewQueue(items: ItemEntry[]) {
  return items.flatMap((item) => {
    if (item.variants.length < 2) return []
    const reasons: string[] = []
    if (item.variants.some((variant) => !variant.source && !variant.verification?.sourceIds?.length)) reasons.push('variant-specific evidence missing')
    if (item.variants.some((variant) => variant.itemLevel == null && item.itemLevel == null)) reasons.push('item level not independently captured')
    if (item.variants.some((variant) => !variant.stats && !item.stats)) reasons.push('stats not independently captured')
    return reasons.length ? [{ item, reasons }] : []
  })
}

function findLegacySetQueue(items: ItemEntry[]) {
  return items.filter((item) => {
    if (!item.set) return false
    const value = item.set as Record<string, unknown>
    return typeof value.id !== 'string' || !Array.isArray(value.members) || typeof value.requiredPieces !== 'number'
  })
}

function findScreenshotEvidenceGaps(items: ItemEntry[]) {
  return items.filter((item) => {
    const screenshotBacked = artworkProvenance(item) === 'screenshot-extracted' || String(item.sourceStatus).includes('screenshot') || item.sourceStatus === 'final-zip'
    return screenshotBacked && (!item.provenance?.evidence?.length || (!item.provenance?.image && !item.artwork?.sourceId))
  })
}

export function buildDataHealthReport() {
  const materialNames = new Set(catalog.materials.map((material) => norm(material.name)))
  const itemNames = new Set(catalog.items.map((item) => norm(item.name)))
  const recipeNames = new Set(catalog.recipes.map((recipe) => norm(recipe.name)))
  const referencedMaterials = catalog.recipes.flatMap((recipe) => recipe.materials.map((row) => ({ recipe: recipe.name, ...row })))
  const danglingMaterialRefs = referencedMaterials.filter((row) => !materialNames.has(norm(row.name)) && !itemNames.has(norm(row.name)))
  const invalidQuantities = referencedMaterials.filter((row) => !Number.isFinite(row.required) || row.required <= 0 || !Number.isInteger(row.required))
  const invalidYields = catalog.recipes.filter((recipe) => !Number.isFinite(recipe.outputQuantity) || recipe.outputQuantity <= 0 || !Number.isInteger(recipe.outputQuantity))
  const unknownYields = catalog.recipes.filter((recipe) => recipe.quantityExplicit === false)
  const missingArtwork = [...catalog.items, ...catalog.materials].filter((entity) => artworkProvenance(entity) === 'missing')
  const rejectedArtwork = [...catalog.items, ...catalog.materials].filter((entity) => artworkProvenance(entity) === 'rejected')
  const missingProfessionRecipes = catalog.recipes.filter((recipe) => !recipe.profession)
  const orphanCraftableMaterials = catalog.materials.filter((material) => material.craftable && !recipeNames.has(norm(material.name)))
  const duplicateItems = findDuplicates(catalog.items.map((item) => item.name))
  const duplicateMaterials = findDuplicates(catalog.materials.map((material) => material.name))
  const duplicateRecipes = findDuplicates(catalog.recipes.map((recipe) => recipe.name))
  const cycles = findRecipeCycles(catalog.recipes)
  const rawMaterials = catalog.materials.filter((material) => !material.craftable)
  const explicitAcquisition = rawMaterials.filter((material) => Boolean(material.acquisition && material.acquisition.type !== 'unknown'))
  const iconCollisions = findIconCollisions([...catalog.items, ...catalog.materials])
  const qualityVariantReview = findVariantReviewQueue(catalog.items)
  const legacySetRecords = findLegacySetQueue(catalog.items)
  const screenshotEvidenceGaps = findScreenshotEvidenceGaps(catalog.items)
  const sourceCounts = [...catalog.items, ...catalog.materials].reduce<Record<string, number>>((acc, entity) => {
    const key = String(entity.sourceStatus || 'unknown')
    acc[key] = (acc[key] ?? 0) + 1
    return acc
  }, {})
  const blockers = [
    ...danglingMaterialRefs.map((row) => `Dangling material reference: ${row.recipe} → ${row.name}`),
    ...invalidQuantities.map((row) => `Invalid ingredient quantity: ${row.recipe} → ${row.name} ×${row.required}`),
    ...invalidYields.map((row) => `Invalid recipe yield: ${row.name} ×${row.outputQuantity}`),
    ...orphanCraftableMaterials.map((row) => `Craftable material has no recipe: ${row.name}`),
    ...cycles.map((name) => `Recipe cycle detected near ${name}`),
    ...rejectedArtwork.map((row) => `Rejected artwork still attached: ${row.name}`),
  ]

  return {
    generatedAt: new Date().toISOString(),
    totals: { items: catalog.items.length, recipes: catalog.recipes.length, materials: catalog.materials.length },
    sourceCounts,
    blockers,
    queues: {
      unknownYields,
      missingArtwork,
      rejectedArtwork,
      missingProfessionRecipes,
      orphanCraftableMaterials,
      acquisitionUnknown: rawMaterials.length - explicitAcquisition.length,
      duplicateItems,
      duplicateMaterials,
      duplicateRecipes,
      iconCollisions,
      qualityVariantReview,
      legacySetRecords,
      screenshotEvidenceGaps,
    },
    ignoredKnowledgeGaps: [
      masterworkProgression.chultan.purchaseBinding === null ? 'Modern Chultan Choice Pack binding' : null,
      masterworkProgression.chultan.strongholdPurchaseGate === null ? 'Exact modern Stronghold purchase gate' : null,
      professionMechanics.xpThresholds === null ? 'Profession XP thresholds Level 1→20' : null,
    ].filter(Boolean),
  }
}
