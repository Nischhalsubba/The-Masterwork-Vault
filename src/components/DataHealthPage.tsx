import { useMemo } from 'react'
import { AlertTriangle, BadgeCheck, ChevronLeft, CircleHelp, ImageOff, ListChecks, SearchCheck, ShieldCheck } from 'lucide-react'
import { artworkProvenance, buildDataHealthReport, verificationLedger } from '../domain/verification'
import catalogJson from '../data/catalog'
import type { CatalogData } from '../types'

const catalog = catalogJson as CatalogData

export function DataHealthPage() {
  const report = useMemo(() => buildDataHealthReport(), [])
  const artworkCounts = useMemo(() => [...catalog.items, ...catalog.materials].reduce<Record<string, number>>((acc, entity) => { const key = artworkProvenance(entity); acc[key] = (acc[key] || 0) + 1; return acc }, {}), [])
  return <div className="mw-health-page">
    <header className="mw-page-topbar"><a href="/catalog" className="mw-page-brand"><img src="/assets/brand/masterwork-vault-mark.svg" alt="" /><span><strong>The Masterwork Vault</strong><small>Verification console</small></span></a><nav aria-label="Primary navigation"><a href="/catalog">Catalog</a><a href="/readiness">Readiness</a><a href="/data-health" aria-current="page">Data Health</a></nav></header>
    <main id="main-content" className="mw-health-main">
      <section className="mw-health-hero"><div><a className="mw-back-link" href="/readiness"><ChevronLeft size={17} />Back to Readiness</a><span className="mw-eyebrow"><SearchCheck size={14} /> REVERIFICATION</span><h1>Data health and reverification.</h1><p>Every unresolved record is tracked as a queue. This page turns missing evidence into explicit maintenance work.</p></div><div className={`mw-health-status ${report.blockers.length ? 'warning' : 'clean'}`}>{report.blockers.length ? <AlertTriangle /> : <ShieldCheck />}<span>Deployment blockers</span><strong>{report.blockers.length}</strong><small>{report.blockers.length ? 'Resolve before release' : 'No runtime catalog integrity blockers detected'}</small></div></section>

      <section className="mw-health-metrics">
        <article><ListChecks /><span>Catalog</span><strong>{report.totals.items} items</strong><small>{report.totals.recipes} recipes · {report.totals.materials} materials</small></article>
        <article><CircleHelp /><span>Unknown yields</span><strong>{report.queues.unknownYields.length}</strong><small>`quantityExplicit: false` queue</small></article>
        <article><ImageOff /><span>Missing artwork</span><strong>{report.queues.missingArtwork.length}</strong><small>Authentic artwork not available</small></article>
        <article><BadgeCheck /><span>Variant review</span><strong>{report.queues.qualityVariantReview.length}</strong><small>HQ/+1 records needing independent evidence</small></article>
      </section>

      {report.blockers.length > 0 && <section className="mw-health-blockers"><h2>Release blockers</h2><ul>{report.blockers.map((problem) => <li key={problem}>{problem}</li>)}</ul></section>}

      <section className="mw-health-grid">
        <article className="mw-health-panel"><div><span className="mw-eyebrow">REVERIFY QUEUE</span><h2>Unknown output yields</h2></div>{report.queues.unknownYields.length ? <ul>{report.queues.unknownYields.slice(0, 80).map((recipe) => <li key={recipe.name}><strong>{recipe.name}</strong><span>{recipe.profession || 'Profession not recorded'} · {recipe.sourceStatus}</span></li>)}</ul> : <p className="mw-health-empty">Every recipe yield is explicitly sourced.</p>}</article>
        <article className="mw-health-panel"><div><span className="mw-eyebrow">ASSET INTEGRITY</span><h2>Artwork provenance</h2></div><dl>{Object.entries(artworkCounts).sort(([a],[b]) => a.localeCompare(b)).map(([key,value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl><p>Generated placeholder art must never be promoted to screenshot-backed. Missing assets remain visibly missing.</p></article>
        <article className="mw-health-panel"><div><span className="mw-eyebrow">ACQUISITION COVERAGE</span><h2>Raw-material sourcing</h2></div><strong className="mw-big-number">{report.queues.acquisitionUnknown}</strong><p>raw-material records still lack structured acquisition metadata. The schema may support vendor/gathering/drop/campaign data without inventing locations.</p></article>
        <article className="mw-health-panel"><div><span className="mw-eyebrow">QUALITY VARIANTS</span><h2>Independent +1/HQ verification</h2></div>{report.queues.qualityVariantReview.length ? <ul>{report.queues.qualityVariantReview.slice(0,60).map(({item,reasons}) => <li key={item.id}><strong>{item.name}</strong><span>{reasons.join(' · ')}</span></li>)}</ul> : <p className="mw-health-empty">Every multi-quality item carries variant-specific evidence.</p>}</article>
        <article className="mw-health-panel"><div><span className="mw-eyebrow">SET NORMALIZATION</span><h2>Structured set records</h2></div><strong className="mw-big-number">{report.queues.legacySetRecords.length}</strong><p>item records still carry legacy inline set data instead of a shared set id, members list and required-piece count.</p></article>
        <article className="mw-health-panel"><div><span className="mw-eyebrow">IMAGE ASSOCIATIONS</span><h2>Evidence and icon review</h2></div><dl><div><dt>Shared icon associations</dt><dd>{report.queues.iconCollisions.length}</dd></div><div><dt>Screenshot evidence gaps</dt><dd>{report.queues.screenshotEvidenceGaps.length}</dd></div><div><dt>Rejected artwork attached</dt><dd>{report.queues.rejectedArtwork.length}</dd></div></dl><p>Shared icons are a review queue, not automatically an error. Rejected artwork is a release blocker.</p></article>
        <article className="mw-health-panel"><div><span className="mw-eyebrow">INTENTIONAL EXCLUSIONS</span><h2>Three research gaps</h2></div><ul>{report.ignoredKnowledgeGaps.map((gap) => <li key={String(gap)}><strong>{gap}</strong><span>Ignored by user approval · never coerced to zero/false</span></li>)}</ul></article>
      </section>

      <section className="mw-ledger"><div><span className="mw-eyebrow">VERIFICATION LEDGER</span><h2>Patch-sensitive facts</h2><p>Use the last-verified date to target future live-game reverification rather than re-researching everything blindly.</p></div><div className="mw-ledger-table-wrap"><table><thead><tr><th>Fact</th><th>Value</th><th>Status</th><th>Last verified</th></tr></thead><tbody>{verificationLedger.map((entry) => <tr key={entry.id}><th>{entry.label}{entry.note && <small>{entry.note}</small>}</th><td>{entry.value}</td><td><span className={`mw-status-chip ${entry.status}`}>{entry.status}</span></td><td>{entry.lastVerified}</td></tr>)}</tbody></table></div></section>
    </main>
  </div>
}
