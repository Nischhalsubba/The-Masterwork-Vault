import './crafting-tree-workspace.css'
import { createPortal } from 'react-dom'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  BookOpen,
  Boxes,
  CircleHelp,
  Gem,
  Grid3X3,
  Hammer,
  Home,
  Maximize2,
  RotateCcw,
  Route,
  ScrollText,
  SlidersHorizontal,
  Wrench,
} from 'lucide-react'
import catalogJson from '../data/catalog'
import spriteDataUri from '../data/sprite'
import { materialSourceRecords, normalizeMaterialSourceName } from '../data/materialSources'
import type { CatalogData } from '../types'
import type { CraftTreeNode } from '../lib/crafting'
import { requestAppRoute } from '../lib/navigation'

const catalog = catalogJson as CatalogData
const norm = (value: string) => value.toLowerCase().replace(/\+1/g, '').replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ')
const itemsByName = new Map(catalog.items.map((item) => [norm(item.name), item]))
const materialsByName = new Map(catalog.materials.map((material) => [norm(material.name), material]))
const sourceByName = new Map(materialSourceRecords.map((guide) => [normalizeMaterialSourceName(guide.name), guide]))
const iconIndexByName = new Map<string, number>()
for (const item of catalog.items) if (item.iconIndex != null) iconIndexByName.set(norm(item.name), item.iconIndex)
for (const material of catalog.materials) if (material.iconIndex != null) iconIndexByName.set(norm(material.name), material.iconIndex)

type PlannerTab = 'overview' | 'tree' | 'ready' | 'checklist' | 'professions' | 'saved'
type TreeMode = 'item' | 'material'
type SourceKind = 'crafted' | 'raw' | 'gathered' | 'dungeon' | 'vendor' | 'item'

interface CraftingTreeWorkspaceProps {
  trees: CraftTreeNode[]
  onOpenMaterial?: (name: string) => void
  onSetPlannerTab: (tab: PlannerTab) => void
}

function TreeIcon({ name, size = 40 }: { name: string; size?: number }) {
  const item = itemsByName.get(norm(name))
  const material = materialsByName.get(norm(name))
  const src = item?.icon || material?.icon || null
  const index = iconIndexByName.get(norm(name))
  const [failed, setFailed] = useState(false)

  useEffect(() => setFailed(false), [src, index])

  if (src && !failed) {
    return <img className="sprite thumb" src={src} alt={name} width={size} height={size} loading="lazy" decoding="async" onError={() => setFailed(true)} />
  }

  if (index == null) {
    return <span className="sprite fallback" role="img" aria-label={`${name}, image unavailable`} style={{ width: size, height: size }} />
  }

  const columns = catalog.meta.sprite.columns || 10
  const rows = Math.ceil(catalog.meta.sprite.count / columns)
  const col = index % columns
  const row = Math.floor(index / columns)

  return (
    <span className="sprite atlas-icon" role="img" aria-label={name} style={{ width: size, height: size, position: 'relative', overflow: 'hidden' }}>
      <img
        src={spriteDataUri}
        alt=""
        aria-hidden="true"
        draggable={false}
        style={{
          position: 'absolute',
          width: columns * size,
          height: rows * size,
          maxWidth: 'none',
          left: -col * size,
          top: -row * size,
          pointerEvents: 'none',
        }}
      />
    </span>
  )
}

function sourceKindForNode(node: CraftTreeNode): SourceKind {
  if (node.kind === 'item') return 'item'
  if (node.craftable) return 'crafted'
  const guide = sourceByName.get(normalizeMaterialSourceName(node.name))
  const method = guide?.routes[0]?.method
  if (method === 'Explorer chart' || method === 'Workshop gathering') return 'gathered'
  if (method === 'Dungeon drop' || method === 'Enemy drop' || method === 'Abyssal hunt') return 'dungeon'
  if (method === 'Campaign store' || method === 'Stronghold vendor') return 'vendor'
  if (method === 'Workshop crafting') return 'crafted'
  return 'raw'
}

function sourceMeta(node: CraftTreeNode, kind: SourceKind) {
  if (node.kind === 'item') return itemsByName.get(norm(node.name))?.kind || 'Craftable'
  if (node.craftable) return node.profession || 'Crafted material'
  if (kind === 'gathered') return 'Gathered'
  if (kind === 'dungeon') return 'Dungeon / hunt'
  if (kind === 'vendor') return 'Vendor / other'
  return 'Raw material'
}

function findNode(root: CraftTreeNode | undefined, id: string | null): CraftTreeNode | undefined {
  if (!root || !id) return undefined
  if (root.id === id) return root
  for (const child of root.children) {
    const match = findNode(child, id)
    if (match) return match
  }
  return undefined
}

function firstMaterialRoot(root: CraftTreeNode | undefined) {
  if (!root) return undefined
  return root.children.find((child) => child.craftable && child.children.length > 0)
    || root.children.find((child) => child.craftable)
    || root.children[0]
}

function nodeKey(node: CraftTreeNode) {
  return `${node.id}:${node.required}`
}

function navButton(
  label: string,
  IconComponent: typeof Home,
  onClick: () => void,
  active = false,
) {
  return (
    <button className={`masterwork-tree-nav-item ${active ? 'active' : ''}`} type="button" onClick={onClick} aria-current={active ? 'page' : undefined}>
      <IconComponent size={15} aria-hidden="true" />
      <span>{label}</span>
    </button>
  )
}

function GraphNode({
  node,
  parentKey,
  root = false,
  onActivate,
  onOpenMaterial,
}: {
  node: CraftTreeNode
  parentKey?: string
  root?: boolean
  onActivate: (node: CraftTreeNode) => void
  onOpenMaterial?: (name: string) => void
}) {
  const kind = sourceKindForNode(node)
  const interactive = node.kind === 'material'
  const className = `masterwork-graph-node ${root ? 'root' : ''} ${kind} ${kind === 'gathered' ? 'soft-gathered' : ''}`

  const content = (
    <>
      <span className={`masterwork-graph-icon ${kind}`}><TreeIcon name={node.name} size={root ? 46 : 38} /></span>
      <span className="masterwork-graph-copy">
        <strong>{node.name}</strong>
        <small>{sourceMeta(node, kind)}</small>
        {!root && <b>×{node.required}</b>}
        {root && node.required > 1 && <b>Qty ×{node.required}</b>}
      </span>
    </>
  )

  return (
    <article
      className={className}
      data-node-key={nodeKey(node)}
      data-parent-key={parentKey}
      data-source-kind={kind}
    >
      {interactive ? (
        <button
          type="button"
          className="masterwork-graph-card"
          onClick={() => node.craftable ? onActivate(node) : onOpenMaterial?.(node.name)}
          title={node.craftable ? `Open ${node.name} as a material tree` : `Inspect ${node.name} in Materials`}
        >
          {content}
        </button>
      ) : <div className="masterwork-graph-card">{content}</div>}
    </article>
  )
}

export function CraftingTreeWorkspace({ trees, onOpenMaterial, onSetPlannerTab }: CraftingTreeWorkspaceProps) {
  const [mode, setMode] = useState<TreeMode>('item')
  const [fitted, setFitted] = useState(false)
  const [rootId, setRootId] = useState(trees[0]?.id || '')
  const [materialRootId, setMaterialRootId] = useState<string | null>(firstMaterialRoot(trees[0])?.id || null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const itemRoot = useMemo(() => trees.find((tree) => tree.id === rootId) || trees[0], [trees, rootId])
  const materialRoot = useMemo(() => findNode(itemRoot, materialRootId) || firstMaterialRoot(itemRoot), [itemRoot, materialRootId])
  const activeRoot = mode === 'item' ? itemRoot : materialRoot
  const branches = activeRoot?.children || []
  const canvasMinWidth = Math.max(700, branches.length * 180)

  useEffect(() => {
    if (!trees.length) return
    if (!trees.some((tree) => tree.id === rootId)) {
      setRootId(trees[0].id)
      setMaterialRootId(firstMaterialRoot(trees[0])?.id || null)
    }
  }, [trees, rootId])

  useEffect(() => {
    const app = document.querySelector('.app')
    const previousAriaHidden = app?.getAttribute('aria-hidden')
    app?.setAttribute('aria-hidden', 'true')
    document.body.classList.add('masterwork-tree-open')
    return () => {
      document.body.classList.remove('masterwork-tree-open')
      if (!app) return
      if (previousAriaHidden == null) app.removeAttribute('aria-hidden')
      else app.setAttribute('aria-hidden', previousAriaHidden)
    }
  }, [])

  useLayoutEffect(() => {
    const canvas = canvasRef.current
    const svg = svgRef.current
    if (!canvas || !svg || !activeRoot) return

    const draw = () => {
      const scale = fitted ? 0.9 : 1
      const base = canvas.getBoundingClientRect()
      const width = canvas.offsetWidth
      const height = canvas.offsetHeight
      svg.setAttribute('viewBox', `0 0 ${width} ${height}`)
      svg.replaceChildren()

      const nodes = [...canvas.querySelectorAll<HTMLElement>('[data-node-key]')]
      const map = new Map(nodes.map((node) => [node.dataset.nodeKey || '', node]))

      for (const child of nodes) {
        const parentKey = child.dataset.parentKey
        if (!parentKey) continue
        const parent = map.get(parentKey)
        if (!parent) continue

        const parentRect = parent.getBoundingClientRect()
        const childRect = child.getBoundingClientRect()
        const startX = (parentRect.left - base.left + parentRect.width / 2) / scale
        const startY = (parentRect.bottom - base.top) / scale
        const endX = (childRect.left - base.left + childRect.width / 2) / scale
        const endY = (childRect.top - base.top) / scale
        const middleY = startY + Math.max(16, (endY - startY) * 0.46)

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        path.setAttribute('class', 'masterwork-tree-connector-path')
        path.setAttribute('d', `M ${startX} ${startY} V ${middleY} H ${endX} V ${endY - 7}`)
        svg.append(path)

        const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        arrow.setAttribute('class', 'masterwork-tree-connector-arrow')
        arrow.setAttribute('d', `M ${endX - 3} ${endY - 9} L ${endX} ${endY - 5} L ${endX + 3} ${endY - 9} Z`)
        svg.append(arrow)
      }
    }

    const frame = requestAnimationFrame(draw)
    const observer = new ResizeObserver(() => requestAnimationFrame(draw))
    observer.observe(canvas)
    window.addEventListener('resize', draw)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('resize', draw)
    }
  }, [activeRoot, fitted, mode])

  const activateMaterial = (node: CraftTreeNode) => {
    if (!node.craftable) {
      onOpenMaterial?.(node.name)
      return
    }
    setMaterialRootId(node.id)
    setMode('material')
    setFitted(false)
  }

  const setTreeMode = (next: TreeMode) => {
    if (next === 'material' && !materialRootId) setMaterialRootId(firstMaterialRoot(itemRoot)?.id || null)
    setMode(next)
    setFitted(false)
  }

  const frame = (
    <div className="masterwork-tree-shell">
      <div className="masterwork-tree-frame">
        <aside className="masterwork-tree-sidebar" aria-label="Plan and craft navigation">
          <a className="masterwork-tree-brand" href={import.meta.env.BASE_URL} aria-label="The Masterwork Vault home">
            <img src={`${import.meta.env.BASE_URL}assets/brand/masterwork-vault-mark.svg`} alt="" />
            <span><strong>The Masterwork Vault</strong><small>Neverwinter Crafting Companion</small></span>
          </a>

          <nav className="masterwork-tree-nav">
            {navButton('Home', Home, () => onSetPlannerTab('overview'))}
            {navButton('Catalog', BookOpen, () => requestAppRoute({ view: 'catalog' }))}
            {navButton('Plan & Craft', Boxes, () => setTreeMode('item'), true)}
            {navButton('Materials', Gem, () => requestAppRoute({ view: 'materials' }))}
            {navButton('Guides', ScrollText, () => onSetPlannerTab('checklist'))}
            {navButton('Progression', Route, () => onSetPlannerTab('professions'))}
            {navButton('Tools', Wrench, () => onSetPlannerTab('ready'))}
            {navButton('Reference', CircleHelp, () => requestAppRoute({ view: 'reference' }))}
          </nav>

          <div className="masterwork-tree-sidebar-footer">
            <small>Knowledge</small>
            <p>Crafts a Stronger Neverwinter.</p>
          </div>
        </aside>

        <main className="masterwork-tree-content">
          <header className="masterwork-tree-page-header">
            <div>
              <h1>Crafting Tree</h1>
              <p>See the full dependency chain for your item.</p>
            </div>
            <div className="masterwork-tree-mode" role="group" aria-label="Tree view">
              <button type="button" className={mode === 'item' ? 'active' : ''} aria-pressed={mode === 'item'} onClick={() => setTreeMode('item')}>Item Tree</button>
              <button type="button" className={mode === 'material' ? 'active' : ''} aria-pressed={mode === 'material'} disabled={!materialRoot} onClick={() => setTreeMode('material')}>Material Tree</button>
            </div>
          </header>

          <div className="masterwork-tree-toolbar">
            {trees.length > 1 && (
              <label className="masterwork-tree-root-select">
                <span>Root item</span>
                <select
                  aria-label="Crafting tree root"
                  value={itemRoot?.id || ''}
                  onChange={(event) => {
                    const next = trees.find((tree) => tree.id === event.target.value)
                    setRootId(event.target.value)
                    setMaterialRootId(firstMaterialRoot(next)?.id || null)
                    setMode('item')
                    setFitted(false)
                  }}
                >
                  {trees.map((tree) => <option value={tree.id} key={tree.id}>{tree.name}</option>)}
                </select>
              </label>
            )}
            <button type="button" className="masterwork-tree-fit" onClick={() => setFitted((value) => !value)} aria-label={fitted ? 'Reset view' : 'Fit to view'}>
              {fitted ? <RotateCcw size={14} aria-hidden="true" /> : <Maximize2 size={14} aria-hidden="true" />}
              <span>{fitted ? 'Reset view' : 'Fit to view'}</span>
            </button>
          </div>

          <section className="masterwork-tree-stage" aria-label="Crafting dependency tree">
            {!activeRoot ? (
              <div className="masterwork-tree-empty" role="status">
                <Grid3X3 size={30} aria-hidden="true" />
                <h2>No crafting tree yet</h2>
                <p>Add a craftable item from Catalog, then return to Plan & Craft.</p>
                <button type="button" onClick={() => requestAppRoute({ view: 'catalog' })}>Browse Catalog</button>
              </div>
            ) : (
              <div
                className={`masterwork-tree-canvas ${fitted ? 'is-fitted' : ''}`}
                ref={canvasRef}
                style={{ minWidth: canvasMinWidth }}
              >
                <svg className="masterwork-tree-connectors" ref={svgRef} aria-hidden="true" />

                <div className="masterwork-tree-root-row">
                  <GraphNode node={activeRoot} root onActivate={activateMaterial} onOpenMaterial={onOpenMaterial} />
                </div>

                <div className="masterwork-tree-branches" style={{ gridTemplateColumns: `repeat(${Math.max(1, branches.length)}, minmax(150px, 1fr))` }}>
                  {branches.map((branch) => (
                    <div className="masterwork-tree-branch" key={nodeKey(branch)}>
                      <GraphNode node={branch} parentKey={nodeKey(activeRoot)} onActivate={activateMaterial} onOpenMaterial={onOpenMaterial} />
                      {branch.children.length > 0 && (
                        <div className={`masterwork-tree-leaves ${branch.children.length === 1 ? 'single' : ''}`}>
                          {branch.children.map((leaf) => (
                            <GraphNode node={leaf} parentKey={nodeKey(branch)} onActivate={activateMaterial} onOpenMaterial={onOpenMaterial} key={nodeKey(leaf)} />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          <footer className="masterwork-tree-legend" aria-label="Crafting source legend">
            <span><i className="crafted" />Crafted material</span>
            <span><i className="raw" />Raw material</span>
            <span><i className="gathered" />Gathered</span>
            <span><i className="dungeon" />Dungeon drop</span>
            <span><i className="vendor" />Vendor / Other</span>
          </footer>
        </main>
      </div>
    </div>
  )

  return createPortal(frame, document.body)
}
