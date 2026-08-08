import { useEffect } from 'react'
import { gsap } from 'gsap'

const PRESS_TARGETS = [
  '.primary',
  '.stats-trigger',
  '.craftable-indicator',
  '.ghost-button',
  '.qty button',
  '.item-foot > button',
  '.mobile-native-tabbar button',
].join(', ')

const DIRECTIONAL_TARGETS = '.craftable-indicator, .stats-trigger, .mobile-native-back'

function closestElement(target: EventTarget | null, selector: string) {
  return target instanceof Element ? target.closest<HTMLElement>(selector) : null
}

function animateAddedContent(node: Node) {
  if (!(node instanceof HTMLElement)) return

  const targets = new Set<HTMLElement>()
  const collect = (selector: string) => {
    if (node.matches(selector)) targets.add(node)
    node.querySelectorAll<HTMLElement>(selector).forEach((element) => targets.add(element))
  }

  collect('.material-drilldown.enter')
  collect('.workbench-grid.enter')
  collect('.tree-panel.enter')
  collect('.checklist-panel.enter')
  collect('.professions-panel.enter')
  collect('.saved-grid.enter')

  targets.forEach((element) => {
    if (element.dataset.motionSeen === 'true') return
    element.dataset.motionSeen = 'true'

    const isDrilldown = element.matches('.material-drilldown')
    gsap.fromTo(
      element,
      {
        x: isDrilldown ? 14 : 0,
        y: isDrilldown ? 0 : 8,
        autoAlpha: 0.88,
      },
      {
        x: 0,
        y: 0,
        autoAlpha: 1,
        duration: isDrilldown ? 0.24 : 0.26,
        ease: 'power3.out',
        overwrite: 'auto',
        clearProps: 'transform,opacity,visibility',
      },
    )
  })

  const addedRows: HTMLElement[] = []
  if (node.matches('.items article')) addedRows.push(node)
  node.querySelectorAll<HTMLElement>('.items article').forEach((row) => addedRows.push(row))
  if (addedRows.length) {
    gsap.fromTo(
      addedRows.slice(0, 8),
      { y: 6, autoAlpha: 0.92 },
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.22,
        ease: 'power2.out',
        stagger: 0.025,
        overwrite: 'auto',
        clearProps: 'transform,opacity,visibility',
      },
    )
  }
}

export function MotionSystem() {
  useEffect(() => {
    const root = document.getElementById('root')
    if (!root) return

    const mm = gsap.matchMedia()

    mm.add(
      {
        phone: '(max-width: 680px)',
        larger: '(min-width: 681px)',
        reduceMotion: '(prefers-reduced-motion: reduce)',
      },
      (context) => {
        const phone = Boolean(context.conditions?.phone)
        const reduceMotion = Boolean(context.conditions?.reduceMotion)
        if (reduceMotion) return undefined

        let pressed: HTMLElement | null = null

        const releasePress = () => {
          if (!pressed) return
          const target = pressed
          pressed = null
          gsap.to(target, {
            scale: 1,
            duration: 0.16,
            ease: 'power2.out',
            overwrite: 'auto',
            clearProps: 'transform',
          })
        }

        const onPointerDown = (event: PointerEvent) => {
          const target = closestElement(event.target, PRESS_TARGETS)
          if (!target) return
          pressed = target
          gsap.to(target, {
            scale: 0.975,
            duration: 0.08,
            ease: 'power1.out',
            overwrite: 'auto',
          })
        }

        const onPointerOver = (event: PointerEvent) => {
          if (event.pointerType === 'touch') return
          const target = closestElement(event.target, DIRECTIONAL_TARGETS)
          if (!target) return
          const icons = target.querySelectorAll<SVGElement>('svg')
          const icon = target.matches('.mobile-native-back') ? icons[0] : icons[icons.length - 1]
          if (!icon) return
          gsap.to(icon, {
            x: target.matches('.mobile-native-back') ? -2 : 2,
            duration: 0.16,
            ease: 'power2.out',
            overwrite: 'auto',
          })
        }

        const onPointerOut = (event: PointerEvent) => {
          if (event.pointerType === 'touch') return
          const target = closestElement(event.target, DIRECTIONAL_TARGETS)
          if (!target || (event.relatedTarget instanceof Node && target.contains(event.relatedTarget))) return
          target.querySelectorAll<SVGElement>('svg').forEach((icon) => {
            gsap.to(icon, {
              x: 0,
              duration: 0.14,
              ease: 'power2.out',
              overwrite: 'auto',
              clearProps: 'transform',
            })
          })
        }

        const onClick = (event: MouseEvent) => {
          const itemMain = closestElement(event.target, '.item-main')
          if (itemMain && !phone) {
            window.requestAnimationFrame(() => {
              const selected = itemMain.closest<HTMLElement>('article')
              if (!selected) return
              gsap.fromTo(
                selected,
                { x: 4, scale: 0.997 },
                {
                  x: 0,
                  scale: 1,
                  duration: 0.22,
                  ease: 'power3.out',
                  overwrite: 'auto',
                  clearProps: 'transform',
                },
              )
            })
          }

          const planAction = closestElement(event.target, '.item-foot > button, .detail-head > .primary')
          if (planAction) {
            window.requestAnimationFrame(() => {
              document.querySelectorAll<HTMLElement>('.app > header .badge, .mobile-native-tabbar .badge').forEach((badge) => {
                gsap.fromTo(
                  badge,
                  { scale: 0.72, autoAlpha: 0.55 },
                  {
                    scale: 1,
                    autoAlpha: 1,
                    duration: 0.24,
                    ease: 'power3.out',
                    overwrite: 'auto',
                    clearProps: 'transform,opacity,visibility',
                  },
                )
              })
            })
          }

          const mobileTab = closestElement(event.target, '.mobile-native-tabbar button')
          if (mobileTab) {
            const icon = mobileTab.querySelector<SVGElement>('svg')
            if (icon) {
              gsap.fromTo(
                icon,
                { y: 2, scale: 0.9 },
                {
                  y: 0,
                  scale: 1,
                  duration: 0.2,
                  ease: 'power3.out',
                  overwrite: 'auto',
                  clearProps: 'transform',
                },
              )
            }
          }

          const segmented = closestElement(event.target, '.filters button, .seg button, .catalog aside button, .workbench-tabs button')
          if (segmented) {
            gsap.fromTo(
              segmented,
              { scale: 0.97 },
              {
                scale: 1,
                duration: 0.18,
                ease: 'power3.out',
                overwrite: 'auto',
                clearProps: 'transform',
              },
            )
          }
        }

        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            mutation.addedNodes.forEach(animateAddedContent)
          })
        })
        observer.observe(root, { childList: true, subtree: true })

        document.addEventListener('pointerdown', onPointerDown, { passive: true })
        document.addEventListener('pointerup', releasePress, { passive: true })
        document.addEventListener('pointercancel', releasePress, { passive: true })
        document.addEventListener('pointerover', onPointerOver, { passive: true })
        document.addEventListener('pointerout', onPointerOut, { passive: true })
        document.addEventListener('click', onClick)

        return () => {
          observer.disconnect()
          document.removeEventListener('pointerdown', onPointerDown)
          document.removeEventListener('pointerup', releasePress)
          document.removeEventListener('pointercancel', releasePress)
          document.removeEventListener('pointerover', onPointerOver)
          document.removeEventListener('pointerout', onPointerOut)
          document.removeEventListener('click', onClick)

          const animated = root.querySelectorAll<HTMLElement>([
            PRESS_TARGETS,
            DIRECTIONAL_TARGETS,
            '.material-drilldown.enter',
            '.workbench-grid.enter',
            '.tree-panel.enter',
            '.checklist-panel.enter',
            '.professions-panel.enter',
            '.saved-grid.enter',
            '.items article',
            '.badge',
          ].join(', '))
          gsap.killTweensOf(Array.from(animated))
        }
      },
    )

    return () => mm.revert()
  }, [])

  return null
}
