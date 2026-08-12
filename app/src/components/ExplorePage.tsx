import { useMemo, useState } from 'react'
import { BadgeCheck, BookOpen, ChevronLeft, Filter, Search, ShieldCheck } from 'lucide-react'
import catalogJson from '../data/catalog'
import type { CatalogData, ItemEntry } from '../types'
import { artworkProvenance } from '../domain/verification'

const catalog = catalogJson as CatalogData
const slug = (value: string) => value.toLowerCase().replace(/\+1/g, '').replace(/[’']/g, '').replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
const itemHref = (item: ItemEntry) => `/catalog/${item.campaign === 'Underdark' ? 'underdark' : 'sharandar'}/${encodeURIComponent(item.id)}/${slug(item.name)}`

function toggle(set: Set<string>, value: string) {
  const next = new Set(set)
  if (next.has(value)) next.delete(value); else next.add(value)
  return next
}

function FilterGroup({ label, values, selected, onChange }: { label: string; values: string[]; selected: Set<string>; onChange: (next: Set<string>) => void }) {
  return <fieldset className="mw-filter-group"><legend>{label}</legend>{values.map((value) => <label key={value}><input type="checkbox" checked={selected.has(value)} onChange={() => onChange(toggle(selected, value))} /><span>{value}</span></label>)}</fieldset>
}

export function ExplorePage() {
  const [query, setQuery] = useState('')
  const [campaigns, setCampaigns] = useState(new Set<string>())
  const [kinds, setKinds] = useState(new Set<string>())
  const [professions, setProfessions] = useState(new Set<string>())
  const [classes, setClasses] = useState(new Set<string>())
  const [evidenceOnly, setEvidenceOnly] = useState(false)
  const [recipeOnly, setRecipeOnly] = useState(false)
  const allKinds = useMemo(() => [...new Set(catalog.items.map((item) => item.kind))].sort(), [])
  const allProfessions = useMemo(() => [...new Set(catalog.items.map((item) => item.profession).filter((value): value is string => Boolean(value)))].sort(), [])
  const allCampaigns = useMemo(() => [...new Set(catalog.items.map((item) => item.campaign).filter((value): value is string => Boolean(value)))].sort(), [])
  const allClasses = useMemo(() => catalog.classes.filter((value) => value !== 'All'), [])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return catalog.items.filter((item) => {
      const text = `${item.name} ${item.kind} ${item.campaign || ''} ${item.profession || ''} ${item.classes.join(' ')} ${item.categories.join(' ')} ${item.materials.map((row) => row.name).join(' ')}`.toLowerCase()
      const campaignMatch = !campaigns.size || (item.campaign && campaigns.has(item.campaign))
      const kindMatch = !kinds.size || kinds.has(item.kind)
      const professionMatch = !professions.size || (item.profession && professions.has(item.profession))
      const classMatch = !classes.size || item.classes.includes('All') || [...classes].some((name) => item.classes.includes(name))
      const evidenceMatch = !evidenceOnly || ['screenshot-extracted', 'verified-game-asset'].includes(artworkProvenance(item))
      const recipeMatch = !recipeOnly || (item.recipeKnown !== false && item.materials.length > 0)
      return (!q || text.includes(q)) && campaignMatch && kindMatch && professionMatch && classMatch && evidenceMatch && recipeMatch
    })
  }, [query, campaigns, kinds, professions, classes, evidenceOnly, recipeOnly])

  const clear = () => { setQuery(''); setCampaigns(new Set()); setKinds(new Set()); setProfessions(new Set()); setClasses(new Set()); setEvidenceOnly(false); setRecipeOnly(false) }
  return <div className="mw-explore-page">
    <header className="mw-page-topbar"><a href="/catalog" className="mw-page-brand"><img src="/assets/brand/masterwork-vault-mark.svg" alt="" /><span><strong>The Masterwork Vault</strong><small>Advanced explorer</small></span></a><nav aria-label="Primary navigation"><a href="/catalog">Catalog</a><a href="/explore" aria-current="page">Explore</a><a href="/graph">Graph</a><a href="/readiness">Readiness</a></nav></header>
    <main className="mw-explore-main">
      <section className="mw-explore-hero"><div><a className="mw-back-link" href="/catalog"><ChevronLeft size={17} />Back to Catalog</a><span className="mw-eyebrow"><Filter size={14} /> ADVANCED EXPLORER</span><h1>Filter the Vault like a database.</h1><p>Combine campaign, profession, type, class, source confidence, recipe availability and free-text search without replacing the faster everyday Catalog.</p></div><div className="mw-explore-count"><strong>{results.length}</strong><span>matching craftables</span><small>{catalog.items.length} total catalog records</small></div></section>
      <div className="mw-explore-layout">
        <aside className="mw-explore-filters">
          <label className="mw-explore-search"><Search size={17} /><span className="sr-only">Search advanced explorer</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search item, material, class…" /></label>
          <FilterGroup label="Campaign" values={allCampaigns} selected={campaigns} onChange={setCampaigns} />
          <FilterGroup label="Type" values={allKinds} selected={kinds} onChange={setKinds} />
          <FilterGroup label="Profession" values={allProfessions} selected={professions} onChange={setProfessions} />
          <FilterGroup label="Class" values={allClasses} selected={classes} onChange={setClasses} />
          <fieldset className="mw-filter-group"><legend>Evidence</legend><label><input type="checkbox" checked={recipeOnly} onChange={(event) => setRecipeOnly(event.target.checked)} /><span>Recipe captured</span></label><label><input type="checkbox" checked={evidenceOnly} onChange={(event) => setEvidenceOnly(event.target.checked)} /><span>Verified artwork source</span></label></fieldset>
          <button className="mw-filter-clear" type="button" onClick={clear}>Clear all filters</button>
        </aside>
        <section className="mw-explore-results" aria-live="polite">
          {results.length ? results.map((item) => <a className="mw-explore-card" href={itemHref(item)} key={item.id}>
            <span className="mw-explore-icon">{item.icon ? <img src={item.icon} alt="" loading="lazy" /> : <BookOpen size={20} />}</span>
            <span className="mw-explore-copy"><small>{item.campaign || 'Unknown'} · {item.kind}</small><strong>{item.name}</strong><span>{item.profession || 'Profession not recorded'} · {item.classes.includes('All') ? 'All classes' : item.classes.join(', ') || 'Class not captured'}</span></span>
            <span className="mw-explore-meta"><i className={item.recipeKnown !== false && item.materials.length ? 'ready' : 'unknown'}>{item.recipeKnown !== false && item.materials.length ? <BadgeCheck size={13} /> : <ShieldCheck size={13} />}{item.recipeKnown !== false && item.materials.length ? `${item.materials.length} direct inputs` : 'Recipe unknown'}</i><em>{artworkProvenance(item)}</em></span>
          </a>) : <div className="mw-explore-empty"><Search size={30} /><h2>No craftables match</h2><p>Remove one or more filters to broaden the catalog results.</p><button type="button" onClick={clear}>Clear filters</button></div>}
        </section>
      </div>
    </main>
  </div>
}
