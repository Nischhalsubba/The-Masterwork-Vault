import assert from 'node:assert/strict'
import { journeyPhases, journeySources, journeyProfessionGuides, JOURNEY_REVIEWED_AT, JOURNEY_BOOK_PRICES } from '../src/data/journeyKnowledge.ts'

import { chultanIntermediateFormulas, chultanWeaponSlots, masterworkResearchSources, masterworkTierAssessment, masterworkResearchLimits } from '../src/data/masterworkResearch.ts'
import { chultanHistoricalTaskRows } from '../src/data/chultanHistoricalTasks.ts'
import { buildJourneyCraftables, matchesJourneyCraftable, journeyItemHref } from '../src/domain/journeyCatalog.ts'
import { sharandarItems, sharandarRecipes } from '../src/data/sharandarSupplement.ts'
import { gatheringReferenceTasks, GATHERING_SOURCE_SCALE, GATHERING_MAPPING_STATUS } from '../src/data/gatheringReference.ts'
assert.equal(journeyPhases.length, 9)
assert.equal(new Set(journeyPhases.map(p => p.id)).size, 9)
for (const id of ['foundation', 'workshop', 'chultan', 'sharandar', 'menzoberranzan']) assert.ok(journeyPhases.some(p => p.id === id), `Preserve legacy milestone ${id}`)
const ids = new Set(journeySources.map(s => s.id))
assert.equal(ids.size, journeySources.length)
for (const source of journeySources) {
  assert.equal(new URL(source.url).protocol, 'https:')
  assert.ok(source.limitation && source.reviewedAt === JOURNEY_REVIEWED_AT)
  assert.ok(source.publishedAt == null || source.publishedAt <= source.reviewedAt)
}
for (const phase of journeyPhases) {
  assert.ok(phase.tasks.length && phase.sections.length && phase.caution && phase.milestone)
  for (const id of [...phase.sourceIds, ...phase.sections.flatMap(s => s.sourceIds)]) assert.ok(ids.has(id), `${phase.id}: unknown source ${id}`)
}
assert.equal(journeyProfessionGuides.length, 8)
assert.deepEqual(JOURNEY_BOOK_PRICES, [500000,500000,1500000,1500000])
assert.equal(JOURNEY_BOOK_PRICES.reduce((a,b)=>a+b,0)*7, 28000000)
const inputs = [{name:'Ore',required:3}]
const item = { id:'test-id', name:'Test output', campaign:'Underdark', kind:'Weapon', profession:'Blacksmithing', materials:inputs, variants:[],classes:['Barbarian'],sourceStatus:'test', recipeKnown:true }
const recipe = { name:'Test output', campaign:'Underdark', outputQuantity:2, quantityExplicit:true, materials:inputs, sourceStatus:'test' }
const data = {items:[item, {...item,id:'missing',name:'Missing recipe',recipeKnown:false,materials:[]}],recipes:[recipe, {...recipe,name:'Test output +1'}, {...recipe,name:'Uncertain yield',quantityExplicit:false}],materials:[]}
const before = JSON.stringify(data)
const rows = buildJourneyCraftables(data)
assert.equal(rows.length,4)
assert.equal(rows.find(r=>r.name==='Test output').outputQuantity,2)
assert.equal(rows.find(r=>r.name==='Uncertain yield').outputQuantity,null)
assert.equal(rows.find(r=>r.name==='Missing recipe').recipeCaptured,false)
assert.equal(rows.find(r=>r.name==='Missing recipe').outputQuantity,null)
assert.equal(JSON.stringify(data),before,'Catalog must not be mutated')
assert.ok(matchesJourneyCraftable(rows.find(r=>r.name==='Test output'),'barbarian ore'))
assert.ok(!matchesJourneyCraftable(rows[0],'not-a-real-output'))
assert.equal(buildJourneyCraftables({...data,recipes:[{...recipe,materials:[{name:'Other ore',required:8}]}]}).find(r=>r.name==='Test output').outputQuantity,null,'Conflicting recipe inputs must not silently supply a yield')
assert.ok(journeyItemHref(item).startsWith('/catalog/underdark/test-id/'))
const unresolvedSharandarYields = sharandarRecipes.filter(recipe=>!recipe.quantityExplicit).map(recipe=>recipe.name).sort()
assert.deepEqual(unresolvedSharandarYields, ['Feywood Bark','Feywood Bark Barbute','Feywood Buckler','Feywood Shield','Feywood Sprouts'].sort())
for (const name of ['Crafted Potion of Accuracy Rank 13','Crafted Potion of Critical Strike Rank 13','Crafted Potion of Defense Rank 13','Crafted Potion of Deflect Rank 13','Crafted Potion of Power Rank 13']) {
  const recipe = sharandarRecipes.find(row=>row.name===name)
  assert.ok(recipe?.quantityExplicit, `${name}: Wiki-backed yield must be explicit`)
  assert.equal(recipe?.outputQuantity,12, `${name}: recorded Sharandar task yield`)
}
assert.equal(sharandarRecipes.filter(recipe=>!recipe.quantityExplicit).length,5)
assert.equal(GATHERING_SOURCE_SCALE,'legacy-1-80')
assert.equal(GATHERING_MAPPING_STATUS,'unresolved-after-2021-compression')
assert.equal(gatheringReferenceTasks.length,25)
assert.ok(gatheringReferenceTasks.every(task=>task.plannerEligible===false))
assert.ok(gatheringReferenceTasks.every(task=>task.confidence==='historical-pre-compression-sample'))
const publisherPatchUrl='https://www.playneverwinter.com/en/news-details/11542223'
const incense = sharandarItems.find(item=>item.name==="Hermit's Incense")
assert.ok(incense)
assert.equal(incense.variants.find(variant=>variant.quality==='+1')?.itemLevel,95)
assert.ok(incense.provenance.evidence.some(line=>String(line).includes('11542223')))
for (const [name,slot] of [
  ['Thorned Amulet +1','Neck'],
  ['Feywood Amulet +1','Neck'],
  ['Thorned Sash +1','Waist'],
  ['Feywood Sash +1','Waist'],
  ["Dawn's Light Sash +1",'Waist'],
]) {
  const item = sharandarItems.find(row=>row.name===name)
  assert.ok(item,`${name}: publisher-confirmed item must be represented`)
  assert.equal(item.slot,slot)
  assert.equal(item.recipeKnown,false)
  assert.equal(item.sourceStatus,'publisher-patch')
  assert.equal(item.variants.find(variant=>variant.quality==='+1')?.itemLevel,1300)
  assert.ok(String(item.icon).startsWith('data:image/svg+xml'))
  assert.equal(item.artwork?.provenance,'reference-derived')
  assert.ok(item.provenance.evidence.some(line=>String(line).includes(publisherPatchUrl)))
}
assert.equal(chultanIntermediateFormulas.length,17)
assert.equal(chultanWeaponSlots.length,18)
assert.equal(chultanHistoricalTaskRows.length,76)
assert.deepEqual(Object.fromEntries([...new Set(chultanHistoricalTaskRows.map(row=>row.profession))].sort().map(profession=>[profession,chultanHistoricalTaskRows.filter(row=>row.profession===profession).length])), {Alchemy:7,Armorsmithing:13,Artificing:13,Blacksmithing:20,Jewelcrafting:8,Leatherworking:7,Tailoring:8})
for (const row of chultanHistoricalTaskRows) {
  assert.ok(row.name && row.profession && ['IV','V'].includes(row.historicalTier))
  assert.ok(row.outputQuantity > 0 && Number.isInteger(row.outputQuantity))
  assert.ok(row.materials.length > 0)
  assert.equal(new URL(row.sourceUrl).protocol,'https:')
}
const historicalLichstone = chultanHistoricalTaskRows.find(row=>row.profession==='Artificing' && row.historicalTier==='IV' && row.name==='Lichstone Enamel')
assert.equal(historicalLichstone?.outputQuantity,3)
assert.deepEqual(historicalLichstone?.materials,[{name:'Lichstone',quantity:1},{name:"Artisan's Enamel",quantity:4}])
const formulaSignature = (outputQuantity, inputs) => JSON.stringify({ outputQuantity, inputs:[...inputs].map(input=>({name:input.name.toLowerCase(),quantity:input.quantity})).sort((a,b)=>a.name.localeCompare(b.name)) })
const historicalFormulaConflicts = chultanIntermediateFormulas.filter(formula => {
  const matches = chultanHistoricalTaskRows.filter(row=>row.name===formula.name)
  return matches.length && matches.some(row=>formulaSignature(row.outputQuantity,row.materials)!==formulaSignature(formula.outputQuantity,formula.inputs))
}).map(formula=>formula.name).sort()
assert.deepEqual(historicalFormulaConflicts,['Brilliant Bead','Chultan Silk Thread','Fanged Ornament','Lacquered Dinosaur Leather','Lion Fur'])
assert.equal(new Set(chultanIntermediateFormulas.map(row=>row.name)).size,17)
const lichstoneEnamel = chultanIntermediateFormulas.find(row=>row.name==='Lichstone Enamel')
assert.equal(lichstoneEnamel?.outputQuantity,3)
assert.deepEqual(lichstoneEnamel?.inputs,[{name:'Lichstone',quantity:1},{name:"Artisan's Enamel",quantity:4}])
assert.equal(new Set(chultanWeaponSlots.map(row=>row.slot)).size,18)
for (const row of [...chultanIntermediateFormulas,...chultanWeaponSlots]) {
  assert.ok(row.inputs.length > 0, `${'name' in row ? row.name : row.slot}: research row needs inputs`)
  for (const input of row.inputs) assert.ok(input.name && input.quantity > 0 && Number.isInteger(input.quantity))
}
for (const row of chultanIntermediateFormulas) assert.ok(row.outputQuantity > 0 && Number.isInteger(row.outputQuantity))
assert.ok(masterworkResearchSources.some(source=>source.url.includes('/11500323')))
assert.ok(masterworkResearchSources.some(source=>source.url.includes('1gYsenO0JX3fOkZrSxgyJ7fdiBPK_dcs96sP3blUra44')))
assert.equal(masterworkTierAssessment.latestPositivelyDocumented,'Menzoberranzan')
assert.equal(masterworkTierAssessment.laterTierStatus,'unresolved')
assert.ok(masterworkTierAssessment.note.includes('not proof'))
assert.ok(masterworkResearchLimits.some(text=>text.includes('current complete Chultan I / II final-output inventory is not established')))
console.log('Masterwork research: 17 intermediate formulas, 18 weapon slots, 76 historical IV/V task rows, source URLs and unresolved-later-tier boundary passed.')
console.log('Journey: 9 sourced chapters, legacy IDs, eight professions, book-price arithmetic, quality identities, unknown yields and immutable catalog joins passed.')
