import generatedCatalog from './catalog.generated'
import iconData from './iconData'
import materialIconOverrides from './materialIconOverrides'
import gatheringMaterialIconOverrides from './gatheringMaterialIconOverrides'
import { verifiedIconCount, verifiedIconIndex } from './verifiedIconIndex'
import {
  recoveredDirectRecipes,
  recoveredIcons,
  recoveredMaterialRecipes,
  recoveredMaterialSpecs,
} from './extractedSupplement'
import { sharandarItems, sharandarRecipes } from './sharandarSupplement'
import { sharandarIconDataUri, verifiedSharandarRemoteIconEvidence } from './sharandarSprite'
import { referenceIconDataUri, referenceIconKindForEntity } from './referenceIcons.ts'

const catalog = structuredClone(generatedCatalog)

const slug = (name: string) => name
  .toLowerCase()
  .replace(/\+1/g, '')
  .replace(/[’']/g, '')
  .replace(/&/g, 'and')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')

const norm = (name: string) => slug(name)

const iconByName = new Map<string, string>()
for (const [key, source] of Object.entries(iconData)) {
  const name = key.slice(key.indexOf('/') + 1)
  iconByName.set(slug(name), source)
}

const blobCache = new Map<string, string>()
const asRenderableUrl = (source?: string | null): string | null => {
  if (!source) return null
  const match = /^data:(image\/[a-z0-9.+-]+);base64,(.*)$/i.exec(source)
  if (!match) return source

  const cached = blobCache.get(source)
  if (cached) return cached

  try {
    const binary = atob(match[2].replace(/\s+/g, ''))
    const data = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i += 1) data[i] = binary.charCodeAt(i)
    const url = URL.createObjectURL(new Blob([data], { type: match[1] }))
    blobCache.set(source, url)
    return url
  } catch {
    return source
  }
}

const mappedIcon = (
  category: 'gear' | 'materials' | 'tools',
  name: string,
  fallback?: string | null,
  preferRecovered = true,
) => {
  const key = slug(name)
  const recovered = recoveredIcons[`${category}/${key}`]
  const original = iconData[`${category}/${key}`] ?? iconByName.get(key) ?? fallback ?? null
  return {
    recovered,
    original,
    url: asRenderableUrl((preferRecovered && recovered) ? recovered : original ?? recovered ?? null),
  }
}

const appendCampaign = (row: any, campaign: string) => {
  const campaigns = new Set<string>([...(row.campaigns ?? []), ...(row.campaign ? [row.campaign] : []), campaign])
  row.campaigns = [...campaigns]
  if (!row.campaign) row.campaign = campaign
}

// Everything in the original compressed payload is the Underdark/Menzoberranzan collection.
for (const item of catalog.items ?? []) {
  item.campaign = item.campaign ?? 'Underdark'
  item.recipeKnown = item.recipeKnown ?? Boolean(item.materials?.length)
}
for (const recipe of catalog.recipes ?? []) recipe.campaign = recipe.campaign ?? 'Underdark'
for (const material of catalog.materials ?? []) appendCampaign(material, 'Underdark')

// Preserve every direct icon that was already working. The verified atlas remains only as
// a browser-side fallback when a direct image actually fails to decode.
let itemIconCount = 0
for (const item of catalog.items ?? []) {
  const category = item.kind === 'Profession Tool' ? 'tools' : 'gear'
  const preferRecovered = item.kind === 'Profession Tool' || item.kind === 'Accessory'
  const mapped = mappedIcon(category, item.name, item.icon, preferRecovered)
  item.icon = mapped.url
  item.iconIndex = verifiedIconIndex(item.name, category) ?? null
  if (item.icon || item.iconIndex != null) itemIconCount += 1
}

// Final-ZIP direct recipes are unambiguous for the recovered Underdark accessories/tools.
for (const item of catalog.items ?? []) {
  const supplement = recoveredDirectRecipes[item.name as keyof typeof recoveredDirectRecipes]
  if (!supplement) continue
  item.materials = supplement.materials.map((material) => ({ ...material }))
  item.sourceStatus = 'final-zip'
  item.recipeKnown = true
  item.provenance = item.provenance ?? { evidence: [] }
  item.provenance.recipe = `Underdark Masterwork ZIP · recipe page ${supplement.page}`
  item.provenance.evidence = Array.from(new Set([
    ...(item.provenance.evidence ?? []),
    `Recovered direct recipe from page ${supplement.page}`,
  ]))
}

// Ensure all recovered Underdark materials exist.
const materialByName = new Map<string, any>((catalog.materials ?? []).map((material: any) => [norm(material.name), material]))
for (const spec of recoveredMaterialSpecs) {
  let material = materialByName.get(norm(spec.name))
  if (!material) {
    material = {
      name: spec.name,
      icon: null,
      iconIndex: null,
      craftable: spec.craftable,
      outputQuantity: spec.outputQuantity,
      profession: null,
      usedBy: [],
      sourceStatus: 'final-zip',
      campaign: 'Underdark',
      campaigns: ['Underdark'],
    }
    catalog.materials.push(material)
    materialByName.set(norm(spec.name), material)
  }
  material.icon = mappedIcon('materials', spec.name, material.icon, true).url
  material.iconIndex = verifiedIconIndex(spec.name, 'materials') ?? null
  material.craftable = spec.craftable
  material.outputQuantity = spec.outputQuantity ?? material.outputQuantity ?? null
  material.sourceStatus = 'final-zip'
  appendCampaign(material, 'Underdark')
}

// Exact and curated material artwork overrides.
for (const material of catalog.materials ?? []) {
  const key = norm(material.name)
  const override = materialIconOverrides[key]
  const gatheringOverride = gatheringMaterialIconOverrides[key]
  if (override) material.icon = asRenderableUrl(override)
  if (gatheringOverride) material.icon = gatheringOverride
  if (material.iconIndex == null) material.iconIndex = verifiedIconIndex(material.name, 'materials') ?? null
}

// Replace the recovered Underdark component recipes with screenshot-grounded values.
const recoveredRecipeNames = new Set(recoveredMaterialRecipes.map((recipe) => norm(recipe.name)))
catalog.recipes = (catalog.recipes ?? []).filter((recipe: any) => !recoveredRecipeNames.has(norm(recipe.name)))
for (const recipe of recoveredMaterialRecipes) {
  const material = materialByName.get(norm(recipe.name))
  catalog.recipes.push({
    name: recipe.name,
    outputQuantity: recipe.outputQuantity,
    quantityExplicit: recipe.quantityExplicit,
    profession: material?.profession ?? null,
    materials: recipe.materials.map((entry) => ({ ...entry })),
    sourceStatus: recipe.sourceStatus,
    campaign: 'Underdark',
    evidence: [...recipe.evidence],
  })
}

// ---------------------------------------------------------------------------
// Sharandar collection
// ---------------------------------------------------------------------------

const finalSharandarNames = new Set(sharandarItems.map((item) => norm(String(item.name ?? ''))))
const sharandarRecipeByName = new Map(sharandarRecipes.map((recipe) => [norm(recipe.name), recipe]))
const existingRecipeByName = new Map<string, any>((catalog.recipes ?? []).map((recipe: any) => [norm(recipe.name), recipe]))

for (const recipe of sharandarRecipes) {
  const key = norm(recipe.name)
  const existing = existingRecipeByName.get(key)
  if (existing && existing.campaign !== 'Sharandar') {
    // The current planner keys recipes by material name. Preserve the older record rather than
    // silently replacing a different-era recipe. There are no known collisions in the supplied
    // Sharandar pack, but this guard makes future uploads fail safe instead of fail creative.
    console.warn(`Sharandar recipe name collision: ${recipe.name}. Keeping ${existing.campaign ?? 'existing'} recipe.`)
    continue
  }
  const next = {
    ...recipe,
    sourceStatus: 'sharandar-screenshot-final-zip',
    campaign: 'Sharandar',
    materials: recipe.materials.map((entry) => ({ ...entry })),
    evidence: [...recipe.evidence],
  }
  if (existing) Object.assign(existing, next)
  else {
    catalog.recipes.push(next)
    existingRecipeByName.set(key, next)
  }
}

// Create every material referenced by Sharandar screenshots. Recipe outputs that are not final
// craftables become craftable materials; leaf/raw inputs remain acquisition materials.
const ensureMaterial = (name: string) => {
  const key = norm(name)
  let material = materialByName.get(key)
  const recipe = sharandarRecipeByName.get(key)
  const isCraftableMaterial = Boolean(recipe && !finalSharandarNames.has(key))
  const screenshotIcon = sharandarIconDataUri(name)
  if (!material) {
    material = {
      name,
      icon: screenshotIcon,
      iconIndex: null,
      craftable: isCraftableMaterial,
      outputQuantity: isCraftableMaterial ? recipe?.outputQuantity ?? 1 : null,
      profession: isCraftableMaterial ? recipe?.profession ?? null : null,
      usedBy: [],
      sourceStatus: 'sharandar-screenshot-final-zip',
      campaign: 'Sharandar',
      campaigns: ['Sharandar'],
    }
    catalog.materials.push(material)
    materialByName.set(key, material)
  } else {
    appendCampaign(material, 'Sharandar')
    if (!material.icon && screenshotIcon) material.icon = screenshotIcon
    if (isCraftableMaterial) {
      material.craftable = true
      material.outputQuantity = recipe?.outputQuantity ?? material.outputQuantity ?? 1
      material.profession = recipe?.profession ?? material.profession ?? null
      if (material.sourceStatus === 'spreadsheet-supplemental') material.sourceStatus = 'sharandar-screenshot-final-zip'
    }
  }
  return material
}

for (const recipe of sharandarRecipes) {
  if (!finalSharandarNames.has(norm(recipe.name))) ensureMaterial(recipe.name)
  for (const need of recipe.materials) ensureMaterial(need.name)
}

// Merge duplicate Sharandar names by keeping the richer screenshot record. This prevents a
// name-only Miscellaneous crop and a class-specific tooltip from appearing as two fake items.
const itemScore = (item: any) =>
  (item.classes?.length ?? 0) * 3 +
  (item.variants?.length ?? 0) * 3 +
  (item.itemLevel ? 4 : 0) +
  (item.stats && Object.keys(item.stats).length ? 4 : 0) +
  (item.equipPower?.text ? 3 : 0) +
  (item.materials?.length ? 2 : 0) +
  (item.recipeKnown === false ? -1 : 0)

const sharandarByName = new Map<string, any>()
for (const raw of sharandarItems) {
  const itemName = String(raw.name ?? '')
  const recipeKnown = raw.recipeKnown !== false
  const item: any = {
    icon: sharandarIconDataUri(itemName),
    iconIndex: null,
    bind: null,
    levelRequirement: null,
    itemLevel: null,
    stats: null,
    equipPower: null,
    set: null,
    recommended: null,
    reinforced: null,
    ...raw,
    sourceStatus: String(raw.sourceStatus ?? '').includes('publisher') ? raw.sourceStatus : recipeKnown ? 'sharandar-screenshot-final-zip' : raw.sourceStatus,
    campaign: 'Sharandar',
    categories: Array.from(new Set([...(Array.isArray(raw.categories) ? raw.categories : []), 'Sharandar'])),
    classes: Array.isArray(raw.classes) ? [...raw.classes] : [],
    variants: Array.isArray(raw.variants) ? [...raw.variants] : [],
    materials: Array.isArray(raw.materials) ? raw.materials.map((entry: any) => ({ ...entry })) : [],
    provenance: raw.provenance ?? { evidence: [] },
  }
  if (!item.icon) item.icon = sharandarIconDataUri(itemName)

  // A reference-derived fallback from the supplemental row must never override a later
  // exact Neverwinter asset match. Replace it and record the external evidence explicitly.
  const remoteArtwork = verifiedSharandarRemoteIconEvidence(itemName)
  if (remoteArtwork) {
    item.icon = sharandarIconDataUri(itemName)
    item.artwork = {
      provenance: 'verified-game-asset',
      sourceId: remoteArtwork.sourceUrl,
      lastVerified: '2026-09-20',
    }
    item.provenance = item.provenance ?? { evidence: [] }
    item.provenance.image = `Neverwinter profession table · ${remoteArtwork.assetFile}`
    item.provenance.evidence = Array.from(new Set([
      ...(item.provenance.evidence ?? []).filter((entry: string) => !entry.includes('Reference icon is category-derived')),
      `${remoteArtwork.sourceUrl} · exact game asset: ${remoteArtwork.assetFile}`,
    ]))
  }

  const key = norm(item.name)
  const previous = sharandarByName.get(key)
  if (!previous || itemScore(item) > itemScore(previous)) sharandarByName.set(key, item)
}

catalog.items.push(...sharandarByName.values())

// Keep class navigation useful as the new pack introduces Bard alongside the older collection.
const classNames = new Set<string>(catalog.classes ?? [])
for (const item of sharandarByName.values()) {
  for (const className of item.classes ?? []) if (className && className !== 'All') classNames.add(className)
}
catalog.classes = [...classNames].sort((a, b) => a.localeCompare(b))

// Complete the material index from references in both collections. A missing sidebar
// entry is not a missing ingredient. This does not alter any item/recipe or invent
// an acquisition route, yield, binding, or artwork for an undocumented material.
const finalItemNames = new Set<string>(catalog.items.map((item: any) => norm(item.name)))
const mergedRecipeByName = new Map<string, any>(catalog.recipes.map((recipe: any) => [norm(recipe.name), recipe]))
for (const parent of [...catalog.items, ...catalog.recipes]) {
  for (const need of parent.materials ?? []) {
    const key = norm(need.name)
    if (materialByName.has(key) || finalItemNames.has(key)) continue
    const recipe = mergedRecipeByName.get(key)
    const icon = gatheringMaterialIconOverrides[key] ?? asRenderableUrl(materialIconOverrides[key]) ?? mappedIcon('materials', need.name).url
    const iconIndex = verifiedIconIndex(need.name, 'materials') ?? null
    const material = {
      name: need.name,
      icon,
      iconIndex,
      // In this catalog, craftable means a captured dependency recipe is available.
      craftable: Boolean(recipe?.materials?.length),
      outputQuantity: recipe?.quantityExplicit ? recipe.outputQuantity : null,
      profession: recipe?.profession ?? null,
      usedBy: [],
      sourceStatus: 'catalog-recipe-reference',
      campaign: parent.campaign ?? null,
      campaigns: parent.campaign ? [parent.campaign] : [],
      verification: { status: 'unknown', notes: ['Identity is referenced by a captured recipe. Acquisition and crafting details must be checked separately.'] },
      ...(!icon && iconIndex == null ? { artwork: { provenance: 'missing' } } : {}),
    }
    catalog.materials.push(material)
    materialByName.set(key, material)
  }
}

// Rebuild used-by relationships after both campaign packs are merged.
for (const material of catalog.materials ?? []) material.usedBy = []
const addUsedBy = (materialName: string, targetName: string) => {
  const material = materialByName.get(norm(materialName))
  if (!material) return
  if (!material.usedBy.includes(targetName)) material.usedBy.push(targetName)
}
for (const item of catalog.items ?? []) {
  for (const need of item.materials ?? []) addUsedBy(need.name, item.name)
}
for (const recipe of catalog.recipes ?? []) {
  for (const need of recipe.materials ?? []) addUsedBy(need.name, recipe.name)
}
for (const material of catalog.materials ?? []) material.usedBy.sort((a: string, b: string) => a.localeCompare(b))

// Every record gets a usable visual marker. When authentic game artwork is unavailable,
// use a category-derived reference icon and label its provenance explicitly instead of
// presenting generated UI art as screenshot-backed evidence.
for (const item of catalog.items ?? []) {
  if (!item.icon && item.iconIndex == null) {
    item.icon = referenceIconDataUri(referenceIconKindForEntity(item.kind, item.slot))
    if (!item.artwork || item.artwork.provenance === 'missing') {
      item.artwork = {
        provenance: 'reference-derived',
        sourceId: 'app-reference-icon:auto',
        lastVerified: '2026-09-18',
      }
    }
  }
}
for (const material of catalog.materials ?? []) {
  if (!material.icon && material.iconIndex == null) {
    material.icon = referenceIconDataUri('material')
    if (!material.artwork || material.artwork.provenance === 'missing') {
      material.artwork = {
        provenance: 'reference-derived',
        sourceId: 'app-reference-icon:auto',
        lastVerified: '2026-09-18',
      }
    }
  }
}

catalog.meta = {
  ...catalog.meta,
  title: 'The Masterwork Vault',
  subtitle: 'Underdark + Sharandar Masterwork',
  campaigns: ['Sharandar', 'Underdark'],
  sourcePriority: Array.from(new Set([
    'User-supplied Sharandar screenshots / Sharandar.zip',
    ...(catalog.meta.sourcePriority ?? []),
    'External workshop/profession reference pages',
  ])),
  sprite: {
    ...(catalog.meta.sprite ?? {}),
    tileSize: 48,
    columns: 10,
    count: verifiedIconCount,
  },
}

const finalItemIconCount = (catalog.items ?? []).filter((item: any) => Boolean(item.icon) || item.iconIndex != null).length
const materialIconCount = (catalog.materials ?? []).filter((material: any) => Boolean(material.icon) || material.iconIndex != null).length
console.info(`Displayable icon audit: ${finalItemIconCount}/${catalog.items?.length ?? 0} items; ${materialIconCount}/${catalog.materials?.length ?? 0} materials have authentic or explicitly reference-derived visuals`)
console.info(`Masterwork campaign audit: ${catalog.items.filter((item: any) => item.campaign === 'Sharandar').length} Sharandar craftables, ${catalog.items.filter((item: any) => item.campaign === 'Underdark').length} Underdark craftables`)

export default catalog
