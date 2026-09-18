import catalogJson from '../data/catalog'
import { getMaterialSourceGuide, materialSourceRecords } from '../data/materialSources'
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
  sourceUrl?: string
  note?: string
}

// Retrieval/review date, not an in-game observation.
export const verificationLedger: VerificationLedgerEntry[] = [
  { id: 'profession-cap', label: 'Post-rescale profession cap', value: String(professionMechanics.maxLevel), status: 'historical', lastVerified: '2026-09-17', note: 'Publisher change dated 16 July 2021; not a live-server observation.', sourceUrl: 'https://www.playneverwinter.com/en/news-details/11491453' },
  { id: 'daily-morale', label: 'Daily Workshop Morale', value: String(professionMechanics.dailyMorale), status: 'historical', lastVerified: '2026-09-17', note: 'Community reference; confirm current capacity and reset in-game.', sourceUrl: 'https://neverwinter.fandom.com/wiki/Profession' },
  { id: 'morale-cost', label: 'Current Morale refill rate', value: 'Current quote required', status: 'unknown', lastVerified: '2026-09-17', note: 'The previous 120 AD default had no attributable current evidence. Calculators now require an entered rate.' },
  { id: 'maker-manual', label: "Maker's Training Manual", value: 'Exact current bonus needs confirmation', status: 'unknown', lastVerified: '2026-09-17', note: 'Read the item tooltip; no bonus is applied automatically by the Journey.' },
  { id: 'philosopher-manual', label: "Philosopher's Training Manual", value: 'Exact current bonus needs confirmation', status: 'unknown', lastVerified: '2026-09-17' },
  { id: 'focus', label: 'Focus model retained in calculation library', value: professionMechanics.highQualityChance.formula, status: 'historical', lastVerified: '2026-09-17', note: 'Legacy model, not independently certified in this review. Use the task preview for actual quality chance.' },
  { id: 'speed', label: 'Speed model retained in calculation library', value: professionMechanics.craftingTime.formula, status: 'historical', lastVerified: '2026-09-17', note: 'Model behavior is unit-tested, but that is not evidence of current game mechanics. Use the live task duration.' },
  { id: 'artisan-capacity', label: 'Workshop artisan capacities and quest gates', value: 'Current values need confirmation', status: 'unknown', lastVerified: '2026-09-17', note: 'The community page explicitly warns that its leveling gates are outdated. No mathematical rescaling is presented as a verified gate.', sourceUrl: 'https://neverwinter.fandom.com/wiki/Profession#Upgrading_the_workshop' },
  { id: 'grand-upgrade', label: 'The Grand Upgrade credit requirement', value: workshopProgressionKnowledge.rank4.southSeaTradingCompanyCredits.toLocaleString(), status: 'historical', lastVerified: '2026-09-17', note: 'Publisher lowered it from 5,000,000 on 18 July 2023. This is credits, not AD.', sourceUrl: workshopProgressionKnowledge.rank4.sourceUrl },
  { id: 'professions-event', label: 'Published 2x Professions rules', value: 'Half Morale cost; double Masterwork-node resources; no doubled task XP', status: 'historical', lastVerified: '2026-09-17', note: 'Publisher rules dated 21 June 2022. Check the current calendar; no event is assumed active.', sourceUrl: 'https://www.playneverwinter.com/en/news-details/11519393' },
  { id: 'masterwork-book-prices', label: 'Publisher-documented Masterwork book baselines', value: 'Stronghold book: 500,000 AD; Sharandar book: 1,500,000 AD', status: 'historical', lastVerified: '2026-09-18', sourceUrl: 'https://www.playneverwinter.com/en/news-details/11500323', note: '2021 publisher baseline, not a live 2026 quote. The patch renames IV/V to Chultan Masterwork but the reviewed text does not independently establish every Chultan or Menzoberranzan price.' },
  { id: 'hermits-incense-plus-one', label: "Hermit's Incense +1 item level", value: '95', status: 'historical', lastVerified: '2026-09-18', sourceUrl: 'https://www.playneverwinter.com/en/news-details/11542223', note: 'Publisher correction dated 19 April 2023; supersedes the older screenshot value of 90 for the +1 variant.' },
  { id: 'sharandar-accessory-ilvl', label: 'Sharandar +1 amulet/sash correction', value: '1,300', status: 'historical', lastVerified: '2026-09-18', sourceUrl: 'https://www.playneverwinter.com/en/news-details/11542223', note: 'Publisher correction covers Thorned/Feywood Amulets, Thorned/Feywood Sashes and Dawn\'s Light Sash +1. Recipes and current live stats remain uncaptured.' },
  { id: 'gathering-compression', label: 'Gathering legacy level mapping', value: 'Old 1–80 source → modern mapping unresolved', status: 'unknown', lastVerified: '2026-09-18', sourceUrl: 'https://www.playneverwinter.com/en/news-details/11491453', note: 'The publisher compressed profession levels into 20 four-level buckets. The legacy Gathering table has not yet been fully reconciled to the modern task list.' },
  { id: 'xp-curve', label: 'Profession XP curve Level 1-20', value: 'Unknown / excluded', status: 'unknown', lastVerified: '2026-09-17', note: 'Obsolete pre-2021 XP tables must not be reused.' },
  { id: 'chultan-bind', label: 'Modern Chultan Choice Pack binding', value: 'Unknown / excluded', status: 'unknown', lastVerified: '2026-09-17' },
  { id: 'stronghold-gate', label: 'Exact modern Stronghold purchase gate', value: 'Unknown / excluded', status: 'unknown', lastVerified: '2026-09-17' },
  { id: 'cross-profession-gates', label: 'Minimum later-book prerequisites and binding', value: 'Confirm the current quest and vendor', status: 'unknown', lastVerified: '2026-09-17', note: 'A demonstration buying all seven book sets does not establish the minimum necessary for one profession.' },
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
  const sourceGuides = [...new Map([...materialSourceRecords, ...rawMaterials.map((material) => getMaterialSourceGuide(material.name))].map((guide) => [guide.name, guide])).values()]
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
      acquisitionUnknown: sourceGuides.filter((guide) => guide.status === 'unresolved').length,
      acquisitionTracked: sourceGuides.length,
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
      'Current Morale refill rate and Workshop capacities',
      'Rescaled Workshop quest triggers',
      'Minimum cross-profession gates and later-book binding',
      'Complete current Chultan recipe inventory and any post-Menzoberranzan tiers',
    ].filter(Boolean),
  }
}
