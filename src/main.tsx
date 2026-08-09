import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { MobileV4Shell } from './components/MobileV4Shell'
import { MotionSystem } from './components/MotionSystem'
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
import './mobile-popups-v5.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <MobileV4Shell />
    <MotionSystem />
  </StrictMode>,
)
