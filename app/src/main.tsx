import { lazy, StrictMode, Suspense, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from './components/ErrorBoundary'
import { CommandPalette } from './components/CommandPalette'
import { UpdateBanner } from './components/UpdateBanner'
import { UXSystem } from './components/UXSystem'
import './styles.css'
import './drilldown.css'
import './features.css'
import './features-a11y.css'
import './features-complete.css'
import './sticky-detail.css'
import './compact-ui.css'
import './stats-drawer.css'
import './desktop-overlay-v4.css'
import './mobile-v4.css'
import './campaign-layout.css'
import './mobile-popups-v5.css'
import './workshop-journey.css'
import './workshop-journey-prominence.css'
import './journey-page.css'
import './icon-fallbacks.css'
import './quality-fixes.css'
import './masterwork-next.css'
import './typography.css'
import './typography-mobile.css'
import './ux-system.css'

const App = lazy(() => import('./App'))
const MobileV4Shell = lazy(() => import('./components/MobileV4Shell').then((module) => ({ default: module.MobileV4Shell })))
const RouteSync = lazy(() => import('./components/RouteSync').then((module) => ({ default: module.RouteSync })))
const QualitySystem = lazy(() => import('./components/QualitySystem').then((module) => ({ default: module.QualitySystem })))
const CompareWorkbench = lazy(() => import('./components/CompareWorkbench').then((module) => ({ default: module.CompareWorkbench })))
const JourneyPage = lazy(() => import('./components/JourneyPage').then((module) => ({ default: module.JourneyPage })))
const JourneyLauncher = lazy(() => import('./components/JourneyPage').then((module) => ({ default: module.JourneyLauncher })))
const ReadinessPage = lazy(() => import('./components/ReadinessPage').then((module) => ({ default: module.ReadinessPage })))
const DataHealthPage = lazy(() => import('./components/DataHealthPage').then((module) => ({ default: module.DataHealthPage })))
const ExplorePage = lazy(() => import('./components/ExplorePage').then((module) => ({ default: module.ExplorePage })))
const RecipeGraphPage = lazy(() => import('./components/RecipeGraphPage').then((module) => ({ default: module.RecipeGraphPage })))

function PageLoading() {
  return <div className="mw-page-loading" role="status" aria-label="Loading Masterwork Vault"><div><span /><span /><span /><span /></div></div>
}

function Guarded({ name, children }: { name: string; children: ReactNode }) {
  return <ErrorBoundary name={name}>{children}</ErrorBoundary>
}

function RouteContent() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/catalog'
  if (path === '/journey') return <Guarded name="Journey"><JourneyPage /></Guarded>
  if (path === '/readiness') return <Guarded name="Readiness"><ReadinessPage /></Guarded>
  if (path === '/data-health') return <Guarded name="Data Health"><DataHealthPage /></Guarded>
  if (path === '/explore') return <Guarded name="Explorer"><ExplorePage /></Guarded>
  if (path === '/graph') return <Guarded name="Dependency Graph"><RecipeGraphPage /></Guarded>
  return <>
    <App />
    <MobileV4Shell />
    <RouteSync />
    <JourneyLauncher />
    <CompareWorkbench />
  </>
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary name="The Masterwork Vault">
      <Suspense fallback={<PageLoading />}>
        <UXSystem />
        <RouteContent />
        <QualitySystem />
        <CommandPalette />
        <UpdateBanner />
      </Suspense>
    </ErrorBoundary>
  </StrictMode>,
)
