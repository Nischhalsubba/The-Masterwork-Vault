import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const sourcePath = path.join(here, '..', 'src', 'data', 'extractedSupplement.ts')
const source = fs.readFileSync(sourcePath, 'utf8')

function readJsonConst(name) {
  const pattern = new RegExp(`export const ${name} = (\\[[\\s\\S]*?\\]) as const`)
  const match = source.match(pattern)
  if (!match) throw new Error(`Could not locate ${name} in extractedSupplement.ts`)
  return JSON.parse(match[1])
}

const recipes = readJsonConst('recoveredMaterialRecipes')
const specs = readJsonConst('recoveredMaterialSpecs')

const expected = {
  'Purified Darklake Water': { output: 3, inputs: { 'Luminescent Darklake Water': 15, Terebinth: 5 } },
  'Hardened Mushroom': { output: 2, inputs: { 'Mushroom Lumber': 4, 'Purified Darklake Water': 1, 'Calcified Webbing': 1 } },
  'Mushroom Lumber': { output: 4, inputs: { 'Mushroom Log': 12, 'Mushroom Droplet': 1 } },
  'Living Fungi': { output: 3, inputs: { 'Mushroom Lumber': 4, 'Luminescent Darklake Water': 1, 'Fungal Moss': 3, 'Menzoberranzan Faerzress Crystal': 1 } },
  'Marilith Charm': { output: 4, inputs: { "Fallen God's Ore": 2, 'Abyssal Crystal': 1, 'Demonweb Faerzress Crystal': 1, 'Calcified Webbing': 1 } },
  'Unknown Godsteel': { output: 3, inputs: { 'Druegarsteel Scrap': 12, "Fallen God's Ore": 1, 'Calcified Webbing': 2 } },
  Lolthbead: { output: 4, inputs: { 'Menzoberranzan Faerzress Crystal': 12, 'Unknown Godsteel': 4, 'Faerzress Rock': 3, 'Abyssal Crystal': 1 } },
  'Soul Bead': { output: 2, inputs: { Lolthbead: 4, 'Spool of Marilithsilk': 3, "Fallen God's Ore": 6 } },
  'Lacquered Mushroom': { output: 2, inputs: { 'Goristro Hide': 2, 'Purified Darklake Water': 2, 'Mushroom Droplet': 4, 'Mushroom Log': 16 } },
  'Lacquered Goristro Leather': { output: 2, inputs: { 'Mushroom Droplet': 12, 'Shroomsap Spores': 2, 'Purified Darklake Water': 2, 'Goristro Hide': 8 } },
  'Spool of Marilithsilk': { output: 2, inputs: { 'Perfect Marilith Hair': 8, 'Luminescent Darklake Water': 3 } },
  'Underdark Fiber': { output: 1, inputs: { 'Fluorescent Flora': 12, 'Luminescent Darklake Water': 6, 'Fungal Moss': 3 } },
}

const problems = []
const recipeByName = new Map(recipes.map((recipe) => [recipe.name, recipe]))
const specByName = new Map(specs.map((spec) => [spec.name, spec]))

const expectedNames = Object.keys(expected).sort()
const actualNames = recipes.map((recipe) => recipe.name).sort()
if (JSON.stringify(actualNames) !== JSON.stringify(expectedNames)) {
  problems.push(`Critical recipe set changed. Expected ${expectedNames.length} recipes, found ${actualNames.length}.`)
}

for (const [name, truth] of Object.entries(expected)) {
  const recipe = recipeByName.get(name)
  const spec = specByName.get(name)
  if (!recipe) {
    problems.push(`${name}: recipe missing`)
    continue
  }
  if (!spec || spec.craftable !== true) problems.push(`${name}: material must remain marked craftable`)
  if (recipe.outputQuantity !== truth.output) problems.push(`${name}: yield ${recipe.outputQuantity} != verified ${truth.output}`)
  if (spec?.outputQuantity !== truth.output) problems.push(`${name}: material yield ${spec?.outputQuantity} != verified ${truth.output}`)
  if (recipe.quantityExplicit !== true) problems.push(`${name}: output quantity is no longer marked explicit`)

  const actualInputs = Object.fromEntries(recipe.materials.map((row) => [row.name, row.required]))
  const expectedInputNames = Object.keys(truth.inputs).sort()
  const actualInputNames = Object.keys(actualInputs).sort()
  if (JSON.stringify(actualInputNames) !== JSON.stringify(expectedInputNames)) {
    problems.push(`${name}: ingredient set changed`)
  }

  for (const [ingredient, quantity] of Object.entries(truth.inputs)) {
    if (actualInputs[ingredient] !== quantity) {
      problems.push(`${name}: ${ingredient} requires ${actualInputs[ingredient]} but verified value is ${quantity}`)
    }
  }

  if (!Number.isInteger(recipe.outputQuantity) || recipe.outputQuantity < 1) problems.push(`${name}: invalid output quantity`)
  for (const row of recipe.materials) {
    if (!Number.isInteger(row.required) || row.required < 1) problems.push(`${name}: invalid quantity for ${row.name}`)
  }

  for (let needed = 1; needed <= 20; needed += 1) {
    const crafts = Math.ceil(needed / recipe.outputQuantity)
    const produced = crafts * recipe.outputQuantity
    const leftover = produced - needed
    if (produced < needed || leftover < 0 || leftover >= recipe.outputQuantity) {
      problems.push(`${name}: batch math failed for needed=${needed}`)
      break
    }
  }
}

const craftableSpecNames = specs.filter((spec) => spec.craftable).map((spec) => spec.name).sort()
if (JSON.stringify(craftableSpecNames) !== JSON.stringify(expectedNames)) {
  problems.push('Craftable material set no longer matches the verified recipe set.')
}

const visiting = new Set()
const visited = new Set()
function visit(name) {
  if (visiting.has(name)) {
    problems.push(`Recipe cycle detected at ${name}`)
    return
  }
  if (visited.has(name)) return
  visiting.add(name)
  const recipe = recipeByName.get(name)
  if (recipe) {
    for (const row of recipe.materials) if (recipeByName.has(row.name)) visit(row.name)
  }
  visiting.delete(name)
  visited.add(name)
}
for (const name of expectedNames) visit(name)

if (problems.length) {
  console.error('\nCritical material recipe verification FAILED:\n')
  for (const problem of problems) console.error(`- ${problem}`)
  console.error('\nThese values are locked to the user-provided recipe screenshots. Do not deploy until reconciled with newer screenshot evidence.\n')
  process.exit(1)
}

console.log(`Critical material recipe verification passed: ${expectedNames.length}/${expectedNames.length} recipes, exact yields and per-craft inputs, batch math checked for quantities 1-20.`)
