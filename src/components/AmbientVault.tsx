import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export function AmbientVault() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = mountRef.current
    if (!host || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100)
    camera.position.set(0, 0, 6)

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.setClearColor(0x000000, 0)
    renderer.domElement.setAttribute('aria-hidden', 'true')
    host.appendChild(renderer.domElement)

    const group = new THREE.Group()
    scene.add(group)

    const crystalGeometry = new THREE.OctahedronGeometry(1.05, 0)
    const crystalMaterial = new THREE.MeshBasicMaterial({ color: 0x9a6cff, wireframe: true, transparent: true, opacity: 0.46 })
    const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial)
    crystal.rotation.z = Math.PI / 4
    group.add(crystal)

    const ringGeometry = new THREE.TorusGeometry(1.65, 0.012, 8, 96)
    const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xc7a253, transparent: true, opacity: 0.34 })
    const ring = new THREE.Mesh(ringGeometry, ringMaterial)
    ring.rotation.x = Math.PI / 2.6
    group.add(ring)

    const count = 70
    const particlePositions = new Float32Array(count * 3)
    for (let i = 0; i < count; i += 1) {
      const radius = 1.8 + Math.random() * 2.6
      const angle = Math.random() * Math.PI * 2
      particlePositions[i * 3] = Math.cos(angle) * radius
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 3.6
      particlePositions[i * 3 + 2] = Math.sin(angle) * radius * 0.34
    }
    const particleGeometry = new THREE.BufferGeometry()
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3))
    const particleMaterial = new THREE.PointsMaterial({ color: 0xb895ff, size: 0.025, transparent: true, opacity: 0.55 })
    const particles = new THREE.Points(particleGeometry, particleMaterial)
    scene.add(particles)

    const clock = new THREE.Clock()
    let frame = 0
    const render = () => {
      const delta = Math.min(clock.getDelta(), 0.05)
      group.rotation.y += delta * 0.12
      group.rotation.x = Math.sin(clock.elapsedTime * 0.35) * 0.08
      particles.rotation.z -= delta * 0.018
      renderer.render(scene, camera)
      frame = requestAnimationFrame(render)
    }

    const resize = () => {
      const rect = host.getBoundingClientRect()
      renderer.setSize(Math.max(1, rect.width), Math.max(1, rect.height), false)
      camera.aspect = rect.width / Math.max(1, rect.height)
      camera.updateProjectionMatrix()
    }
    const observer = new ResizeObserver(resize)
    observer.observe(host)
    resize()
    render()

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      crystalGeometry.dispose()
      crystalMaterial.dispose()
      ringGeometry.dispose()
      ringMaterial.dispose()
      particleGeometry.dispose()
      particleMaterial.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  return <div ref={mountRef} className="ambient-vault" aria-hidden="true" />
}
