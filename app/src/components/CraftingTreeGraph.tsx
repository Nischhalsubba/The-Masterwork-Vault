import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import catalogJson from '../data/catalog'
import spriteDataUri from '../data/sprite'
import { materialSourceRecords, normalizeMaterialSourceName } from '../data/materialSources'
import type { CatalogData } from '../types'
import type { CraftTreeNode } from '../lib/crafting'

const catalog = catalogJson as CatalogData
const norm = (value: string) => value.toLowerCase().replace(/\+1/g, '').replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ')
const itemsByName = new Map(catalog.items.map((item) => [norm(item.name), item]))
const materialsByName = new Map(catalog.materials.map((material) => [norm(material.name), material]))
const sourceByName = new Map(materialSourceRecords.map((guide) => [normalizeMaterialSourceName(guide.name), guide]))
const iconIndexByName = new Map<string, number>()
for (const item of catalog.items) if (item.iconIndex != null) iconIndexByName.set(norm(item.name), item.iconIndex)
for (const material of catalog.materials) if (material.iconIndex != null) iconIndexByName.set(norm(material.name), material.iconIndex)

type SourceKind = 'crafted' | 'raw' | 'gathered' | 'dungeon' | 'vendor' | 'item'

interface CraftingTreeGraphProps {
  root?: CraftTreeNode
  fitted: boolean
  onActivateMaterial: (node: CraftTreeNode) => void
  onOpenMaterial?: (name: string) => void
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

function nodeKey(node: CraftTreeNode) {
  return `${node.id}:${node.required}`
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
      className={`masterwork-graph-node ${root ? 'root' : ''} ${kind} ${kind === 'gathered' ? 'soft-gathered' : ''}`}
      data-node-key={nodeKey(node)}
      data-parent-key={parentKey}
      data-source-kind={kind}
    >
      {node.kind === 'material' ? (
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

export function CraftingTreeGraph({ root, fitted, onActivateMaterial, onOpenMaterial }: CraftingTreeGraphProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const branches = root?.children || []
  const canvasMinWidth = Math.max(700, branches.length * 180)

  useLayoutEffect(() => {
    const canvas = canvasRef.current
    const svg = svgRef.current
    if (!canvas || !svg || !root) return

    const draw = () => {
      const scale = fitted ? 0.9 : 1
      const base = canvas.getBoundingClientRect()
      svg.setAttribute('viewBox', `0 0 ${canvas.offsetWidth} ${canvas.offsetHeight}`)
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
  }, [root, fitted])

  if (!root) return null

  return (
    <div
      className={`masterwork-tree-canvas ${fitted ? 'is-fitted' : ''}`}
      ref={canvasRef}
      style={{ minWidth: canvasMinWidth }}
    >
      <svg className="masterwork-tree-connectors" ref={svgRef} aria-hidden="true" />

      <div className="masterwork-tree-root-row">
        <GraphNode node={root} root onActivate={onActivateMaterial} onOpenMaterial={onOpenMaterial} />
      </div>

      <div className="masterwork-tree-branches" style={{ gridTemplateColumns: `repeat(${Math.max(1, branches.length)}, minmax(150px, 1fr))` }}>
        {branches.map((branch) => (
          <div className="masterwork-tree-branch" key={nodeKey(branch)}>
            <GraphNode node={branch} parentKey={nodeKey(root)} onActivate={onActivateMaterial} onOpenMaterial={onOpenMaterial} />
            {branch.children.length > 0 && (
              <div className={`masterwork-tree-leaves ${branch.children.length === 1 ? 'single' : ''}`}>
                {branch.children.map((leaf) => (
                  <GraphNode node={leaf} parentKey={nodeKey(branch)} onActivate={onActivateMaterial} onOpenMaterial={onOpenMaterial} key={nodeKey(leaf)} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
