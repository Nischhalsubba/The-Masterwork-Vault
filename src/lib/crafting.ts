import type { ItemEntry, MaterialNeed, RecipeEntry } from '../types'

export interface PlanSelection {
  item: ItemEntry
  quantity: number
}

export interface BatchStep {
  name: string
  needed: number
  outputPerCraft: number
  crafts: number
  produced: number
  leftover: number
  profession?: string | null
  sourceStatus: string
}

export interface CraftingPlan {
  direct: MaterialNeed[]
  raw: MaterialNeed[]
  batches: BatchStep[]
}

const normalize = (value: string) => value.toLowerCase().replace(/\+1/g, '').replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ')

export function buildRecipeMap(recipes: RecipeEntry[]) {
  return new Map(recipes.map((recipe) => [normalize(recipe.name), recipe]))
}

function addNeed(target: Map<string, { name: string; quantity: number }>, name: string, quantity: number) {
  const key = normalize(name)
  const current = target.get(key)
  target.set(key, { name: current?.name ?? name, quantity: (current?.quantity ?? 0) + quantity })
}

function recipeDepth(name: string, recipeMap: Map<string, RecipeEntry>, memo = new Map<string, number>(), visiting = new Set<string>()): number {
  const key = normalize(name)
  if (memo.has(key)) return memo.get(key)!
  if (visiting.has(key)) return 0
  const recipe = recipeMap.get(key)
  if (!recipe) return 0
  visiting.add(key)
  const depth = 1 + Math.max(0, ...recipe.materials.map((material) => recipeDepth(material.name, recipeMap, memo, visiting)))
  visiting.delete(key)
  memo.set(key, depth)
  return depth
}

export function calculateCraftingPlan(selections: PlanSelection[], recipes: RecipeEntry[]): CraftingPlan {
  const recipeMap = buildRecipeMap(recipes)
  const directMap = new Map<string, { name: string; quantity: number }>()

  for (const { item, quantity } of selections) {
    if (quantity <= 0) continue
    item.materials.forEach((material) => addNeed(directMap, material.name, material.required * quantity))
  }

  const demand = new Map(directMap)
  const batches: BatchStep[] = []
  const processed = new Set<string>()
  const depthMemo = new Map<string, number>()

  while (true) {
    const candidates = [...demand.entries()]
      .filter(([key]) => recipeMap.has(key) && !processed.has(key))
      .sort((a, b) => recipeDepth(b[1].name, recipeMap, depthMemo) - recipeDepth(a[1].name, recipeMap, depthMemo))

    if (!candidates.length) break
    const [key, need] = candidates[0]
    const recipe = recipeMap.get(key)!
    const outputPerCraft = Math.max(1, recipe.outputQuantity || 1)
    const crafts = Math.ceil(need.quantity / outputPerCraft)
    const produced = crafts * outputPerCraft

    batches.push({
      name: recipe.name,
      needed: need.quantity,
      outputPerCraft,
      crafts,
      produced,
      leftover: produced - need.quantity,
      profession: recipe.profession,
      sourceStatus: recipe.sourceStatus,
    })

    demand.delete(key)
    processed.add(key)
    recipe.materials.forEach((material) => addNeed(demand, material.name, material.required * crafts))
  }

  const toSortedNeeds = (map: Map<string, { name: string; quantity: number }>): MaterialNeed[] =>
    [...map.values()]
      .map(({ name, quantity }) => ({ name, required: quantity }))
      .sort((a, b) => b.required - a.required || a.name.localeCompare(b.name))

  return {
    direct: toSortedNeeds(directMap),
    raw: toSortedNeeds(demand),
    batches: batches.sort((a, b) => b.crafts - a.crafts || a.name.localeCompare(b.name)),
  }
}

export function expandSingleMaterial(name: string, quantity: number, recipes: RecipeEntry[]) {
  const pseudoItem: ItemEntry = {
    id: '__material__', name, kind: 'Material', classes: ['All'], categories: [], variants: [],
    materials: [{ name, required: quantity }], sourceStatus: 'derived',
    provenance: { evidence: [] },
  }
  return calculateCraftingPlan([{ item: pseudoItem, quantity: 1 }], recipes)
}
