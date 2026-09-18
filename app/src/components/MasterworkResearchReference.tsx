import { useMemo, useState } from 'react'
import { ArrowUpRight, ChevronDown, Search } from 'lucide-react'
import {
  MASTERWORK_RESEARCH_REVIEWED_AT,
  chultanIntermediateFormulas,
  chultanWeaponSlots,
  masterworkResearchLimits,
  masterworkResearchSources,
  masterworkTierAssessment,
} from '../data/masterworkResearch'
import {
  CHULTAN_HISTORICAL_TASKS_NOTICE,
  chultanHistoricalTaskRows,
} from '../data/chultanHistoricalTasks'
import { masterworkResearchCorrections } from '../data/researchCorrections'

const historicalTaskSourceCount = new Set(chultanHistoricalTaskRows.map((row) => row.sourceUrl)).size

const formulaSignature = (outputQuantity: number, inputs: { name: string; quantity: number }[]) =>
  JSON.stringify({
    outputQuantity,
    inputs: [...inputs]
      .map((input) => ({ name: input.name.toLocaleLowerCase('en'), quantity: input.quantity }))
      .sort((a, b) => a.name.localeCompare(b.name)),
  })

const historicalFormulaConflicts = chultanIntermediateFormulas
  .filter((formula) => {
    const matches = chultanHistoricalTaskRows.filter((row) => row.name === formula.name)
    if (!matches.length) return false
    const worksheetSignature = formulaSignature(formula.outputQuantity, formula.inputs)
    return matches.some((row) => formulaSignature(row.outputQuantity, row.materials) !== worksheetSignature)
  })
  .map((formula) => formula.name)

function SourceLink({ id }: { id: string }) {
  const source = masterworkResearchSources.find((row) => row.id === id)
  if (!source) return null
  return <a href={source.url} target="_blank" rel="noopener noreferrer">{source.label}<ArrowUpRight size={14} aria-hidden="true" /><span className="acquisition-sr-only"> (opens in a new tab)</span></a>
}

export function MasterworkResearchReference() {
  const [query, setQuery] = useState('')
  const search = query.trim().toLocaleLowerCase('en')
  const formulas = useMemo(() => chultanIntermediateFormulas.filter((row) => !search || [row.name, ...row.inputs.map((item) => item.name)].join(' ').toLocaleLowerCase('en').includes(search)), [search])
  const weaponSlots = useMemo(() => chultanWeaponSlots.filter((row) => !search || [row.slot, ...row.inputs.map((item) => item.name)].join(' ').toLocaleLowerCase('en').includes(search)), [search])
  const historicalTasks = useMemo(() => chultanHistoricalTaskRows.filter((row) => !search || [
    row.name,
    row.profession,
    `Masterwork ${row.historicalTier}`,
    ...row.materials.map((item) => item.name),
  ].join(' ').toLocaleLowerCase('en').includes(search)), [search])

  return <section className="masterwork-research" aria-labelledby="masterwork-research-heading">
    <div className="journey-section-intro">
      <span className="journey-kicker">MASTERWORK / EVIDENCE MAP</span>
      <h2 id="masterwork-research-heading">Masterwork lineage and Chultan evidence</h2>
      <p>Follow what is publisher-documented, what is preserved from post-rework community formulas and profession task tables, and what still needs an in-game verification. Historical rows never enter planner totals automatically.</p>
    </div>

    <div className="journey-coverage" aria-label="Masterwork research coverage">
      <span><strong>{chultanWeaponSlots.length}</strong> weapon-slot formulas</span>
      <span><strong>{chultanIntermediateFormulas.length}</strong> intermediate recipes</span>
      <span><strong>{chultanHistoricalTaskRows.length}</strong> historical IV/V task rows</span>
      <span><strong>{historicalTaskSourceCount}</strong> profession task-table sources</span>
      <span><strong>{masterworkResearchSources.length}</strong> claim-ledger sources</span>
      <span><strong>{MASTERWORK_RESEARCH_REVIEWED_AT}</strong> research review</span>
    </div>

    <section className="masterwork-tier-status" aria-labelledby="masterwork-tier-status-heading">
      <span className="journey-kicker">LATEST POSITIVELY DOCUMENTED TIER</span>
      <h3 id="masterwork-tier-status-heading">{masterworkTierAssessment.latestPositivelyDocumented}</h3>
      <p>{masterworkTierAssessment.note}</p>
      <div className="masterwork-source-links"><SourceLink id="menzoberranzan-2023-forum" /><SourceLink id="arc-2026-roadmap" /><SourceLink id="arc-2026-biting-cold" /><SourceLink id="arc-2026-monoliths" /></div>
    </section>

    <section className="masterwork-corrections" aria-labelledby="masterwork-corrections-heading">
      <div className="journey-section-intro compact">
        <span className="journey-kicker">PUBLISHER OVERRIDES / COVERAGE AUDIT</span>
        <h3 id="masterwork-corrections-heading">Publisher corrections & coverage gaps</h3>
        <p>Newer publisher evidence takes priority over older screenshots, task tables and worksheets. These records explain exactly what changed and what still remains uncaptured.</p>
      </div>
      <div className="masterwork-corrections-grid">
        {masterworkResearchCorrections.map((correction) => <article key={correction.id}>
          <div className="masterwork-correction-head">
            <strong>{correction.title}</strong>
            <span className={`mw-status-chip ${correction.status === 'publisher-correction' ? 'reviewed' : correction.status === 'coverage-gap' ? 'unknown' : 'historical'}`}>{correction.status.replaceAll('-', ' ')}</span>
          </div>
          <p>{correction.summary}</p>
          <small>{correction.impact}</small>
          <a href={correction.sourceUrl} target="_blank" rel="noopener noreferrer">{correction.sourceLabel}<ArrowUpRight size={14} aria-hidden="true" /><span className="acquisition-sr-only"> (opens in a new tab)</span></a>
        </article>)}
      </div>
    </section>

    <section className="masterwork-lineage" aria-labelledby="masterwork-lineage-heading">
      <div className="journey-section-intro compact"><span className="journey-kicker">THE LINEAGE</span><h3 id="masterwork-lineage-heading">Separate the eras before you spend AD.</h3></div>
      <div className="masterwork-lineage-grid">
        <article><small>Legacy / historical</small><h4>Masterwork I–III</h4><p>Older Stronghold-era books and questlines. Do not use old profession levels or quest gates as current requirements.</p></article>
        <article><small>Renamed in 2021</small><h4>Chultan Masterwork I & II</h4><p>The publisher renamed Masterwork IV and V to Chultan Masterwork and changed book acquisition and recipes. The exact complete 2026 Chultan output list is not publicly reverified.</p><SourceLink id="publisher-2021-masterwork-rework" /></article>
        <article><small>Later tier</small><h4>Sharandar Masterwork</h4><p>Comes after the Chultan line in the researched progression. Current minimum cross-profession and binding rules remain verification-sensitive.</p></article>
        <article><small>Latest positively documented</small><h4>Menzoberranzan Masterwork</h4><p>Documented in 2023 release-era material and preserved by this Vault's Underdark catalog. A newer tier was not verified in the reviewed 2026 sources.</p><SourceLink id="menzoberranzan-2023-forum" /></article>
      </div>
    </section>

    <aside className="masterwork-research-warning" role="note">
      <h3>What is deliberately not guessed</h3>
      <ul>{masterworkResearchLimits.map((text) => <li key={text}>{text}</li>)}</ul>
    </aside>

    <div className="masterwork-reference-search">
      <label><span>Search Chultan evidence</span><span className="journey-library-search"><Search size={17} aria-hidden="true" /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try Soulfired Obsidian, Armorsmithing or Tyrannosaur" /></span></label>
      {query && <button type="button" onClick={() => setQuery('')}>Clear search</button>}
    </div>

    <section aria-labelledby="chultan-intermediate-heading">
      <div className="journey-section-intro compact">
        <span className="journey-kicker">CHULTAN WORKED MATERIALS</span>
        <h3 id="chultan-intermediate-heading">Intermediate recipes recorded by the post-rework weapon worksheet.</h3>
        <p>Ratios are read directly from the worksheet formulas. They are historical reference evidence and are intentionally excluded from current planner calculations until live reverified.</p>
      </div>
      <div className="masterwork-source-links"><SourceLink id="chultan-weapon-sheet" /><SourceLink id="chultan-2023-field-guide" /></div>
      <p className="journey-library-result" role="status">{formulas.length} matching intermediate recipes / {chultanIntermediateFormulas.length}</p>
      <div className="masterwork-research-list">
        {formulas.map((row) => <details className="journey-output" key={row.name}>
          <summary><span><small>Chultan / historical worksheet formula</small><strong>{row.name}</strong><small>Recorded yield ×{row.outputQuantity}</small></span><span className="journey-recipe-state">Reference only</span><ChevronDown size={18} aria-hidden="true" /></summary>
          <div className="journey-output-detail"><h4>Inputs for one recorded batch</h4><ul className="journey-input-list">{row.inputs.map((input) => <li key={input.name}><span><strong>{input.name}</strong><b>×{input.quantity}</b></span></li>)}</ul><p className="journey-data-note">Do not use this historical worksheet ratio as a live 2026 cost until the recipe is confirmed in-game.</p></div>
        </details>)}
      </div>
    </section>

    <section aria-labelledby="chultan-historical-tasks-heading">
      <div className="journey-section-intro compact">
        <span className="journey-kicker">HISTORICAL PROFESSION TASK TABLES</span>
        <h3 id="chultan-historical-tasks-heading">Historical Chultan task-table snapshot</h3>
        <p>{CHULTAN_HISTORICAL_TASKS_NOTICE}</p>
      </div>
      <aside className="masterwork-research-warning" role="note">
        <h3>Source conflict audit</h3>
        <p>{historicalFormulaConflicts.length} worksheet ratios disagree with at least one historical profession task row: {historicalFormulaConflicts.join(', ')}. Neither source is silently promoted as the current recipe; verify the live workstation before using those ratios for costs.</p>
      </aside>
      <p className="journey-library-result" role="status">{historicalTasks.length} matching historical task rows / {chultanHistoricalTaskRows.length}</p>
      <div className="masterwork-research-list">
        {historicalTasks.map((row) => <details className="journey-output masterwork-historical-task" key={`${row.profession}:${row.historicalTier}:${row.name}`}>
          <summary><span><small>{row.profession} · Masterwork {row.historicalTier}</small><strong>{row.name}</strong><small>Recorded Tier 1 yield ×{row.outputQuantity}</small></span><span className="journey-recipe-state">Reference only</span><ChevronDown size={18} aria-hidden="true" /></summary>
          <div className="journey-output-detail">
            <h4>Materials for one recorded task</h4>
            <ul className="journey-input-list">{row.materials.map((input) => <li key={input.name}><span><strong>{input.name}</strong><b>×{input.quantity}</b></span></li>)}</ul>
            <div className="journey-output-actions"><a href={row.sourceUrl} target="_blank" rel="noopener noreferrer">Open profession task table<ArrowUpRight size={14} aria-hidden="true" /><span className="acquisition-sr-only"> (opens in a new tab)</span></a></div>
            <p className="journey-data-note">Historical reference only. This post-2018 IV/V task row is evidence for the renamed Chultan lineage, not a September 2026 live-recipe certification and not planner input.</p>
          </div>
        </details>)}
      </div>
    </section>

    <section aria-labelledby="chultan-weapons-heading">
      <div className="journey-section-intro compact">
        <span className="journey-kicker">CHULTAN WEAPON FORMULAS</span>
        <h3 id="chultan-weapons-heading">Class slot formulas preserved without inventing item names.</h3>
        <p>The source names these as class main-hand/off-hand slots rather than reliable canonical item names, so this reference keeps the slot labels exactly at that confidence level.</p>
      </div>
      <p className="journey-library-result" role="status">{weaponSlots.length} matching weapon-slot formulas / {chultanWeaponSlots.length}</p>
      <div className="masterwork-weapon-grid">
        {weaponSlots.map((row) => <article key={row.slot}><h4>{row.slot}</h4><ul>{row.inputs.map((input) => <li key={input.name}><span>{input.name}</span><b>×{input.quantity}</b></li>)}</ul></article>)}
      </div>
    </section>

    <section className="masterwork-research-sources" aria-labelledby="masterwork-research-sources-heading">
      <div className="journey-section-intro compact"><span className="journey-kicker">SOURCE LEDGER</span><h3 id="masterwork-research-sources-heading">Why each claim is allowed to appear.</h3></div>
      {masterworkResearchSources.map((source) => <article key={source.id}><div><strong>{source.label}</strong><span className={`mw-status-chip ${source.status === 'unresolved' ? 'unknown' : 'reviewed'}`}>{source.status.replaceAll('-', ' ')}</span></div><p>{source.supports}</p><small>{source.publishedAt ? `Published ${source.publishedAt} · ` : ''}Reviewed {MASTERWORK_RESEARCH_REVIEWED_AT}. {source.limitation}</small><a href={source.url} target="_blank" rel="noopener noreferrer">Open source<ArrowUpRight size={14} aria-hidden="true" /></a></article>)}
    </section>
  </section>
}
