import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { sharandarRecipes, sharandarItems } from '../src/data/sharandarSupplement.ts'

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8')
// Read the two literal data arrays without importing their browser-only icon dependencies.
const supplement = read('../src/data/extractedSupplement.ts')
function readSupplement(name) {
  const match = supplement.match(new RegExp(`export const ${name} = (\\[[\\s\\S]*?\\]) as const`))
  assert.ok(match, `Missing literal data array: ${name}`)
  return JSON.parse(match[1])
}
const recoveredMaterialSpecs = readSupplement('recoveredMaterialSpecs')
const recoveredMaterialRecipes = readSupplement('recoveredMaterialRecipes')
const base = JSON.parse(gunzipSync(Buffer.from(read('../src/data/catalog.gz.b64').replace(/\s/g, ''), 'base64')))
const key = (name) => name.toLowerCase().replace(/\+1/g, '').replace(/[\u2019']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const recipes = [...base.recipes, ...recoveredMaterialRecipes, ...sharandarRecipes]
const outputs = new Set(recipes.filter((row) => row.materials?.length).map((row) => key(row.name)))
const items = [...base.items, ...sharandarItems]
const finalNames = new Set(items.map((row) => key(row.name)))
const inventory = new Map()
for (const row of [...base.materials, ...recoveredMaterialSpecs]) {
  if (!row.craftable && !outputs.has(key(row.name))) inventory.set(key(row.name), row.name)
}
for (const parent of [...recipes, ...items]) for (const row of parent.materials ?? []) {
  if (!outputs.has(key(row.name)) && !finalNames.has(key(row.name))) inventory.set(key(row.name), row.name)
}
const names = [...inventory.values()].sort()
console.log('RAW_MATERIAL_INVENTORY=' + JSON.stringify(names))
const { materialSourceRecords, getMaterialSourceGuide, normalizeMaterialSourceName } = await import('../src/data/materialSources.ts')
const indexed = new Map(materialSourceRecords.map((row) => [normalizeMaterialSourceName(row.name), row]))
const missing = names.filter((name) => !indexed.has(normalizeMaterialSourceName(name)))
assert.deepEqual(missing, [], 'Every raw/leaf ingredient needs an explicit researched or unresolved record')
assert.equal(indexed.size, materialSourceRecords.length, 'Duplicate canonical source records')
for (const row of materialSourceRecords) {
  assert.ok(row.name && row.reviewedAt && row.scope && row.notes.length)
  assert.ok(['documented', 'historical', 'unresolved'].includes(row.status))
  if (row.status === 'unresolved') assert.equal(row.routes.length, 0, 'Unresolved records must not invent farming routes')
  else assert.ok(row.routes.length > 0, row.name + ': a documented route is required')
  for (const route of row.routes) {
    assert.ok(route.id && route.location && route.method && route.steps.length && route.evidence.length)
    for (const evidence of route.evidence) {
      assert.equal(new URL(evidence.url).protocol, 'https:')
      assert.ok(evidence.title && evidence.access && evidence.checkedAt && evidence.supports)
    }
  }
  assert.equal(getMaterialSourceGuide(row.name + ' +1').name, row.name)
}
assert.equal(getMaterialSourceGuide('An unknown future material').status, 'unresolved')
assert.equal(getMaterialSourceGuide('An unknown future material').routes.length, 0)
assert.equal(getMaterialSourceGuide('Druegarsteel Scrap').name, getMaterialSourceGuide('Duergarsteel Scrap').name)
assert.notEqual(normalizeMaterialSourceName('Marilith Hair'), normalizeMaterialSourceName('Perfect Marilith Hair'))
assert.match(getMaterialSourceGuide('Marilith Hair').routes[0].location, /Advanced/)
assert.match(getMaterialSourceGuide('Perfect Marilith Hair').routes[0].location, /Master/)
assert.equal(getMaterialSourceGuide('Calcified Webbing').routes[0].method, 'Campaign store')
assert.match(getMaterialSourceGuide('Mushroom Log').routes[0].location, /^Menzoberranzan$/)
assert.match(getMaterialSourceGuide('Luminescent Darklake Water').routes[0].location, /^Narbondellyn$/)
console.log('SOURCE_COVERAGE=' + JSON.stringify(names.reduce((acc, name) => { const status = getMaterialSourceGuide(name).status; acc[status] = (acc[status] || 0) + 1; return acc }, {})))
console.log('Material acquisition schema, raw-material coverage, aliases and uncertainty checks passed.')
