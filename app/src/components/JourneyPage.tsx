import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowUpRight, Check, ChevronLeft, ChevronRight, CircleHelp, Coins } from 'lucide-react'
import { journeyPhases, journeySources, journeyProfessionGuides, JOURNEY_REVIEWED_AT, JOURNEY_BOOK_PRICES } from '../data/journeyKnowledge'
import { JourneyCraftables } from './JourneyCraftables'
import './journey-workspace.css'

// Retain the previous five milestone IDs. New chapters begin unchecked.
const PROGRESS_KEY = 'masterwork-vault.workshop-journey.v2'
const allowed = new Set(journeyPhases.map((phase) => phase.id))
function readProgress(): Set<string> {
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(PROGRESS_KEY) || '[]')
    return new Set(Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string' && allowed.has(id)) : [])
  } catch { return new Set() }
}
function SourceLinks({ ids }: { ids: string[] }) {
  return <div className="journey-source-links">{ids.map((id) => journeySources.find((source) => source.id === id)).filter((source) => source != null).map((source) => <a key={source.id} href={source.url} target="_blank" rel="noopener noreferrer">{source.title}<ArrowUpRight size={13} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a>)}</div>
}
function JourneyPlanning() {
  const [bookCount, setBookCount] = useState(7)
  const [morale, setMorale] = useState(100)
  const [rate, setRate] = useState('')
  const [taskCost, setTaskCost] = useState(10)
  const [event, setEvent] = useState(false)
  const prices = JOURNEY_BOOK_PRICES
  const allBooks = prices.reduce((sum, price) => sum + price, 0)
  const costPerTask = taskCost * (event ? .5 : 1)
  const refill = rate.trim() && Number.isFinite(Number(rate)) && Number(rate) >= 0 ? morale * Number(rate) : null
  return <section id="journey-planning" className="journey-planning" aria-labelledby="journey-planning-heading">
    <div className="journey-section-intro"><span className="journey-kicker">PLANNING, NOT LIVE PRICES</span><h2 id="journey-planning-heading">Useful numbers without leaving the journey</h2><p>Separate recipe-book purchases from ingredients, artisans, tools, failures, commissions and Workshop upgrades.</p></div>
    <div className="journey-planning-grid"><article><Coins size={22} aria-hidden="true" /><h3>Published book-price baseline</h3><label><span>Professions to budget for</span><input type="number" min={1} max={7} value={bookCount} onChange={(e) => setBookCount(Math.min(7,Math.max(1,Math.floor(Number(e.target.value)||1))))} /></label><dl>{['Chultan I','Chultan II','Sharandar','Menzoberranzan'].map((label,index) => <div key={label}><dt>{label} / {bookCount} book{bookCount === 1 ? '' : 's'}</dt><dd>{(prices[index]*bookCount).toLocaleString()} AD</dd></div>)}</dl><div className="journey-planning-total"><span>Books only</span><strong>{(allBooks*bookCount).toLocaleString()} AD</strong></div><p>One profession across all four book stages is 4,000,000 AD at these published prices; all seven total 28,000,000 AD. This is a budget scenario, not proof of the minimum prerequisites for one profession. Confirm live vendor prices before purchasing.</p><SourceLinks ids={['book-rework','menzo-workbook']} /></article>
    <article><CircleHelp size={22} aria-hidden="true" /><h3>Daily Morale and paid restoration</h3><p>The community reference records 400 daily Morale. Enter the cost shown by your current task; this estimate excludes procs and failures.</p><label><span>Base Morale per task</span><input type="number" min={1} max={400} value={taskCost} onChange={(e) => setTaskCost(Math.min(400,Math.max(1,Math.floor(Number(e.target.value)||1))))} /></label><label className="journey-check-field"><input type="checkbox" checked={event} onChange={(e) => setEvent(e.target.checked)} /><span>Apply documented 2x Professions Morale discount</span></label><div className="journey-planning-total"><span>Attempts from 400 Morale</span><strong>{Math.floor(400/costPerTask)}</strong></div><p>The publisher states that the event halves Morale costs; it does not double task XP. No current event is assumed active. Check actual rounding on low-cost tasks.</p><div className="journey-refill-fields"><label><span>Morale to restore</span><input type="number" min={0} max={400} value={morale} onChange={(e) => setMorale(Math.min(400,Math.max(0,Math.floor(Number(e.target.value)||0))))} /></label><label><span>Current AD per point</span><input type="number" min={0} value={rate} onChange={(e) => setRate(e.target.value)} placeholder="Read the Retainer quote" /></label></div><p role="status">{refill == null ? 'Enter the live quote to calculate a restoration estimate.' : `Your entered-rate estimate: ${refill.toLocaleString()} AD.`}</p><SourceLinks ids={['workshop','event']} /></article></div>
  </section>
}
export function JourneyPage() {
  const initialProgress = useMemo(readProgress,[])
  const [completed,setCompleted] = useState(initialProgress)
  const [activeId,setActiveId] = useState(() => {
    const requested = new URLSearchParams(window.location.search).get('stage')
    return requested && allowed.has(requested) ? requested : journeyPhases.find((phase) => !initialProgress.has(phase.id))?.id || journeyPhases[0].id
  })
  const stageHeading = useRef<HTMLHeadingElement>(null)
  const focusRequested = useRef(false)
  const activeIndex = journeyPhases.findIndex((phase) => phase.id === activeId)
  const phase = journeyPhases[activeIndex]
  const done = completed.has(activeId)
  useEffect(() => {
    if (!focusRequested.current) return
    focusRequested.current = false
    stageHeading.current?.scrollIntoView({ block: 'start', behavior: 'instant' })
    stageHeading.current?.focus({ preventScroll: true })
  },[activeId])
  const select = (id: string) => {
    focusRequested.current = true; setActiveId(id)
    const url = new URL(window.location.href); url.searchParams.set('stage',id)
    window.history.replaceState(window.history.state,'',url)
  }
  const toggle = () => {
    const next = new Set(completed); done ? next.delete(activeId) : next.add(activeId); setCompleted(next)
    try { window.localStorage.setItem(PROGRESS_KEY,JSON.stringify([...next])) } catch { /* Local progress is optional. */ }
  }
  const percent = Math.round(completed.size/journeyPhases.length*100)
  return <div className="journey-page journey-v3">
    <header className="journey-page-topbar"><a className="journey-page-brand" href="/catalog"><img src="/assets/brand/masterwork-vault-mark.svg" alt="" /><span><strong>The Masterwork Vault</strong><small>Crafting reference and field guide</small></span></a><nav aria-label="Primary navigation"><a href="/catalog">Catalog</a><a href="/plan">Plan</a><a href="/materials">Materials</a><a href="/journey" aria-current="page">Journey</a><a href="/readiness">Readiness</a></nav></header>
    <main id="main-content" className="journey-page-main" tabIndex={-1}>
      <section className="journey-page-hero"><div className="journey-page-hero-copy"><a className="journey-back-link" href="/catalog"><ChevronLeft size={17} aria-hidden="true" />Back to Catalog</a><span className="journey-eyebrow">WORKSHOP / PROFESSIONS / MASTERWORK</span><h1>Masterwork journey</h1><p>From your first gathering task to a complete production plan. Follow the path, inspect the evidence, and explore the craftables behind each era.</p></div><div className="journey-personal-progress"><span>Your reading checklist</span><strong>{completed.size}<small> / {journeyPhases.length}</small></strong><progress value={completed.size} max={journeyPhases.length} aria-label={`${percent}% of milestones marked complete`} /><p>Saved on this device. Not connected to your game character.</p></div></section>
      <nav className="journey-section-nav" aria-label="Journey sections"><a href="#journey-guide">Progression guide</a><a href="#journey-professions">Professions</a><a href="#journey-craftables">Craftables</a><a href="#journey-planning">Planning</a><a href="#journey-evidence">Evidence</a></nav>
      <div id="journey-guide" className="journey-learning-grid"><nav className="journey-chapter-nav" aria-label="Masterwork milestones">{journeyPhases.map((entry,index) => <button type="button" className={`journey-roadmap-step ${entry.id === activeId ? 'active' : ''}`} aria-current={entry.id === activeId ? 'step' : undefined} onClick={() => select(entry.id)} key={entry.id}><span className="journey-chapter-number">{completed.has(entry.id) ? <Check size={16} aria-hidden="true" /> : String(index+1).padStart(2,'0')}</span><strong>{entry.navTitle}</strong></button>)}</nav>
      <article className="journey-chapter" aria-labelledby="journey-active-heading"><span className="journey-kicker">CHAPTER {activeIndex+1} / {journeyPhases.length}</span><h2 id="journey-active-heading" ref={stageHeading} tabIndex={-1}>{phase.title}</h2><p className="journey-chapter-summary">{phase.summary}</p><h3>What to do</h3><ol className="journey-checkpoints">{phase.tasks.map((task,index) => <li className="journey-task" key={task}><span aria-hidden="true">{index+1}</span><p>{task}</p></li>)}</ol>
        {phase.sections.map((section) => <section className="journey-chapter-section" key={section.title}><h3>{section.title}</h3>{section.paragraphs.map((text) => <p key={text}>{text}</p>)}<SourceLinks ids={section.sourceIds} /></section>)}
        <aside className="journey-caution"><strong>Check before you commit</strong><p>{phase.caution}</p></aside><div className="journey-milestone"><span><strong>Milestone</strong><p>{phase.milestone}</p></span><button type="button" aria-pressed={done} onClick={toggle}><Check size={16} aria-hidden="true" />{done ? 'Mark incomplete' : 'Mark milestone complete'}</button></div><div className="journey-chapter-actions"><button type="button" disabled={!activeIndex} onClick={() => select(journeyPhases[activeIndex-1].id)}><ChevronLeft size={17} aria-hidden="true" />Previous</button><span>{activeIndex+1} of {journeyPhases.length}</span><button type="button" disabled={activeIndex === journeyPhases.length-1} onClick={() => select(journeyPhases[activeIndex+1].id)}>Next<ChevronRight size={17} aria-hidden="true" /></button></div><p className="journey-review-date">Literature reviewed {JOURNEY_REVIEWED_AT}. Publication dates and live-game certainty are separate.</p>
      </article></div>
      <section id="journey-professions" className="journey-professions" aria-labelledby="journey-professions-heading"><div className="journey-section-intro"><span className="journey-kicker">YOUR WORKSHOP TEAM</span><h2 id="journey-professions-heading">Seven crafts. Gathering alongside them.</h2><p>Plan for cross-profession ingredients, not just the profession printed on the final item. Alembic book assignments were corrected to Armorsmithing in November 2023.</p><SourceLinks ids={['workshop','tool-correction']} /></div><div className="journey-profession-grid">{journeyProfessionGuides.map((entry) => <article key={entry.name}><h3>{entry.name}</h3><p>{entry.role}</p><a href={entry.url} target="_blank" rel="noopener noreferrer">View profession reference<ArrowUpRight size={15} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a></article>)}</div></section>
      <JourneyCraftables />
      <JourneyPlanning />
      <section id="journey-evidence" className="journey-evidence" aria-labelledby="journey-evidence-heading"><div className="journey-section-intro"><span className="journey-kicker">EVIDENCE & COVERAGE</span><h2 id="journey-evidence-heading">Know which details are established.</h2><p>Publisher changes take priority over old guides. Preview demonstrations and community references remain labelled. Review dates do not certify the current game.</p></div><aside className="journey-caution"><strong>Still needs current-game evidence</strong><p>The exact minimum cross-profession gates and binding rules for later books, rescaled Workshop quest triggers, a complete standard/Chultan recipe inventory, and any subsequent Masterwork tiers are not fully verified here. Menzoberranzan is the latest tier documented in this guide, not a claim that no later tier exists.</p><a href="/data-health">Review the data-quality queues<ArrowUpRight size={15} aria-hidden="true" /></a></aside><div className="journey-source-ledger">{journeySources.map((source) => <details key={source.id}><summary><span><small>{source.kind === 'publisher' ? 'Publisher documentation' : source.kind === 'preview' ? 'Preview-server demonstration' : 'Community reference'} / {source.publishedAt || 'Publication date not established'}</small><strong>{source.title}</strong></span><ChevronRight size={17} aria-hidden="true" /></summary><p>{source.limitation}</p><p>Reviewed {source.reviewedAt}</p><a href={source.url} target="_blank" rel="noopener noreferrer">Read original source<ArrowUpRight size={15} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a></details>)}</div></section>
      <div className="journey-route-next"><a href="/readiness">Track profession progress<ArrowUpRight size={17} aria-hidden="true" /></a><a href="/materials">Find material sources<ArrowUpRight size={17} aria-hidden="true" /></a><a href="/plan">Build your crafting plan<ArrowUpRight size={17} aria-hidden="true" /></a></div>
    </main>
  </div>
}
