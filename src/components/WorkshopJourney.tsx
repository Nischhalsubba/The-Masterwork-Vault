import { useEffect, useMemo, useState } from 'react'
import { BadgeCheck, BookOpen, ChevronRight, CircleHelp, Coins, Gem, Hammer, X } from 'lucide-react'
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
    title: 'Acquire Chultan Masterwork I, then II',
    summary: 'The modern book-purchase sequence starts with the two Chultan stages and must be completed in order.',
    tasks: [
      'Purchase and unlock Chultan Masterwork I before Chultan Masterwork II.',
      `Budget ${masterworkUnlockPrices[firstProfession].chultanMW1.toLocaleString()} AD for Chultan I and ${masterworkUnlockPrices[firstProfession].chultanMW2.toLocaleString()} AD for Chultan II per profession.`,
      'Do not treat the modern Chultan Choice Pack binding state as known; it is intentionally excluded from this implementation.',
      'Do not hardcode a Guild Hall, Marketplace, or Stronghold rank gate; that exact modern lock is intentionally excluded from this implementation.',
    ],
  },
  {
    id: 'sharandar',
    rank: 'SHARANDAR',
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
              <div>
                <span className="journey-eyebrow">WORKSHOP → CHULTAN → SHARANDAR → MENZOBERRANZAN</span>
                <h2 id="workshop-journey-title">Current Masterwork progression</h2>
                <p>Follow the modern profession and Masterwork path without inheriting obsolete pre-2021 gates. Three user-approved unknowns are intentionally excluded rather than guessed.</p>
              </div>
              <button type="button" className="journey-close" onClick={closeGuide} aria-label="Close Masterwork progression guide"><X size={22} /></button>
            </header>

            <div className="workshop-journey-scroll">
              <div className="journey-caveat">
                <CircleHelp size={20} aria-hidden="true" />
                <div><strong>Three fields intentionally remain outside the model.</strong><p>Exact profession XP thresholds from Level 1→20, modern Chultan Choice Pack binding, and the exact current Stronghold purchase gate are not used as blockers or guessed values. Everything else below uses the current researched model.</p></div>
              </div>

              <section className="journey-progress" aria-label="Journey progress">
                <div><span>Your progress</span><strong>{completed.size}/{phases.length} phases</strong></div>
                <div className="journey-progress-track"><span style={{ width: `${progress}%` }} /></div>
              </section>

              <div className="journey-phases">
                {phases.map((phase, index) => {
                  const done = completed.has(phase.id)
                  return (
                    <article className={`journey-phase ${done ? 'done' : ''}`} key={phase.id}>
                      <button type="button" className="journey-phase-check" onClick={() => togglePhase(phase.id)} aria-pressed={done} aria-label={`${done ? 'Mark incomplete' : 'Mark complete'}: ${phase.title}`}>
                        {done ? <BadgeCheck size={22} /> : <span>{index + 1}</span>}
                      </button>
                      <div className="journey-phase-body">
                        <div className="journey-phase-title"><span>{phase.rank}</span><h3>{phase.title}</h3></div>
                        <p>{phase.summary}</p>
                        <ul>{phase.tasks.map((task) => <li key={task}>{task}</li>)}</ul>
                      </div>
                    </article>
                  )
                })}
              </div>

              <section className="journey-calculator">
                <div className="journey-section-heading"><Coins size={20} /><div><span>CURRENT WORKSHOP ECONOMY</span><h3>Morale refill calculator</h3></div></div>
                <p>Estimate the base Astral Diamond cost of restoring Workshop Morale. VIP or other applicable discounts are intentionally not baked into the base value.</p>
                <div className="journey-calculator-grid">
                  <label><span>Morale to restore</span><input type="number" min="0" max="400" inputMode="numeric" value={moraleToRestore} onChange={(event) => setMoraleToRestore(Math.max(0, Math.min(400, Number(event.target.value) || 0)))} /></label>
                  <label><span>Professions event</span><select value={doubleProfessions ? 'double' : 'normal'} onChange={(event) => setDoubleProfessions(event.target.value === 'double')}><option value="normal">Normal Morale costs</option><option value="double">2x Professions · half Morale cost</option></select></label>
                </div>
                <div className="journey-result"><span>Base refill cost</span><strong>{moraleRefillCost.toLocaleString()} AD</strong><small>{moraleToRestore.toLocaleString()} Morale × {professionMechanics.moraleRefillAdPerPoint.toLocaleString()} AD · task Morale multiplier {effectiveMoralePerTaskMultiplier}×</small></div>
              </section>

              <section className="journey-calculator">
                <div className="journey-section-heading"><Gem size={20} /><div><span>DIRECT BOOK BUDGET</span><h3>Masterwork unlock purchases</h3></div></div>
                <p>This estimates direct recipe-book purchases only. Materials, tools, failures, commissions and Morale refills are separate.</p>
                <div className="journey-calculator-grid">
                  <label><span>Profession</span><select value={profession} onChange={(event) => setProfession(event.target.value)}>{professions.map((name) => <option value={name} key={name}>{name}</option>)}</select></label>
                  <div className="journey-budget-summary"><span>Through Menzoberranzan</span><strong>{fullPathPerProfession.toLocaleString()} AD</strong><small>for {profession}</small></div>
                </div>
                <div className="journey-budget-grid">
                  <div><span>Chultan I + II</span><strong>{(unlockRow.chultanMW1 + unlockRow.chultanMW2).toLocaleString()} AD</strong></div>
                  <div><span>Sharandar</span><strong>{unlockRow.sharandarMW.toLocaleString()} AD</strong></div>
                  <div><span>Menzoberranzan</span><strong>{unlockRow.menzoberranzanMW.toLocaleString()} AD</strong></div>
                </div>
                <p className="journey-budget-total">All seven professions: <strong>{allProfessionTotals.chultan.toLocaleString()} AD Chultan</strong> · <strong>{allProfessionTotals.sharandar.toLocaleString()} AD Sharandar</strong> · <strong>{allProfessionTotals.menzoberranzan.toLocaleString()} AD Menzoberranzan</strong></p>
              </section>

              <section className="journey-next">
                <div className="journey-section-heading"><Hammer size={20} /><div><span>WHEN ACCESS IS READY</span><h3>Move from progression to production</h3></div></div>
                <div className="journey-next-grid">
                  <div><strong>1. Catalog</strong><p>Choose Sharandar or Underdark and find the craftable you want.</p></div>
                  <ChevronRight aria-hidden="true" />
                  <div><strong>2. Recipe tree</strong><p>Open crafted ingredients until every dependency is understood.</p></div>
                  <ChevronRight aria-hidden="true" />
                  <div><strong>3. Plan</strong><p>Combine crafts so shared materials, output batches and leftovers are calculated together.</p></div>
                </div>
              </section>

              <footer className="journey-sources">
                <strong>Knowledge policy</strong>
                <p>Current researched progression rules are kept separate from historical Workshop strategies. Null means unknown, never zero. The old Rank-4 Masterwork gate remains recorded only as superseded history.</p>
              </footer>
            </div>
          </section>
        </div>
      )}
    </>
  )
}
