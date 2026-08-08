import { useEffect, useState } from 'react'
import { ChevronLeft } from 'lucide-react'

const PHONE_QUERY = '(max-width: 680px)'
const HISTORY_KEY = 'masterworkMobileDetail'

function mobileHistoryState(value: boolean) {
  const current = window.history.state
  const next = current && typeof current === 'object' ? { ...current } : {}
  if (value) next[HISTORY_KEY] = true
  else delete next[HISTORY_KEY]
  return next
}

export function MobileNativeBridge() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(PHONE_QUERY)

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
      }
    }

    const onPopState = (event: PopStateEvent) => {
      applyOpen(Boolean(media.matches && event.state?.[HISTORY_KEY]))
    }

    const onMediaChange = () => {
      if (!media.matches) closeAndClearHistory()
    }

    document.addEventListener('click', onDocumentClick)
    window.addEventListener('popstate', onPopState)
    media.addEventListener('change', onMediaChange)

    return () => {
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

  return (
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
  )
}
