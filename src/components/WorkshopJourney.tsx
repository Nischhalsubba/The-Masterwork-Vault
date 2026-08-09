import { useEffect, useMemo, useState } from 'react'
import { BadgeCheck, BookOpen, ChevronRight, CircleHelp, Gem, Hammer, X } from 'lucide-react'

const PROGRESS_KEY = 'masterwork-vault.workshop-journey.v1'
const GUIDE_HASH = '#masterwork-journey'

const phases = [
  {
    id: 'foundation',
    rank: 'START',
    title: 'Build a workshop that can fund itself',
    summary: 'Learn the daily action economy before you chase Masterwork recipes.',
    tasks: [
      'Unlock the physical Workshop through the introductory Protector’s Enclave profession questline.',
      'Treat Morale as your daily fast-action budget. Spending it carelessly makes every later grind slower.',
      'Build a gold reserve for artisan commissions. The supplied historical guide demonstrates a Leatherworking → Leather Visor vendor loop as an early funding method.',
      'Keep Blacksmithing in your plan because profession tools become part of the workshop’s internal supply chain.',
    ],
  },
  {
    id: 'rank-2',
    rank: 'RANK 2',
    title: 'Level one profession far enough to advance',
    summary: 'The historical Module 15 guide uses profession level 15 as the early progression gate.',
    tasks: [
      'Concentrate Morale and gathering on one profession instead of spreading early progress across every profession.',
      'The supplied guide recommends Alchemy as a practical early focus and uses Honey as both profession XP progression and a later commission item.',
      'If an upgrade NPC offers no useful progression dialogue, re-check profession-level prerequisites before assuming the quest is broken.',
    ],
  },
  {
    id: 'rank-3',
    rank: 'RANK 3',
    title: 'Prepare for the South Sea credit grind',
    summary: 'The supplied guide gives 500,000 South Sea Trading Company Credits as the Rank 3 target.',
    tasks: [
      'Accepted commission items rotate, so pre-craft useful turn-ins and wait for the matching list instead of crafting only after reset.',
      'The guide highlights Beeswax as a historical bulk route: Alchemy level 44, 225 base credits each, or 2,223 standard Beeswax from zero to 500,000.',
      'Higher-quality outputs reduce the number of crafts needed, so artisan quality and proficiency matter before the quantities become painful.',
    ],
  },
  {
    id: 'rank-4',
    rank: 'RANK 4',
    title: 'Plan the Grand Upgrade as a logistics problem',
    summary: 'The guide records a historical 5,000,000-credit requirement later reduced to 2,500,000, with stale quest text sometimes still showing the old value.',
    tasks: [
      'Verify the current in-game target before committing materials. The supplied source describes both 5M and 2.5M values from different patches.',
      'The historical guide uses profession level 20 as another prerequisite before the Grand Upgrade can proceed.',
      'Choose a production route around what limits you most: Morale, raw materials, gold/AD, or real-world time. The guide discusses Myrrh, Black Ink, Sapphire Chokers, and Gold Pendants as historical strategies.',
      'Do not copy old Auction House profit assumptions into a modern plan. Prices are server- and patch-dependent.',
    ],
  },
  {
    id: 'masterwork-ready',
    rank: 'MASTERWORK',
    title: 'Graduate from Workshop management to Masterwork planning',
    summary: 'Rank 4 is the doorway. Your artisan roster, tools, Focus, Proficiency, and material chains become the real system.',
    tasks: [
      'Prioritize strong Focus and Proficiency once high-quality checks matter.',
      'The supplied guide emphasizes Dab Hand for bonus output and commission-cost reduction for expensive production, but treat exact profitability as historical rather than current market truth.',
      'Use the Vault’s Sharandar and Underdark collections to inspect recipes, drill into crafted components, expand from-scratch requirements, and build a consolidated Plan.',
      'Keep screenshot-backed recipe evidence separate from historical workshop strategy. Missing recipe evidence should remain unknown instead of becoming a zero-cost craft.',
    ],
  },
] as const

const commissions = [
  ['Sleeping Phial', 26, 6],
  ['Steel Greataxe', 29, 300],
  ['Wolfskin Jacket', 32, 300],
  ['Amethyst Ring', 33, 150],
  ['Silver Rod', 34, 300],
  ['Steel Hauberk', 34, 300],
  ['Wool Doublet', 35, 300],
  ['Silver Symbol', 36, 600],
  ['Wolfskin Jerkin', 37, 600],
  ['Felt Halfrobe', 38, 600],
  ['Steel Platemail', 39, 600],
  ['Steel Claymore', 39, 600],
  ['Peridot Ring', 39, 300],
  ['Honey', 41, 150],
  ['Mithral Zweihander', 43, 900],
  ['Beeswax', 44, 225],
  ['Black Pearl Ring', 46, 450],
  ['Velveteen Halfrobe', 47, 900],
  ['Mithral Scepter', 48, 900],
  ['Mithral Scale Mail', 48, 900],
  ['Bearskin Vest', 48, 900],
  ['Mithral Greataxe', 50, 1200],
  ['Mithral Symbol', 50, 1200],
  ['Ornate Mithral Hauberk', 51, 1200],
  ['Aquamarine Ring', 51, 600],
  ["Workman's Anodyne", 52, 100],
  ['Bearskin Jacket', 54, 1200],
  ['Velveteen Justaucorps', 54, 1200],
  ['Electrum Symbol', 60, 1800],
  ['Farhide Jerkin', 60, 1800],
  ['Blackiron Scale Mail', 61, 1800],
  ['Blackiron Greataxe', 62, 1800],
  ['Silk Robe', 62, 1800],
  ['Emerald Ring', 62, 900],
  ['Horn Glue', 63, 450],
  ['Farskin Jerkin', 63, 2200],
  ['Silk Justaucorps', 64, 2200],
  ['Electrum Scepter', 64, 2200],
  ['Blackiron Zweihander', 65, 2200],
  ['Gilded Blackiron Scale Mail', 66, 2200],
  ['Sapphire Ring', 66, 1100],
  ['Potent Paralyzing Phial', 67, 45],
  ['Adamantine Claymore', 70, 3000],
  ['Gold Symbol', 70, 3000],
  ['Adamantine Cuirass', 70, 3000],
  ['Drakehide Coat', 70, 3000],
  ['Shimmerweave Halfrobe', 70, 3000],
  ['Black Opal Ring', 70, 1500],
  ['Black Ink', 70, 750],
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
  const [currentCredits, setCurrentCredits] = useState(0)
  const [commissionName, setCommissionName] = useState('Beeswax')

  useEffect(() => {
    const syncHash = () => setOpen(window.location.hash === GUIDE_HASH)
    window.addEventListener('hashchange', syncHash)
    return () => window.removeEventListener('hashchange', syncHash)
  }, [])

  useEffect(() => {
    try {
      window.localStorage.setItem(PROGRESS_KEY, JSON.stringify([...completed]))
    } catch {
      // The guide still works when storage is unavailable.
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

  const selectedCommission = useMemo(
    () => commissions.find(([name]) => name === commissionName) ?? commissions[15],
    [commissionName],
  )
  const remainingRank3 = Math.max(0, 500000 - currentCredits)
  const unitsNeeded = Math.ceil(remainingRank3 / selectedCommission[2])
  const progress = Math.round((completed.size / phases.length) * 100)

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
        <span>{completed.size ? `Journey ${completed.size}/${phases.length}` : 'New player guide'}</span>
      </button>

      {open && (
        <div className="workshop-journey-layer" role="presentation" onMouseDown={(event) => {
          if (event.currentTarget === event.target) closeGuide()
        }}>
          <section className="workshop-journey-sheet" role="dialog" aria-modal="true" aria-labelledby="workshop-journey-title">
            <header className="workshop-journey-header">
              <div>
                <span className="journey-eyebrow">WORKSHOP → MASTERWORK</span>
                <h2 id="workshop-journey-title">The new-player crafting journey</h2>
                <p>Follow the Workshop progression first. Use the recipe vault once you are ready to plan actual Masterwork crafts.</p>
              </div>
              <button type="button" className="journey-close" onClick={closeGuide} aria-label="Close new-player guide"><X size={22} /></button>
            </header>

            <div className="workshop-journey-scroll">
              <div className="journey-caveat">
                <CircleHelp size={20} aria-hidden="true" />
                <div><strong>Historical guide, current planner.</strong><p>The supplied video write-up reconstructs a Module 15 Workshop tutorial and related economic guidance rather than providing a literal transcript. Rank thresholds, credit targets, market prices, and old exploits can change. Verify patch-sensitive requirements in game; the Sharandar/Underdark recipe data elsewhere in this app remains separately screenshot-backed.</p></div>
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
                <div className="journey-section-heading"><Gem size={20} /><div><span>HISTORICAL SOUTH SEA TOOL</span><h3>Rank 3 commission calculator</h3></div></div>
                <p>Use the commission values recorded in the supplied Module 15 guide to estimate how many standard items would cover the remaining portion of its 500,000-credit Rank 3 target.</p>
                <div className="journey-calculator-grid">
                  <label><span>Current credits</span><input type="number" min="0" max="500000" inputMode="numeric" value={currentCredits} onChange={(event) => setCurrentCredits(Math.max(0, Math.min(500000, Number(event.target.value) || 0)))} /></label>
                  <label><span>Commission item</span><select value={commissionName} onChange={(event) => setCommissionName(event.target.value)}>{commissions.map(([name, level, credits]) => <option value={name} key={name}>{name} · Lv {level} · {credits.toLocaleString()} credits</option>)}</select></label>
                </div>
                <div className="journey-result"><span>Estimated standard items needed</span><strong>{unitsNeeded.toLocaleString()}</strong><small>{remainingRank3.toLocaleString()} credits remaining ÷ {selectedCommission[2].toLocaleString()} credits each</small></div>
              </section>

              <section className="journey-next">
                <div className="journey-section-heading"><Hammer size={20} /><div><span>WHEN YOU REACH MASTERWORK</span><h3>Move from progression to production</h3></div></div>
                <div className="journey-next-grid">
                  <div><strong>1. Catalog</strong><p>Choose Sharandar or Underdark and find the craftable you actually want.</p></div>
                  <ChevronRight aria-hidden="true" />
                  <div><strong>2. Recipe tree</strong><p>Open crafted ingredients until you understand every dependency.</p></div>
                  <ChevronRight aria-hidden="true" />
                  <div><strong>3. Plan</strong><p>Combine several crafts so shared materials and batches are calculated together.</p></div>
                </div>
              </section>

              <footer className="journey-sources">
                <strong>Guide basis</strong>
                <p>Neverwinter Workshop Rank 1 → Rank 4 tutorial reconstruction supplied by the user, based on the Gavscar Gaming video and supporting community references.</p>
                <a href="https://www.youtube.com/watch?v=mqDD5x2nLpM" target="_blank" rel="noreferrer">Open the original video</a>
              </footer>
            </div>
          </section>
        </div>
      )}
    </>
  )
}
