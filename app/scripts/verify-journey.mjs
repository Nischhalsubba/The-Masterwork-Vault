import assert from 'node:assert/strict'
import { journeyPhases, journeySources, journeyProfessionGuides, JOURNEY_REVIEWED_AT, JOURNEY_BOOK_PRICES } from '../src/data/journeyKnowledge.ts'

import { chultanIntermediateFormulas, chultanWeaponSlots, masterworkResearchSources, masterworkTierAssessment, masterworkResearchLimits } from '../src/data/masterworkResearch.ts'
import { buildJourneyCraftables, matchesJourneyCraftable, journeyItemHref } from '../src/domain/journeyCatalog.ts'
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
assert.equal(chultanIntermediateFormulas.length,16)
assert.equal(chultanWeaponSlots.length,18)
assert.equal(new Set(chultanIntermediateFormulas.map(row=>row.name)).size,16)
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
console.log('Masterwork research: 16 intermediate formulas, 18 weapon slots, source URLs and unresolved-later-tier boundary passed.')
console.log('Journey: 9 sourced chapters, legacy IDs, eight professions, book-price arithmetic, quality identities, unknown yields and immutable catalog joins passed.')
