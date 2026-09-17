import type { CatalogData, ItemEntry, MaterialNeed, RecipeEntry } from '../types'

export interface JourneyCraftable {
  key: string
  name: string
  campaign: string
  kind: string
  profession: string
  item?: ItemEntry
  recipe?: RecipeEntry
  inputs: MaterialNeed[]
  recipeCaptured: boolean
  outputQuantity: number | null
  sourceStatus: string
}
// Search normalization must never merge distinct material/quality identities.
const keyFor = (campaign: string | null | undefined, name: string) => `${campaign || 'Unknown'}:${name.trim().toLocaleLowerCase('en')}`
const inputSignature = (inputs: MaterialNeed[]) => JSON.stringify(inputs.map((input) => [input.name.trim().toLocaleLowerCase('en'), input.required]).sort((a,b) => String(a[0]).localeCompare(String(b[0]))))

export function buildJourneyCraftables(catalog: CatalogData): JourneyCraftable[] {
  const recipes = new Map(catalog.recipes.map((recipe) => [keyFor(recipe.campaign, recipe.name), recipe]))
  const rows = new Map<string, JourneyCraftable>()
  for (const item of catalog.items) {
    const key = keyFor(item.campaign, item.name)
    const candidate = recipes.get(key)
    const recipe = candidate && inputSignature(candidate.materials) === inputSignature(item.materials) ? candidate : undefined
    const recipeCaptured = item.recipeKnown !== false && item.materials.length > 0
    rows.set(key, {
      key, name: item.name, campaign: item.campaign || 'Unknown', kind: item.kind,
      profession: item.profession || recipe?.profession || 'Not recorded', item, recipe,
      inputs: item.materials, recipeCaptured,
      outputQuantity: recipeCaptured && recipe?.quantityExplicit ? recipe.outputQuantity : null,
      sourceStatus: item.sourceStatus,
    })
  }
  for (const recipe of catalog.recipes) {
    const key = keyFor(recipe.campaign, recipe.name)
    if (rows.has(key)) continue
    rows.set(key, {
      key, name: recipe.name, campaign: recipe.campaign || 'Unknown', kind: 'Recipe output',
      profession: recipe.profession || 'Not recorded', recipe, inputs: recipe.materials,
      recipeCaptured: recipe.materials.length > 0,
      outputQuantity: recipe.quantityExplicit ? recipe.outputQuantity : null,
      sourceStatus: recipe.sourceStatus,
    })
  }
  return [...rows.values()].sort((a, b) => a.name.localeCompare(b.name) || a.campaign.localeCompare(b.campaign))
}

export function matchesJourneyCraftable(row: JourneyCraftable, query: string): boolean {
  const normalize = (text: string) => text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('en')
  const text = normalize([row.name, row.campaign, row.kind, row.profession, ...(row.item?.classes || []), ...row.inputs.map((input) => input.name)].join(' '))
  return normalize(query).trim().split(/\s+/).every((term) => text.includes(term))
}

export function journeyItemHref(item: ItemEntry): string {
  const slug = item.name.toLowerCase().replace(/\+1/g, '').replace(/[\u2019']/g, '').replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  return `/catalog/${item.campaign === 'Underdark' ? 'underdark' : 'sharandar'}/${encodeURIComponent(item.id)}/${slug}?campaign=${encodeURIComponent(item.campaign || 'All')}`
}
