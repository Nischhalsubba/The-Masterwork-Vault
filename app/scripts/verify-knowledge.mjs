import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const source = readFileSync(new URL('../src/data/craftingKnowledgePool.ts', import.meta.url), 'utf8')

// Integrity guard for published facts, evidence-backed progression, and uncertainty.
// This does not turn community-maintained evidence into a live-server certification.
for (const marker of ['maxLevel: 20', 'dailyMorale: 400', 'moraleCostMultiplier: 0.5', 'xpMultiplier: 1',
  'southSeaTradingCompanyCredits: 2_500_000', 'xpThresholds: null', 'purchaseBinding: null',
  'strongholdPurchaseGate: null', 'requiredWorkshopRank: null', 'moraleRefillAdPerPoint: null',
  'allChultanRecipesRequired: true', 'allProfessionsLevel20: true', "quest: 'Drow Mastery'",
  "bind: 'Bind on Pickup (Character)'", "id: 'neverwinter-wiki-masterwork-progression-2026'"]) {
  assert.ok(source.includes(marker), `Missing fact/uncertainty invariant: ${marker}`)
}

assert.equal((source.match(/professionLevel: null, quest:/g) || []).length, 5, 'Unverified Workshop quest gates must remain unset')
assert.equal((source.match(/currentVerificationRequired: false/g) || []).length, 2, 'Only the corroborated Sharandar and Menzoberranzan progression records should retire the verification flag')
assert.ok(source.includes('community-maintained, not a live-server capture') || source.includes('community evidence rather than a live-server capture'), 'Evidence limitations must remain explicit')
assert.ok(!source.includes('moraleRefillAdPerPoint: 120'), 'Do not restore an unsupported live price')
console.log('Knowledge integrity passed: corroborated progression is explicit; unsupported live-only gates and prices remain unset.')
