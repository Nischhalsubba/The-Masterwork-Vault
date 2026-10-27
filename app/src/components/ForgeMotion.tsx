import { useEffect } from 'react'
import { gsap } from 'gsap'

/** Route changes emphasize the new context without hiding the user's data.
 * Fine-grained crafting feedback is animated in ForgeWorkOrder.
 */
export function ForgeMotion() {
  useEffect(() => {
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0
    let followup = 0
    let current: HTMLElement[] = []
    const reset = () => {
      window.cancelAnimationFrame(frame)
      window.cancelAnimationFrame(followup)
      gsap.killTweensOf(current)
      if (current.length) gsap.set(current, { clearProps: 'transform,opacity,visibility' })
      current = []
    }
    const play = () => {
      reset()
      if (motionPreference.matches) return
      frame = window.requestAnimationFrame(() => {
        followup = window.requestAnimationFrame(() => {
          const headings = Array.from(document.querySelectorAll<HTMLElement>(
            '.mw-core-page-header h1, .workbench-header h1, .mw-explore-hero h1, .mw-graph-hero h1, .mw-journey-hero h1',
          )).filter((node) => node.getClientRects().length).slice(0, 3)
          current = headings
          if (!headings.length) return
          gsap.fromTo(headings, { y: 7 },
            { y: 0, duration: .22, ease: 'power2.out', stagger: .035,
              overwrite: 'auto', clearProps: 'transform' })
        })
      })
    }
    play()
    const onPreferenceChange = () => { if (motionPreference.matches) reset(); else play() }
    document.addEventListener('masterwork:navigate', play)
    window.addEventListener('popstate', play)
    motionPreference.addEventListener('change', onPreferenceChange)
    return () => {
      document.removeEventListener('masterwork:navigate', play)
      window.removeEventListener('popstate', play)
      motionPreference.removeEventListener('change', onPreferenceChange)
      reset()
    }
  }, [])
  return null
}
