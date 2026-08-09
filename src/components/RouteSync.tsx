import { useEffect } from 'react'
import catalogJson from '../data/catalog'
import type { CatalogData } from '../types'

const catalog = catalogJson as CatalogData

type ViewName = 'catalog' | 'plan' | 'materials' | 'reference'
type CampaignFilter = 'Sharandar' | 'Underdark' | 'All'
type RouteDetail = { view: ViewName; itemId?: string; campaign?: CampaignFilter }

const VIEWS: ViewName[] = ['catalog', 'plan', 'materials', 'reference']

const slug = (value: string) => value
  .toLowerCase()
  .replace(/\+1/g, '')
  .replace(/[’']/g, '')
  .replace(/&/g, ' and ')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')

function itemByLegacySlug(value: string) {
  return catalog.items.find((item) => slug(item.name) === value)
}

function routeFromLocation(): { detail: RouteDetail; canonicalPath: string; valid: boolean } {
  const parts = window.location.pathname.split('/').filter(Boolean)
  if (!parts.length) return { detail: { view: 'catalog' }, canonicalPath: '/catalog', valid: true }

  const first = parts[0] as ViewName
  if (!VIEWS.includes(first)) return { detail: { view: 'catalog' }, canonicalPath: '/catalog', valid: false }
  if (first !== 'catalog') return { detail: { view: first }, canonicalPath: `/${first}`, valid: parts.length === 1 }
  if (parts.length === 1) return { detail: { view: 'catalog' }, canonicalPath: '/catalog', valid: true }

  // Stable route: /catalog/<campaign>/<item-id>/<human-readable-slug>
  if (parts.length >= 3 && (parts[1] === 'sharandar' || parts[1] === 'underdark')) {
    const itemId = decodeURIComponent(parts[2])
    const item = catalog.items.find((entry) => entry.id === itemId)
    if (!item) return { detail: { view: 'catalog' }, canonicalPath: '/catalog', valid: false }
    const campaign = item.campaign === 'Underdark' ? 'Underdark' : 'Sharandar'
    const canonicalPath = `/catalog/${campaign.toLowerCase()}/${encodeURIComponent(item.id)}/${slug(item.name)}`
    return { detail: { view: 'catalog', itemId: item.id, campaign }, canonicalPath, valid: true }
  }

  // Backward-compatible legacy route: /catalog/<item-name-slug>
  const legacy = itemByLegacySlug(decodeURIComponent(parts.slice(1).join('/')))
  if (legacy) {
    const campaign = legacy.campaign === 'Underdark' ? 'Underdark' : 'Sharandar'
    return {
      detail: { view: 'catalog', itemId: legacy.id, campaign },
      canonicalPath: `/catalog/${campaign.toLowerCase()}/${encodeURIComponent(legacy.id)}/${slug(legacy.name)}`,
      valid: true,
    }
  }

  return { detail: { view: 'catalog' }, canonicalPath: '/catalog', valid: false }
}

function relevantSearch(view: ViewName) {
  const current = new URLSearchParams(window.location.search)
  const next = new URLSearchParams()
  if (view === 'plan' && current.has('plan')) next.set('plan', current.get('plan') || '')
  if (view === 'catalog') {
    for (const key of ['campaign', 'class', 'kind', 'q']) {
      const value = current.get(key)
      if (value) next.set(key, value)
    }
  }
  const query = next.toString()
  return query ? `?${query}` : ''
}

function setUrl(path: string, view: ViewName, replace = false) {
  const next = `${path}${relevantSearch(view)}`
  const current = `${window.location.pathname}${window.location.search}`
  if (next === current) return
  const state = { ...(window.history.state || {}), masterworkView: view }
  if (replace) window.history.replaceState(state, '', next)
  else window.history.pushState(state, '', next)
}

function dispatchRoute(detail: RouteDetail) {
  document.dispatchEvent(new CustomEvent<RouteDetail>('masterwork:navigate', { detail }))
}

function pathForItem(itemId: string) {
  const item = catalog.items.find((entry) => entry.id === itemId)
  if (!item) return '/catalog'
  const campaign = item.campaign === 'Underdark' ? 'underdark' : 'sharandar'
  return `/catalog/${campaign}/${encodeURIComponent(item.id)}/${slug(item.name)}`
}

export function RouteSync() {
  useEffect(() => {
    const sync = (replaceInvalid = false) => {
      const route = routeFromLocation()
      if (!route.valid || window.location.pathname !== route.canonicalPath) {
        setUrl(route.canonicalPath, route.detail.view, true)
      } else if (replaceInvalid && window.location.pathname === '/') {
        setUrl('/catalog', 'catalog', true)
      }
      dispatchRoute(route.detail)
    }

    requestAnimationFrame(() => sync(true))

    const onClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null
      if (!target) return

      const brand = target.closest<HTMLAnchorElement>('.app > header .brand, .mobile-v4-brand, .tablet-v4-brand')
      if (brand) {
        event.preventDefault()
        setUrl('/catalog', 'catalog')
        dispatchRoute({ view: 'catalog' })
        return
      }

      const navButton = target.closest<HTMLButtonElement>('[data-view]')
      const view = navButton?.dataset.view as ViewName | undefined
      if (view && VIEWS.includes(view)) {
        setUrl(`/${view}`, view)
        return
      }

      const itemButton = target.closest<HTMLButtonElement>('.catalog .items .item-main[data-item-id]')
      if (itemButton?.dataset.itemId) {
        setUrl(pathForItem(itemButton.dataset.itemId), 'catalog')
      }
    }

    const onPopState = () => sync()
    document.addEventListener('click', onClick)
    window.addEventListener('popstate', onPopState)
    return () => {
      document.removeEventListener('click', onClick)
      window.removeEventListener('popstate', onPopState)
    }
  }, [])

  return null
}
