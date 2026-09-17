import { useEffect, useRef, useState } from 'react'
import { BookOpen, Boxes, ChevronLeft, CircleHelp, Gem, Route, Menu, Search, GitBranch, ClipboardCheck, ShieldCheck } from 'lucide-react'
import catalogJson from '../data/catalog'
import type { CatalogData } from '../types'
import { requestAppRoute, type CoreView } from '../lib/navigation'

const catalog = catalogJson as CatalogData
const PHONE_QUERY = '(max-width: 680px)'
const coreViews = new Set(['catalog', 'plan', 'materials', 'reference'])
type ViewName = CoreView | 'journey' | 'readiness' | 'explore' | 'graph' | 'data-health'
type AppStateDetail = { view?: CoreView; planCount?: number; itemTitle?: string | null; detailOpen?: boolean }
const tabs = [
  { view: 'catalog', label: 'Catalog', Icon: BookOpen },
  { view: 'plan', label: 'Plan', Icon: Boxes },
  { view: 'materials', label: 'Materials', Icon: Gem },
  { view: 'reference', label: 'Reference', Icon: CircleHelp },
] as const
const tools = [
  { view: 'explore', label: 'Advanced explorer', detail: 'Filter the full item catalog', Icon: Search },
  { view: 'graph', label: 'Recipe graph', detail: 'Follow crafting dependencies', Icon: GitBranch },
  { view: 'readiness', label: 'Readiness tracker', detail: 'Record your profession progress', Icon: ClipboardCheck },
  { view: 'data-health', label: 'Data health', detail: 'Inspect evidence and missing records', Icon: ShieldCheck },
] as const
function viewFromPath(): ViewName {
  const first = window.location.pathname.split('/').filter(Boolean)[0]
  return [...coreViews, 'journey', 'readiness', 'explore', 'graph', 'data-health'].includes(first) ? first as ViewName : 'catalog'
}
function itemTitleFromPath() {
  const parts = window.location.pathname.split('/').filter(Boolean)
  if (parts[0] !== 'catalog' || parts.length < 3) return 'Item details'
  try { return catalog.items.find((item) => item.id === decodeURIComponent(parts[2]))?.name || 'Item details' }
  catch { return 'Item details' }
}

/** Shared navigation for every route. It never releases scroll locks owned by dialogs. */
export function MobileV4Shell() {
  const [activeView, setActiveView] = useState<ViewName>(viewFromPath)
  const [planCount, setPlanCount] = useState(0)
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailTitle, setDetailTitle] = useState(itemTitleFromPath)
  const [nested, setNested] = useState(false)
  const menu = useRef<HTMLDetailsElement>(null)
  useEffect(() => {
    const phone = window.matchMedia(PHONE_QUERY)
    const applyPath = () => {
      const view = viewFromPath()
      const isDetail = phone.matches && view === 'catalog' && window.location.pathname.split('/').filter(Boolean).length >= 3
      setActiveView(view); setDetailOpen(isDetail); setNested(false); setDetailTitle(itemTitleFromPath())
      document.body.classList.toggle('mobile-v4-detail-open', isDetail)
    }
    const onAppState = (event: Event) => {
      const detail = (event as CustomEvent<AppStateDetail>).detail || {}
      if (detail.view) setActiveView(detail.view)
      if (Number.isFinite(detail.planCount)) setPlanCount(Math.max(0, Number(detail.planCount)))
      if (detail.itemTitle) setDetailTitle(detail.itemTitle)
      if (typeof detail.detailOpen === 'boolean' && phone.matches) {
        setDetailOpen(detail.detailOpen)
        document.body.classList.toggle('mobile-v4-detail-open', detail.detailOpen)
      }
    }
    const onDetailState = (event: Event) => {
      const detail = (event as CustomEvent<{ nested?: boolean; title?: string }>).detail || {}
      setNested(Boolean(detail.nested)); if (detail.title) setDetailTitle(detail.title)
    }
    applyPath()
    document.addEventListener('masterwork:app-state', onAppState)
    document.addEventListener('masterwork:detail-state', onDetailState)
    document.addEventListener('masterwork:navigate', applyPath)
    window.addEventListener('popstate', applyPath)
    window.addEventListener('pageshow', applyPath)
    phone.addEventListener('change', applyPath)
    return () => {
      document.removeEventListener('masterwork:app-state', onAppState)
      document.removeEventListener('masterwork:detail-state', onDetailState)
      document.removeEventListener('masterwork:navigate', applyPath)
      window.removeEventListener('popstate', applyPath)
      window.removeEventListener('pageshow', applyPath)
      phone.removeEventListener('change', applyPath)
      document.body.classList.remove('mobile-v4-detail-open')
    }
  }, [])
  const navigate = (view: CoreView) => {
    if (!coreViews.has(viewFromPath())) { window.location.assign(`/${view}`); return }
    requestAppRoute({ view })
    setActiveView(view); setDetailOpen(false); setNested(false)
    document.body.classList.remove('mobile-v4-detail-open')
  }
  const goBack = () => {
    if (nested) document.dispatchEvent(new CustomEvent('masterwork:detail-back'))
    else navigate('catalog')
  }
  const routeLabel = tabs.find((tab) => tab.view === activeView)?.label || tools.find((tool) => tool.view === activeView)?.label || 'Masterwork journey'
  const coreButtons = tabs.map(({ view, label, Icon }) => <button type="button" className={activeView === view ? 'active' : ''} aria-current={activeView === view ? 'page' : undefined} onClick={() => navigate(view)} key={view}><Icon size={21} aria-hidden="true" /><span>{label}</span>{view === 'plan' && planCount > 0 && <b className="badge">{planCount}</b>}</button>)
  const journeyLink = <a href="/journey" className={activeView === 'journey' ? 'active' : ''} aria-current={activeView === 'journey' ? 'page' : undefined} aria-label="Open Masterwork journey"><Route size={21} aria-hidden="true" /><span>Journey</span></a>
  return <>
    <header className={`mobile-v4-topbar ${detailOpen ? 'detail-mode' : ''}`}>
      {detailOpen ? <><button type="button" className="mobile-v4-back" onClick={goBack} aria-label={nested ? 'Back to previous recipe' : 'Back to catalog'}><ChevronLeft size={22} aria-hidden="true" /><span>Back</span></button><strong className="mobile-v4-detail-title">{detailTitle}</strong></> : <a className="mobile-v4-brand" href="/catalog" aria-label="The Masterwork Vault home"><img src="/assets/brand/masterwork-vault-mark.svg" alt="" /><span><strong>The Masterwork Vault</strong><small>{routeLabel}</small></span></a>}
      <details className="workspace-tools-menu" ref={menu} onKeyDown={(event) => { if (event.key === 'Escape' && menu.current?.open) { event.stopPropagation(); menu.current.open = false; menu.current.querySelector('summary')?.focus() } }}>
        <summary aria-label="More workspace tools"><Menu size={20} aria-hidden="true" /></summary>
        <nav aria-label="Workspace tools">{tools.map(({ view, label, detail, Icon }) => <a href={`/${view}`} key={view} aria-current={activeView === view ? 'page' : undefined}><Icon size={19} aria-hidden="true" /><span><strong>{label}</strong><small>{detail}</small></span></a>)}</nav>
      </details>
    </header>
    <aside className="tablet-v4-sidebar" aria-label="Workspace navigation"><a className="tablet-v4-brand" href="/catalog" aria-label="The Masterwork Vault home"><img src="/assets/brand/masterwork-vault-mark.svg" alt="" /><span><strong>The Masterwork Vault</strong><small>Crafting reference</small></span></a><nav className="tablet-v4-nav" aria-label="Primary navigation">{coreButtons}{journeyLink}{tools.map(({ view, label, Icon }) => <a href={`/${view}`} className={activeView === view ? 'active' : ''} aria-current={activeView === view ? 'page' : undefined} key={view}><Icon size={21} aria-hidden="true" /><span>{label}</span></a>)}</nav></aside>
    <nav className="mobile-v4-tabbar" aria-label="Primary navigation">{coreButtons}{journeyLink}</nav>
  </>
}
