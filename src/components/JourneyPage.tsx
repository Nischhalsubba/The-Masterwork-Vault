import { useMemo, useState } from 'react'
import {
  BadgeCheck,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Coins,
  Gem,
  Hammer,
} from 'lucide-react'
import {
  masterworkProgression,
  masterworkUnlockPrices,
  professionMechanics,
  workshopProgressionKnowledge,
} from '../data/craftingKnowledgePool'

const PROGRESS_KEY = 'masterwork-vault.workshop-journey.v2'
const professions = Object.keys(masterworkUnlockPrices)
const firstProfession = professions[0] ?? 'Alchemy'

const phases = [
  {
    id: 'foundation',
    rank: 'START',
    navTitle: 'Workshop basics',
    title: 'Unlock the Workshop and learn the daily economy',
    summary: `Modern professions cap at Level ${professionMechanics.maxLevel}. Your Workshop has ${professionMechanics.dailyMorale} Morale each day for instant crafts.`,
    tasks: [
      'Unlock the Workshop from character Level 8 through A Workshop Opportunity from Sergeant Knox.',
      `Treat ${professionMechanics.dailyMorale} daily Morale as your fast-crafting budget; normal crafting can continue over time without spending Morale.`,
      `Base Morale restoration costs ${professionMechanics.moraleRefillAdPerPoint.toLocaleString()} AD per point before applicable discounts.`,
      'Successful crafts grant profession/artisan XP. Failed crafts consume ingredients and any Morale spent.',
    ],
  },
  {
    id: 'workshop',
    rank: 'WORKSHOP',
    navTitle: 'Workshop ranks',
    title: 'Advance Workshop ranks without confusing them with Masterwork access',
    summary: 'Workshop progression remains useful, but Rank 4 is no longer the modern gate for buying Masterwork recipe books.',
    tasks: [
      ...workshopProgressionKnowledge.questTriggers.map((row) => `Profession Level ${row.professionLevel}: ${row.quest} — ${row.outcome}.`),
      `Current artisan capacity by Workshop rank: ${Object.entries(workshopProgressionKnowledge.artisanCapacityByRank).map(([rank, count]) => `R${rank} ${count}`).join(' · ')}.`,
      `Grand Upgrade currently uses ${workshopProgressionKnowledge.rank4.southSeaTradingCompanyCredits.toLocaleString()} South Sea Trading Company Credits.`,
      'The October 2021 professions rework superseded the old “Workshop Rank 4 required for Masterwork books” rule.',
    ],
  },
  {
    id: 'chultan',
    rank: 'CHULTAN',
    navTitle: 'Chultan I & II',
    title: 'Acquire Chultan Masterwork I, then II',
    summary: 'The modern book-purchase sequence starts with the two Chultan stages and must be completed in order.',
    tasks: [
      'Purchase and unlock Chultan Masterwork I before Chultan Masterwork II.',
      `Budget ${masterworkUnlockPrices[firstProfession].chultanMW1.toLocaleString()} AD for Chultan I and ${masterworkUnlockPrices[firstProfession].chultanMW2.toLocaleString()} AD for Chultan II per profession.`,
      'Complete both Chultan stages before moving into Sharandar Masterwork progression.',
    ],
  },
  {
    id: 'sharandar',
    rank: 'SHARANDAR',
    navTitle: 'Sharandar',
    title: 'Complete Chultan and unlock Sharandar Masterwork',
    summary: `Sharandar recipes are Level ${masterworkProgression.sharandar.professionLevel} profession crafts and the book costs ${masterworkProgression.sharandar.pricePerProfession.toLocaleString()} AD per profession.`,
    tasks: [
      'Own the required Chultan Masterwork recipe progression before Sharandar.',
      `Reach profession Level ${masterworkProgression.sharandar.professionLevel}.`,
      `Buy the profession book from ${masterworkProgression.sharandar.vendor} in ${masterworkProgression.sharandar.location}.`,
      `The Sharandar book is recorded as ${masterworkProgression.sharandar.bind.toLowerCase()}-bound and consumed to unlock the profession recipes.`,
    ],
  },
  {
    id: 'menzoberranzan',
    rank: 'MENZOBERRANZAN',
    navTitle: 'Menzoberranzan',
    title: 'Finish the full prerequisite chain for Menzoberranzan',
    summary: 'This tier is account-planning heavy: every profession and the earlier Masterwork tiers matter before the final profession book purchase.',
    tasks: [
      `Reach Level ${masterworkProgression.menzoberranzan.professionLevel} in all seven professions.`,
      'Own all Chultan Masterwork recipes and all Sharandar Masterwork books.',
      `Complete ${masterworkProgression.menzoberranzan.quest}.`,
      `Buy the profession book for ${masterworkProgression.menzoberranzan.pricePerProfession.toLocaleString()} AD from the ${masterworkProgression.menzoberranzan.vendor} in ${masterworkProgression.menzoberranzan.location}.`,
    ],
  },
] as const

type PhaseId = typeof phases[number]['id']

function readProgress(): Set<PhaseId> {
  try {
    const raw = window.localStorage.getItem(PROGRESS_KEY)
    const values = raw ? JSON.parse(raw) as string[] : []
    const allowed = new Set(phases.map((phase) => phase.id))
    return new Set(values.filter((value): value is PhaseId => allowed.has(value as PhaseId)))
  } catch {
    return new Set()
  }
}

function saveProgress(completed: Set<PhaseId>) {
  try {
    window.localStorage.setItem(PROGRESS_KEY, JSON.stringify([...completed]))
  } catch {
    // Progress tracking remains optional if storage is unavailable.
  }
}

export function JourneyLauncher() {
  const [completed] = useState<Set<PhaseId>>(() => readProgress())
  return (
    <a className="workshop-journey-launcher" href="/journey" aria-label="Open Masterwork journey">
      <BookOpen size={18} aria-hidden="true" />
      <span>{completed.size ? `Journey ${completed.size}/${phases.length}` : 'Masterwork journey'}</span>
    </a>
  )
}

export function JourneyPage() {
  const initialProgress = useMemo(() => readProgress(), [])
  const [completed, setCompleted] = useState<Set<PhaseId>>(initialProgress)
  const [activePhaseId, setActivePhaseId] = useState<PhaseId>(() => phases.find((phase) => !initialProgress.has(phase.id))?.id ?? phases[phases.length - 1].id)
  const [moraleToRestore, setMoraleToRestore] = useState(100)
  const [doubleProfessions, setDoubleProfessions] = useState(false)
  const [profession, setProfession] = useState(firstProfession)

  const progress = Math.round((completed.size / phases.length) * 100)
  const unlockRow = masterworkUnlockPrices[profession] ?? masterworkUnlockPrices[firstProfession]
  const moraleRefillCost = moraleToRestore * professionMechanics.moraleRefillAdPerPoint
  const effectiveMoralePerTaskMultiplier = doubleProfessions
    ? professionMechanics.doubleProfessionsEvent.moraleCostMultiplier
    : 1
  const fullPathPerProfession = unlockRow.chultanMW1 + unlockRow.chultanMW2 + unlockRow.sharandarMW + unlockRow.menzoberranzanMW
  const allProfessionTotals = useMemo(() => ({
    chultan: professions.reduce((sum, name) => sum + masterworkUnlockPrices[name].chultanMW1 + masterworkUnlockPrices[name].chultanMW2, 0),
    sharandar: professions.reduce((sum, name) => sum + masterworkUnlockPrices[name].sharandarMW, 0),
    menzoberranzan: professions.reduce((sum, name) => sum + masterworkUnlockPrices[name].menzoberranzanMW, 0),
  }), [])
  const allProfessionGrandTotal = allProfessionTotals.chultan + allProfessionTotals.sharandar + allProfessionTotals.menzoberranzan
  const activeIndex = Math.max(0, phases.findIndex((phase) => phase.id === activePhaseId))
  const activePhase = phases[activeIndex]
  const previousPhase = activeIndex > 0 ? phases[activeIndex - 1] : null
  const nextPhase = activeIndex < phases.length - 1 ? phases[activeIndex + 1] : null
  const activeDone = completed.has(activePhase.id)

  const togglePhase = (id: PhaseId) => {
    setCompleted((previous) => {
      const next = new Set(previous)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      saveProgress(next)
      return next
    })
  }

  return (
    <div className="journey-page">
      <header className="journey-page-topbar">
        <a className="journey-page-brand" href="/catalog" aria-label="The Masterwork Vault catalog">
          <img src="/assets/brand/masterwork-vault-mark.svg" alt="" />
          <span><strong>The Masterwork Vault</strong><small>Underdark + Sharandar Masterwork</small></span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="/catalog">Catalog</a>
          <a href="/plan">Plan</a>
          <a href="/materials">Materials</a>
          <a href="/reference">Reference</a>
          <a href="/journey" aria-current="page">Journey</a>
        </nav>
      </header>

      <main id="main-content" className="journey-page-main">
        <section className="journey-page-hero">
          <div className="journey-page-hero-copy">
            <a className="journey-back-link" href="/catalog"><ChevronLeft size={17} aria-hidden="true" />Back to Catalog</a>
            <span className="journey-eyebrow">WORKSHOP → CHULTAN → SHARANDAR → MENZOBERRANZAN</span>
            <h1>Masterwork journey</h1>
            <p>See the whole progression route, focus on one milestone at a time, and keep the useful planning numbers beside the path instead of inside another popup.</p>
          </div>
          <div className="journey-header-progress" aria-label={`${progress}% of Masterwork journey complete`}>
            <div><span>Journey progress</span><strong>{progress}%</strong></div>
            <div className="journey-progress-track"><span style={{ width: `${progress}%` }} /></div>
            <small>{completed.size} of {phases.length} milestones complete</small>
          </div>
        </section>

        <nav className="journey-roadmap" aria-label="Masterwork milestones">
          <div className="journey-roadmap-track">
            {phases.map((phase, index) => {
              const done = completed.has(phase.id)
              const active = phase.id === activePhase.id
              return (
                <button
                  type="button"
                  className={`journey-roadmap-step ${done ? 'done' : ''} ${active ? 'active' : ''}`}
                  onClick={() => setActivePhaseId(phase.id)}
                  aria-current={active ? 'step' : undefined}
                  key={phase.id}
                >
                  <span className="journey-roadmap-node">{done ? <BadgeCheck size={20} aria-hidden="true" /> : index + 1}</span>
                  <span className="journey-roadmap-label"><small>{phase.rank}</small><strong>{phase.navTitle}</strong></span>
                </button>
              )
            })}
          </div>
        </nav>

        <div className="journey-workspace">
          <section className="journey-stage-card" aria-labelledby={`journey-stage-${activePhase.id}`}>
            <div className="journey-stage-main">
              <div className="journey-stage-heading">
                <span className="journey-stage-number">{activeIndex + 1}</span>
                <div>
                  <small>{activePhase.rank} · MILESTONE {activeIndex + 1} OF {phases.length}</small>
                  <h2 id={`journey-stage-${activePhase.id}`}>{activePhase.title}</h2>
                  <p>{activePhase.summary}</p>
                </div>
              </div>

              <div className="journey-task-section">
                <div className="journey-task-heading"><span>WHAT TO DO</span><strong>{activePhase.tasks.length} checkpoints</strong></div>
                <div className="journey-task-grid">
                  {activePhase.tasks.map((task) => (
                    <div className="journey-task" key={task}><CheckCircle2 size={18} aria-hidden="true" /><p>{task}</p></div>
                  ))}
                </div>
              </div>
            </div>

            <aside className={`journey-stage-status ${activeDone ? 'done' : ''}`}>
              <span>Milestone status</span>
              <strong>{activeDone ? 'Complete' : 'Current focus'}</strong>
              <p>{activeDone ? 'You marked this milestone complete. You can revisit it anytime from the roadmap.' : 'Work through the checkpoints, then mark this milestone complete to update the route.'}</p>
              <button type="button" className="journey-complete-button" onClick={() => togglePhase(activePhase.id)} aria-pressed={activeDone}>
                {activeDone ? <><BadgeCheck size={18} aria-hidden="true" />Mark incomplete</> : <><CheckCircle2 size={18} aria-hidden="true" />Mark milestone complete</>}
              </button>
              {nextPhase ? (
                <div className="journey-up-next"><span>Up next</span><strong>{nextPhase.navTitle}</strong><small>{nextPhase.title}</small></div>
              ) : (
                <div className="journey-up-next"><span>Route complete</span><strong>Move into production</strong><small>Use the Catalog, recipe tree, and Plan to turn access into actual crafts.</small></div>
              )}
            </aside>

            <footer className="journey-stage-actions">
              <button type="button" onClick={() => previousPhase && setActivePhaseId(previousPhase.id)} disabled={!previousPhase}><ChevronLeft size={17} aria-hidden="true" />Previous</button>
              <span>{activePhase.navTitle}</span>
              <button type="button" onClick={() => nextPhase && setActivePhaseId(nextPhase.id)} disabled={!nextPhase}>Next<ChevronRight size={17} aria-hidden="true" /></button>
            </footer>
          </section>

          <section className="journey-tools" aria-labelledby="journey-tools-title">
            <div className="journey-tools-heading">
              <div><span>PLANNING TOOLS</span><h2 id="journey-tools-title">Useful numbers without leaving the journey</h2></div>
              <p>These are supporting calculators, not another progression chapter.</p>
            </div>

            <div className="journey-tools-grid">
              <article className="journey-tool-card">
                <div className="journey-section-heading"><Coins size={20} aria-hidden="true" /><div><span>WORKSHOP ECONOMY</span><h3>Morale refill</h3></div></div>
                <p>Estimate the base Astral Diamond cost of restoring Workshop Morale. VIP or other applicable discounts are not baked into the base value.</p>
                <div className="journey-calculator-grid">
                  <label><span>Morale to restore</span><input type="number" min="0" max="400" inputMode="numeric" value={moraleToRestore} onChange={(event) => setMoraleToRestore(Math.max(0, Math.min(400, Number(event.target.value) || 0)))} /></label>
                  <label><span>Professions event</span><select value={doubleProfessions ? 'double' : 'normal'} onChange={(event) => setDoubleProfessions(event.target.value === 'double')}><option value="normal">Normal Morale costs</option><option value="double">2x Professions · half Morale cost</option></select></label>
                </div>
                <div className="journey-result"><span>Base refill cost</span><strong>{moraleRefillCost.toLocaleString()} AD</strong><small>{moraleToRestore.toLocaleString()} Morale × {professionMechanics.moraleRefillAdPerPoint.toLocaleString()} AD · task Morale multiplier {effectiveMoralePerTaskMultiplier}×</small></div>
              </article>

              <article className="journey-tool-card">
                <div className="journey-section-heading"><Gem size={20} aria-hidden="true" /><div><span>DIRECT BOOK BUDGET</span><h3>Masterwork unlocks</h3></div></div>
                <p>Direct recipe-book purchases only. Materials, tools, failures, commissions and Morale refills remain separate.</p>
                <label className="journey-profession-field"><span>Profession</span><select value={profession} onChange={(event) => setProfession(event.target.value)}>{professions.map((name) => <option value={name} key={name}>{name}</option>)}</select></label>
                <div className="journey-budget-hero"><span>Through Menzoberranzan</span><strong>{fullPathPerProfession.toLocaleString()} AD</strong><small>for {profession}</small></div>
                <div className="journey-budget-grid">
                  <div><span>Chultan I + II</span><strong>{(unlockRow.chultanMW1 + unlockRow.chultanMW2).toLocaleString()} AD</strong></div>
                  <div><span>Sharandar</span><strong>{unlockRow.sharandarMW.toLocaleString()} AD</strong></div>
                  <div><span>Menzoberranzan</span><strong>{unlockRow.menzoberranzanMW.toLocaleString()} AD</strong></div>
                </div>
                <p className="journey-budget-total">All seven professions through the full route: <strong>{allProfessionGrandTotal.toLocaleString()} AD</strong></p>
              </article>
            </div>
          </section>

          <section className="journey-next">
            <div className="journey-section-heading"><Hammer size={20} aria-hidden="true" /><div><span>WHEN ACCESS IS READY</span><h2>Progression becomes production</h2></div></div>
            <div className="journey-next-grid">
              <div><strong>1. Catalog</strong><p>Choose Sharandar or Underdark and find the craftable you want.</p></div>
              <ChevronRight aria-hidden="true" />
              <div><strong>2. Recipe tree</strong><p>Open crafted ingredients until every dependency is understood.</p></div>
              <ChevronRight aria-hidden="true" />
              <div><strong>3. Plan</strong><p>Combine crafts so shared materials, output batches and leftovers are calculated together.</p></div>
            </div>
          </section>

          <details className="journey-evidence-note">
            <summary><CircleHelp size={18} aria-hidden="true" /><span>Evidence boundaries</span><small>3 intentionally excluded fields</small></summary>
            <p>Exact profession XP thresholds from Level 1→20, modern Chultan Choice Pack binding, and the exact current Stronghold purchase gate are not used as blockers or guessed values. Null still means unknown, never zero.</p>
          </details>
        </div>
      </main>

      <footer className="journey-page-footer">
        <img src="/assets/brand/masterwork-vault-mark.svg" alt="" />
        <p><strong>The Masterwork Vault</strong> · Current Masterwork progression and planning reference.</p>
      </footer>
    </div>
  )
}
