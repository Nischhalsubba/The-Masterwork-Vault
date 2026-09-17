from pathlib import Path
import json, subprocess
p=Path.cwd()/'app'
assert (p/'src/App.tsx').is_file()
# One-time conversion of existing build-time UI integrations into normal source.
for script in ['precompile-catalog.mjs','apply-quality-fixes.mjs','apply-next-level-integration.mjs','apply-ux-integration.mjs','apply-material-source-integration.mjs']:
    subprocess.run(['node','scripts/'+script],cwd=p,check=True)
def rep(path, old, new, count=1):
    f=p/path;s=f.read_text()
    if new and new in s:return
    assert s.count(old)==count, (path,old[:80],s.count(old))
    f.write_text(s.replace(old,new))
rep('src/main.tsx',"import './ux-system.css'","import './ux-system.css'\nimport './responsive-workspace.css'")
rep('src/main.tsx','    <MobileV4Shell />\n','')
rep('src/main.tsx','        <UXSystem />','        <UXSystem />\n        <MobileV4Shell />')
f=p/'src/components/CraftingWorkbench.tsx';s=f.read_text();s=s.replace('useMemo, useState','useMemo, useRef, useState');f.write_text(s)
rep('src/components/CraftingWorkbench.tsx',"  const [history, setHistory] = useState<string[]>([])","""  const [history, setHistory] = useState<string[]>([])
  const detailHeading = useRef<HTMLHeadingElement>(null)
  const revealSelection = useRef(false)
  useEffect(() => {
    if (!revealSelection.current) return
    revealSelection.current = false
    if (!window.matchMedia('(max-width: 900px)').matches) return
    detailHeading.current?.scrollIntoView({ block: 'start', behavior: 'instant' })
    detailHeading.current?.focus({ preventScroll: true })
  }, [name])""")
rep('src/components/CraftingWorkbench.tsx','    setName(nextName)\n','    revealSelection.current = true\n    setName(nextName)\n')
rep('src/components/CraftingWorkbench.tsx','  const chooseMaterial = (nextName: string) => { setHistory([]); setName(nextName) }',"  const chooseMaterial = (nextName: string) => { setHistory([]); revealSelection.current = true; setName(nextName); if (nextName === name && window.matchMedia('(max-width: 900px)').matches) detailHeading.current?.scrollIntoView({ block: 'start' }) }")
rep('src/components/CraftingWorkbench.tsx','<h2>{material.name}</h2>','<h2 ref={detailHeading} tabIndex={-1} className="material-selection-heading">{material.name}</h2>')
rep('src/components/ExplorePage.tsx','  const loadMoreRef = useRef<HTMLDivElement>(null)',"""  const [filtersOpen, setFiltersOpen] = useState(() => !window.matchMedia('(max-width: 900px)').matches)
  useEffect(() => {
    const viewport = window.matchMedia('(max-width: 900px)')
    const update = () => setFiltersOpen(!viewport.matches)
    viewport.addEventListener('change', update)
    return () => viewport.removeEventListener('change', update)
  }, [])
  const loadMoreRef = useRef<HTMLDivElement>(null)""")
rep('src/components/ExplorePage.tsx','          <FilterGroup label="Campaign"', '''          <button type="button" className="workspace-filter-toggle" aria-expanded={filtersOpen} aria-controls="explorer-filter-fields" onClick={() => setFiltersOpen((open) => !open)}><Filter size={17} aria-hidden="true" />{filtersOpen ? 'Hide filters' : 'Filters'}<span>{campaigns.size + kinds.size + professions.size + classes.size + Number(evidenceOnly) + Number(recipeOnly)} active</span></button>
          <div id="explorer-filter-fields" hidden={!filtersOpen}>
          <FilterGroup label="Campaign"''')
rep('src/components/ExplorePage.tsx','<button className="mw-filter-clear" type="button" onClick={clear}>Clear all filters</button>','<button className="mw-filter-clear" type="button" onClick={clear}>Clear all filters</button>\n          </div>')
rep('src/components/RecipeGraphPage.tsx',"import type { CatalogData, ItemEntry } from '../types'","import type { CatalogData, ItemEntry } from '../types'\nimport { MaterialSourceButton } from './MaterialSources'")
rep('src/components/RecipeGraphPage.tsx','      <b>\u00d7{node.required}</b>','      <b>\u00d7{node.required}</b>\n      {node.kind === \'material\' && !node.craftable && <MaterialSourceButton name={node.name} />}')
rep('src/components/RecipeGraphPage.tsx','<section className="mw-graph-canvas" aria-label=','<section className="mw-graph-canvas" tabIndex={0} aria-label=')

f=p/'src/data/craftingKnowledgePool.ts'
s=f.read_text()
s=s.replace("import catalog from './catalog'", "import catalog from './catalog'\nimport { JOURNEY_BOOK_PRICES } from './journeyKnowledge'")
s=s.replace("confidence: 'verified-current' as const,", "confidence: 'historical-secondary' as const,\n    url: 'https://www.playneverwinter.com/en/news-details/11500323',\n    publishedAt: '2021-10-18',\n    reviewedAt: '2026-09-17',",1)
s=s.replace("label: '2026 current-system progression research pass',", "label: '17 September 2026 literature review',")
s=s.replace("Modern profession, Workshop and Masterwork rules reconciled against official patch notes, current wiki data and live-era community evidence. Unresolved fields remain null rather than inferred.", "Publisher changes and historical community references were read. This is not an in-game observation; minimum gates, binding, capacities and refill rates require current confirmation.")
s=s.replace("confidence: 'strong-current' as const,\n  },\n]", "confidence: 'historical-secondary' as const,\n  },\n]")
s=s.replace('moraleRefillAdPerPoint: 120,','moraleRefillAdPerPoint: null,\n  moraleRefillCurrentVerificationRequired: true,')
s=s.replace("confidence: 'strong-current' as KnowledgeConfidence", "confidence: 'historical-secondary' as KnowledgeConfidence")
s=s.replace("  currentVerificationRequired: false,\n  note: 'Workshop Rank 4 remains useful Workshop progression but is not a modern prerequisite for purchasing Masterwork recipe books.',", "  currentVerificationRequired: true,\n  note: 'Workshop facilities and book access are separate tracks. The 2021 removal of the Artisan storyline does not establish every current Workshop or guild gate.',")
for r,c in [(1,11),(2,17),(3,23),(4,29)]: s=s.replace(f'{r}: {c},',f'{r}: null,')
for lvl in [5,8,10,13,15]: s=s.replace(f'professionLevel: {lvl}, quest:', 'professionLevel: null, quest:')
s=s.replace("quest: 'Grand Upgrade',", "quest: 'The Grand Upgrade',")
s=s.replace("note: 'The South Sea Trading Company credit requirement was reduced from the historical 5,000,000 value to 2,500,000.',", "note: 'Publisher patch of 18 July 2023 reduced the requirement from 5,000,000 to 2,500,000; confirm the live quest before spending.',\n    sourceUrl: 'https://www.playneverwinter.com/en/news-details/11548793',\n    publishedAt: '2023-07-18',")
s=s.replace("description: 'Workshop Rank 4 was a historical Masterwork-access gate. The 2021 professions rework removed the old Stronghold Artisan storyline requirement and moved books to direct purchase.',\n    currentVerificationRequired: false,", "description: 'The 2021 publisher note removes the old Stronghold Artisan storyline requirement. The exact current Workshop-rank gate is not independently established.',\n    currentVerificationRequired: true,")
s=s.replace('chultanMW1: 500_000,','chultanMW1: JOURNEY_BOOK_PRICES[0],').replace('chultanMW2: 500_000,','chultanMW2: JOURNEY_BOOK_PRICES[1],').replace('sharandarMW: 1_500_000,','sharandarMW: JOURNEY_BOOK_PRICES[2],').replace('menzoberranzanMW: 1_500_000,','menzoberranzanMW: JOURNEY_BOOK_PRICES[3],')
s=s.replace("confidence: 'strong-current' as const,\n      currentVerificationRequired: false,\n      source: 'Current-system research plus supplied Menzoberranzan unlock-price data',", "confidence: 'historical-secondary' as const,\n      currentVerificationRequired: true,\n      source: 'AsteR MW Unlock Prices!A1:E10; published baseline, not a live vendor quote',")
s=s.replace("confidence: 'strong-current'\n", "confidence: 'historical-secondary'\n")
s=s.replace('allChultanRecipesRequired: true,','allChultanRecipesRequired: null,\n    currentVerificationRequired: true,').replace('allProfessionsLevel20: true,','allProfessionsLevel20: null,\n    currentVerificationRequired: true,').replace("quest: 'Drow Mastery',", "quest: null,\n    historicalQuestLabel: 'Drow Mastery',")
s=s.replace("bind: 'Character',", "bind: null,")
s=s.replace("steps: ['Reach Level 20 in all seven professions', 'Own all Chultan Masterwork recipes', 'Own all Sharandar Masterwork books', 'Complete Drow Mastery', 'Purchase the profession book from the Drow Master Artisan in Narbondellyn'],", "steps: ['Develop the professions needed by your recipes to Level 20', 'Review Chultan I, Chultan II and Sharandar preparation', 'Check the current introduction quest with Stryker Bronzepin', 'Confirm the profession book, prerequisites and price at the Drow Master Artisan in Narbondellyn'],")
s=s.replace("unresolvedIgnoredFields: ['Current Chultan Choice Pack binding', 'Exact modern Stronghold purchase gate'],", "unresolvedIgnoredFields: ['Current recipe-book binding', 'Exact modern Stronghold purchase gate', 'Minimum cross-profession prerequisites; verify the live vendor'],")
f.write_text(s)

f=p/'src/components/ReadinessPage.tsx';s=f.read_text();a=s.index('<h3>Current Masterwork unlock path</h3>');b=s.index('<a href="/journey">Open full journey</a>',a)
s=s[:a]+'<h3>Published Masterwork progression</h3><p>Chultan I, Chultan II, Sharandar and Menzoberranzan form the documented path. Tracking all seven professions is a full-path preparation plan, not proof of a minimum unlock gate. Confirm live quest requirements, binding and vendor prices.</p>'+s[b:]
s=s.replace('masterworkProgression, ', '').replace(', masterworkProgression', '')
f.write_text(s)
f=p/'src/domain/readiness.ts';s=f.read_text().replace('Account-wide prerequisites include all seven professions at Level 20 and earlier Masterwork progression.', 'Check the current introduction quest and vendor prerequisites. This tracker records your full-path preparation, not live eligibility.');f.write_text(s)
f=p/'src/domain/professionMath.ts';s=f.read_text().replace('adPerPoint = 120','adPerPoint: number');s=s.replace('  const cleanPoints = Math.max(0, Number(points) || 0)', '  if (![points, adPerPoint, discountRate].every(Number.isFinite)) return Number.NaN\n  const cleanPoints = Math.max(0, Number(points) || 0)');f.write_text(s)
f=p/'scripts/verify-domain-math.mjs';s=f.read_text().replace('moraleRefillCost(50)', 'moraleRefillCost(50, 120)').replace('moraleRefillCost(150)', 'moraleRefillCost(150, 120)').replace('moraleRefillCost(300)', 'moraleRefillCost(300, 120)');s=s.replace("console.log('Profession mechanics tests passed: Focus, Speed, Morale refill, and 2x Professions event behavior.')", "assert.ok(Number.isNaN(moraleRefillCost(10, Number.NaN)))\nassert.ok(Number.isNaN(moraleRefillCost(Number.POSITIVE_INFINITY, 120)))\nconsole.log('Profession calculation tests passed for supplied inputs. These math checks do not certify live game values.')");f.write_text(s)

f=p/'src/domain/verification.ts';s=f.read_text()
s=s.replace("import catalogJson from '../data/catalog'", "import catalogJson from '../data/catalog'\nimport { getMaterialSourceGuide, materialSourceRecords } from '../data/materialSources'")
s=s.replace('  lastVerified: string\n','  lastVerified: string\n  sourceUrl?: string\n')
a=s.index('export const verificationLedger:');b=s.index('\nexport function artworkProvenance',a)
s=s[:a]+'''// Retrieval/review date, not an in-game observation.
export const verificationLedger: VerificationLedgerEntry[] = [
  { id: 'profession-cap', label: 'Post-rescale profession cap', value: String(professionMechanics.maxLevel), status: 'historical', lastVerified: '2026-09-17', note: 'Publisher change dated 16 July 2021; not a live-server observation.', sourceUrl: 'https://www.playneverwinter.com/en/news-details/11491453' },
  { id: 'daily-morale', label: 'Daily Workshop Morale', value: String(professionMechanics.dailyMorale), status: 'historical', lastVerified: '2026-09-17', note: 'Community reference; confirm current capacity and reset in-game.', sourceUrl: 'https://neverwinter.fandom.com/wiki/Profession' },
  { id: 'morale-cost', label: 'Current Morale refill rate', value: 'Current quote required', status: 'unknown', lastVerified: '2026-09-17', note: 'The previous 120 AD default had no attributable current evidence. Calculators now require an entered rate.' },
  { id: 'maker-manual', label: "Maker's Training Manual", value: 'Exact current bonus needs confirmation', status: 'unknown', lastVerified: '2026-09-17', note: 'Read the item tooltip; no bonus is applied automatically by the Journey.' },
  { id: 'philosopher-manual', label: "Philosopher's Training Manual", value: 'Exact current bonus needs confirmation', status: 'unknown', lastVerified: '2026-09-17' },
  { id: 'focus', label: 'Focus model retained in calculation library', value: professionMechanics.highQualityChance.formula, status: 'historical', lastVerified: '2026-09-17', note: 'Legacy model, not independently certified in this review. Use the task preview for actual quality chance.' },
  { id: 'speed', label: 'Speed model retained in calculation library', value: professionMechanics.craftingTime.formula, status: 'historical', lastVerified: '2026-09-17', note: 'Model behavior is unit-tested, but that is not evidence of current game mechanics. Use the live task duration.' },
  { id: 'artisan-capacity', label: 'Workshop artisan capacities and quest gates', value: 'Current values need confirmation', status: 'unknown', lastVerified: '2026-09-17', note: 'The community page explicitly warns that its leveling gates are outdated. No mathematical rescaling is presented as a verified gate.', sourceUrl: 'https://neverwinter.fandom.com/wiki/Profession#Upgrading_the_workshop' },
  { id: 'grand-upgrade', label: 'The Grand Upgrade credit requirement', value: workshopProgressionKnowledge.rank4.southSeaTradingCompanyCredits.toLocaleString(), status: 'historical', lastVerified: '2026-09-17', note: 'Publisher lowered it from 5,000,000 on 18 July 2023. This is credits, not AD.', sourceUrl: workshopProgressionKnowledge.rank4.sourceUrl },
  { id: 'professions-event', label: 'Published 2x Professions rules', value: 'Half Morale cost; double Masterwork-node resources; no doubled task XP', status: 'historical', lastVerified: '2026-09-17', note: 'Publisher rules dated 21 June 2022. Check the current calendar; no event is assumed active.', sourceUrl: 'https://www.playneverwinter.com/en/news-details/11519393' },
  { id: 'xp-curve', label: 'Profession XP curve Level 1-20', value: 'Unknown / excluded', status: 'unknown', lastVerified: '2026-09-17', note: 'Obsolete pre-2021 XP tables must not be reused.' },
  { id: 'chultan-bind', label: 'Modern Chultan Choice Pack binding', value: 'Unknown / excluded', status: 'unknown', lastVerified: '2026-09-17' },
  { id: 'stronghold-gate', label: 'Exact modern Stronghold purchase gate', value: 'Unknown / excluded', status: 'unknown', lastVerified: '2026-09-17' },
  { id: 'cross-profession-gates', label: 'Minimum later-book prerequisites and binding', value: 'Confirm the current quest and vendor', status: 'unknown', lastVerified: '2026-09-17', note: 'A demonstration buying all seven book sets does not establish the minimum necessary for one profession.' },
]
''' + s[b:]
s=s.replace("const explicitAcquisition = rawMaterials.filter((material) => Boolean(material.acquisition && material.acquisition.type !== 'unknown'))", "const sourceGuides = [...new Map([...materialSourceRecords, ...rawMaterials.map((material) => getMaterialSourceGuide(material.name))].map((guide) => [guide.name, guide])).values()]")
s=s.replace('acquisitionUnknown: rawMaterials.length - explicitAcquisition.length,', "acquisitionUnknown: sourceGuides.filter((guide) => guide.status === 'unresolved').length,\n      acquisitionTracked: sourceGuides.length,")
s=s.replace("      professionMechanics.xpThresholds === null ? 'Profession XP thresholds Level 1\u219220' : null,", "      professionMechanics.xpThresholds === null ? 'Profession XP thresholds Level 1\u219220' : null,\n      'Current Morale refill rate and Workshop capacities',\n      'Rescaled Workshop quest triggers',\n      'Minimum cross-profession gates and later-book binding',\n      'Complete standard/Chultan recipe inventories and later tiers',")
f.write_text(s)
f=p/'src/components/DataHealthPage.tsx';s=f.read_text().replace('raw-material records still lack structured acquisition metadata. The schema may support vendor/gathering/drop/campaign data without inventing locations.', 'of {report.queues.acquisitionTracked} tracked acquisition records have no established route. Published and historical guides are not live-game verification.')
s=s.replace('<h2>Three research gaps</h2>', '<h2>Unresolved research fields</h2>').replace('Ignored by user approval \u00b7 never coerced to zero/false','Not treated as confirmed live-game data')
s=s.replace('Use the last-verified date to target future live-game reverification rather than re-researching everything blindly.', 'Dates below record literature review, not in-game observation. Open the source and check the current tooltip before relying on patch-sensitive values.').replace('<th>Last verified</th>', '<th>Reviewed</th>')
s=s.replace('{entry.label}{entry.note', '{entry.label}{entry.sourceUrl && <a href={entry.sourceUrl} target="_blank" rel="noopener noreferrer"> Read source<span className="sr-only"> (opens in a new tab)</span></a>}{entry.note')
f.write_text(s)

for name in ['apply-quality-fixes.mjs','apply-next-level-integration.mjs','apply-ux-integration.mjs','apply-material-source-integration.mjs']:
    (p/'scripts'/name).unlink()
(p/'src/components/WorkshopJourney.tsx').unlink()
f=p/'scripts/precompile-catalog.mjs';s=f.read_text();s=s[:s.index("const path = 'src/data/catalog.ts'")]+"console.log('Catalog data generated; authored source remains unchanged.')\n";f.write_text(s)
f=p/'.gitignore';s=f.read_text()+'\nsrc/data/catalog.generated.ts\ntest-results/\nplaywright-results.json\nplaywright-report/\n';f.write_text(s)
f=p/'package.json';d=json.loads(f.read_text());d['scripts']['prebuild']='npm run verify:sources && node scripts/precompile-catalog.mjs';d['scripts']['verify:journey']='node --experimental-strip-types scripts/verify-journey.mjs';d['scripts']['verify:release']='npm run verify:recipes && npm run verify:knowledge && npm run test:domain && npm run verify:journey';f.write_text(json.dumps(d,indent=2)+'\n')
f=p/'tests/e2e.spec.ts';s=f.read_text().replace("locator('.journey-roadmap-step')).toHaveCount(5)","locator('.journey-roadmap-step')).toHaveCount(9)")
s=s.replace("toHaveURL(/\\/journey$/)", "toHaveURL(/\\/journey(?:\\?|$)/)");f.write_text(s)
print('Native UI integrations, responsive navigation, facts and calculation guards finalized.')
