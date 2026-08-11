import { useMemo, useState } from 'react'
import { ChevronDown, ChevronLeft, ChevronRight, GitBranch, Hammer, Search, Wrench } from 'lucide-react'
import catalogJson from '../data/catalog'
import type { CatalogData, ItemEntry } from '../types'
import { buildCraftingTrees, type CraftTreeNode } from '../lib/crafting'

const catalog = catalogJson as CatalogData

function GraphNode({ node, depth = 0 }: { node: CraftTreeNode; depth?: number }) {
  const [open, setOpen] = useState(depth < 3)
  const hasChildren = node.children.length > 0
  return <li className={`mw-graph-node ${node.kind} ${node.craftable ? 'craftable' : 'raw'}`}>
    <div className="mw-graph-card">
      {hasChildren ? <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={`${open ? 'Collapse' : 'Expand'} ${node.name}`}>{open ? <ChevronDown size={15} /> : <ChevronRight size={15} />}</button> : <span className="mw-graph-spacer" />}
      <span className="mw-graph-kind">{node.kind === 'item' ? <Wrench size={16} /> : node.craftable ? <Hammer size={16} /> : <span />}</span>
      <span><strong>{node.name}</strong><small>{node.kind === 'item' ? 'Final craft' : node.craftable ? `${node.profession || 'Crafted'} · ${node.crafts || 0} craft${node.crafts === 1 ? '' : 's'}` : 'Raw / acquired'}</small></span>
      <b>×{node.required}</b>
    </div>
    {open && hasChildren && <ol>{node.children.map((child, index) => <GraphNode node={child} depth={depth + 1} key={`${child.id}:${index}`} />)}</ol>}
  </li>
}

export function RecipeGraphPage() {
  const eligible = useMemo(() => catalog.items.filter((item) => item.recipeKnown !== false && item.materials.length > 0), [])
  const [query, setQuery] = useState('')
  const [itemId, setItemId] = useState(eligible[0]?.id || '')
  const visible = useMemo(() => { const q = query.trim().toLowerCase(); return eligible.filter((item) => !q || `${item.name} ${item.profession || ''} ${item.campaign || ''}`.toLowerCase().includes(q)).slice(0, 80) }, [eligible, query])
  const item = eligible.find((entry) => entry.id === itemId) ?? eligible[0]
  const trees = useMemo(() => item ? buildCraftingTrees([{ item, quantity: 1 }], catalog.recipes) : [], [item?.id])
  const rawCount = useMemo(() => { const names = new Set<string>(); const visit = (node: CraftTreeNode) => { if (!node.craftable && node.kind === 'material') names.add(node.name); node.children.forEach(visit) }; trees.forEach(visit); return names.size }, [trees])
  const craftableCount = useMemo(() => { const names = new Set<string>(); const visit = (node: CraftTreeNode) => { if (node.craftable && node.kind === 'material') names.add(node.name); node.children.forEach(visit) }; trees.forEach(visit); return names.size }, [trees])
  return <div className="mw-graph-page">
    <header className="mw-page-topbar"><a href="/catalog" className="mw-page-brand"><img src="/assets/brand/masterwork-vault-mark.svg" alt="" /><span><strong>The Masterwork Vault</strong><small>Dependency graph</small></span></a><nav aria-label="Primary navigation"><a href="/catalog">Catalog</a><a href="/explore">Explore</a><a href="/graph" aria-current="page">Graph</a><a href="/plan">Plan</a></nav></header>
    <main className="mw-graph-main">
      <section className="mw-graph-hero"><div><a className="mw-back-link" href="/catalog"><ChevronLeft size={17} />Back to Catalog</a><span className="mw-eyebrow"><GitBranch size={14} /> DEPENDENCY GRAPH</span><h1>See every craft beneath the final item.</h1><p>The graph uses the same batch-aware recipe relationships as the production planner. Expand only the branches you need; raw materials remain the leaves.</p></div>{item && <div className="mw-graph-summary"><span>{item.campaign || 'Unknown'} · {item.profession || 'Profession not recorded'}</span><strong>{item.name}</strong><small>{craftableCount} crafted intermediates · {rawCount} raw material kinds</small></div>}</section>
      <div className="mw-graph-layout">
        <aside><label className="mw-explore-search"><Search size={16} /><span className="sr-only">Search graph items</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a craftable…" /></label><div className="mw-graph-picker">{visible.map((entry: ItemEntry) => <button type="button" className={entry.id === item?.id ? 'active' : ''} onClick={() => setItemId(entry.id)} key={entry.id}><strong>{entry.name}</strong><small>{entry.campaign || 'Unknown'} · {entry.profession || entry.kind}</small></button>)}</div></aside>
        <section className="mw-graph-canvas" aria-label={item ? `${item.name} dependency graph` : 'Dependency graph'}>{trees.length ? <ol className="mw-graph-tree">{trees.map((tree) => <GraphNode node={tree} key={tree.id} />)}</ol> : <p>No recipe graph is available.</p>}</section>
      </div>
    </main>
  </div>
}
