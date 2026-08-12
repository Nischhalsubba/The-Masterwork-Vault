import { useEffect, useState } from 'react'
import { RefreshCw, X } from 'lucide-react'

export function UpdateBanner() {
  const [available, setAvailable] = useState(false)
  useEffect(() => {
    const onUpdate = () => setAvailable(true)
    document.addEventListener('masterwork:update-available', onUpdate)
    return () => document.removeEventListener('masterwork:update-available', onUpdate)
  }, [])
  if (!available) return null
  return <aside className="mw-update-banner" role="status" aria-live="polite">
    <div><strong>New Masterwork data is available.</strong><span>Refresh to use the latest recipes and progression data.</span></div>
    <button type="button" onClick={() => window.location.reload()}><RefreshCw size={15} />Refresh</button>
    <button className="mw-update-dismiss" type="button" onClick={() => setAvailable(false)} aria-label="Dismiss update notice"><X size={16} /></button>
  </aside>
}
