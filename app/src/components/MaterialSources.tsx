import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { AlertCircle, BookOpen, ChevronDown, ExternalLink, MapPin, Search, X } from 'lucide-react'
import {
  getMaterialSourceGuide, materialSourceRecords, MATERIAL_SOURCES_NOTICE,
  normalizeMaterialSourceName, type AcquisitionMethod, type AcquisitionStatus,
  type MaterialSourceGuide, type SourceEvidence,
} from '../data/materialSources'
import { indexMaterialSource, matchesMaterialSource } from '../domain/materialSourceSearch'
import './material-sources.css'

const statusLabel: Record<AcquisitionStatus, string> = {
  documented: 'Published source', historical: 'Historical guide', unresolved: 'Needs verification',
}
const FOCUSABLE = 'button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),summary,[tabindex]:not([tabindex="-1"])'

function SourceStatus({ status }: { status: AcquisitionStatus }) {
  return <span className={`acquisition-status ${status}`}>
    {status === 'unresolved' && <AlertCircle size={13} aria-hidden="true" />}
    {statusLabel[status]}
  </span>
}

function EvidenceLinks({ sources }: { sources: SourceEvidence[] }) {
  return <div className="acquisition-evidence">
    {sources.map((source) => <div key={source.url}>
      <a href={source.url} target="_blank" rel="noopener noreferrer">
        {source.title}<ExternalLink size={13} aria-hidden="true" />
        <span className="acquisition-sr-only"> (opens in a new tab)</span>
      </a>
      <p>{source.supports}</p>
      <small>{source.publishedAt ? `Published ${source.publishedAt} · ` : ''}Reviewed {source.checkedAt} · {source.access.replaceAll('-', ' ')}</small>
    </div>)}
  </div>
}

export function MaterialSourcePanel({ name, embedded = false }: { name: string; embedded?: boolean }) {
  const guide = getMaterialSourceGuide(name)
  const headingId = useId()
  return <section className="acquisition-guide" aria-labelledby={headingId} data-source-status={guide.status}>
    <header className="acquisition-guide-head">
      <div><small>ACQUISITION GUIDE</small><h3 id={headingId}>Where to get {guide.name}</h3></div>
      <SourceStatus status={guide.status} />
    </header>
    {/* The browser already shows the full notice once, above its results. */}
    {!embedded && <p className="acquisition-notice">{MATERIAL_SOURCES_NOTICE}</p>}
    {guide.notes.map((note) => <p className={guide.status === 'unresolved' ? 'acquisition-warning' : 'acquisition-note'} key={note}>{note}</p>)}
    {guide.routes.map((route) => <article className="acquisition-route" key={route.id}>
      <div className="acquisition-route-head">
        <span className="acquisition-location-icon"><MapPin size={20} aria-hidden="true" /></span>
        <div><small>{route.method}</small><h4>{route.location}</h4></div>
      </div>
      <div className="acquisition-route-content">
        <div className="acquisition-requirements"><h5>Before you go</h5>
          <ul>{route.requirements.map((text) => <li key={text}>{text}</li>)}</ul>
        </div>
        <div className="acquisition-steps"><h5>How to obtain it</h5>
          <ol>{route.steps.map((text) => <li key={text}>{text}</li>)}</ol>
        </div>
      </div>
      <div className="acquisition-caveats"><strong>Keep in mind</strong>
        {route.caveats.map((text) => <p key={text}>{text}</p>)}
      </div>
      <details className="acquisition-reference">
        <summary>Evidence and source limitations ({route.evidence.length})</summary>
        <EvidenceLinks sources={route.evidence} />
      </details>
    </article>)}
    {!!guide.researchLeads?.length && <details className="acquisition-reference">
      <summary>Research leads - not a verified farming route</summary>
      <EvidenceLinks sources={guide.researchLeads} />
    </details>}
    {embedded && <p className="acquisition-review-date">Sources reviewed {guide.reviewedAt}; not verified in-game.</p>}
  </section>
}

type SourcesDialogProps = {
  title: string
  onClose: () => void
  returnFocusRef: RefObject<HTMLButtonElement | null>
  children: ReactNode
}

/** Native top-layer isolation plus explicit keyboard boundaries for nested recipe drawers. */
function SourcesDialog({ title, onClose, returnFocusRef, children }: SourcesDialogProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const backdropPress = useRef(false)
  const titleId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    const trigger = returnFocusRef.current
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialog.showModal()
    headingRef.current?.focus({ preventScroll: true })
    return () => {
      dialog.close()
      document.body.style.overflow = previousOverflow
      if (trigger?.isConnected) trigger.focus({ preventScroll: true })
    }
  }, [returnFocusRef])

  function handleKeyDown(event: KeyboardEvent<HTMLDialogElement>) {
    // Portal events bubble through the React tree; do not activate an underlying drawer/search.
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault()
      event.stopPropagation()
      return
    }
    if (event.key === 'Escape') { event.stopPropagation(); return }
    if (event.key !== 'Tab') return
    event.stopPropagation()
    const dialog = ref.current
    if (!dialog) return
    const nodes = [...dialog.querySelectorAll<HTMLElement>(FOCUSABLE)]
      .filter((node) => node.tabIndex >= 0 && node.getClientRects().length > 0 && !node.closest('[inert]'))
    const first = nodes[0]
    const last = nodes[nodes.length - 1]
    if (!first || !last) { event.preventDefault(); headingRef.current?.focus(); return }
    const active = document.activeElement
    if (event.shiftKey && (active === first || active === headingRef.current)) {
      event.preventDefault(); last.focus()
    } else if (!event.shiftKey && active === last) {
      event.preventDefault(); first.focus()
    }
  }

  function isBackdrop(target: EventTarget, clientX: number, clientY: number) {
    const dialog = ref.current
    if (!dialog || target !== dialog) return false
    const rect = dialog.getBoundingClientRect()
    return clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom
  }

  return createPortal(<dialog ref={ref} className="acquisition-dialog" aria-modal="true" aria-labelledby={titleId}
    onCancel={(event) => { event.preventDefault(); onClose() }}
    onKeyDown={handleKeyDown}
    onPointerDown={(event) => { backdropPress.current = isBackdrop(event.target, event.clientX, event.clientY) }}
    onClick={(event) => {
      event.stopPropagation()
      // Dragging a selection from content onto the backdrop must not discard the guide.
      if (backdropPress.current && isBackdrop(event.target, event.clientX, event.clientY)) onClose()
      backdropPress.current = false
    }}>
    <header className="acquisition-dialog-head">
      <div><small>THE MASTERWORK VAULT</small><h2 id={titleId} ref={headingRef} tabIndex={-1}>{title}</h2></div>
      <button type="button" onClick={onClose} aria-label="Close material sources"><X size={20} aria-hidden="true" /></button>
    </header>
    <div className="acquisition-dialog-body">{children}</div>
  </dialog>, document.body)
}

export function MaterialSourceButton({ name }: { name: string }) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  return <>
    <button ref={triggerRef} type="button" className="acquisition-button" aria-label={`Where to get ${name}`} aria-haspopup="dialog"
      onClick={(event) => { event.stopPropagation(); setOpen(true) }}>
      <MapPin size={15} aria-hidden="true" /><span>Where to get</span>
    </button>
    {open && <SourcesDialog title={name} onClose={() => setOpen(false)} returnFocusRef={triggerRef}>
      <MaterialSourcePanel name={name} />
    </SourcesDialog>}
  </>
}

function SourceIndexEntry({ guide }: { guide: MaterialSourceGuide }) {
  const [expanded, setExpanded] = useState(false)
  return <details onToggle={(event) => setExpanded(event.currentTarget.open)}>
    <summary>
      <span className="acquisition-index-copy"><strong>{guide.name}</strong>
        <small>{guide.scope} · {guide.routes[0]?.location ?? 'Acquisition not verified'}</small>
      </span>
      <SourceStatus status={guide.status} />
      <ChevronDown className="acquisition-chevron" size={17} aria-hidden="true" />
    </summary>
    {expanded && <MaterialSourcePanel name={guide.name} embedded />}
  </details>
}

export function MaterialSourceBrowser({ names }: { names: string[] }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<AcquisitionStatus | 'all'>('all')
  const [method, setMethod] = useState<AcquisitionMethod | 'all'>('all')
  const triggerRef = useRef<HTMLButtonElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const searchId = useId()
  const filterId = useId()
  const methodId = useId()
  // Include registry leaves missing from the sidebar and build the searchable text just once.
  const index = useMemo(() => [...new Map(
    [...materialSourceRecords, ...names.map(getMaterialSourceGuide)]
      .map((guide) => [normalizeMaterialSourceName(guide.name), guide]),
  ).values()].sort((a, b) => a.name.localeCompare(b.name)).map(indexMaterialSource), [names])
  const methods = useMemo(() => [...new Set(index.flatMap(({ guide }) => guide.routes.map((route) => route.method)))].sort(), [index])
  const visible = index.filter(({ guide, text }) => (status === 'all' || guide.status === status)
    && (method === 'all' || guide.routes.some((route) => route.method === method))
    && matchesMaterialSource(text, query))
  const unresolved = index.filter(({ guide }) => guide.status === 'unresolved').length
  const hasFilters = Boolean(query.trim() || status !== 'all' || method !== 'all')

  function resetFilters() {
    setQuery(''); setStatus('all'); setMethod('all')
    searchRef.current?.focus({ preventScroll: true })
  }

  return <>
    <button ref={triggerRef} type="button" className="acquisition-button acquisition-browse" aria-haspopup="dialog" onClick={() => setOpen(true)}>
      <BookOpen size={18} aria-hidden="true" /><span>Browse material sources</span><b>{index.length}</b>
    </button>
    {open && <SourcesDialog title="Material acquisition guide" onClose={() => setOpen(false)} returnFocusRef={triggerRef}>
      <div className="acquisition-intro">
        <p className="acquisition-lead">Find the material. Know where to go.</p>
        <p>Search by name, location or hunt modifier, then open a material for its steps and references.</p>
        <div className="acquisition-coverage" aria-label="Source coverage">
          <span><b>{index.length}</b> materials</span><span><b>{index.length - unresolved}</b> with published guidance</span>
          <span><b>{unresolved}</b> unresolved</span>
        </div>
        <p className="acquisition-notice">{MATERIAL_SOURCES_NOTICE}</p>
      </div>
      <div className="acquisition-filters">
        <div className="acquisition-query-field">
          <label htmlFor={searchId}>Find a material, location or method</label>
          <div className="acquisition-search"><Search size={18} aria-hidden="true" />
            <input id={searchId} ref={searchRef} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="e.g. Mushroom Log or Tricky Reversal" />
          </div>
        </div>
        <div><label htmlFor={methodId}>Acquisition method</label>
          <select id={methodId} value={method} onChange={(event) => setMethod(event.target.value as AcquisitionMethod | 'all')}>
            <option value="all">All methods</option>{methods.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </div>
        <div><label htmlFor={filterId}>Evidence</label>
          <select id={filterId} value={status} onChange={(event) => setStatus(event.target.value as AcquisitionStatus | 'all')}>
            <option value="all">All evidence</option><option value="documented">Published source</option>
            <option value="historical">Historical guide</option><option value="unresolved">Needs verification</option>
          </select>
        </div>
      </div>
      <div className="acquisition-results-bar">
        <p className="acquisition-results" role="status" aria-atomic="true">{visible.length} of {index.length} materials shown</p>
        {hasFilters && <button type="button" className="acquisition-reset" onClick={resetFilters}>Reset filters</button>}
      </div>
      <div className="acquisition-index">{visible.map(({ guide }) => <SourceIndexEntry key={guide.name} guide={guide} />)}</div>
      {!visible.length && <div className="acquisition-empty">
        <Search size={26} aria-hidden="true" /><h3>No matching materials</h3>
        <p>Try a shorter name, another location or reset the filters above.</p>
      </div>}
    </SourcesDialog>}
  </>
}
