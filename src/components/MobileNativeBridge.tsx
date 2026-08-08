import { useEffect, useState } from 'react'
import { BookOpen, Boxes, ChevronLeft, CircleHelp, Gem } from 'lucide-react'

const PHONE_QUERY = '(max-width: 680px)'
const HISTORY_KEY = 'masterworkMobileDetail'

const mobileTabs = [
  { label: 'Catalog', Icon: BookOpen },
  { label: 'Plan', Icon: Boxes },
  { label: 'Materials', Icon: Gem },
  { label: 'Reference', Icon: CircleHelp },
] as const

function mobileHistoryState(value: boolean) {
  const current = window.history.state
  const next = current && typeof current === 'object' ? { ...current } : {}
  if (value) next[HISTORY_KEY] = true
  else delete next[HISTORY_KEY]
  return next
}

function readDetailChrome() {
  const detail = document.querySelector<HTMLElement>('.catalog .detail')
  const nestedBack = detail?.querySelector<HTMLButtonElement>('.material-drilldown .drilldown-back') ?? null
  const drilldownTitle = detail?.querySelector<HTMLElement>('.material-drilldown .drilldown-head h2')?.textContent?.trim()
  const rootTitle = detail?.querySelector<HTMLElement>(':scope > .detail-head h2')?.textContent?.trim()
  return {
    nested: Boolean(nestedBack),
    title: drilldownTitle || rootTitle || 'Item details',
  }
}

export function MobileNativeBridge() {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const [planCount, setPlanCount] = useState(0)
  const [detailTitle, setDetailTitle] = useState('Item details')
  const [nestedDetail, setNestedDetail] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(PHONE_QUERY)
    let syncFrame = 0

    const syncNavigation = () => {
      const sourceButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('.app > header nav button'))
      const nextActive = sourceButtons.findIndex((button) => button.classList.contains('active'))
      if (nextActive >= 0) setActiveTab(nextActive)

      const count = Number.parseInt(sourceButtons[1]?.querySelector('.badge')?.textContent || '0', 10)
      setPlanCount(Number.isFinite(count) ? count : 0)
    }

    const syncDetailChrome = () => {
      const next = readDetailChrome()
      setDetailTitle(next.title)
      setNestedDetail(next.nested)
    }

    const scheduleSync = () => {
      if (syncFrame) cancelAnimationFrame(syncFrame)
      syncFrame = requestAnimationFrame(() => {
        syncFrame = 0
        syncNavigation()
        syncDetailChrome()
      })
    }

    const applyOpen = (next: boolean) => {
      document.body.classList.toggle('mobile-detail-open', next)
      setOpen(next)
      if (next) {
        requestAnimationFrame(() => {
          document.querySelector<HTMLElement>('.catalog .detail')?.scrollTo({ top: 0, behavior: 'auto' })
          syncDetailChrome()
        })
      }
    }

    const openDetail = () => {
      if (!media.matches) return
      if (!window.history.state?.[HISTORY_KEY]) {
        window.history.pushState(mobileHistoryState(true), '', window.location.href)
      }
      applyOpen(true)
    }

    const closeAndClearHistory = () => {
      applyOpen(false)
      if (window.history.state?.[HISTORY_KEY]) {
        window.history.replaceState(mobileHistoryState(false), '', window.location.href)
      }
    }

    const onDocumentClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null
      if (!target) return

      if (media.matches && target.closest('.catalog .item-main')) {
        openDetail()
        scheduleSync()
        return
      }

      if (target.closest('.catalog .detail .craftable-indicator, .catalog .detail .drilldown-back')) {
        scheduleSync()
      }

      if (target.closest('.app > header nav button')) {
        closeAndClearHistory()
        scheduleSync()
      }
    }

    const onPopState = (event: PopStateEvent) => {
      applyOpen(Boolean(media.matches && event.state?.[HISTORY_KEY]))
      scheduleSync()
    }

    const onMediaChange = () => {
      if (!media.matches) closeAndClearHistory()
      scheduleSync()
    }

    syncNavigation()
    syncDetailChrome()

    const sourceNav = document.querySelector('.app > header nav')
    const navObserver = new MutationObserver(scheduleSync)
    if (sourceNav) {
      navObserver.observe(sourceNav, {
        attributes: true,
        attributeFilter: ['class'],
        childList: true,
        characterData: true,
        subtree: true,
      })
    }

    const root = document.querySelector('#root')
    const detailObserver = new MutationObserver(scheduleSync)
    if (root) {
      detailObserver.observe(root, {
        childList: true,
        characterData: true,
        subtree: true,
      })
    }

    document.addEventListener('click', onDocumentClick)
    window.addEventListener('popstate', onPopState)
    media.addEventListener('change', onMediaChange)

    return () => {
      if (syncFrame) cancelAnimationFrame(syncFrame)
      navObserver.disconnect()
      detailObserver.disconnect()
      document.removeEventListener('click', onDocumentClick)
      window.removeEventListener('popstate', onPopState)
      media.removeEventListener('change', onMediaChange)
      document.body.classList.remove('mobile-detail-open')
    }
  }, [])

  const close = () => {
    const nestedBack = document.querySelector<HTMLButtonElement>('.catalog .detail .material-drilldown .drilldown-back')
    if (nestedBack) {
      nestedBack.click()
      requestAnimationFrame(() => {
        const next = readDetailChrome()
        setDetailTitle(next.title)
        setNestedDetail(next.nested)
        document.querySelector<HTMLElement>('.catalog .detail')?.scrollTo({ top: 0, behavior: 'auto' })
      })
      return
    }

    if (window.history.state?.[HISTORY_KEY]) window.history.back()
    else {
      document.body.classList.remove('mobile-detail-open')
      setOpen(false)
    }
  }

  const navigate = (index: number) => {
    const sourceButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('.app > header nav button'))
    sourceButtons[index]?.click()
    setActiveTab(index)
  }

  return (
    <>
      <div className={`mobile-native-detailbar ${open ? 'visible' : ''}`} aria-hidden={!open}>
        <button
          type="button"
          className="mobile-native-back"
          onClick={close}
          tabIndex={open ? 0 : -1}
          aria-label={nestedDetail ? 'Back to previous recipe' : 'Back to catalog'}
        >
          <ChevronLeft size={24} aria-hidden="true" />
          <span>{nestedDetail ? 'Back' : 'Catalog'}</span>
        </button>
        <strong className="mobile-native-detailbar-title">{detailTitle}</strong>
        <span className="mobile-native-detailbar-spacer" aria-hidden="true" />
      </div>

      <nav className="mobile-native-tabbar" aria-label="Primary navigation">
        {mobileTabs.map(({ label, Icon }, index) => (
          <button
            type="button"
            className={activeTab === index ? 'active' : ''}
            aria-current={activeTab === index ? 'page' : undefined}
            onClick={() => navigate(index)}
            key={label}
          >
            <Icon size={20} aria-hidden="true" />
            <span>{label}</span>
            {index === 1 && planCount > 0 && <b className="badge">{planCount}</b>}
          </button>
        ))}
      </nav>
    </>
  )
}
