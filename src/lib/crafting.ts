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

export type InventoryRecord = Record<string, number>

export interface InventoryAvailability {
  name: string
  required: number
  owned: number
  missing: number
}

export interface InventoryAwarePlan extends CraftingPlan {
  availability: InventoryAvailability[]
  inventoryUsed: MaterialNeed[]
  missingRaw: MaterialNeed[]
}

export interface CraftTreeNode {
  id: string
  name: string
  required: number
  kind: 'item' | 'material'
  craftable: boolean
  outputPerCraft?: number
  crafts?: number
  produced?: number
  leftover?: number
  profession?: string | null
  sourceStatus?: string
  children: CraftTreeNode[]
}

export interface CraftSequenceStep {
  order: number
  stage: number
  name: string
  crafts: number
  needed: number
  produced: number
  leftover: number
  profession?: string | null
  sourceStatus: string
  final: boolean
}

const normalize = (value: string) => value.toLowerCase().replace(/\+1/g, '').replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ')

export function buildRecipeMap(recipes: RecipeEntry[]) {
  return new Map(recipes.map((recipe) => [normalize(recipe.name), recipe]))
}

function addNeed(target: Map<string, { name: string; quantity: number }>, name: string, quantity: number) {
  if (!Number.isFinite(quantity) || quantity <= 0) return
  const key = normalize(name)
  const current = target.get(key)
  target.set(key, { name: current?.name ?? name, quantity: (current?.quantity ?? 0) + quantity })
}

function toSortedNeeds(map: Map<string, { name: string; quantity: number }>): MaterialNeed[] {
  return [...map.values()]
    .map(({ name, quantity }) => ({ name, required: quantity }))
    .sort((a, b) => b.required - a.required || a.name.localeCompare(b.name))
}

function buildDirectMap(selections: PlanSelection[]) {
  const directMap = new Map<string, { name: string; quantity: number }>()
  for (const { item, quantity } of selections) {
    if (!Number.isFinite(quantity) || quantity <= 0) continue
    item.materials.forEach((material) => addNeed(directMap, material.name, material.required * quantity))
  }
  return directMap
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
  const directMap = buildDirectMap(selections)
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

  return {
    direct: toSortedNeeds(directMap),
    raw: toSortedNeeds(demand),
    batches: batches.sort((a, b) => b.crafts - a.crafts || a.name.localeCompare(b.name)),
  }
}

export function calculateNaiveRawRequirements(selections: PlanSelection[], recipes: RecipeEntry[]): MaterialNeed[] {
  const total = new Map<string, { name: string; quantity: number }>()
  for (const selection of selections) {
    if (selection.quantity <= 0) continue
    const single = calculateCraftingPlan([selection], recipes)
    for (const row of single.raw) addNeed(total, row.name, row.required)
  }
  return toSortedNeeds(total)
}

function inventoryMap(inventory: InventoryRecord) {
  const map = new Map<string, number>()
  for (const [name, value] of Object.entries(inventory)) {
    const count = Math.max(0, Math.floor(Number(value) || 0))
    if (count > 0) map.set(normalize(name), count)
  }
  return map
}

export function calculateInventoryAwarePlan(selections: PlanSelection[], recipes: RecipeEntry[], inventory: InventoryRecord): InventoryAwarePlan {
  const recipeMap = buildRecipeMap(recipes)
  const directMap = buildDirectMap(selections)
  const demand = new Map(directMap)
  const stock = inventoryMap(inventory)
  const used = new Map<string, { name: string; quantity: number }>()
  const batches: BatchStep[] = []
  const processed = new Set<string>()
  const depthMemo = new Map<string, number>()

  const consumeStock = (key: string, displayName: string, quantity: number) => {
    const available = stock.get(key) ?? 0
    const amount = Math.min(available, quantity)
    if (amount > 0) {
      stock.set(key, available - amount)
      addNeed(used, displayName, amount)
    }
    return amount
  }

  while (true) {
    const candidates = [...demand.entries()]
      .filter(([key]) => recipeMap.has(key) && !processed.has(key))
      .sort((a, b) => recipeDepth(b[1].name, recipeMap, depthMemo) - recipeDepth(a[1].name, recipeMap, depthMemo))

    if (!candidates.length) break
    const [key, need] = candidates[0]
    const recipe = recipeMap.get(key)!
    const fromInventory = consumeStock(key, need.name, need.quantity)
    const remaining = need.quantity - fromInventory

    demand.delete(key)
    processed.add(key)
    if (remaining <= 0) continue

    const outputPerCraft = Math.max(1, recipe.outputQuantity || 1)
    const crafts = Math.ceil(remaining / outputPerCraft)
    const produced = crafts * outputPerCraft

    batches.push({
      name: recipe.name,
      needed: remaining,
      outputPerCraft,
      crafts,
      produced,
      leftover: produced - remaining,
      profession: recipe.profession,
      sourceStatus: recipe.sourceStatus,
    })

    recipe.materials.forEach((material) => addNeed(demand, material.name, material.required * crafts))
  }

  const rawDemand = new Map(demand)
  const missing = new Map<string, { name: string; quantity: number }>()
  const availability: InventoryAvailability[] = []

  for (const [key, need] of rawDemand.entries()) {
    const owned = consumeStock(key, need.name, need.quantity)
    const missingQuantity = need.quantity - owned
    availability.push({ name: need.name, required: need.quantity, owned, missing: missingQuantity })
    if (missingQuantity > 0) addNeed(missing, need.name, missingQuantity)
  }

  availability.sort((a, b) => b.missing - a.missing || b.required - a.required || a.name.localeCompare(b.name))

  return {
    direct: toSortedNeeds(directMap),
    raw: toSortedNeeds(rawDemand),
    batches: batches.sort((a, b) => b.crafts - a.crafts || a.name.localeCompare(b.name)),
    availability,
    inventoryUsed: toSortedNeeds(used),
    missingRaw: toSortedNeeds(missing),
  }
}

export function buildDependencyCraftSequence(selections: PlanSelection[], batches: BatchStep[], recipes: RecipeEntry[]): CraftSequenceStep[] {
  const recipeMap = buildRecipeMap(recipes)
  const activeBatches = new Map(batches.map((batch) => [normalize(batch.name), batch]))
  const stageMemo = new Map<string, number>()
  const visiting = new Set<string>()

  const activeStage = (name: string): number => {
    const key = normalize(name)
    if (stageMemo.has(key)) return stageMemo.get(key)!
    if (visiting.has(key)) return 1
    const recipe = recipeMap.get(key)
    if (!recipe || !activeBatches.has(key)) return 0

    visiting.add(key)
    const dependencyStages = recipe.materials
      .filter((material) => activeBatches.has(normalize(material.name)))
      .map((material) => activeStage(material.name))
    visiting.delete(key)

    const stage = dependencyStages.length ? Math.max(...dependencyStages) + 1 : 1
    stageMemo.set(key, stage)
    return stage
  }

  const intermediate = batches
    .map((batch) => ({ batch, stage: activeStage(batch.name) }))
    .sort((a, b) => a.stage - b.stage || a.batch.name.localeCompare(b.batch.name))

  const finalStage = Math.max(0, ...intermediate.map((entry) => entry.stage)) + 1
  let order = 1
  const steps: CraftSequenceStep[] = intermediate.map(({ batch, stage }) => ({
    order: order++,
    stage,
    name: batch.name,
    crafts: batch.crafts,
    needed: batch.needed,
    produced: batch.produced,
    leftover: batch.leftover,
    profession: batch.profession,
    sourceStatus: batch.sourceStatus,
    final: false,
  }))

  for (const { item, quantity } of selections) {
    if (!Number.isFinite(quantity) || quantity <= 0) continue
    steps.push({
      order: order++,
      stage: finalStage,
      name: item.name,
      crafts: quantity,
      needed: quantity,
      produced: quantity,
      leftover: 0,
      profession: item.profession,
      sourceStatus: item.sourceStatus,
      final: true,
    })
  }

  return steps
}

export function canCraftSelection(selection: PlanSelection, recipes: RecipeEntry[], inventory: InventoryRecord) {
  return calculateInventoryAwarePlan([selection], recipes, inventory).missingRaw.length === 0
}

function buildMaterialTree(name: string, required: number, recipeMap: Map<string, RecipeEntry>, path: Set<string>): CraftTreeNode {
  const key = normalize(name)
  const recipe = recipeMap.get(key)
  if (!recipe || path.has(key)) {
    return {
      id: `material:${key}:${required}`,
      name,
      required,
      kind: 'material',
      craftable: Boolean(recipe),
      profession: recipe?.profession,
      sourceStatus: recipe?.sourceStatus,
      children: [],
    }
  }

  const outputPerCraft = Math.max(1, recipe.outputQuantity || 1)
  const crafts = Math.ceil(required / outputPerCraft)
  const produced = crafts * outputPerCraft
  const nextPath = new Set(path)
  nextPath.add(key)

  return {
    id: `material:${key}:${required}`,
    name: recipe.name,
    required,
    kind: 'material',
    craftable: true,
    outputPerCraft,
    crafts,
    produced,
    leftover: produced - required,
    profession: recipe.profession,
    sourceStatus: recipe.sourceStatus,
    children: recipe.materials.map((material) => buildMaterialTree(material.name, material.required * crafts, recipeMap, nextPath)),
  }
}

export function buildCraftingTrees(selections: PlanSelection[], recipes: RecipeEntry[]): CraftTreeNode[] {
  const recipeMap = buildRecipeMap(recipes)
  return selections
    .filter(({ quantity }) => quantity > 0)
    .map(({ item, quantity }) => ({
      id: `item:${item.id}`,
      name: item.name,
      required: quantity,
      kind: 'item' as const,
      craftable: true,
      profession: item.profession,
      sourceStatus: item.sourceStatus,
      children: item.materials.map((material) => buildMaterialTree(material.name, material.required * quantity, recipeMap, new Set<string>())),
    }))
}

export function expandSingleMaterial(name: string, quantity: number, recipes: RecipeEntry[]) {
  const pseudoItem: ItemEntry = {
    id: '__material__', name, kind: 'Material', classes: ['All'], categories: [], variants: [],
    materials: [{ name, required: quantity }], sourceStatus: 'derived',
    provenance: { evidence: [] },
  }
  return calculateCraftingPlan([{ item: pseudoItem, quantity: 1 }], recipes)
}