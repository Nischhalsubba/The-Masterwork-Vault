import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Check, SlidersHorizontal } from 'lucide-react'
import { requestAppRoute } from '../lib/navigation'

type InformationDensity = 'summary' | 'standard' | 'expert'
type AppStateDetail = { view?: string; planCount?: number }
type AnnouncementDetail = string | { message?: string }

const DENSITY_KEY = 'masterwork-vault.information-density.v1'
const densityOptions: Array<{ value: InformationDensity; label: string; detail: string }> = [
  { value: 'summary', label: 'Summary', detail: 'Core crafting decisions only' },
  { value: 'standard', label: 'Standard', detail: 'Balanced detail and context' },
  { value: 'expert', label: 'Expert', detail: 'Evidence and secondary metadata visible' },
]

function readDensity(): InformationDensity {
  try {
    const saved = window.localStorage.getItem(DENSITY_KEY)
    if (saved === 'summary' || saved === 'expert') return saved
  } catch {
    // Storage is progressive enhancement.
  }
  return 'standard'
}

export function UXSystem() {
  const [density, setDensity] = useState<InformationDensity>(() => readDensity())
  const [notice, setNotice] = useState('')
  const previousPlanCount = useRef<number | null>(null)
  const dismissTimer = useRef<number | null>(null)
  const densityMenu = useRef<HTMLDetailsElement>(null)

  const announce = (message: string) => {
    if (dismissTimer.current != null) window.clearTimeout(dismissTimer.current)
    setNotice(message)
    dismissTimer.current = window.setTimeout(() => setNotice(''), 3600)
  }

  useEffect(() => {
    document.documentElement.dataset.informationDensity = density
    try { window.localStorage.setItem(DENSITY_KEY, density) } catch { /* Storage is optional. */ }
  }, [density])

  useEffect(() => {
    const onAppState = (event: Event) => {
      const detail = (event as CustomEvent<AppStateDetail>).detail
      if (typeof detail?.planCount !== 'number') return
      if (previousPlanCount.current != null && previousPlanCount.current !== detail.planCount) {
        const delta = detail.planCount - previousPlanCount.current
        announce(delta > 0
          ? `Added to plan. ${detail.planCount} ${detail.planCount === 1 ? 'item' : 'items'} selected.`
          : `Plan updated. ${detail.planCount} ${detail.planCount === 1 ? 'item' : 'items'} selected.`)
      }
      previousPlanCount.current = detail.planCount
    }

    const onAnnouncement = (event: Event) => {
      const detail = (event as CustomEvent<AnnouncementDetail>).detail
      const message = typeof detail === 'string' ? detail : detail?.message
      if (message) announce(message)
    }

    document.addEventListener('masterwork:app-state', onAppState)
    document.addEventListener('masterwork:announce', onAnnouncement)
    return () => {
      document.removeEventListener('masterwork:app-state', onAppState)
      document.removeEventListener('masterwork:announce', onAnnouncement)
      if (dismissTimer.current != null) window.clearTimeout(dismissTimer.current)
    }
  }, [])

  const skipToContent = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    const target = document.querySelector<HTMLElement>('main')
    if (!target) return
    const hadTabIndex = target.hasAttribute('tabindex')
    if (!hadTabIndex) target.tabIndex = -1
    target.focus({ preventScroll: false })
    if (!hadTabIndex) target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true })
  }

  return <>
    <a className="ux-skip-link" href="#main-content" onClick={skipToContent}>Skip to main content</a>

    <details ref={densityMenu} className="ux-density-menu">
      <summary><SlidersHorizontal size={16} aria-hidden="true" />View</summary>
      <div className="ux-density-popover" role="group" aria-label="Information density">
        <strong>Information density</strong>
        {densityOptions.map((option) => <button key={option.value} type="button" aria-pressed={density === option.value} onClick={() => { setDensity(option.value); densityMenu.current?.removeAttribute('open') }}>
          <span><b>{option.label}</b><small>{option.detail}</small></span>
          {density === option.value && <Check size={16} aria-hidden="true" />}
        </button>)}
      </div>
    </details>

    <div className={`ux-action-toast ${notice ? 'visible' : ''}`} role="status" aria-live="polite" aria-atomic="true">
      <span>{notice}</span>
      {notice.includes('plan') && <button type="button" onClick={() => requestAppRoute({ view: 'plan' })}>Open plan <ArrowRight size={14} aria-hidden="true" /></button>}
    </div>
  </>
}
