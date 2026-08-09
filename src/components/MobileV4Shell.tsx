import { useEffect, useState } from 'react'
import { BookOpen, Boxes, ChevronLeft, CircleHelp, Gem } from 'lucide-react'

const PHONE_QUERY = '(max-width: 680px)'
const TABLET_QUERY = '(min-width: 681px) and (max-width: 1180px)'
const HISTORY_KEY = 'masterworkMobileDetailV4'

const tabs = [
  { label: 'Catalog', Icon: BookOpen },
  { label: 'Plan', Icon: Boxes },
  { label: 'Materials', Icon: Gem },
  { label: 'Reference', Icon: CircleHelp },
] as const

function sourceButtons() {
  return Array.from(document.querySelectorAll<HTMLButtonElement>('.app > header nav button'))
}

function readDetailTitle() {
  return (
    document.querySelector<HTMLElement>('.catalog .detail .material-drilldown .drilldown-head h2')?.textContent?.trim() ||
    document.querySelector<HTMLElement>('.catalog .detail > .detail-head h2')?.textContent?.trim() ||
    'Item details'
  )
}

function isNestedDetail() {
  return Boolean(document.querySelector('.catalog .detail .material-drilldown .drilldown-back'))
}

function nextHistoryState(open: boolean) {
  const current = window.history.state
  const next = current && typeof current === 'object' ? { ...current } : {}
  if (open) next[HISTORY_KEY] = true
  else delete next[HISTORY_KEY]
  return next
}

function clearStaleScrollLock() {
  const body = document.body
  const root = document.documentElement
  const detail = document.querySelector<HTMLElement>('.catalog .detail')

  for (const property of ['overflow', 'overflow-y', 'position', 'top', 'left', 'right', 'width', 'height', 'touch-action']) {
    body.style.removeProperty(property)
    root.style.removeProperty(property)
  }

  if (detail) {
    for (const property of ['overflow', 'overflow-y', 'position', 'top', 'left', 'right', 'width', 'height', 'touch-action']) {
      detail.style.removeProperty(property)
    }
  }
}

export function MobileV4Shell() {
  const [activeTab, setActiveTab] = useState(0)
  const [planCount, setPlanCount] = useState(0)
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailTitle, setDetailTitle] = useState('Item details')
  const [nested, setNested] = useState(false)

  useEffect(() => {
    const phone = window.matchMedia(PHONE_QUERY)
    const tablet = window.matchMedia(TABLET_QUERY)
    let frame = 0
    let sheetWasOpen = Boolean(document.querySelector('.stats-drawer-layer.open'))

    const sync = () => {
      const buttons = sourceButtons()
      const active = buttons.findIndex((button) => button.classList.contains('active'))
      if (active >= 0) setActiveTab(active)

      const count = Number.parseInt(buttons[1]?.querySelector('.badge')?.textContent || '0', 10)
      setPlanCount(Number.isFinite(count) ? count : 0)

      setDetailTitle(readDetailTitle())
      setNested(isNestedDetail())

      const sheetOpen = Boolean(document.querySelector('.stats-drawer-layer.open'))
      if (sheetWasOpen && !sheetOpen) {
        // React restores the lock in an effect cleanup. Run after that cleanup too.
        requestAnimationFrame(() => {
          clearStaleScrollLock()
          requestAnimationFrame(clearStaleScrollLock)
        })
      }
      sheetWasOpen = sheetOpen
    }

    const scheduleSync = () => {
      if (frame) cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        frame = 0
        sync()
      })
    }

    const openDetail = () => {
      if (!phone.matches) return
      if (!window.history.state?.[HISTORY_KEY]) {
        window.history.pushState(nextHistoryState(true), '', window.location.href)
      }
      document.body.classList.add('mobile-v4-detail-open')
      setDetailOpen(true)
      requestAnimationFrame(() => {
        setDetailTitle(readDetailTitle())
        setNested(isNestedDetail())
        document.querySelector<HTMLElement>('.catalog .detail')?.scrollTo({ top: 0, behavior: 'auto' })
      })
    }

    const closeDetail = () => {
      document.body.classList.remove('mobile-v4-detail-open')
      setDetailOpen(false)
      clearStaleScrollLock()
    }

    const onDocumentClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null
      if (!target) return

      if (phone.matches && target.closest('.catalog .item-main')) {
        requestAnimationFrame(openDetail)
        return
      }

      if (target.closest('.catalog .detail .craftable-indicator, .catalog .detail .drilldown-back')) {
        requestAnimationFrame(scheduleSync)
      }

      if (target.closest('.app > header nav button')) {
        closeDetail()
        if (window.history.state?.[HISTORY_KEY]) {
          window.history.replaceState(nextHistoryState(false), '', window.location.href)
        }
        requestAnimationFrame(scheduleSync)
      }

      if (target.closest('.stats-drawer-close, .stats-drawer-scrim')) {
        requestAnimationFrame(() => requestAnimationFrame(clearStaleScrollLock))
      }
    }

    const onPopState = (event: PopStateEvent) => {
      const open = Boolean(phone.matches && event.state?.[HISTORY_KEY])
      document.body.classList.toggle('mobile-v4-detail-open', open)
      setDetailOpen(open)
      clearStaleScrollLock()
      scheduleSync()
    }

    const onViewportChange = () => {
      if (!phone.matches) {
        document.body.classList.remove('mobile-v4-detail-open')
        setDetailOpen(false)
        if (window.history.state?.[HISTORY_KEY]) {
          window.history.replaceState(nextHistoryState(false), '', window.location.href)
        }
      }
      if (!document.querySelector('.stats-drawer-layer.open')) clearStaleScrollLock()
      scheduleSync()
    }

    clearStaleScrollLock()
    sync()

    const observer = new MutationObserver(scheduleSync)
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
      childList: true,
      characterData: true,
      subtree: true,
    })

    document.addEventListener('click', onDocumentClick)
    window.addEventListener('popstate', onPopState)
    window.addEventListener('pageshow', onViewportChange)
    window.addEventListener('orientationchange', onViewportChange)
    window.addEventListener('resize', onViewportChange, { passive: true })
    phone.addEventListener('change', onViewportChange)
    tablet.addEventListener('change', onViewportChange)

    return () => {
      if (frame) cancelAnimationFrame(frame)
      observer.disconnect()
      document.removeEventListener('click', onDocumentClick)
      window.removeEventListener('popstate', onPopState)
      window.removeEventListener('pageshow', onViewportChange)
      window.removeEventListener('orientationchange', onViewportChange)
      window.removeEventListener('resize', onViewportChange)
      phone.removeEventListener('change', onViewportChange)
      tablet.removeEventListener('change', onViewportChange)
      document.body.classList.remove('mobile-v4-detail-open')
      clearStaleScrollLock()
    }
  }, [])

  const navigate = (index: number) => {
    sourceButtons()[index]?.click()
    setActiveTab(index)
    document.body.classList.remove('mobile-v4-detail-open')
    setDetailOpen(false)
    if (window.history.state?.[HISTORY_KEY]) {
      window.history.replaceState(nextHistoryState(false), '', window.location.href)
    }
    clearStaleScrollLock()
  }

  const goBack = () => {
    const nestedBack = document.querySelector<HTMLButtonElement>('.catalog .detail .material-drilldown .drilldown-back')
    if (nestedBack) {
      nestedBack.click()
      requestAnimationFrame(() => {
        setDetailTitle(readDetailTitle())
        setNested(isNestedDetail())
        document.querySelector<HTMLElement>('.catalog .detail')?.scrollTo({ top: 0, behavior: 'auto' })
      })
      return
    }

    if (window.history.state?.[HISTORY_KEY]) {
      window.history.back()
    } else {
      document.body.classList.remove('mobile-v4-detail-open')
      setDetailOpen(false)
      clearStaleScrollLock()
    }
  }

  return (
    <>
      <header className={`mobile-v4-topbar ${detailOpen ? 'detail-mode' : ''}`}>
        {detailOpen ? (
          <>
            <button type="button" className="mobile-v4-back" onClick={goBack} aria-label={nested ? 'Back to previous recipe' : 'Back to catalog'}>
              <ChevronLeft size={24} aria-hidden="true" />
              <span>{nested ? 'Back' : 'Catalog'}</span>
            </button>
            <strong className="mobile-v4-detail-title">{detailTitle}</strong>
            <span className="mobile-v4-topbar-spacer" aria-hidden="true" />
          </>
        ) : (
          <a className="mobile-v4-brand" href={import.meta.env.BASE_URL} aria-label="The Masterwork Vault home">
            <img src={`${import.meta.env.BASE_URL}assets/brand/masterwork-vault-mark.svg`} alt="" />
            <span>
              <strong>The Masterwork Vault</strong>
              <small>Menzoberranzan Masterwork</small>
            </span>
          </a>
        )}
      </header>

      <aside className="tablet-v4-sidebar" aria-label="Primary navigation">
        <a className="tablet-v4-brand" href={import.meta.env.BASE_URL} aria-label="The Masterwork Vault home">
          <img src={`${import.meta.env.BASE_URL}assets/brand/masterwork-vault-mark.svg`} alt="" />
          <span><strong>The Masterwork Vault</strong><small>Menzoberranzan Masterwork</small></span>
        </a>
        <nav className="tablet-v4-nav">
          {tabs.map(({ label, Icon }, index) => (
            <button
              type="button"
              className={activeTab === index ? 'active' : ''}
              aria-current={activeTab === index ? 'page' : undefined}
              onClick={() => navigate(index)}
              key={label}
            >
              <Icon size={21} aria-hidden="true" />
              <span>{label}</span>
              {index === 1 && planCount > 0 && <b className="badge">{planCount}</b>}
            </button>
          ))}
        </nav>
      </aside>

      <nav className="mobile-v4-tabbar" aria-label="Primary navigation">
        {tabs.map(({ label, Icon }, index) => (
          <button
            type="button"
            className={activeTab === index ? 'active' : ''}
            aria-current={activeTab === index ? 'page' : undefined}
            onClick={() => navigate(index)}
            key={label}
          >
            <Icon size={23} aria-hidden="true" />
            <span>{label}</span>
            {index === 1 && planCount > 0 && <b className="badge">{planCount}</b>}
          </button>
        ))}
      </nav>
    </>
  )
}
