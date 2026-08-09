import { useEffect, useMemo, useState } from 'react'
import { BadgeCheck, BookOpen, CheckCircle2, ChevronLeft, ChevronRight, CircleHelp, Coins, Gem, Hammer, X } from 'lucide-react'
import {
  masterworkProgression,
  masterworkUnlockPrices,
  professionMechanics,
  workshopProgressionKnowledge,
} from '../data/craftingKnowledgePool'

const PROGRESS_KEY = 'masterwork-vault.workshop-journey.v2'
const GUIDE_HASH = '#masterwork-journey'

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

function clearGuideHash() {
  if (window.location.hash !== GUIDE_HASH) return
  window.history.replaceState(window.history.state, '', `${window.location.pathname}${window.location.search}`)
}

export function WorkshopJourney() {
  const [open, setOpen] = useState(() => window.location.hash === GUIDE_HASH)
  const [completed, setCompleted] = useState<Set<PhaseId>>(() => readProgress())
  const [moraleToRestore, setMoraleToRestore] = useState(100)
  const [doubleProfessions, setDoubleProfessions] = useState(false)
  const [profession, setProfession] = useState(firstProfession)
  const [activePhaseId, setActivePhaseId] = useState<PhaseId>('foundation')

  useEffect(() => {
    const syncHash = () => setOpen(window.location.hash === GUIDE_HASH)
    window.addEventListener('hashchange', syncHash)
    return () => window.removeEventListener('hashchange', syncHash)
  }, [])

  useEffect(() => {
    try {
      window.localStorage.setItem(PROGRESS_KEY, JSON.stringify([...completed]))
    } catch {
      // The guide remains usable when storage is unavailable.
    }
  }, [completed])

  useEffect(() => {
    if (!open) return
    const firstIncomplete = phases.find((phase) => !completed.has(phase.id))
    setActivePhaseId(firstIncomplete?.id ?? phases[phases.length - 1].id)
  }, [open])

  useEffect(() => {
    if (!open) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        clearGuideHash()
        setOpen(false)
      }
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [open])

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
      return next
    })
  }

  const openGuide = () => {
    if (window.location.hash !== GUIDE_HASH) window.location.hash = GUIDE_HASH
    setOpen(true)
  }

  const closeGuide = () => {
    clearGuideHash()
    setOpen(false)
  }

  return (
    <>
      <button className="workshop-journey-launcher" type="button" onClick={openGuide} aria-haspopup="dialog">
        <BookOpen size={18} aria-hidden="true" />
        <span>{completed.size ? `Journey ${completed.size}/${phases.length}` : 'Masterwork journey'}</span>
      </button>

      {open && (
        <div className="workshop-journey-layer" role="presentation" onMouseDown={(event) => {
          if (event.currentTarget === event.target) closeGuide()
        }}>
          <section className="workshop-journey-sheet" role="dialog" aria-modal="true" aria-labelledby="workshop-journey-title">
            <header className="workshop-journey-header">
              <div className="journey-header-copy">
                <span className="journey-eyebrow">WORKSHOP → CHULTAN → SHARANDAR → MENZOBERRANZAN</span>
                <h2 id="workshop-journey-title">Masterwork journey</h2>
                <p>A focused progression workspace: see the whole route, open one milestone at a time, and keep the useful planning tools nearby.</p>
              </div>
              <div className="journey-header-progress" aria-label={`${progress}% of Masterwork journey complete`}>
                <div><span>Journey progress</span><strong>{progress}%</strong></div>
                <div className="journey-progress-track"><span style={{ width: `${progress}%` }} /></div>
                <small>{completed.size} of {phases.length} milestones complete</small>
              </div>
              <button type="button" className="journey-close" onClick={closeGuide} aria-label="Close Masterwork progression guide"><X size={22} /></button>
            </header>

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

            <div className="workshop-journey-scroll">
              <div className="journey-workspace">
                <section className="journey-stage-card" aria-labelledby={`journey-stage-${activePhase.id}`}>
                  <div className="journey-stage-main">
                    <div className="journey-stage-heading">
                      <span className="journey-stage-number">{activeIndex + 1}</span>
                      <div>
                        <small>{activePhase.rank} · MILESTONE {activeIndex + 1} OF {phases.length}</small>
                        <h3 id={`journey-stage-${activePhase.id}`}>{activePhase.title}</h3>
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
                    {nextPhase && <div className="journey-up-next"><span>Up next</span><strong>{nextPhase.navTitle}</strong><small>{nextPhase.title}</small></div>}
                    {!nextPhase && <div className="journey-up-next"><span>Route complete</span><strong>Move into production</strong><small>Use the Catalog, recipe tree, and Plan to turn access into actual crafts.</small></div>}
                  </aside>

                  <footer className="journey-stage-actions">
                    <button type="button" onClick={() => previousPhase && setActivePhaseId(previousPhase.id)} disabled={!previousPhase}><ChevronLeft size={17} aria-hidden="true" />Previous</button>
                    <span>{activePhase.navTitle}</span>
                    <button type="button" onClick={() => nextPhase && setActivePhaseId(nextPhase.id)} disabled={!nextPhase}>Next<ChevronRight size={17} aria-hidden="true" /></button>
                  </footer>
                </section>

                <section className="journey-tools" aria-labelledby="journey-tools-title">
                  <div className="journey-tools-heading">
                    <div><span>PLANNING TOOLS</span><h3 id="journey-tools-title">Useful numbers without leaving the journey</h3></div>
                    <p>These are supporting calculators, not another progression chapter.</p>
                  </div>

                  <div className="journey-tools-grid">
                    <article className="journey-tool-card">
                      <div className="journey-section-heading"><Coins size={20} aria-hidden="true" /><div><span>WORKSHOP ECONOMY</span><h4>Morale refill</h4></div></div>
                      <p>Estimate the base Astral Diamond cost of restoring Workshop Morale. VIP or other applicable discounts are not baked into the base value.</p>
                      <div className="journey-calculator-grid">
                        <label><span>Morale to restore</span><input type="number" min="0" max="400" inputMode="numeric" value={moraleToRestore} onChange={(event) => setMoraleToRestore(Math.max(0, Math.min(400, Number(event.target.value) || 0)))} /></label>
                        <label><span>Professions event</span><select value={doubleProfessions ? 'double' : 'normal'} onChange={(event) => setDoubleProfessions(event.target.value === 'double')}><option value="normal">Normal Morale costs</option><option value="double">2x Professions · half Morale cost</option></select></label>
                      </div>
                      <div className="journey-result"><span>Base refill cost</span><strong>{moraleRefillCost.toLocaleString()} AD</strong><small>{moraleToRestore.toLocaleString()} Morale × {professionMechanics.moraleRefillAdPerPoint.toLocaleString()} AD · task Morale multiplier {effectiveMoralePerTaskMultiplier}×</small></div>
                    </article>

                    <article className="journey-tool-card">
                      <div className="journey-section-heading"><Gem size={20} aria-hidden="true" /><div><span>DIRECT BOOK BUDGET</span><h4>Masterwork unlocks</h4></div></div>
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
                  <div className="journey-section-heading"><Hammer size={20} aria-hidden="true" /><div><span>WHEN ACCESS IS READY</span><h3>Progression becomes production</h3></div></div>
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
            </div>
          </section>
        </div>
      )}
    </>
  )
}
