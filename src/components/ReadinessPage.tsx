import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { gsap } from 'gsap'
import { BadgeCheck, BookOpen, CheckCircle2, ChevronLeft, CircleHelp, Coins, Download, FileUp, Gem, ShieldCheck, Sparkles, Wrench } from 'lucide-react'
import { masterworkProgression, masterworkUnlockPrices } from '../data/craftingKnowledgePool'
import { loadPlayerState, MASTERWORK_PROFESSIONS, savePlayerState, type MasterworkProfession, type PlayerState, type ProfessionProgress } from '../domain/playerState'
import { importPortableVaultState, serializePortableVaultState } from '../domain/portableState'
import { readinessSummary } from '../domain/readiness'
import { buildDataHealthReport } from '../domain/verification'

const tierLabels = [
  ['chultan1', 'Chultan I'],
  ['chultan2', 'Chultan II'],
  ['sharandar', 'Sharandar'],
  ['menzoberranzan', 'Menzo'],
] as const

function downloadJson() {
  const blob = new Blob([serializePortableVaultState()], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `masterwork-vault-state-${new Date().toISOString().slice(0, 10)}.json`
  anchor.click()
  setTimeout(() => URL.revokeObjectURL(url), 500)
}

export function ReadinessPage() {
  const root = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<PlayerState>(() => loadPlayerState())
  const [notice, setNotice] = useState('')
  const summary = useMemo(() => readinessSummary(state), [state])
  const health = useMemo(() => buildDataHealthReport(), [])

  useEffect(() => { document.documentElement.dataset.density = state.density }, [state.density])

  useEffect(() => {
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      if (!root.current) return
      const ctx = gsap.context(() => {
        gsap.from('.mw-readiness-hero > *, .mw-summary-card', { y: 14, autoAlpha: 0, duration: .42, ease: 'power3.out', stagger: .045, clearProps: 'transform,opacity,visibility' })
      }, root)
      return () => ctx.revert()
    })
    return () => mm.revert()
  }, [])

  const commit = (next: PlayerState, message?: string) => {
    const saved = savePlayerState(next)
    setState(saved)
    if (message) { setNotice(message); window.setTimeout(() => setNotice(''), 2600) }
  }

  const setProfessionLevel = (profession: MasterworkProfession, level: number) => commit({
    ...state,
    professions: { ...state.professions, [profession]: { ...state.professions[profession], level } },
  })

  const toggleTier = (profession: MasterworkProfession, key: typeof tierLabels[number][0]) => {
    const current = state.professions[profession]
    const nextValue = !current[key]
    const next: ProfessionProgress = { ...current, [key]: nextValue }
    if (key === 'chultan1' && !nextValue) { next.chultan2 = false; next.sharandar = false; next.menzoberranzan = false }
    if (key === 'chultan2' && !nextValue) { next.sharandar = false; next.menzoberranzan = false }
    if (key === 'sharandar' && !nextValue) next.menzoberranzan = false
    if (key === 'chultan2' && nextValue) next.chultan1 = true
    if (key === 'sharandar' && nextValue) { next.chultan1 = true; next.chultan2 = true; next.level = 20 }
    if (key === 'menzoberranzan' && nextValue) { next.chultan1 = true; next.chultan2 = true; next.sharandar = true; next.level = 20 }
    commit({ ...state, professions: { ...state.professions, [profession]: next } })
  }

  const importState = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      const count = importPortableVaultState(await file.text())
      setState(loadPlayerState())
      setNotice(`${count} saved Vault state ${count === 1 ? 'entry' : 'entries'} imported.`)
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Import failed.') }
  }

  return (
    <div ref={root} className="mw-readiness-page">
      <a className="mw-skip-link" href="#readiness-main">Skip to readiness</a>
      <header className="mw-page-topbar">
        <a href="/catalog" className="mw-page-brand"><img src="/assets/brand/masterwork-vault-mark.svg" alt="" /><span><strong>The Masterwork Vault</strong><small>Player readiness center</small></span></a>
        <nav aria-label="Primary navigation"><a href="/catalog">Catalog</a><a href="/plan">Plan</a><a href="/materials">Materials</a><a href="/journey">Journey</a><a href="/readiness" aria-current="page">Readiness</a></nav>
      </header>

      <main id="readiness-main" className="mw-readiness-main">
        <section className="mw-readiness-hero">
          <div>
            <a className="mw-back-link" href="/catalog"><ChevronLeft size={17} />Back to Catalog</a>
            <span className="mw-eyebrow"><Sparkles size={14} /> PLAYER STATE</span>
            <h1>Know exactly what unlocks next.</h1>
            <p>Track all seven professions, Masterwork books, Workshop rank, and remaining direct unlock cost. Unknown game facts stay unknown instead of silently becoming requirements.</p>
          </div>
          <div className="mw-hero-progress" aria-label={`${summary.completion}% overall readiness`}><span>Overall readiness</span><strong>{summary.completion}%</strong><div><i style={{ width: `${summary.completion}%` }} /></div><small>{summary.level20Count}/7 professions at Level 20</small></div>
        </section>

        {notice && <div className="mw-toast" role="status" aria-live="polite">{notice}</div>}

        <section className="mw-summary-grid" aria-label="Readiness summary">
          <article className="mw-summary-card"><Coins /><span>Book AD remaining</span><strong>{summary.remainingBookAd.toLocaleString()}</strong><small>Direct unlock purchases only</small></article>
          <article className="mw-summary-card"><ShieldCheck /><span>Workshop rank</span><strong>Rank {state.workshopRank}</strong><small>Not a modern Masterwork book gate</small></article>
          <article className="mw-summary-card"><CheckCircle2 /><span>Menzo quest posture</span><strong>{summary.readyForMenzoQuest ? 'Prereqs marked ready' : 'Still building'}</strong><small>All seven Level 20 + earlier books</small></article>
          <article className="mw-summary-card"><CircleHelp /><span>Data blockers</span><strong>{health.blockers.length}</strong><small>{health.ignoredKnowledgeGaps.length} approved unknowns remain excluded</small></article>
        </section>

        <section className="mw-next-action">
          <div><span className="mw-eyebrow">NEXT LOWEST-COMPLETION PROFESSION</span><h2>{summary.next ? `${summary.next.profession}: ${summary.next.next.title}` : 'All professions marked complete'}</h2><p>{summary.next?.next.detail || 'The tracked Masterwork progression is complete through Menzoberranzan.'}</p></div>
          {summary.next && <strong>{summary.next.next.adCost ? `${summary.next.next.adCost.toLocaleString()} AD` : 'No direct book cost'}</strong>}
        </section>

        <section className="mw-workshop-strip">
          <div><Wrench size={19} /><span><strong>Workshop rank</strong><small>Track it for Workshop capacity and upgrades, not as a Masterwork purchase prerequisite.</small></span></div>
          <div role="group" aria-label="Workshop rank">{([1,2,3,4] as const).map((rank) => <button key={rank} type="button" aria-pressed={state.workshopRank === rank} onClick={() => commit({ ...state, workshopRank: rank })}>R{rank}</button>)}</div>
        </section>

        <section className="mw-profession-section">
          <div className="mw-section-heading"><div><span className="mw-eyebrow">SEVEN PROFESSIONS</span><h2>Masterwork readiness matrix</h2></div><p>Checking a later tier automatically satisfies earlier tracked tiers. It does not fill the three research fields we deliberately excluded.</p></div>
          <div className="mw-profession-table-wrap">
            <table className="mw-profession-table">
              <thead><tr><th>Profession</th><th>Level</th>{tierLabels.map(([,label]) => <th key={label}>{label}</th>)}<th>Next action</th><th>Remaining AD</th></tr></thead>
              <tbody>{summary.professions.map((row) => <tr key={row.profession}>
                <th><span>{row.profession}</span><small>{row.completion}% complete</small></th>
                <td><label><span className="sr-only">{row.profession} level</span><input type="number" min="0" max="20" inputMode="numeric" value={row.progress.level} onChange={(event) => setProfessionLevel(row.profession, Math.max(0, Math.min(20, Number(event.target.value) || 0)))} /></label></td>
                {tierLabels.map(([key,label]) => <td key={key}><button className="mw-check-toggle" type="button" aria-label={`${label} for ${row.profession}`} aria-pressed={row.progress[key]} onClick={() => toggleTier(row.profession, key)}>{row.progress[key] ? <BadgeCheck size={20} /> : <span />}</button></td>)}
                <td><strong>{row.next.title}</strong><small>{row.next.detail}</small></td>
                <td><strong>{row.remainingBookAd.toLocaleString()} AD</strong></td>
              </tr>)}</tbody>
            </table>
          </div>
        </section>

        <section className="mw-readiness-bottom-grid">
          <article className="mw-policy-card"><BookOpen /><span className="mw-eyebrow">UNLOCK POLICY</span><h3>Current Masterwork unlock path</h3><p>Chultan I → Chultan II → Sharandar. Menzoberranzan then requires all seven professions at Level {masterworkProgression.menzoberranzan.professionLevel}, earlier Masterwork progression, and {masterworkProgression.menzoberranzan.quest}.</p><a href="/journey">Open full journey</a></article>
          <article className="mw-policy-card"><Gem /><span className="mw-eyebrow">DIRECT BOOK BASELINE</span><h3>{MASTERWORK_PROFESSIONS.length} professions × four unlock stages</h3><p>Per profession: {(masterworkUnlockPrices.Alchemy.chultanMW1 + masterworkUnlockPrices.Alchemy.chultanMW2).toLocaleString()} AD Chultan, {masterworkUnlockPrices.Alchemy.sharandarMW.toLocaleString()} AD Sharandar, {masterworkUnlockPrices.Alchemy.menzoberranzanMW.toLocaleString()} AD Menzoberranzan.</p><a href="/data-health">Inspect evidence health</a></article>
        </section>

        <section className="mw-state-tools">
          <div><span className="mw-eyebrow">PORTABLE VAULT STATE</span><h2>Your progress should not belong to one browser.</h2><p>Export progression, inventory, saved plans, preferences, and other versioned Vault state. Recipe/source truth remains application-owned and is never imported from user state.</p></div>
          <div><div className="mw-density-toggle" role="group" aria-label="Interface density"><button type="button" aria-pressed={state.density === 'comfortable'} onClick={() => commit({ ...state, density: 'comfortable' })}>Comfortable</button><button type="button" aria-pressed={state.density === 'compact'} onClick={() => commit({ ...state, density: 'compact' })}>Compact</button></div><button type="button" onClick={downloadJson}><Download size={17} />Export Vault JSON</button><label className="mw-file-button"><FileUp size={17} />Import Vault JSON<input type="file" accept="application/json,.json" onChange={importState} /></label></div>
        </section>
      </main>
    </div>
  )
}
