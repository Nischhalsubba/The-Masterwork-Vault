import { useEffect } from 'react'
import catalogJson from '../data/catalog'
import type { CatalogData } from '../types'
import { announceAppRoute, type AppRouteDetail, type CampaignFilter, type CoreView } from '../lib/navigation'

const catalog = catalogJson as CatalogData
const VIEWS: CoreView[] = ['catalog', 'plan', 'materials', 'reference']

type RouteHistoryState = {
  masterworkView?: CoreView
  scrollY?: number
  listScroll?: number
}

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

function routeFromLocation(): { detail: AppRouteDetail; canonicalPath: string; valid: boolean } {
  const parts = window.location.pathname.split('/').filter(Boolean)
  if (!parts.length) return { detail: { view: 'catalog' }, canonicalPath: '/catalog', valid: true }
  const first = parts[0] as CoreView
  if (!VIEWS.includes(first)) return { detail: { view: 'catalog' }, canonicalPath: '/catalog', valid: false }
  if (first !== 'catalog') return { detail: { view: first }, canonicalPath: `/${first}`, valid: parts.length === 1 }
  if (parts.length === 1) return { detail: { view: 'catalog' }, canonicalPath: '/catalog', valid: true }

  if (parts.length >= 3 && (parts[1] === 'sharandar' || parts[1] === 'underdark')) {
    const itemId = decodeURIComponent(parts[2])
    const item = catalog.items.find((entry) => entry.id === itemId)
    if (!item) return { detail: { view: 'catalog' }, canonicalPath: '/catalog', valid: false }
    const campaign: CampaignFilter = item.campaign === 'Underdark' ? 'Underdark' : 'Sharandar'
    const canonicalPath = `/catalog/${campaign.toLowerCase()}/${encodeURIComponent(item.id)}/${slug(item.name)}`
    return { detail: { view: 'catalog', itemId: item.id, campaign }, canonicalPath, valid: true }
  }

  const legacy = itemByLegacySlug(decodeURIComponent(parts.slice(1).join('/')))
  if (legacy) {
    const campaign: CampaignFilter = legacy.campaign === 'Underdark' ? 'Underdark' : 'Sharandar'
    return { detail: { view: 'catalog', itemId: legacy.id, campaign }, canonicalPath: pathForItem(legacy.id), valid: true }
  }
  return { detail: { view: 'catalog' }, canonicalPath: '/catalog', valid: false }
}

function relevantSearch(view: CoreView) {
  const current = new URLSearchParams(window.location.search)
  const next = new URLSearchParams()
  if (view === 'plan' && current.has('plan')) next.set('plan', current.get('plan') || '')
  if (view === 'materials' && current.has('material')) next.set('material', current.get('material') || '')
  if (view === 'catalog') {
    for (const key of ['campaign', 'class', 'kind', 'q']) {
      const value = current.get(key)
      if (value) next.set(key, value)
    }
  }
  const query = next.toString()
  return query ? `?${query}` : ''
}

function currentHistoryState(): RouteHistoryState {
  return window.history.state && typeof window.history.state === 'object' ? window.history.state as RouteHistoryState : {}
}

function saveScrollState() {
  const current = currentHistoryState()
  const list = document.querySelector<HTMLElement>('.items')
  window.history.replaceState({
    ...current,
    scrollY: window.scrollY,
    listScroll: list?.scrollTop || 0,
  }, '', window.location.href)
}

function restoreScrollState() {
  const state = currentHistoryState()
  requestAnimationFrame(() => requestAnimationFrame(() => {
    if (typeof state.scrollY === 'number') window.scrollTo({ top: state.scrollY, behavior: 'auto' })
    const list = document.querySelector<HTMLElement>('.items')
    if (list && typeof state.listScroll === 'number') list.scrollTop = state.listScroll
  }))
}

function focusRoute(detail: AppRouteDetail, preserveScroll = false) {
  requestAnimationFrame(() => requestAnimationFrame(() => {
    const target = detail.itemId
      ? document.querySelector<HTMLElement>('.detail h2, .mobile-v4-detail-title')
      : document.querySelector<HTMLElement>('main h1, main h2, main')
    if (!target) return
    const hadTabIndex = target.hasAttribute('tabindex')
    if (!hadTabIndex) target.tabIndex = -1
    target.focus({ preventScroll: preserveScroll })
    if (!hadTabIndex) target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true })
  }))
}

function setUrl(path: string, view: CoreView, replace = false) {
  const next = `${path}${relevantSearch(view)}`
  const current = `${window.location.pathname}${window.location.search}`
  if (next === current) return
  const state: RouteHistoryState = { masterworkView: view, scrollY: 0, listScroll: 0 }
  if (replace) window.history.replaceState({ ...currentHistoryState(), ...state }, '', next)
  else window.history.pushState(state, '', next)
}

function pathForItem(itemId: string) {
  const item = catalog.items.find((entry) => entry.id === itemId)
  if (!item) return '/catalog'
  const campaign = item.campaign === 'Underdark' ? 'underdark' : 'sharandar'
  return `/catalog/${campaign}/${encodeURIComponent(item.id)}/${slug(item.name)}`
}

export function RouteSync() {
  useEffect(() => {
    const sync = (fromHistory = false) => {
      const route = routeFromLocation()
      if (!route.valid || window.location.pathname !== route.canonicalPath) setUrl(route.canonicalPath, route.detail.view, true)
      announceAppRoute(route.detail)
      if (fromHistory) {
        restoreScrollState()
        focusRoute(route.detail, true)
      }
    }

    const onRequestRoute = (event: Event) => {
      const detail = (event as CustomEvent<AppRouteDetail>).detail
      if (!detail || !VIEWS.includes(detail.view)) return
      saveScrollState()
      const path = detail.itemId ? pathForItem(detail.itemId) : `/${detail.view}`
      setUrl(path, detail.view)
      announceAppRoute(detail)
      focusRoute(detail)
    }

    const onPopState = () => sync(true)
    const onPageHide = () => saveScrollState()

    requestAnimationFrame(() => sync(false))
    document.addEventListener('masterwork:request-route', onRequestRoute)
    window.addEventListener('popstate', onPopState)
    window.addEventListener('pagehide', onPageHide)
    return () => {
      document.removeEventListener('masterwork:request-route', onRequestRoute)
      window.removeEventListener('popstate', onPopState)
      window.removeEventListener('pagehide', onPageHide)
    }
  }, [])
  return null
}
