import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { MobileNativeBridge } from './components/MobileNativeBridge'
import { MotionSystem } from './components/MotionSystem'
import './styles.css'
import './drilldown.css'
import './features.css'
import './features-a11y.css'
import './features-complete.css'
import './sticky-detail.css'
import './compact-ui.css'
import './stats-drawer.css'
import './mobile-native.css'
import './mobile-browser-fixes.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <MobileNativeBridge />
    <MotionSystem />
  </StrictMode>,
)
