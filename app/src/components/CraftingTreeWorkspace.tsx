import './crafting-tree-workspace.css'
import { useEffect, useMemo, useState } from 'react'
import { Grid3X3, Maximize2, RotateCcw } from 'lucide-react'
import type { CraftTreeNode } from '../lib/crafting'
import { requestAppRoute } from '../lib/navigation'
import { CraftingTreeGraph } from './CraftingTreeGraph'

type TreeMode = 'item' | 'material'

interface CraftingTreeWorkspaceProps {
  trees: CraftTreeNode[]
  onOpenMaterial?: (name: string) => void
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
  const craftable = root.children
    .filter((child) => child.craftable)
    .sort((a, b) => a.name.localeCompare(b.name))
  return craftable.find((child) => child.children.length > 0)
    || craftable[0]
    || [...root.children].sort((a, b) => a.name.localeCompare(b.name))[0]
}

export function CraftingTreeWorkspace({ trees, onOpenMaterial }: CraftingTreeWorkspaceProps) {
  const [mode, setMode] = useState<TreeMode>('item')
  const [fitted, setFitted] = useState(false)
  const [rootId, setRootId] = useState(trees[0]?.id || '')
  const [materialRootId, setMaterialRootId] = useState<string | null>(firstMaterialRoot(trees[0])?.id || null)

  const itemRoot = useMemo(() => trees.find((tree) => tree.id === rootId) || trees[0], [trees, rootId])
  const materialRoot = useMemo(() => findNode(itemRoot, materialRootId) || firstMaterialRoot(itemRoot), [itemRoot, materialRootId])
  const activeRoot = mode === 'item' ? itemRoot : materialRoot

  useEffect(() => {
    if (!trees.length) return
    if (!trees.some((tree) => tree.id === rootId)) {
      setRootId(trees[0].id)
      setMaterialRootId(firstMaterialRoot(trees[0])?.id || null)
    }
  }, [trees, rootId])

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

  const chooseRoot = (nextRootId: string) => {
    const next = trees.find((tree) => tree.id === nextRootId)
    setRootId(nextRootId)
    setMaterialRootId(firstMaterialRoot(next)?.id || null)
    setMode('item')
    setFitted(false)
  }

  return (
    <section className="masterwork-tree-shell" aria-labelledby="crafting-tree-title">
      <div className="masterwork-tree-frame">
        <div className="masterwork-tree-content">
          <header className="masterwork-tree-page-header">
            <div>
              <span className="mw-tree-context">PLAN & CRAFT / DEPENDENCIES</span>
              <h2 id="crafting-tree-title">Crafting Tree</h2>
              <p>Trace every crafted intermediate and acquired material without leaving your plan.</p>
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
                <select aria-label="Crafting tree root" value={itemRoot?.id || ''} onChange={(event) => chooseRoot(event.target.value)}>
                  {trees.map((tree) => <option value={tree.id} key={tree.id}>{tree.name}</option>)}
                </select>
              </label>
            )}
            <button type="button" className="masterwork-tree-fit" onClick={() => setFitted((value) => !value)} aria-label={fitted ? 'Reset view' : 'Fit to view'}>
              {fitted ? <RotateCcw size={14} aria-hidden="true" /> : <Maximize2 size={14} aria-hidden="true" />}
              <span>{fitted ? 'Reset view' : 'Fit to view'}</span>
            </button>
          </div>

          <div className="masterwork-tree-stage" aria-label="Crafting dependency tree">
            {!activeRoot ? (
              <div className="masterwork-tree-empty" role="status">
                <Grid3X3 size={30} aria-hidden="true" />
                <h3>No crafting tree yet</h3>
                <p>Add a craftable item from Catalog, then return to Plan & Craft.</p>
                <button type="button" onClick={() => requestAppRoute({ view: 'catalog' })}>Browse Catalog</button>
              </div>
            ) : (
              <CraftingTreeGraph root={activeRoot} fitted={fitted} onActivateMaterial={activateMaterial} onOpenMaterial={onOpenMaterial} />
            )}
          </div>

          <div className="masterwork-tree-legend" role="list" aria-label="Crafting source legend">
            <span role="listitem"><i className="crafted" />Crafted material</span>
            <span role="listitem"><i className="raw" />Raw material</span>
            <span role="listitem"><i className="gathered" />Gathered</span>
            <span role="listitem"><i className="dungeon" />Dungeon drop</span>
            <span role="listitem"><i className="vendor" />Vendor / Other</span>
          </div>
        </div>
      </div>
    </section>
  )
}
