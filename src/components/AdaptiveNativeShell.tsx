import { useEffect, useState } from 'react'
import { BookOpen, Boxes, CircleHelp, Gem } from 'lucide-react'

const tabs = [
  { label: 'Catalog', Icon: BookOpen },
  { label: 'Plan', Icon: Boxes },
  { label: 'Materials', Icon: Gem },
  { label: 'Reference', Icon: CircleHelp },
] as const

const FOCUSABLE = [
  'button:not([disabled])',
  'a[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

function sourceButtons() {
  return Array.from(document.querySelectorAll<HTMLButtonElement>('.app > header nav button'))
}

function releaseStaleScrollLock() {
  const body = document.body
  const root = document.documentElement
  const detail = document.querySelector<HTMLElement>('.catalog .detail')

  for (const property of ['overflow', 'overflow-y', 'position', 'top', 'left', 'right', 'width']) {
    body.style.removeProperty(property)
    root.style.removeProperty(property)
  }

  if (detail) {
    detail.style.removeProperty('overflow')
    detail.style.removeProperty('overflow-y')
    detail.style.removeProperty('touch-action')
  }
}

function visibleFocusables(container: Element) {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((element) => {
    const style = window.getComputedStyle(element)
    return style.display !== 'none' && style.visibility !== 'hidden' && element.getClientRects().length > 0
  })
}

export function AdaptiveNativeShell() {
  const [activeTab, setActiveTab] = useState(0)
  const [planCount, setPlanCount] = useState(0)

  useEffect(() => {
    let wasSheetOpen = Boolean(document.querySelector('.stats-drawer-layer.open'))
    let returnFocus: HTMLElement | null = null
    let frame = 0

    const syncNavigation = () => {
      const buttons = sourceButtons()
      const active = buttons.findIndex((button) => button.classList.contains('active'))
      if (active >= 0) setActiveTab(active)
      const count = Number.parseInt(buttons[1]?.querySelector('.badge')?.textContent || '0', 10)
      setPlanCount(Number.isFinite(count) ? count : 0)
    }

    const syncOverlays = () => {
      const layer = document.querySelector<HTMLElement>('.stats-drawer-layer.open')
      const sheetOpen = Boolean(layer)

      if (!wasSheetOpen && sheetOpen) {
        returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
        window.requestAnimationFrame(() => {
          const preferred = layer?.querySelector<HTMLElement>('.stats-drawer-close')
          preferred?.focus({ preventScroll: true })
        })
      }

      if (wasSheetOpen && !sheetOpen) {
        releaseStaleScrollLock()
        window.requestAnimationFrame(() => {
          if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true })
          returnFocus = null
        })
      }

      wasSheetOpen = sheetOpen
    }

    const scheduleSync = () => {
      if (frame) cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        frame = 0
        syncNavigation()
        syncOverlays()
      })
    }

    const trapSheetFocus = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return
      const layer = document.querySelector<HTMLElement>('.stats-drawer-layer.open')
      if (!layer) return
      const focusables = visibleFocusables(layer)
      if (!focusables.length) return

      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      const active = document.activeElement

      if (event.shiftKey && (active === first || !layer.contains(active))) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (active === last || !layer.contains(active))) {
        event.preventDefault()
        first.focus()
      }
    }

    // Repair stale inline locks left behind by a dismissed sheet or a restored browser tab.
    if (!wasSheetOpen) releaseStaleScrollLock()
    syncNavigation()

    const observer = new MutationObserver(scheduleSync)
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
      childList: true,
      subtree: true,
    })

    const recover = () => {
      if (!document.querySelector('.stats-drawer-layer.open')) releaseStaleScrollLock()
      scheduleSync()
    }

    document.addEventListener('keydown', trapSheetFocus)
    window.addEventListener('pageshow', recover)
    window.addEventListener('orientationchange', recover)
    window.addEventListener('resize', recover, { passive: true })
    document.addEventListener('visibilitychange', recover)

    return () => {
      if (frame) cancelAnimationFrame(frame)
      observer.disconnect()
      document.removeEventListener('keydown', trapSheetFocus)
      window.removeEventListener('pageshow', recover)
      window.removeEventListener('orientationchange', recover)
      window.removeEventListener('resize', recover)
      document.removeEventListener('visibilitychange', recover)
      releaseStaleScrollLock()
    }
  }, [])

  const navigate = (index: number) => {
    sourceButtons()[index]?.click()
    setActiveTab(index)
  }

  return (
    <aside className="adaptive-tablet-sidebar" aria-label="Primary navigation">
      <a className="adaptive-tablet-brand" href={import.meta.env.BASE_URL} aria-label="The Masterwork Vault home">
        <img src={`${import.meta.env.BASE_URL}assets/brand/masterwork-vault-mark.svg`} alt="" />
        <span><strong>The Masterwork Vault</strong><small>Menzoberranzan Masterwork</small></span>
      </a>
      <nav className="adaptive-tablet-nav">
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
      <p className="adaptive-tablet-caption">Crafting reference</p>
    </aside>
  )
}
