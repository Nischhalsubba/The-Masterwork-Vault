import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { ContentVoice } from './components/ContentVoice'
import { MobileV4Shell } from './components/MobileV4Shell'
import { MotionSystem } from './components/MotionSystem'
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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <MobileV4Shell />
    <RouteSync />
    <MotionSystem />
    <WorkshopJourney />
    <ContentVoice />
  </StrictMode>,
)
