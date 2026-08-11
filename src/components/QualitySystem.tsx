import { useEffect } from 'react'
import catalogJson from '../data/catalog'
import type { CatalogData } from '../types'

const catalog = catalogJson as CatalogData
const SITE = 'https://neverwintermastercraft.netlify.app'
const DEFAULT_TITLE = 'The Masterwork Vault | Neverwinter Masterwork Guide'
const DEFAULT_DESCRIPTION = 'Neverwinter Underdark and Sharandar Masterwork recipes, materials, crafting plans, workshop references, and screenshot-backed evidence.'
const SOCIAL_IMAGE = `${SITE}/.netlify/images?url=/social-preview.svg&w=1200&h=630&fit=cover&fm=png`

function upsertMeta(selector: string, attr: string, value: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector)
  if (!element) {
    element = document.createElement('meta')
    const match = selector.match(/meta\[(name|property)="([^"]+)"\]/)
    if (match) element.setAttribute(match[1], match[2])
    document.head.appendChild(element)
  }
  element.setAttribute(attr, value)
}

function upsertCanonical(href: string) {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!link) { link = document.createElement('link'); link.rel = 'canonical'; document.head.appendChild(link) }
  link.href = href
}

function currentSeo() {
  const parts = window.location.pathname.split('/').filter(Boolean)
  const view = parts[0] || 'catalog'
  let title = DEFAULT_TITLE
  let description = DEFAULT_DESCRIPTION
  if (view === 'plan') { title = 'Crafting Planner | The Masterwork Vault'; description = 'Build inventory-aware Neverwinter Masterwork crafting plans with shared batches, shortages, dependency trees, and ordered craft steps.' }
  else if (view === 'materials') { title = 'Masterwork Materials | The Masterwork Vault'; description = 'Search Neverwinter Masterwork materials, inspect recipes, trace reverse dependencies, and track inventory.' }
  else if (view === 'reference') { title = 'Workshop Reference | The Masterwork Vault'; description = 'Neverwinter Workshop progression, artisan mechanics, South Seas commissions, source caveats, and current research context.' }
  else if (view === 'journey') { title = 'Masterwork Journey | The Masterwork Vault'; description = 'Follow Neverwinter Masterwork progression from Workshop basics through Chultan, Sharandar, and Menzoberranzan.' }
  else if (view === 'readiness') { title = 'Masterwork Readiness | The Masterwork Vault'; description = 'Track all seven professions, Workshop rank, Masterwork unlock stages, next actions, and remaining direct book costs.' }
  else if (view === 'data-health') { title = 'Masterwork Data Health | The Masterwork Vault'; description = 'Inspect Masterwork source confidence, reverification queues, unknown yields, artwork provenance, and patch-sensitive facts.' }
  else if (view === 'explore') { title = 'Advanced Masterwork Explorer | The Masterwork Vault'; description = 'Filter Neverwinter Masterwork craftables by campaign, profession, type, class, recipe availability, and evidence state.' }
  else if (view === 'graph') { title = 'Masterwork Dependency Graph | The Masterwork Vault'; description = 'Explore recursive Neverwinter Masterwork crafting dependencies from final item to raw materials.' }
  else if (view === 'catalog' && parts.length >= 3) {
    const id = decodeURIComponent(parts[2] || '')
    const item = catalog.items.find((entry) => entry.id === id)
    if (item) {
      title = `${item.name} | Neverwinter Masterwork Recipe`
      const classes = item.classes.includes('All') ? 'all classes' : item.classes.join(', ')
      description = `${item.name}: ${item.campaign || 'Neverwinter'} Masterwork ${item.kind.toLowerCase()} for ${classes}. View recipe inputs, stats, materials, and crafting dependencies.`
    }
  }
  return { title, description }
}

function updateSeo() {
  const { title, description } = currentSeo()
  const canonical = `${SITE}${window.location.pathname}`
  document.title = title
  upsertCanonical(canonical)
  upsertMeta('meta[name="description"]', 'content', description)
  upsertMeta('meta[property="og:title"]', 'content', title)
  upsertMeta('meta[property="og:description"]', 'content', description)
  upsertMeta('meta[property="og:url"]', 'content', canonical)
  upsertMeta('meta[property="og:image"]', 'content', SOCIAL_IMAGE)
  upsertMeta('meta[property="og:image:width"]', 'content', '1200')
  upsertMeta('meta[property="og:image:height"]', 'content', '630')
  upsertMeta('meta[name="twitter:title"]', 'content', title)
  upsertMeta('meta[name="twitter:description"]', 'content', description)
  upsertMeta('meta[name="twitter:image"]', 'content', SOCIAL_IMAGE)
  let jsonLd = document.head.querySelector<HTMLScriptElement>('script[data-masterwork-jsonld]')
  if (!jsonLd) { jsonLd = document.createElement('script'); jsonLd.type = 'application/ld+json'; jsonLd.dataset.masterworkJsonld = 'true'; document.head.appendChild(jsonLd) }
  jsonLd.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebApplication', name: 'The Masterwork Vault', url: SITE, description, applicationCategory: 'ReferenceApplication', operatingSystem: 'Any', image: SOCIAL_IMAGE, isAccessibleForFree: true })
}

function visibleFocusables(container: Element) {
  const selector = 'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])'
  return Array.from(container.querySelectorAll<HTMLElement>(selector)).filter((element) => element.getClientRects().length > 0 && getComputedStyle(element).visibility !== 'hidden')
}

function setupServiceWorker() {
  if (!('serviceWorker' in navigator) || !import.meta.env.PROD) return () => undefined
  let disposed = false
  let registration: ServiceWorkerRegistration | null = null
  const signalUpdate = () => { if (!disposed) document.dispatchEvent(new Event('masterwork:update-available')) }
  const register = async () => {
    try {
      registration = await navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' })
      await registration.update()
      const watch = () => {
        const worker = registration?.installing
        if (!worker) return
        worker.addEventListener('statechange', () => { if (worker.state === 'installed' && navigator.serviceWorker.controller) signalUpdate() })
      }
      registration.addEventListener('updatefound', watch)
    } catch {
      // Offline/PWA support is progressive enhancement; the application remains usable.
    }
  }
  window.addEventListener('load', register, { once: true })
  return () => { disposed = true; window.removeEventListener('load', register); registration = null }
}

export function QualitySystem() {
  useEffect(() => {
    updateSeo()
    let statsReturnFocus: HTMLElement | null = null
    const onClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null
      if (!target) return
      if (target.closest('.stats-trigger')) statsReturnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
      if (target.closest('.stats-drawer-close, .stats-drawer-scrim') && statsReturnFocus?.isConnected) requestAnimationFrame(() => statsReturnFocus?.focus({ preventScroll: true }))
      requestAnimationFrame(updateSeo)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      const drawer = document.querySelector<HTMLElement>('.stats-drawer-layer.open .stats-drawer')
      if (!drawer) return
      if (event.key === 'Escape') { drawer.querySelector<HTMLButtonElement>('.stats-drawer-close')?.click(); return }
      if (event.key !== 'Tab') return
      const focusables = visibleFocusables(drawer)
      if (!focusables.length) return
      const first = focusables[0], last = focusables[focusables.length - 1], active = document.activeElement
      if (event.shiftKey && (active === first || !drawer.contains(active))) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && (active === last || !drawer.contains(active))) { event.preventDefault(); first.focus() }
    }
    const onLocation = () => requestAnimationFrame(updateSeo)
    document.addEventListener('click', onClick)
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('masterwork:navigate', onLocation)
    window.addEventListener('popstate', onLocation)
    const teardownSw = setupServiceWorker()
    return () => {
      document.removeEventListener('click', onClick); document.removeEventListener('keydown', onKeyDown); document.removeEventListener('masterwork:navigate', onLocation); window.removeEventListener('popstate', onLocation); teardownSw()
    }
  }, [])
  return null
}
