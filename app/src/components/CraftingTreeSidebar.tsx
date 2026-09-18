import {
  BookOpen,
  Boxes,
  CircleHelp,
  Gem,
  Home,
  Route,
  ScrollText,
  Wrench,
  type LucideIcon,
} from 'lucide-react'
import { requestAppRoute } from '../lib/navigation'

export type PlannerTab = 'overview' | 'tree' | 'ready' | 'checklist' | 'professions' | 'saved'

interface CraftingTreeSidebarProps {
  onSetPlannerTab: (tab: PlannerTab) => void
  onResetItemTree: () => void
}

function NavButton({
  label,
  icon: Icon,
  onClick,
  active = false,
}: {
  label: string
  icon: LucideIcon
  onClick: () => void
  active?: boolean
}) {
  return (
    <button className={`masterwork-tree-nav-item ${active ? 'active' : ''}`} type="button" onClick={onClick} aria-current={active ? 'page' : undefined}>
      <Icon size={15} aria-hidden="true" />
      <span>{label}</span>
    </button>
  )
}

export function CraftingTreeSidebar({ onSetPlannerTab, onResetItemTree }: CraftingTreeSidebarProps) {
  return (
    <aside className="masterwork-tree-sidebar" aria-label="Plan and craft navigation">
      <a className="masterwork-tree-brand" href={import.meta.env.BASE_URL} aria-label="The Masterwork Vault home">
        <img src={`${import.meta.env.BASE_URL}assets/brand/masterwork-vault-mark.svg`} alt="" />
        <span><strong>The Masterwork Vault</strong><small>Neverwinter Crafting Companion</small></span>
      </a>

      <nav className="masterwork-tree-nav">
        <NavButton label="Home" icon={Home} onClick={() => onSetPlannerTab('overview')} />
        <NavButton label="Catalog" icon={BookOpen} onClick={() => requestAppRoute({ view: 'catalog' })} />
        <NavButton label="Plan & Craft" icon={Boxes} onClick={onResetItemTree} active />
        <NavButton label="Materials" icon={Gem} onClick={() => requestAppRoute({ view: 'materials' })} />
        <NavButton label="Guides" icon={ScrollText} onClick={() => onSetPlannerTab('checklist')} />
        <NavButton label="Progression" icon={Route} onClick={() => onSetPlannerTab('professions')} />
        <NavButton label="Tools" icon={Wrench} onClick={() => onSetPlannerTab('ready')} />
        <NavButton label="Reference" icon={CircleHelp} onClick={() => requestAppRoute({ view: 'reference' })} />
      </nav>

      <div className="masterwork-tree-sidebar-footer">
        <small>Knowledge</small>
        <p>Crafts a Stronger Neverwinter.</p>
      </div>
    </aside>
  )
}
