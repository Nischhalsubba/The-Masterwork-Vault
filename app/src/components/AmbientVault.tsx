import { useEffect, useRef } from 'react'

export function AmbientVault() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const shellRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const shell = shellRef.current
    if (!canvas || !shell) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const lowEnd = typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 2
    const saveData = Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData)
    if (reduced || lowEnd || saveData) {
      shell.dataset.static = 'true'
      return
    }

    let disposed = false
    let cleanup = () => undefined
    const start = async () => {
      const THREE = await import('three')
      if (disposed || !canvasRef.current || !shellRef.current) return
      let renderer: import('three').WebGLRenderer
      try {
        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' })
      } catch {
        shell.dataset.static = 'true'
        return
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.35))
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.setClearColor(0x000000, 0)

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100)
      camera.position.set(0, 0, 7)
      const group = new THREE.Group()
      scene.add(group)

      const coreGeometry = new THREE.IcosahedronGeometry(1.48, 1)
      const edges = new THREE.EdgesGeometry(coreGeometry, 20)
      const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x2f7de1, transparent: true, opacity: 0.24 })
      const wire = new THREE.LineSegments(edges, edgeMaterial)
      group.add(wire)

      const ringMaterial = new THREE.MeshBasicMaterial({ color: 0x7a5af8, transparent: true, opacity: 0.08, wireframe: true })
      const ringA = new THREE.Mesh(new THREE.TorusGeometry(2.05, 0.012, 6, 72), ringMaterial)
      const ringBMaterial = ringMaterial.clone()
      const ringB = new THREE.Mesh(new THREE.TorusGeometry(1.78, 0.01, 6, 72), ringBMaterial)
      ringA.rotation.x = Math.PI * 0.34; ringA.rotation.y = Math.PI * 0.18
      ringB.rotation.x = Math.PI * -0.26; ringB.rotation.z = Math.PI * 0.28
      group.add(ringA, ringB)

      const pointCount = 42
      const positions = new Float32Array(pointCount * 3)
      for (let i = 0; i < pointCount; i += 1) {
        const theta = (i / pointCount) * Math.PI * 2
        const radius = 2.25 + ((i * 17) % 11) * 0.055
        positions[i * 3] = Math.cos(theta) * radius
        positions[i * 3 + 1] = Math.sin(theta * 1.73) * 1.25
        positions[i * 3 + 2] = Math.sin(theta) * 0.7
      }
      const pointGeometry = new THREE.BufferGeometry()
      pointGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      const pointMaterial = new THREE.PointsMaterial({ color: 0x4f8ee8, size: 0.027, transparent: true, opacity: 0.34, sizeAttenuation: true })
      const points = new THREE.Points(pointGeometry, pointMaterial)
      group.add(points)

      const clock = new THREE.Clock()
      let frame = 0
      let spinY = 0
      let targetX = 0
      let targetY = 0
      let visible = true
      const onPointer = (event: PointerEvent) => {
        if (event.pointerType === 'touch') return
        const rect = shell.getBoundingClientRect()
        targetY = ((event.clientX - rect.left) / Math.max(1, rect.width) - 0.5) * 0.12
        targetX = ((event.clientY - rect.top) / Math.max(1, rect.height) - 0.5) * 0.08
      }
      shell.addEventListener('pointermove', onPointer, { passive: true })

      const resize = () => {
        const rect = shell.getBoundingClientRect()
        renderer.setSize(Math.max(1, Math.floor(rect.width)), Math.max(1, Math.floor(rect.height)), false)
        camera.aspect = rect.width / Math.max(1, rect.height)
        camera.updateProjectionMatrix()
      }
      const resizeObserver = new ResizeObserver(resize)
      resizeObserver.observe(shell)
      const visibilityObserver = new IntersectionObserver(([entry]) => { visible = Boolean(entry?.isIntersecting) }, { rootMargin: '100px' })
      visibilityObserver.observe(shell)
      resize()

      const render = () => {
        if (disposed) return
        if (visible && !document.hidden) {
          const delta = Math.min(clock.getDelta(), 0.05)
          spinY += delta * 0.055
          wire.rotation.x += delta * 0.018
          ringA.rotation.z += delta * 0.035
          ringB.rotation.y -= delta * 0.028
          group.rotation.x += (targetX - group.rotation.x) * Math.min(1, delta * 3.5)
          group.rotation.y = spinY + targetY
          renderer.render(scene, camera)
        } else {
          clock.getDelta()
        }
        frame = requestAnimationFrame(render)
      }
      frame = requestAnimationFrame(render)

      cleanup = () => {
        cancelAnimationFrame(frame)
        resizeObserver.disconnect(); visibilityObserver.disconnect(); shell.removeEventListener('pointermove', onPointer)
        coreGeometry.dispose(); edges.dispose(); edgeMaterial.dispose(); ringA.geometry.dispose(); ringB.geometry.dispose(); ringMaterial.dispose(); ringBMaterial.dispose(); pointGeometry.dispose(); pointMaterial.dispose(); renderer.dispose()
      }
    }

    const idleApi = window as Window & {
      requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number
      cancelIdleCallback?: (id: number) => void
    }
    const usedIdleCallback = typeof idleApi.requestIdleCallback === 'function'
    const idle = usedIdleCallback
      ? idleApi.requestIdleCallback!(() => void start(), { timeout: 1200 })
      : globalThis.setTimeout(() => void start(), 450)

    return () => {
      disposed = true
      if (usedIdleCallback && typeof idleApi.cancelIdleCallback === 'function') idleApi.cancelIdleCallback(idle)
      else globalThis.clearTimeout(idle)
      cleanup()
    }
  }, [])

  return <div ref={shellRef} className="ambient-vault" aria-hidden="true"><canvas ref={canvasRef} /><span className="ambient-vault-static" /></div>
}
