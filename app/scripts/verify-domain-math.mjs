import assert from 'node:assert/strict'

const sourceUrl = new URL('../src/domain/professionMath.ts', import.meta.url)
const { craftingDuration, eventMoraleCost, highQualityChance, moraleRefillCost } = await import(sourceUrl.href)
const craftingUrl = new URL('../src/lib/crafting.ts', import.meta.url)
const { calculateCraftingPlan, calculateInventoryAwarePlan } = await import(craftingUrl.href)

assert.equal(highQualityChance(970, 970, 1400), 0)
assert.equal(highQualityChance(1400, 970, 1400), 1)
assert.equal(highQualityChance(800, 970, 1400), 0)
assert.equal(highQualityChance(1600, 970, 1400), 1)
assert.ok(Math.abs(highQualityChance(1140, 970, 1400) - 170 / 430) < 1e-12)
assert.equal(craftingDuration(3, -75), 12)
assert.equal(craftingDuration(3, 50), 2)
assert.equal(craftingDuration(3, 100), 1.5)
assert.equal(moraleRefillCost(50, 120), 6000)
assert.equal(moraleRefillCost(150, 120), 18000)
assert.equal(moraleRefillCost(300, 120), 36000)
assert.equal(eventMoraleCost(40, false), 40)
assert.equal(eventMoraleCost(40, true), 20)
assert.ok(Number.isNaN(moraleRefillCost(10, Number.NaN)))
assert.ok(Number.isNaN(moraleRefillCost(Number.POSITIVE_INFINITY, 120)))
console.log('Profession calculation tests passed for supplied inputs. These math checks do not certify live game values.')

const uncertainRecipe = {
  name: 'Uncertain Resin',
  outputQuantity: 1,
  quantityExplicit: false,
  profession: 'Alchemy',
  materials: [{ name: 'Raw Sap', required: 4 }],
  sourceStatus: 'historical',
  evidence: ['Yield not visible in source'],
}
const uncertainItem = {
  id: 'test-uncertain-item',
  name: 'Test Uncertain Item',
  kind: 'Accessory',
  classes: ['All'],
  categories: [],
  variants: [],
  materials: [{ name: 'Uncertain Resin', required: 2 }],
  sourceStatus: 'test',
  provenance: { evidence: [] },
}
const uncertainPlan = calculateCraftingPlan([{ item: uncertainItem, quantity: 1 }], [uncertainRecipe])
assert.equal(uncertainPlan.batches.length, 0, 'Unknown-yield recipes must not be planned as yield 1')
assert.deepEqual(uncertainPlan.unresolved, [{ name: 'Uncertain Resin', required: 2 }])
const uncertainInventoryPlan = calculateInventoryAwarePlan([{ item: uncertainItem, quantity: 1 }], [uncertainRecipe], { 'Uncertain Resin': 1 })
assert.equal(uncertainInventoryPlan.batches.length, 0)
assert.deepEqual(uncertainInventoryPlan.unresolved, [{ name: 'Uncertain Resin', required: 1 }])
console.log('Crafting planner rejects unresolved recipe yields instead of assuming one output.')
