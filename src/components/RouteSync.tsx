import { useEffect } from 'react'

type ViewName = 'catalog' | 'plan' | 'materials' | 'reference'

const VIEW_ORDER: ViewName[] = ['catalog', 'plan', 'materials', 'reference']
const ITEM_ROUTE_PREFIX = '/catalog/'

const slug = (value: string) => value
  .toLowerCase()
  .replace(/\+1/g, '')
  .replace(/[’']/g, '')
  .replace(/&/g, ' and ')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')

function routeFromLocation() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/catalog'
  const first = path.split('/').filter(Boolean)[0] as ViewName | undefined
  const view: ViewName = VIEW_ORDER.includes(first as ViewName) ? (first as ViewName) : 'catalog'
  const itemSlug = view === 'catalog' ? path.slice(ITEM_ROUTE_PREFIX.length) : ''
  return { view, itemSlug: itemSlug && itemSlug !== 'catalog' ? decodeURIComponent(itemSlug) : '' }
}

function sourceButtons() {
  return Array.from(document.querySelectorAll<HTMLButtonElement>('.app > header nav button'))
}

function sourceButtonFor(view: ViewName) {
  return sourceButtons()[VIEW_ORDER.indexOf(view)]
}

function routeUrl(view: ViewName, itemSlug = '') {
  const path = view === 'catalog' && itemSlug ? `/catalog/${encodeURIComponent(itemSlug)}` : `/${view}`
  const planQuery = view === 'plan' ? new URLSearchParams(window.location.search).get('plan') : null
  return planQuery ? `${path}?plan=${encodeURIComponent(planQuery)}` : path
}

function setUrl(view: ViewName, itemSlug = '', replace = false) {
  const next = routeUrl(view, itemSlug)
  const current = `${window.location.pathname}${window.location.search}`
  if (next === current) return
  const state = window.history.state && typeof window.history.state === 'object'
    ? { ...window.history.state, masterworkView: view }
    : { masterworkView: view }
  if (replace) window.history.replaceState(state, '', next)
  else window.history.pushState(state, '', next)
}

function clickView(view: ViewName) {
  const button = sourceButtonFor(view)
  if (button && !button.classList.contains('active')) button.click()
}

function selectCatalogItem(itemSlug: string, reopenPhoneDetail: boolean) {
  if (!itemSlug) return

  const trySelect = () => {
    const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('.catalog .items .item-main'))
    const target = buttons.find((button) => slug(button.querySelector('strong')?.textContent || '') === itemSlug)
    if (!target) return false

    const phone = window.matchMedia('(max-width: 680px)').matches
    if (phone && !reopenPhoneDetail) {
      // On mobile, browser Back is also used to close the full-screen item detail.
      // Re-clicking the item here would immediately reopen the screen we just closed.
      return true
    }

    target.click()
    return true
  }

  requestAnimationFrame(() => {
    if (trySelect()) return

    // A direct link can point to an Underdark item while Catalog initially opens
    // Sharandar. Switch to All once, then resolve the visible item by its stable slug.
    const allCollection = Array.from(document.querySelectorAll<HTMLButtonElement>('.collection-seg button'))
      .find((button) => button.textContent?.trim() === 'All')
    if (allCollection && !allCollection.classList.contains('active')) allCollection.click()
    requestAnimationFrame(trySelect)
  })
}

function syncFromLocation({ initial = false } = {}) {
  const { view, itemSlug } = routeFromLocation()
  clickView(view)
  if (view === 'catalog' && itemSlug) selectCatalogItem(itemSlug, initial)
}

export function RouteSync() {
  useEffect(() => {
    // Turn the original root-only SPA into real reload-safe destinations without
    // introducing a second navigation state alongside App.tsx.
    const initial = routeFromLocation()
    if (window.location.pathname === '/' || !VIEW_ORDER.includes(initial.view)) {
      setUrl('catalog', '', true)
    }
    requestAnimationFrame(() => syncFromLocation({ initial: true }))

    const onClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null
      if (!target) return

      const brand = target.closest<HTMLAnchorElement>('.app > header .brand, .mobile-v4-brand, .tablet-v4-brand')
      if (brand) {
        event.preventDefault()
        clickView('catalog')
        setUrl('catalog')
        return
      }

      const navButton = target.closest<HTMLButtonElement>('.app > header nav button')
      if (navButton) {
        const index = sourceButtons().indexOf(navButton)
        const view = VIEW_ORDER[index]
        if (view) setUrl(view)
        return
      }

      const itemButton = target.closest<HTMLButtonElement>('.catalog .items .item-main')
      if (itemButton) {
        const name = itemButton.querySelector('strong')?.textContent?.trim()
        if (name) setUrl('catalog', slug(name))
      }
    }

    const onPopState = () => {
      const { view, itemSlug } = routeFromLocation()
      clickView(view)
      if (view === 'catalog' && itemSlug && !window.matchMedia('(max-width: 680px)').matches) {
        selectCatalogItem(itemSlug, false)
      }
    }

    document.addEventListener('click', onClick)
    window.addEventListener('popstate', onPopState)
    return () => {
      document.removeEventListener('click', onClick)
      window.removeEventListener('popstate', onPopState)
    }
  }, [])

  return null
}
