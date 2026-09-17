import assert from 'node:assert/strict'
import { materialSourceRecords } from '../src/data/materialSources.ts'
import { indexMaterialSource, matchesMaterialSource, sourceSearchText } from '../src/domain/materialSourceSearch.ts'

const index = materialSourceRecords.map(indexMaterialSource)
const search = (query) => index.filter(({ text }) => matchesMaterialSource(text, query)).map(({ guide }) => guide.name)
assert.equal(sourceSearchText('  Lacquered Roth\u00e8 Leather  '), 'lacquered rothe leather')
assert.deepEqual(search('Duergarsteel Scrap'), ['Druegarsteel Scrap'])
assert.deepEqual(search('Flourescent Flora'), ['Fluorescent Flora'])
assert.deepEqual(search('Tricky Reversal').sort(), ['Druegarsteel Scrap', 'Menzoberranzan Faerzress Crystal', 'Mushroom Droplet'].sort())
assert.equal(search('Itty Bitty').length, 4)
assert.ok(search('Narbondellyn water').includes('Luminescent Darklake Water'))
assert.ok(search('rothe leather').some((name) => name.startsWith('Lacquered Roth')))
assert.deepEqual(search('a-nonexistent-material-xyz'), [])
assert.equal(search(' ').length, index.length)
console.log('Source search: spelling aliases, diacritics, modifiers, multiword queries and empty input passed.')
