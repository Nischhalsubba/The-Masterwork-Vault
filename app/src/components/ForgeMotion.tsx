import { useEffect } from 'react'
import { gsap } from 'gsap'

/**
 * Shared Forge V4 motion. Animates presentation only; never mutates crafting data
 * or UI state. Deliberately short, non-looping, and disabled for reduced motion.
 */
export function ForgeMotion() {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0
    let followup = 0
    let active: Element[] = []

    const play = () => {
      window.cancelAnimationFrame(frame)
      window.cancelAnimationFrame(followup)
      if (reduce.matches) return
      frame = window.requestAnimationFrame(() => {
        followup = window.requestAnimationFrame(() => {
          const titles = Array.from(document.querySelectorAll<HTMLElement>(
            '.mw-core-page-header, .workbench-header, .mw-explore-hero, .mw-graph-hero, .mw-journey-hero',
          )).filter((node) => node.getClientRects().length)
          const surfaces = Array.from(document.querySelectorAll<HTMLElement>(
            '.toolbar, .mw-class-filter, .collection-switcher, .workbench-tabs, .mw-explore-filters',
          )).filter((node) => node.getClientRects().length).slice(0, 5)
          const rows = Array.from(document.querySelectorAll<HTMLElement>(
            '.items article, .mw-graph-picker button, .mw-explore-card',
          )).filter((node) => node.getClientRects().length).slice(0, 8)
          active = [...titles, ...surfaces, ...rows]
          gsap.killTweensOf(active)
          if (titles.length) gsap.fromTo(titles,
            { y: 13, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: .45, ease: 'power2.out', stagger: .045,
              clearProps: 'opacity,visibility,transform', overwrite: 'auto' })
          if (surfaces.length) gsap.fromTo(surfaces,
            { y: 9, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: .36, delay: .06, stagger: .045,
              ease: 'power2.out', clearProps: 'opacity,visibility,transform', overwrite: 'auto' })
          if (rows.length) gsap.fromTo(rows,
            { x: -8, autoAlpha: 0 },
            { x: 0, autoAlpha: 1, duration: .3, delay: .09, stagger: .025,
              ease: 'power2.out', clearProps: 'opacity,visibility,transform', overwrite: 'auto' })
        })
      })
    }

    const cleanupAnimations = () => {
      window.cancelAnimationFrame(frame)
      window.cancelAnimationFrame(followup)
      gsap.killTweensOf(active)
      for (const el of active) {
        if (el instanceof HTMLElement) {
          el.style.removeProperty('opacity')
          el.style.removeProperty('visibility')
          el.style.removeProperty('transform')
        }
      }
      active = []
    }

    const onMotionPreferenceChange = () => {
      if (reduce.matches) cleanupAnimations()
      else play()
    }

    play()
    document.addEventListener('masterwork:navigate', play)
    window.addEventListener('popstate', play)
    reduce.addEventListener('change', onMotionPreferenceChange)
    return () => {
      document.removeEventListener('masterwork:navigate', play)
      window.removeEventListener('popstate', play)
      reduce.removeEventListener('change', onMotionPreferenceChange)
      cleanupAnimations()
    }
  }, [])

  return null
}
