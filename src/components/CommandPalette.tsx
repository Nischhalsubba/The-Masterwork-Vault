import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { BookOpen, Boxes, CircleHelp, Gem, Search, Sparkles } from 'lucide-react'
import catalogJson from '../data/catalog'
import type { CatalogData } from '../types'
import { MASTERWORK_PROFESSIONS } from '../domain/playerState'
import { OverlayDialog } from './OverlayDialog'

const catalog = catalogJson as CatalogData
const slug = (value: string) => value.toLowerCase().replace(/\+1/g, '').replace(/[’']/g, '').replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

type Result = { id: string; type: string; title: string; subtitle: string; href: string }

const staticResults: Result[] = [
  { id: 'route:plan', type: 'Page', title: 'Crafting Plan', subtitle: 'Inventory-aware production queue and shortages', href: '/plan' },
  { id: 'route:materials', type: 'Page', title: 'Materials', subtitle: 'Recipes, reverse dependencies and inventory', href: '/materials' },
  { id: 'route:explore', type: 'Page', title: 'Advanced Explorer', subtitle: 'Multi-filter catalog analysis', href: '/explore' },
  { id: 'route:graph', type: 'Page', title: 'Dependency Graph', subtitle: 'Visualize recursive recipe relationships', href: '/graph' },
  { id: 'route:journey', type: 'Progression', title: 'Masterwork Journey', subtitle: 'Workshop → Chultan → Sharandar → Menzoberranzan', href: '/journey' },
  { id: 'route:readiness', type: 'Progression', title: 'Masterwork Readiness', subtitle: 'Track every profession and next unlock', href: '/readiness' },
  { id: 'route:health', type: 'Verification', title: 'Data Health', subtitle: 'Reverification queues and evidence status', href: '/data-health' },
  { id: 'route:reference', type: 'Page', title: 'Reference', subtitle: 'Workshop mechanics and sources', href: '/reference' },
]

function allResults(): Result[] {
  const items = catalog.items.map((item) => ({
    id: `item:${item.id}`, type: item.kind, title: item.name,
    subtitle: `${item.campaign || 'Unknown'} · ${item.profession || 'Profession not recorded'}`,
    href: `/catalog/${(item.campaign === 'Underdark' ? 'underdark' : 'sharandar')}/${encodeURIComponent(item.id)}/${slug(item.name)}`,
  }))
  const materials = catalog.materials.map((material) => ({
    id: `material:${material.name}`, type: 'Material', title: material.name,
    subtitle: `${material.craftable ? 'Craftable' : 'Raw'} · ${material.profession || 'Acquisition material'}`,
    href: `/materials?material=${encodeURIComponent(material.name)}`,
  }))
  const recipes = catalog.recipes.map((recipe) => ({
    id: `recipe:${recipe.name}`, type: 'Recipe', title: recipe.name,
    subtitle: `${recipe.profession || 'Profession not recorded'} · ${recipe.materials.length} direct inputs`,
    href: `/materials?material=${encodeURIComponent(recipe.name)}`,
  }))
  const professions = MASTERWORK_PROFESSIONS.map((profession) => ({ id: `profession:${profession}`, type: 'Profession', title: profession, subtitle: 'Open readiness tracker', href: `/readiness?profession=${encodeURIComponent(profession)}` }))
  return [...staticResults, ...professions, ...items, ...materials, ...recipes]
}

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const results = useMemo(() => allResults(), [])
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return results.slice(0, 12)
    const terms = q.split(/\s+/).filter(Boolean)
    return results
      .map((result) => ({ result, haystack: `${result.title} ${result.subtitle} ${result.type}`.toLowerCase() }))
      .filter(({ haystack }) => terms.every((term) => haystack.includes(term)))
      .slice(0, 30)
      .map(({ result }) => result)
  }, [query, results])

  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setOpen((value) => !value) }
    }
    document.addEventListener('keydown', keydown)
    return () => document.removeEventListener('keydown', keydown)
  }, [])

  const close = useCallback(() => { setOpen(false); setQuery('') }, [])
  const navigate = (href: string) => { close(); window.location.assign(href) }

  return (
    <>
      <button className="mw-command-launcher" type="button" onClick={() => setOpen(true)} aria-label="Open universal search"><Search size={17} aria-hidden="true" /><span>Search Vault</span><kbd>⌘K</kbd></button>
      <OverlayDialog open={open} onClose={close} title="Search the entire Vault" description="Items, materials, recipes, professions, progression, and tools." className="mw-command-dialog" initialFocusRef={inputRef}>
        <label className="mw-command-search"><Search size={18} aria-hidden="true" /><span className="sr-only">Search everything</span><input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try ‘Blacksmithing’, ‘Soul Bead’, or ‘Sharandar’…" /></label>
        <div className="mw-command-results" role="listbox" aria-label="Search results">
          {visible.length ? visible.map((result) => <button type="button" role="option" aria-selected="false" key={result.id} onClick={() => navigate(result.href)}>
            <span className="mw-command-icon">{result.type === 'Material' ? <Gem size={18} /> : result.type === 'Progression' || result.type === 'Profession' ? <Sparkles size={18} /> : result.type === 'Page' ? <Boxes size={18} /> : result.type === 'Verification' ? <CircleHelp size={18} /> : <BookOpen size={18} />}</span>
            <span><strong>{result.title}</strong><small>{result.type} · {result.subtitle}</small></span>
          </button>) : <div className="mw-command-empty"><Search size={26} /><strong>No matching Vault records</strong><p>Try a shorter item, material, profession, or campaign name.</p></div>}
        </div>
      </OverlayDialog>
    </>
  )
}
