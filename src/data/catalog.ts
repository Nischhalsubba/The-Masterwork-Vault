import compressedCatalog from './catalog.gz.b64?raw'
import iconData from './iconData'
import { verifiedIconCount, verifiedIconIndex } from './verifiedIconIndex'
import {
  recoveredDirectRecipes,
  recoveredIcons,
  recoveredMaterialRecipes,
  recoveredMaterialSpecs,
} from './extractedSupplement'

const bytes = Uint8Array.from(atob(compressedCatalog.replace(/\s+/g, '')), (char) => char.charCodeAt(0))
const stream = new Blob([bytes.buffer as ArrayBuffer]).stream().pipeThrough(new DecompressionStream('gzip'))
const text = await new Response(stream).text()
const catalog = JSON.parse(text)

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
    url: asRenderableUrl((preferRecovered && recovered) ? recovered : original ?? recovered ?? null),
  }
}

// Every catalog entry gets a verified atlas tile as a deterministic fallback. Working weapon
// art stays on the direct path. Recovered ZIP art stays primary for materials/tools/accessories.
// Armor and non-recovered accessories use the verified atlas directly so a malformed old image
// cannot render as broken alt text or a corrupted thumbnail.
let itemIconCount = 0
for (const item of catalog.items ?? []) {
  const category = item.kind === 'Profession Tool' ? 'tools' : 'gear'
  const preferRecovered = item.kind !== 'Weapon'
  const mapped = mappedIcon(category, item.name, item.icon, preferRecovered)
  const atlasIndex = verifiedIconIndex(item.name, category)
  item.icon = mapped.url
  item.iconIndex = atlasIndex ?? null
  if (item.kind !== 'Weapon' && !mapped.recovered && atlasIndex !== undefined) item.icon = null
  if (item.icon || item.iconIndex != null) itemIconCount += 1
}

// Final-ZIP direct recipes are unambiguous for the five recovered accessories and seven
// recovered profession tools. Patch those rows without touching weapon recipes.
for (const item of catalog.items ?? []) {
  const supplement = recoveredDirectRecipes[item.name as keyof typeof recoveredDirectRecipes]
  if (!supplement) continue
  item.materials = supplement.materials.map((material) => ({ ...material }))
  item.sourceStatus = 'final-zip'
  item.provenance = item.provenance ?? { evidence: [] }
  item.provenance.recipe = `Underdark Masterwork ZIP · recipe page ${supplement.page}`
  item.provenance.evidence = Array.from(new Set([
    ...(item.provenance.evidence ?? []),
    `Recovered direct recipe from page ${supplement.page}`,
  ]))
}

// Ensure all 29 recovered materials exist and carry their trustworthy ZIP-derived icons.
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
    }
    catalog.materials.push(material)
    materialByName.set(norm(spec.name), material)
  }
  material.icon = mappedIcon('materials', spec.name, material.icon, true).url
  material.iconIndex = verifiedIconIndex(spec.name, 'materials') ?? null
  material.craftable = spec.craftable
  material.outputQuantity = spec.outputQuantity ?? material.outputQuantity ?? null
  material.sourceStatus = 'final-zip'
}

// Give any pre-existing material not touched above the same atlas fallback.
for (const material of catalog.materials ?? []) {
  if (material.iconIndex == null) material.iconIndex = verifiedIconIndex(material.name, 'materials') ?? null
}

// Replace the twelve component recipes with the values visible in the final ZIP screenshots.
// Soul Bead deliberately uses page 191 (6 Fallen God's Ore), the later screenshot, while
// retaining the conflict note in evidence instead of silently ignoring page 186.
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
    evidence: [...recipe.evidence],
  })
}

// Rebuild used-by relationships after merging the recovered recipes and direct recipes.
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

catalog.meta.sprite = {
  ...(catalog.meta.sprite ?? {}),
  tileSize: 48,
  columns: 10,
  count: verifiedIconCount,
}

const materialIconCount = (catalog.materials ?? []).filter((material: any) => Boolean(material.icon) || material.iconIndex != null).length
console.info(`Displayable icon audit: ${itemIconCount}/${catalog.items?.length ?? 0} craftables and ${materialIconCount}/${catalog.materials?.length ?? 0} materials`)

export default catalog
