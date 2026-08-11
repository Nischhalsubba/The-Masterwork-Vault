import fs from 'node:fs'

const sourcePath = new URL('../src/data/craftingKnowledgePool.ts', import.meta.url)
const source = fs.readFileSync(sourcePath, 'utf8')
const failures = []
const mustContain = [
  ['profession cap', 'maxLevel: 20'],
  ['daily morale', 'dailyMorale: 400'],
  ['morale refill', 'moraleRefillAdPerPoint: 120'],
  ['Maker manual multiplier', 'makers: 1'],
  ['Philosopher manual multiplier', 'philosophers: 2'],
  ['2x professions morale', 'moraleCostMultiplier: 0.5'],
  ['Focus formula', 'clamp((focus - minimumFocus) / (focusGoal - minimumFocus), 0, 1)'],
  ['Speed formula', 'baseInterval / (1 + speedModifier / 100)'],
  ['R1 artisan capacity', '1: 11'],
  ['R2 artisan capacity', '2: 17'],
  ['R3 artisan capacity', '3: 23'],
  ['R4 artisan capacity', '4: 29'],
  ['Grand Upgrade current credits', 'southSeaTradingCompanyCredits: 2_500_000'],
  ['XP curve stays unknown', 'xpThresholds: null'],
  ['Chultan binding stays unknown', 'purchaseBinding: null'],
  ['Stronghold gate stays unknown', 'strongholdPurchaseGate: null'],
  ['Workshop Rank 4 not hard gate', 'requiredWorkshopRank: null'],
]
for (const [label, needle] of mustContain) if (!source.includes(needle)) failures.push(`${label}: missing expected source marker ${JSON.stringify(needle)}`)

const orderedTriggers = [5, 8, 10, 13, 15]
for (const level of orderedTriggers) if (!source.includes(`professionLevel: ${level}`)) failures.push(`Workshop quest trigger Level ${level} missing`)
if (!source.includes("prerequisites: ['Chultan MW1', 'Chultan MW2']")) failures.push('Sharandar Chultan I→II prerequisite marker missing')
if (!source.includes("quest: 'Drow Mastery'")) failures.push('Menzoberranzan Drow Mastery marker missing')

if (failures.length) {
  console.error('\nMasterwork knowledge guard FAILED:\n')
  failures.forEach((failure) => console.error(`- ${failure}`))
  process.exit(1)
}
console.log(`Masterwork knowledge guard passed: ${mustContain.length + orderedTriggers.length + 2} current-system invariants checked; three approved unknowns remain null.`)
