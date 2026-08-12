import { useEffect, useMemo, useState } from 'react'
import { BookOpen, Boxes, ChevronLeft, CircleHelp, Gem } from 'lucide-react'
import catalogJson from '../data/catalog'
import type { CatalogData } from '../types'
import { requestAppRoute } from '../lib/navigation'

const catalog = catalogJson as CatalogData
const PHONE_QUERY = '(max-width: 680px)'

type ViewName = 'catalog' | 'plan' | 'materials' | 'reference'
type AppStateDetail = {
  view?: ViewName
  planCount?: number
  itemId?: string | null
  itemTitle?: string | null
  detailOpen?: boolean
}
type DetailState = { nested?: boolean; title?: string | null }

const tabs = [
  { view: 'catalog', label: 'Catalog', Icon: BookOpen },
  { view: 'plan', label: 'Plan', Icon: Boxes },
  { view: 'materials', label: 'Materials', Icon: Gem },
  { view: 'reference', label: 'Reference', Icon: CircleHelp },
] as const

function viewFromPath(): ViewName {
  const first = window.location.pathname.split('/').filter(Boolean)[0]
  return first === 'plan' || first === 'materials' || first === 'reference' ? first : 'catalog'
}

function itemTitleFromPath() {
  const parts = window.location.pathname.split('/').filter(Boolean)
  if (parts[0] !== 'catalog' || parts.length < 3) return 'Item details'
  const id = decodeURIComponent(parts[2])
  return catalog.items.find((item) => item.id === id)?.name || 'Item details'
}

function clearStaleScrollLock() {
  const body = document.body
  const root = document.documentElement
  for (const property of ['overflow', 'overflow-y', 'position', 'top', 'left', 'right', 'width', 'height', 'touch-action']) {
    body.style.removeProperty(property)
    root.style.removeProperty(property)
  }
}

export function MobileV4Shell() {
  const [activeView, setActiveView] = useState<ViewName>(() => viewFromPath())
  const [planCount, setPlanCount] = useState(0)
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailTitle, setDetailTitle] = useState(() => itemTitleFromPath())
  const [nested, setNested] = useState(false)
  const activeTab = useMemo(() => Math.max(0, tabs.findIndex((tab) => tab.view === activeView)), [activeView])

  useEffect(() => {
    const phone = window.matchMedia(PHONE_QUERY)

    const applyPath = () => {
      const nextView = viewFromPath()
      const routeHasItem = window.location.pathname.split('/').filter(Boolean).length >= 3
      setActiveView(nextView)
      if (!phone.matches || nextView !== 'catalog') {
        setDetailOpen(false)
        setNested(false)
        document.body.classList.remove('mobile-v4-detail-open')
        clearStaleScrollLock()
        return
      }
      setDetailOpen(routeHasItem)
      setDetailTitle(itemTitleFromPath())
      document.body.classList.toggle('mobile-v4-detail-open', routeHasItem)
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
      const detail = (event as CustomEvent<DetailState>).detail || {}
      setNested(Boolean(detail.nested))
      if (detail.title) setDetailTitle(detail.title)
    }

    const onViewport = () => applyPath()
    applyPath()
    document.addEventListener('masterwork:app-state', onAppState)
    document.addEventListener('masterwork:detail-state', onDetailState)
    document.addEventListener('masterwork:navigate', applyPath)
    window.addEventListener('popstate', applyPath)
    window.addEventListener('pageshow', applyPath)
    phone.addEventListener('change', onViewport)
    return () => {
      document.removeEventListener('masterwork:app-state', onAppState)
      document.removeEventListener('masterwork:detail-state', onDetailState)
      document.removeEventListener('masterwork:navigate', applyPath)
      window.removeEventListener('popstate', applyPath)
      window.removeEventListener('pageshow', applyPath)
      phone.removeEventListener('change', onViewport)
      document.body.classList.remove('mobile-v4-detail-open')
      clearStaleScrollLock()
    }
  }, [])

  const navigate = (view: ViewName) => {
    requestAppRoute({ view })
    setActiveView(view)
    setDetailOpen(false)
    setNested(false)
    document.body.classList.remove('mobile-v4-detail-open')
    clearStaleScrollLock()
  }

  const goBack = () => {
    if (nested) {
      document.dispatchEvent(new CustomEvent('masterwork:detail-back'))
      return
    }
    if (window.history.length > 1) window.history.back()
    else navigate('catalog')
  }

  return <>
    <header className={`mobile-v4-topbar ${detailOpen ? 'detail-mode' : ''}`}>
      {detailOpen ? <><button type="button" className="mobile-v4-back" onClick={goBack} aria-label={nested ? 'Back to previous recipe' : 'Back to catalog'}><ChevronLeft size={24} aria-hidden="true" /><span>{nested ? 'Back' : 'Catalog'}</span></button><strong className="mobile-v4-detail-title">{detailTitle}</strong><span className="mobile-v4-topbar-spacer" aria-hidden="true" /></> : <a className="mobile-v4-brand" href="/catalog" aria-label="The Masterwork Vault home"><img src="/assets/brand/masterwork-vault-mark.svg" alt="" /><span><strong>The Masterwork Vault</strong><small>Underdark + Sharandar Masterwork</small></span></a>}
    </header>
    <aside className="tablet-v4-sidebar" aria-label="Primary navigation"><a className="tablet-v4-brand" href="/catalog" aria-label="The Masterwork Vault home"><img src="/assets/brand/masterwork-vault-mark.svg" alt="" /><span><strong>The Masterwork Vault</strong><small>Underdark + Sharandar Masterwork</small></span></a><nav className="tablet-v4-nav">{tabs.map(({ view, label, Icon }, index) => <button type="button" className={activeTab === index ? 'active' : ''} aria-current={activeTab === index ? 'page' : undefined} onClick={() => navigate(view)} key={view}><Icon size={21} aria-hidden="true" /><span>{label}</span>{view === 'plan' && planCount > 0 && <b className="badge">{planCount}</b>}</button>)}</nav></aside>
    <nav className="mobile-v4-tabbar" aria-label="Primary navigation">{tabs.map(({ view, label, Icon }, index) => <button type="button" className={activeTab === index ? 'active' : ''} aria-current={activeTab === index ? 'page' : undefined} onClick={() => navigate(view)} key={view}><Icon size={23} aria-hidden="true" /><span>{label}</span>{view === 'plan' && planCount > 0 && <b className="badge">{planCount}</b>}</button>)}</nav>
  </>
}
