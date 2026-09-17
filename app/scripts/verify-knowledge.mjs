import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const source = readFileSync(new URL('../src/data/craftingKnowledgePool.ts', import.meta.url), 'utf8')
// Integrity guard for published facts and uncertainty, not a live-game certification.
for (const marker of ['maxLevel: 20', 'dailyMorale: 400', 'moraleCostMultiplier: 0.5', 'xpMultiplier: 1',
  'southSeaTradingCompanyCredits: 2_500_000', 'xpThresholds: null', 'purchaseBinding: null',
  'strongholdPurchaseGate: null', 'requiredWorkshopRank: null', 'moraleRefillAdPerPoint: null',
  'allChultanRecipesRequired: null', 'allProfessionsLevel20: null', 'quest: null']) {
  assert.ok(source.includes(marker), `Missing fact/uncertainty invariant: ${marker}`)
}
assert.equal((source.match(/professionLevel: null, quest:/g) || []).length, 5, 'Unverified Workshop quest gates must remain unset')
assert.ok(!source.includes('currentVerificationRequired: false'), 'Historical knowledge must not claim automatic current verification')
assert.ok(!source.includes('moraleRefillAdPerPoint: 120'), 'Do not restore an unsupported live price')
console.log('Knowledge integrity passed: published baselines retained; unsupported current gates and quotes remain unset.')
