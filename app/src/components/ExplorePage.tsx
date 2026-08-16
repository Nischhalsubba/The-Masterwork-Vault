import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import { BadgeCheck, BookOpen, ChevronLeft, Filter, History, Search, ShieldCheck, X } from 'lucide-react'
import catalogJson from '../data/catalog'
import type { CatalogData, ItemEntry } from '../types'
import { artworkProvenance } from '../domain/verification'

const catalog = catalogJson as CatalogData
const RECENT_SEARCH_KEY = 'masterwork-vault.explore-recent-searches.v1'
const PAGE_SIZE = 60
const slug = (value: string) => value.toLowerCase().replace(/\+1/g, '').replace(/[’']/g, '').replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
const itemHref = (item: ItemEntry) => `/catalog/${item.campaign === 'Underdark' ? 'underdark' : 'sharandar'}/${encodeURIComponent(item.id)}/${slug(item.name)}`

function toggle(set: Set<string>, value: string) {
  const next = new Set(set)
  if (next.has(value)) next.delete(value); else next.add(value)
  return next
}

function readSetParam(key: string) {
  const value = new URLSearchParams(window.location.search).get(key)
  return new Set(value ? value.split(',').map((entry) => entry.trim()).filter(Boolean) : [])
}

function writeSetParam(params: URLSearchParams, key: string, values: Set<string>) {
  if (values.size) params.set(key, [...values].sort().join(','))
  else params.delete(key)
}

function readRecentSearches() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(RECENT_SEARCH_KEY) || '[]') as unknown
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === 'string').slice(0, 6) : []
  } catch { return [] }
}

function FilterGroup({ label, values, selected, onChange }: { label: string; values: string[]; selected: Set<string>; onChange: (next: Set<string>) => void }) {
  return <fieldset className="mw-filter-group"><legend>{label}</legend>{values.map((value) => <label key={value}><input type="checkbox" checked={selected.has(value)} onChange={() => onChange(toggle(selected, value))} /><span>{value}</span></label>)}</fieldset>
}

function Highlighted({ text, query }: { text: string; query: string }) {
  const clean = query.trim()
  if (!clean) return <>{text}</>
  const index = text.toLowerCase().indexOf(clean.toLowerCase())
  if (index < 0) return <>{text}</>
  return <>{text.slice(0, index)}<mark>{text.slice(index, index + clean.length)}</mark>{text.slice(index + clean.length)}</>
}

export function ExplorePage() {
  const params = useMemo(() => new URLSearchParams(window.location.search), [])
  const [query, setQuery] = useState(() => params.get('q') || '')
  const [campaigns, setCampaigns] = useState(() => readSetParam('campaign'))
  const [kinds, setKinds] = useState(() => readSetParam('kind'))
  const [professions, setProfessions] = useState(() => readSetParam('profession'))
  const [classes, setClasses] = useState(() => readSetParam('class'))
  const [evidenceOnly, setEvidenceOnly] = useState(() => params.get('evidence') === 'verified')
  const [recipeOnly, setRecipeOnly] = useState(() => params.get('recipe') === 'captured')
  const [recentSearches, setRecentSearches] = useState<string[]>(() => readRecentSearches())
  const [visibleLimit, setVisibleLimit] = useState(PAGE_SIZE)
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const deferredQuery = useDeferredValue(query)

  const allKinds = useMemo(() => [...new Set(catalog.items.map((item) => item.kind))].sort(), [])
  const allProfessions = useMemo(() => [...new Set(catalog.items.map((item) => item.profession).filter((value): value is string => Boolean(value)))].sort(), [])
  const allCampaigns = useMemo(() => [...new Set(catalog.items.map((item) => item.campaign).filter((value): value is string => Boolean(value)))].sort(), [])
  const allClasses = useMemo(() => catalog.classes.filter((value) => value !== 'All'), [])

  useEffect(() => {
    const next = new URL(window.location.href)
    const search = query.trim()
    if (search) next.searchParams.set('q', search); else next.searchParams.delete('q')
    writeSetParam(next.searchParams, 'campaign', campaigns)
    writeSetParam(next.searchParams, 'kind', kinds)
    writeSetParam(next.searchParams, 'profession', professions)
    writeSetParam(next.searchParams, 'class', classes)
    if (evidenceOnly) next.searchParams.set('evidence', 'verified'); else next.searchParams.delete('evidence')
    if (recipeOnly) next.searchParams.set('recipe', 'captured'); else next.searchParams.delete('recipe')
    window.history.replaceState(window.history.state, '', next)
  }, [query, campaigns, kinds, professions, classes, evidenceOnly, recipeOnly])

  useEffect(() => { setVisibleLimit(PAGE_SIZE) }, [deferredQuery, campaigns, kinds, professions, classes, evidenceOnly, recipeOnly])

  const results = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase()
    return catalog.items.filter((item) => {
      const text = `${item.name} ${item.kind} ${item.campaign || ''} ${item.profession || ''} ${item.classes.join(' ')} ${item.categories.join(' ')} ${item.materials.map((row) => row.name).join(' ')}`.toLowerCase()
      const campaignMatch = !campaigns.size || (item.campaign && campaigns.has(item.campaign))
      const kindMatch = !kinds.size || kinds.has(item.kind)
      const professionMatch = !professions.size || (item.profession && professions.has(item.profession))
      const classMatch = !classes.size || item.classes.includes('All') || [...classes].some((name) => item.classes.includes(name))
      const evidenceMatch = !evidenceOnly || ['screenshot-extracted', 'verified-game-asset'].includes(artworkProvenance(item))
      const recipeMatch = !recipeOnly || (item.recipeKnown !== false && item.materials.length > 0)
      return (!q || text.includes(q)) && campaignMatch && kindMatch && professionMatch && classMatch && evidenceMatch && recipeMatch
    }).sort((a, b) => {
      if (!q) return a.name.localeCompare(b.name)
      const an = a.name.toLowerCase(); const bn = b.name.toLowerCase()
      const ar = an === q ? 0 : an.startsWith(q) ? 1 : an.includes(q) ? 2 : 3
      const br = bn === q ? 0 : bn.startsWith(q) ? 1 : bn.includes(q) ? 2 : 3
      return ar - br || a.name.localeCompare(b.name)
    })
  }, [deferredQuery, campaigns, kinds, professions, classes, evidenceOnly, recipeOnly])

  useEffect(() => {
    const node = loadMoreRef.current
    if (!node || visibleLimit >= results.length || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) setVisibleLimit((value) => Math.min(results.length, value + PAGE_SIZE))
    }, { rootMargin: '500px 0px' })
    observer.observe(node)
    return () => observer.disconnect()
  }, [results.length, visibleLimit])

  const rememberSearch = (value: string) => {
    const clean = value.trim()
    if (clean.length < 2) return
    const next = [clean, ...recentSearches.filter((entry) => entry.toLowerCase() !== clean.toLowerCase())].slice(0, 6)
    setRecentSearches(next)
    try { window.localStorage.setItem(RECENT_SEARCH_KEY, JSON.stringify(next)) } catch { /* Storage is optional. */ }
  }

  const clear = () => { setQuery(''); setCampaigns(new Set()); setKinds(new Set()); setProfessions(new Set()); setClasses(new Set()); setEvidenceOnly(false); setRecipeOnly(false) }
  const hasFilters = campaigns.size + kinds.size + professions.size + classes.size > 0 || evidenceOnly || recipeOnly
  const visibleResults = results.slice(0, visibleLimit)

  return <div className="mw-explore-page">
    <header className="mw-page-topbar"><a href="/catalog" className="mw-page-brand"><img src="/assets/brand/masterwork-vault-mark.svg" alt="" /><span><strong>The Masterwork Vault</strong><small>Advanced explorer</small></span></a><nav aria-label="Primary navigation"><a href="/catalog">Catalog</a><a href="/explore" aria-current="page">Explore</a><a href="/graph">Graph</a><a href="/readiness">Readiness</a></nav></header>
    <main id="main-content" className="mw-explore-main" tabIndex={-1}>
      <section className="mw-explore-hero"><div><a className="mw-back-link" href="/catalog"><ChevronLeft size={17} />Back to Catalog</a><span className="mw-eyebrow"><Filter size={14} /> ADVANCED EXPLORER</span><h1>Filter the Vault like a database.</h1><p>Combine campaign, profession, type, class, source confidence, recipe availability and free-text search without replacing the faster everyday Catalog.</p></div><div className="mw-explore-count"><strong>{results.length}</strong><span>matching craftables</span><small>{catalog.items.length} total catalog records</small></div></section>
      <div className="mw-explore-layout">
        <aside className="mw-explore-filters">
          <label className="mw-explore-search"><Search size={17} /><span className="sr-only">Search advanced explorer</span><input value={query} onChange={(event) => setQuery(event.target.value)} onBlur={() => rememberSearch(query)} onKeyDown={(event) => { if (event.key === 'Enter') rememberSearch(query) }} placeholder="Search item, material, class…" /></label>
          {!query && recentSearches.length > 0 && <div className="mw-recent-searches" aria-label="Recent searches"><span><History size={13} />Recent</span>{recentSearches.map((entry) => <button type="button" key={entry} onClick={() => setQuery(entry)}>{entry}</button>)}<button type="button" aria-label="Clear recent searches" onClick={() => { setRecentSearches([]); try { window.localStorage.removeItem(RECENT_SEARCH_KEY) } catch { /* Storage is optional. */ } }}><X size={13} /></button></div>}
          <FilterGroup label="Campaign" values={allCampaigns} selected={campaigns} onChange={setCampaigns} />
          <FilterGroup label="Type" values={allKinds} selected={kinds} onChange={setKinds} />
          <FilterGroup label="Profession" values={allProfessions} selected={professions} onChange={setProfessions} />
          <FilterGroup label="Class" values={allClasses} selected={classes} onChange={setClasses} />
          <fieldset className="mw-filter-group"><legend>Evidence</legend><label><input type="checkbox" checked={recipeOnly} onChange={(event) => setRecipeOnly(event.target.checked)} /><span>Recipe captured</span></label><label><input type="checkbox" checked={evidenceOnly} onChange={(event) => setEvidenceOnly(event.target.checked)} /><span>Verified artwork source</span></label></fieldset>
          <button className="mw-filter-clear" type="button" onClick={clear}>Clear all filters</button>
        </aside>
        <section className="mw-explore-results" aria-live="polite" aria-busy={query !== deferredQuery}>
          {visibleResults.length ? visibleResults.map((item) => <a className="mw-explore-card" href={itemHref(item)} key={item.id}>
            <span className="mw-explore-icon">{item.icon ? <img src={item.icon} alt="" loading="lazy" /> : <BookOpen size={20} />}</span>
            <span className="mw-explore-copy"><small>{item.campaign || 'Unknown'} · {item.kind}</small><strong><Highlighted text={item.name} query={deferredQuery} /></strong><span>{item.profession || 'Profession not recorded'} · {item.classes.includes('All') ? 'All classes' : item.classes.join(', ') || 'Class not captured'}</span></span>
            <span className="mw-explore-meta"><i className={item.recipeKnown !== false && item.materials.length ? 'ready' : 'unknown'}>{item.recipeKnown !== false && item.materials.length ? <BadgeCheck size={13} /> : <ShieldCheck size={13} />}{item.recipeKnown !== false && item.materials.length ? `${item.materials.length} direct inputs` : 'Recipe unknown'}</i><em>{artworkProvenance(item)}</em></span>
          </a>) : <div className="mw-explore-empty"><Search size={30} /><h2>No craftables match</h2><p>{hasFilters ? 'Remove one or more filters, or broaden the search terms.' : 'Try a shorter item, material, class, or profession name.'}</p><div>{query && <button type="button" onClick={() => setQuery('')}>Clear search</button>}{hasFilters && <button type="button" onClick={clear}>Clear filters</button>}</div></div>}
          {visibleLimit < results.length && <div ref={loadMoreRef} className="mw-progressive-sentinel" role="status">Showing {visibleLimit} of {results.length} results</div>}
        </section>
      </div>
    </main>
  </div>
}
