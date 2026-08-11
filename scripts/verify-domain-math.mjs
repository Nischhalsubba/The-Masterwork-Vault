import assert from 'node:assert/strict'
import fs from 'node:fs'

const tsModule = await import('typescript')
const ts = tsModule.default ?? tsModule
const sourceUrl = new URL('../src/domain/professionMath.ts', import.meta.url)
const source = fs.readFileSync(sourceUrl, 'utf8')
const transpiled = ts.transpileModule(source, {
  compilerOptions: {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    strict: true,
  },
  fileName: sourceUrl.pathname,
  reportDiagnostics: true,
})
const errors = (transpiled.diagnostics ?? []).filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error)
if (errors.length) {
  for (const diagnostic of errors) console.error(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'))
  process.exit(1)
}
const moduleUrl = `data:text/javascript;base64,${Buffer.from(transpiled.outputText).toString('base64')}`
const { craftingDuration, eventMoraleCost, highQualityChance, moraleRefillCost } = await import(moduleUrl)

assert.equal(highQualityChance(970, 970, 1400), 0)
assert.equal(highQualityChance(1400, 970, 1400), 1)
assert.equal(highQualityChance(800, 970, 1400), 0)
assert.equal(highQualityChance(1600, 970, 1400), 1)
assert.ok(Math.abs(highQualityChance(1140, 970, 1400) - 170 / 430) < 1e-12)
assert.equal(craftingDuration(3, -75), 12)
assert.equal(craftingDuration(3, 50), 2)
assert.equal(craftingDuration(3, 100), 1.5)
assert.equal(moraleRefillCost(50), 6000)
assert.equal(moraleRefillCost(150), 18000)
assert.equal(moraleRefillCost(300), 36000)
assert.equal(eventMoraleCost(40, false), 40)
assert.equal(eventMoraleCost(40, true), 20)
console.log('Profession mechanics tests passed: Focus, Speed, Morale refill, and 2x Professions event behavior.')
