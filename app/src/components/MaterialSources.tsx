import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { BookOpen, ExternalLink, MapPin, Search, X } from 'lucide-react'
import { getMaterialSourceGuide, materialSourceRecords, MATERIAL_SOURCES_NOTICE, normalizeMaterialSourceName, type AcquisitionStatus, type SourceEvidence } from '../data/materialSources'
import './material-sources.css'

const statusLabel: Record<AcquisitionStatus, string> = { documented: 'Published source', historical: 'Historical guide', unresolved: 'Needs verification' }
const searchText = (value: string) => value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
function EvidenceLinks({ sources }: { sources: SourceEvidence[] }) {
  return <div className="acquisition-evidence">{sources.map((source) => <div key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title}<ExternalLink size={13} aria-hidden="true" /><span className="acquisition-sr-only"> (opens in a new tab)</span></a><p>{source.supports}</p><small>{source.publishedAt ? `Published ${source.publishedAt} · ` : ''}Reviewed {source.checkedAt} · {source.access.replaceAll('-', ' ')}</small></div>)}</div>
}
export function MaterialSourcePanel({ name }: { name: string }) {
  const guide = getMaterialSourceGuide(name)
  const headingId = useId()
  return <section className="acquisition-guide" aria-labelledby={headingId} data-source-status={guide.status}>
    <header className="acquisition-guide-head"><div><small>ACQUISITION</small><h3 id={headingId}>Where to get {guide.name}</h3></div><span className={`acquisition-status ${guide.status}`}>{statusLabel[guide.status]}</span></header>
    <p className="acquisition-notice">{MATERIAL_SOURCES_NOTICE}</p>
    {guide.notes.map((note) => <p className={guide.status === 'unresolved' ? 'acquisition-warning' : 'acquisition-note'} key={note}>{note}</p>)}
    {guide.routes.map((route) => <article className="acquisition-route" key={route.id}>
      <div className="acquisition-route-head"><MapPin size={19} aria-hidden="true" /><div><small>{route.method}</small><h4>{route.location}</h4></div></div>
      <h5>Before you go</h5><ul>{route.requirements.map((text) => <li key={text}>{text}</li>)}</ul>
      <h5>How to obtain it</h5><ol>{route.steps.map((text) => <li key={text}>{text}</li>)}</ol>
      <div className="acquisition-caveats">{route.caveats.map((text) => <p key={text}>{text}</p>)}</div>
      <details className="acquisition-reference"><summary>Evidence and source limitations ({route.evidence.length})</summary><EvidenceLinks sources={route.evidence} /></details>
    </article>)}
    {!!guide.researchLeads?.length && <details className="acquisition-reference"><summary>Research leads - not a verified farming route</summary><EvidenceLinks sources={guide.researchLeads} /></details>}
  </section>
}

// Native modal isolation also works when opened from an existing recipe drawer.
// Unique labels, topmost Escape handling, scroll restoration and return focus.
function SourcesDialog({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialog.showModal()
    return () => { dialog.close(); document.body.style.overflow = overflow; if (trigger?.isConnected) trigger.focus({ preventScroll: true }) }
  }, [])
  return createPortal(<dialog ref={ref} className="acquisition-dialog" aria-labelledby={titleId} onCancel={(event) => { event.preventDefault(); onClose() }} onKeyDown={(event) => { if (event.key === 'Escape' || event.key === 'Tab') event.stopPropagation() }} onClick={(event) => { if (event.target !== event.currentTarget) return; const rect = event.currentTarget.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose() }}>
    <header className="acquisition-dialog-head"><h2 id={titleId}>{title}</h2><button type="button" onClick={onClose} aria-label="Close material sources" autoFocus><X size={20} aria-hidden="true" /></button></header>
    <div className="acquisition-dialog-body">{children}</div>
  </dialog>, document.body)
}
export function MaterialSourceButton({ name }: { name: string }) {
  const [open, setOpen] = useState(false)
  return <><button type="button" className="acquisition-button" aria-label={`Where to get ${name}`} aria-haspopup="dialog" onClick={(event) => { event.stopPropagation(); setOpen(true) }}><MapPin size={14} aria-hidden="true" /><span>Where to get</span></button>{open && <SourcesDialog title={name} onClose={() => setOpen(false)}><MaterialSourcePanel name={name} /></SourcesDialog>}</>
}
export function MaterialSourceBrowser({ names }: { names: string[] }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const searchId = useId()
  const filterId = useId()
  // Include explicit leaf records even when a catalog leaf has no material-sidebar entry.
  const guides = useMemo(() => [...new Map([...materialSourceRecords, ...names.map(getMaterialSourceGuide)].map((guide) => [normalizeMaterialSourceName(guide.name), guide])).values()].sort((a, b) => a.name.localeCompare(b.name)), [names])
  const visible = guides.filter((guide) => (status === 'all' || guide.status === status) && searchText([guide.name, ...guide.aliases, guide.scope, ...guide.routes.map((route) => `${route.location} ${route.method}`)].join(' ')).includes(searchText(query.trim())))
  const unresolved = guides.filter((guide) => guide.status === 'unresolved').length
  return <><button type="button" className="acquisition-button acquisition-browse" aria-haspopup="dialog" onClick={() => setOpen(true)}><BookOpen size={17} aria-hidden="true" />Browse material sources<span>{guides.length}</span></button>{open && <SourcesDialog title="Material acquisition guide" onClose={() => setOpen(false)}>
    <p className="acquisition-notice">{MATERIAL_SOURCES_NOTICE}</p>
    <p>{guides.length} catalog materials tracked · {unresolved} need acquisition verification. Published sources are not live-game confirmations.</p>
    <div className="acquisition-filters"><label htmlFor={searchId}><span>Find a material, location or method</span><span className="acquisition-search"><Search size={17} aria-hidden="true" /><input id={searchId} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try Narbondellyn or dungeon" /></span></label><label htmlFor={filterId}><span id={`${filterId}-label`}>Evidence</span><select id={filterId} aria-labelledby={`${filterId}-label`} value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">All evidence</option><option value="documented">Published source</option><option value="historical">Historical guide</option><option value="unresolved">Needs verification</option></select></label></div>
    <p className="acquisition-results" role="status">{visible.length} material{visible.length === 1 ? '' : 's'} shown</p>
    <div className="acquisition-index">{visible.map((guide) => <details key={guide.name}><summary><span><strong>{guide.name}</strong><small>{guide.scope} · {guide.routes[0]?.location ?? 'Acquisition not verified'}</small></span><span className={`acquisition-status ${guide.status}`}>{statusLabel[guide.status]}</span></summary><MaterialSourcePanel name={guide.name} /></details>)}</div>
    {!visible.length && <p className="acquisition-empty">No matching material. Try a broader search or choose All evidence.</p>}
  </SourcesDialog>}</>
}
