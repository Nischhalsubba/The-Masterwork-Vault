import { useEffect, useState } from 'react'
import { BookOpen, Boxes, CircleHelp, Gem } from 'lucide-react'

const tabs = [
  { label: 'Catalog', Icon: BookOpen },
  { label: 'Plan', Icon: Boxes },
  { label: 'Materials', Icon: Gem },
  { label: 'Reference', Icon: CircleHelp },
] as const

function sourceButtons() {
  return Array.from(document.querySelectorAll<HTMLButtonElement>('.app > header nav button'))
}

function releaseStaleScrollLock() {
  const body = document.body
  const detail = document.querySelector<HTMLElement>('.catalog .detail')

  body.style.removeProperty('overflow')
  body.style.removeProperty('overflow-y')
  body.style.removeProperty('position')
  body.style.removeProperty('top')
  body.style.removeProperty('left')
  body.style.removeProperty('right')
  body.style.removeProperty('width')

  if (detail) {
    detail.style.removeProperty('overflow')
    detail.style.removeProperty('overflow-y')
    detail.style.removeProperty('touch-action')
  }
}

export function AdaptiveNativeShell() {
  const [activeTab, setActiveTab] = useState(0)
  const [planCount, setPlanCount] = useState(0)

  useEffect(() => {
    let wasSheetOpen = Boolean(document.querySelector('.stats-drawer-layer.open'))
    let frame = 0

    const syncNavigation = () => {
      const buttons = sourceButtons()
      const active = buttons.findIndex((button) => button.classList.contains('active'))
      if (active >= 0) setActiveTab(active)
      const count = Number.parseInt(buttons[1]?.querySelector('.badge')?.textContent || '0', 10)
      setPlanCount(Number.isFinite(count) ? count : 0)
    }

    const syncOverlays = () => {
      const sheetOpen = Boolean(document.querySelector('.stats-drawer-layer.open'))
      if (wasSheetOpen && !sheetOpen) {
        releaseStaleScrollLock()
        window.requestAnimationFrame(() => {
          document.querySelector<HTMLElement>('.catalog .detail')?.focus({ preventScroll: true })
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

    window.addEventListener('pageshow', recover)
    window.addEventListener('orientationchange', recover)
    window.addEventListener('resize', recover, { passive: true })
    document.addEventListener('visibilitychange', recover)

    return () => {
      if (frame) cancelAnimationFrame(frame)
      observer.disconnect()
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
