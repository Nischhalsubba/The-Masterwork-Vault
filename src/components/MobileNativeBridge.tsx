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

export function MobileNativeBridge() {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const [planCount, setPlanCount] = useState(0)

  useEffect(() => {
    const media = window.matchMedia(PHONE_QUERY)

    const syncNavigation = () => {
      const sourceButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('.app > header nav button'))
      const nextActive = sourceButtons.findIndex((button) => button.classList.contains('active'))
      if (nextActive >= 0) setActiveTab(nextActive)

      const count = Number.parseInt(sourceButtons[1]?.querySelector('.badge')?.textContent || '0', 10)
      setPlanCount(Number.isFinite(count) ? count : 0)
    }

    const applyOpen = (next: boolean) => {
      document.body.classList.toggle('mobile-detail-open', next)
      setOpen(next)
      if (next) {
        window.requestAnimationFrame(() => {
          document.querySelector<HTMLElement>('.catalog .detail')?.scrollTo({ top: 0, behavior: 'auto' })
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
        return
      }

      if (target.closest('.app > header nav button')) {
        closeAndClearHistory()
        window.requestAnimationFrame(syncNavigation)
      }
    }

    const onPopState = (event: PopStateEvent) => {
      applyOpen(Boolean(media.matches && event.state?.[HISTORY_KEY]))
      window.requestAnimationFrame(syncNavigation)
    }

    const onMediaChange = () => {
      if (!media.matches) closeAndClearHistory()
      syncNavigation()
    }

    syncNavigation()
    const sourceNav = document.querySelector('.app > header nav')
    const observer = new MutationObserver(syncNavigation)
    if (sourceNav) {
      observer.observe(sourceNav, {
        attributes: true,
        attributeFilter: ['class'],
        childList: true,
        characterData: true,
        subtree: true,
      })
    }

    document.addEventListener('click', onDocumentClick)
    window.addEventListener('popstate', onPopState)
    media.addEventListener('change', onMediaChange)

    return () => {
      observer.disconnect()
      document.removeEventListener('click', onDocumentClick)
      window.removeEventListener('popstate', onPopState)
      media.removeEventListener('change', onMediaChange)
      document.body.classList.remove('mobile-detail-open')
    }
  }, [])

  const close = () => {
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
      <button
        type="button"
        className={`mobile-native-back ${open ? 'visible' : ''}`}
        onClick={close}
        tabIndex={open ? 0 : -1}
        aria-hidden={!open}
        aria-label="Back to catalog list"
      >
        <ChevronLeft size={20} aria-hidden="true" />
        <span>Catalog</span>
      </button>

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
