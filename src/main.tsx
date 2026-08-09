import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { CompareWorkbench } from './components/CompareWorkbench'
import { MobileV4Shell } from './components/MobileV4Shell'
import { QualitySystem } from './components/QualitySystem'
import { RouteSync } from './components/RouteSync'
import { WorkshopJourney } from './components/WorkshopJourney'
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
import './icon-fallbacks.css'
import './quality-fixes.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <MobileV4Shell />
    <RouteSync />
    <QualitySystem />
    <WorkshopJourney />
    <CompareWorkbench />
  </StrictMode>,
)
