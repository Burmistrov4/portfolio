'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import {
  CORE_FRAGMENT_SHADER,
  CORE_VERTEX_SHADER,
  GRID_FRAGMENT_SHADER,
  GRID_VERTEX_SHADER,
} from '@/components/site/shaders'
import type { Locale } from '@/lib/i18n'

export type SpatialSection =
  | 'inicio'
  | 'sobre-mi'
  | 'stack'
  | 'proyectos'
  | 'certificados'
  | 'contacto'

interface Workbench3DProps {
  locale: Locale
  projectCount: number
  activeSection: SpatialSection
  monitorFocused: boolean
  onToggleMonitorFocus: () => void
  onSelectSection: (section: SpatialSection) => void
  onFallback2D: () => void
  labels: {
    dragHint: string
    zoomMonitor: string
    resetCamera: string
    switch2d: string
  }
}

const MENU_TARGETS: Array<{ id: SpatialSection; labelEs: string; labelEn: string }> = [
  { id: 'proyectos', labelEs: '01 · PROYECTOS FULL-STACK', labelEn: '01 · FULL-STACK PROJECTS' },
  { id: 'stack', labelEs: '02 · STACK & ARQUITECTURA', labelEn: '02 · STACK & ARCHITECTURE' },
  { id: 'certificados', labelEs: '03 · CERTIFICACIONES TI', labelEn: '03 · TECH CERTIFICATES' },
  { id: 'contacto', labelEs: '04 · CONTACTO & CV', labelEn: '04 · CONTACT & RESUME' },
]

const SECTION_WAYPOINTS: Record<
  SpatialSection,
  { pos: [number, number, number]; look: [number, number, number] }
> = {
  inicio: { pos: [2.35, 2.08, 5.45], look: [-1.25, 0.95, 0] },
  'sobre-mi': { pos: [-2.4, 1.7, 3.0], look: [-1.1, 1.0, -0.1] },
  stack: { pos: [2.7, 1.75, 2.8], look: [1.1, 1.08, -0.1] },
  proyectos: { pos: [0, 1.38, 2.95], look: [0, 1.2, -0.35] },
  certificados: { pos: [-2.9, 2.65, 4.1], look: [0, 1.0, 0] },
  contacto: { pos: [1.9, 1.45, 3.6], look: [0, 1.05, -0.1] },
}

/**
 * @description Full-bleed Three.js + GLSL Systems Engineering Lab with per-section camera waypoints and raycasted TFT monitor.
 */
export function Workbench3D({
  locale,
  projectCount,
  activeSection,
  monitorFocused,
  onToggleMonitorFocus,
  onSelectSection,
  onFallback2D,
  labels,
}: Workbench3DProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const [hoveredRow, setHoveredRow] = useState<number | null>(null)

  const focusRef = useRef(monitorFocused)
  const sectionRef = useRef<SpatialSection>(activeSection)
  const hoveredRowRef = useRef<number | null>(null)
  const localeRef = useRef<Locale>(locale)
  const projectCountRef = useRef(projectCount)

  useEffect(() => {
    focusRef.current = monitorFocused
  }, [monitorFocused])

  useEffect(() => {
    sectionRef.current = activeSection
  }, [activeSection])

  useEffect(() => {
    localeRef.current = locale
  }, [locale])

  useEffect(() => {
    projectCountRef.current = projectCount
  }, [projectCount])

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      })
    } catch {
      onFallback2D()
      return
    }

    const width = container.clientWidth || window.innerWidth
    const height = container.clientHeight || window.innerHeight
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setSize(width, height)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.18
    container.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x060a11, 0.036)

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 140)
    const initWp = SECTION_WAYPOINTS[sectionRef.current]
    camera.position.set(...initWp.pos)
    const currentLookAt = new THREE.Vector3(...initWp.look)
    camera.lookAt(currentLookAt)

    // Lighting
    const ambient = new THREE.AmbientLight(0x94a3b8, 0.95)
    scene.add(ambient)

    const keyLight = new THREE.DirectionalLight(0x38bdf8, 2.3)
    keyLight.position.set(5, 7, 5)
    scene.add(keyLight)

    const rimLight = new THREE.PointLight(0x00ffff, 2.8, 18)
    rimLight.position.set(-3.2, 2.6, -2.0)
    scene.add(rimLight)

    const emeraldLight = new THREE.PointLight(0x10b981, 1.9, 14)
    emeraldLight.position.set(2.8, 1.4, 1.8)
    scene.add(emeraldLight)

    // 1. Wide GLSL Spatial Telemetry Grid Floor
    const gridGeo = new THREE.PlaneGeometry(64, 64, 84, 84)
    gridGeo.rotateX(-Math.PI / 2)
    const gridUniforms = {
      uTime: { value: 0 },
      uPrimaryColor: { value: new THREE.Color(0x0284c7) },
      uAccentColor: { value: new THREE.Color(0x22d3ee) },
    }
    const gridMat = new THREE.ShaderMaterial({
      uniforms: gridUniforms,
      vertexShader: GRID_VERTEX_SHADER,
      fragmentShader: GRID_FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      extensions: { derivatives: true } as unknown as THREE.ShaderMaterialParameters['extensions'],
    })
    const gridMesh = new THREE.Mesh(gridGeo, gridMat)
    gridMesh.position.y = -0.05
    scene.add(gridMesh)

    // 2. Architectural Background Server Monoliths (gives wide 3D depth across full screen)
    const monolithMat = new THREE.MeshStandardMaterial({
      color: 0x0b1220,
      metalness: 0.7,
      roughness: 0.35,
    })
    const monolithGlowMat = new THREE.MeshBasicMaterial({
      color: 0x0ea5e9,
      transparent: true,
      opacity: 0.45,
    })
    const monolithCoords: Array<[number, number, number]> = [
      [-5.8, 2.1, -4.5],
      [-3.6, 2.8, -6.2],
      [3.8, 2.5, -5.8],
      [6.1, 1.9, -4.2],
      [-7.2, 1.6, -1.2],
      [7.4, 2.2, -1.5],
    ]
    monolithCoords.forEach(([mx, mh, mz], idx) => {
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.75, mh * 2, 0.75), monolithMat)
      pillar.position.set(mx, mh - 0.05, mz)
      scene.add(pillar)

      const strip = new THREE.Mesh(new THREE.BoxGeometry(0.05, mh * 1.7, 0.78), monolithGlowMat)
      strip.position.set(mx + (idx % 2 === 0 ? 0.36 : -0.36), mh - 0.05, mz)
      scene.add(strip)
    })

    // 3. Central Systems Cyber-Workbench
    const deskGroup = new THREE.Group()
    scene.add(deskGroup)

    const chassisMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      metalness: 0.74,
      roughness: 0.26,
    })
    const darkMetalMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.62,
      roughness: 0.34,
    })
    const cyanGlowMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    const emeraldGlowMat = new THREE.MeshBasicMaterial({ color: 0x34d399 })

    // Wide desk slab
    const deskSlab = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.1, 2.0), chassisMat)
    deskSlab.position.set(0, 0.55, 0)
    deskGroup.add(deskSlab)

    const deskTrim = new THREE.Mesh(new THREE.BoxGeometry(4.16, 0.022, 0.03), cyanGlowMat)
    deskTrim.position.set(0, 0.55, 1.01)
    deskGroup.add(deskTrim)

    for (const x of [-1.85, 1.85]) {
      for (const z of [-0.8, 0.8]) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.6, 0.09), darkMetalMat)
        leg.position.set(x, 0.25, z)
        deskGroup.add(leg)
      }
    }

    // Monitor stand + ultrawide bezel
    const standNeck = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.45, 0.12), darkMetalMat)
    standNeck.position.set(0, 0.82, -0.45)
    deskGroup.add(standNeck)

    const standBase = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.04, 0.38), darkMetalMat)
    standBase.position.set(0, 0.62, -0.42)
    deskGroup.add(standBase)

    const monitorHousing = new THREE.Mesh(new THREE.BoxGeometry(2.14, 1.26, 0.08), chassisMat)
    monitorHousing.position.set(0, 1.24, -0.35)
    monitorHousing.rotation.x = -0.05
    deskGroup.add(monitorHousing)

    // Interactive Dynamic Canvas Texture for the 3D Monitor
    const screenCanvas = document.createElement('canvas')
    screenCanvas.width = 640
    screenCanvas.height = 384
    const screenCtx = screenCanvas.getContext('2d')
    const screenTexture = new THREE.CanvasTexture(screenCanvas)
    screenTexture.colorSpace = THREE.SRGBColorSpace

    const screenMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2.0, 1.14),
      new THREE.MeshBasicMaterial({ map: screenTexture })
    )
    screenMesh.position.set(0, 1.24, -0.305)
    screenMesh.rotation.x = -0.05
    deskGroup.add(screenMesh)

    // Keyboard + Mousepad
    const keyboard = new THREE.Mesh(new THREE.BoxGeometry(1.12, 0.04, 0.36), darkMetalMat)
    keyboard.position.set(-0.08, 0.62, 0.32)
    keyboard.rotation.x = 0.06
    deskGroup.add(keyboard)

    const kbBacklight = new THREE.Mesh(new THREE.BoxGeometry(1.04, 0.015, 0.28), cyanGlowMat)
    kbBacklight.position.set(-0.08, 0.638, 0.32)
    kbBacklight.rotation.x = 0.06
    deskGroup.add(kbBacklight)

    // Left Server / Workstation Tower with spinning cooling fans
    const tower = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.96, 0.96), chassisMat)
    tower.position.set(-1.58, 1.08, -0.1)
    deskGroup.add(tower)

    const fans: THREE.Group[] = []
    for (const fy of [0.87, 1.25]) {
      const fanGroup = new THREE.Group()
      fanGroup.position.set(-1.58, fy, 0.39)
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.016, 8, 24), cyanGlowMat)
      fanGroup.add(ring)
      for (let b = 0; b < 4; b++) {
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.032, 0.01), darkMetalMat)
        blade.rotation.z = (b * Math.PI) / 4
        fanGroup.add(blade)
      }
      deskGroup.add(fanGroup)
      fans.push(fanGroup)
    }

    for (let i = 0; i < 3; i++) {
      const led = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.02, 0.02),
        i === 0 ? emeraldGlowMat : cyanGlowMat
      )
      led.position.set(-1.45 + i * 0.09, 1.48, 0.385)
      deskGroup.add(led)
    }

    // Right GLSL Holographic AI/Systems Core + Orbiting Stack Nodes
    const coreUniforms = {
      uTime: { value: 0 },
      uColorA: { value: new THREE.Color(0x0ea5e9) },
      uColorB: { value: new THREE.Color(0x22d3ee) },
    }
    const coreMat = new THREE.ShaderMaterial({
      uniforms: coreUniforms,
      vertexShader: CORE_VERTEX_SHADER,
      fragmentShader: CORE_FRAGMENT_SHADER,
      transparent: true,
      wireframe: true,
    })
    const coreMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(0.32, 2), coreMat)
    coreMesh.position.set(1.52, 1.12, -0.05)
    deskGroup.add(coreMesh)

    const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.42, 0.08, 24), darkMetalMat)
    pedestal.position.set(1.52, 0.64, -0.05)
    deskGroup.add(pedestal)

    const orbitRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.52, 0.009, 8, 48),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.55 })
    )
    orbitRing.position.copy(coreMesh.position)
    orbitRing.rotation.x = Math.PI / 2.6
    deskGroup.add(orbitRing)

    const nodeMeshes: THREE.Mesh[] = []
    for (let n = 0; n < 4; n++) {
      const node = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.06, 0),
        n % 2 === 0 ? emeraldGlowMat : cyanGlowMat
      )
      deskGroup.add(node)
      nodeMeshes.push(node)
    }

    // Fiber-optic data spline routed behind the monitor connecting Tower -> Stand -> Core
    const busCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.58, 1.12, -0.25),
      new THREE.Vector3(-0.9, 0.78, -0.48),
      new THREE.Vector3(0, 0.72, -0.52),
      new THREE.Vector3(0.95, 0.78, -0.42),
      new THREE.Vector3(1.52, 1.08, -0.05),
    ])
    const busGeo = new THREE.TubeGeometry(busCurve, 40, 0.012, 8, false)
    const busMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35,
    })
    deskGroup.add(new THREE.Mesh(busGeo, busMat))

    const packetMesh = new THREE.Mesh(new THREE.SphereGeometry(0.036, 12, 12), emeraldGlowMat)
    deskGroup.add(packetMesh)

    // Wide ambient starfield / telemetry dust
    const starCount = 240
    const starPositions = new Float32Array(starCount * 3)
    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 26
      starPositions[i * 3 + 1] = Math.random() * 8 + 0.3
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 20 - 2
    }
    const starGeo = new THREE.BufferGeometry()
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
    const starMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.05,
      transparent: true,
      opacity: 0.55,
    })
    const stars = new THREE.Points(starGeo, starMat)
    scene.add(stars)

    // Draw Monitor Canvas HUD
    const drawMonitorScreen = (elapsed: number, fpsEstimate: number) => {
      if (!screenCtx) return
      const w = screenCanvas.width
      const h = screenCanvas.height
      const isEn = localeRef.current === 'en'

      screenCtx.fillStyle = '#090f18'
      screenCtx.fillRect(0, 0, w, h)

      screenCtx.fillStyle = 'rgba(56, 189, 248, 0.03)'
      for (let y = 0; y < h; y += 6) {
        screenCtx.fillRect(0, y, w, 2)
      }

      screenCtx.fillStyle = '#0f172a'
      screenCtx.fillRect(0, 0, w, 46)
      screenCtx.fillStyle = '#38bdf8'
      screenCtx.fillRect(0, 44, w, 2)

      screenCtx.fillStyle = '#34d399'
      screenCtx.beginPath()
      screenCtx.arc(24, 23, 5, 0, Math.PI * 2)
      screenCtx.fill()

      screenCtx.font = 'bold 16px monospace'
      screenCtx.fillStyle = '#f8fafc'
      screenCtx.fillText('LORENZO ROCA // SYS-WORKBENCH', 40, 28)

      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      screenCtx.font = '14px monospace'
      screenCtx.fillStyle = '#38bdf8'
      screenCtx.fillText(`${nowStr} · ${fpsEstimate} FPS`, w - 156, 28)

      const pills = [
        isEn ? '5TH SEM · IUTEPI' : '5.º SEM · IUTEPI',
        isEn ? `${projectCountRef.current} SYSTEMS` : `${projectCountRef.current} SISTEMAS`,
        'PY · TS · FLUTTER · SQL',
      ]
      let px = 24
      screenCtx.font = '12px monospace'
      for (const p of pills) {
        const tw = screenCtx.measureText(p).width + 20
        screenCtx.fillStyle = 'rgba(56, 189, 248, 0.12)'
        screenCtx.fillRect(px, 62, tw, 26)
        screenCtx.strokeStyle = 'rgba(56, 189, 248, 0.4)'
        screenCtx.strokeRect(px, 62, tw, 26)
        screenCtx.fillStyle = '#bae6fd'
        screenCtx.fillText(p, px + 10, 79)
        px += tw + 10
      }

      screenCtx.font = 'bold 17px monospace'
      MENU_TARGETS.forEach((item, idx) => {
        const y = 112 + idx * 52
        const isHover = hoveredRowRef.current === idx
        screenCtx.fillStyle = isHover ? 'rgba(14, 165, 233, 0.30)' : 'rgba(15, 23, 42, 0.9)'
        screenCtx.fillRect(24, y, w - 48, 42)
        screenCtx.strokeStyle = isHover ? '#38bdf8' : 'rgba(148, 163, 184, 0.24)'
        screenCtx.lineWidth = isHover ? 2 : 1
        screenCtx.strokeRect(24, y, w - 48, 42)

        screenCtx.fillStyle = isHover ? '#ffffff' : '#e2e8f0'
        screenCtx.fillText(isEn ? item.labelEn : item.labelEs, 42, y + 27)
        screenCtx.fillStyle = '#38bdf8'
        screenCtx.fillText('>', w - 52, y + 27)
      })

      const pulseW = 140 + Math.sin(elapsed * 2.5) * 40
      screenCtx.fillStyle = 'rgba(52, 211, 153, 0.25)'
      screenCtx.fillRect(24, 336, w - 48, 18)
      screenCtx.fillStyle = '#10b981'
      screenCtx.fillRect(24, 336, pulseW, 18)
      screenCtx.font = '12px monospace'
      screenCtx.fillStyle = '#94a3b8'
      screenCtx.fillText(
        isEn ? 'CLICK A MODULE TO OPEN · OPEN FOR HIRE' : 'CLIC EN UN MÓDULO PARA ABRIR · DISPONIBLE',
        24,
        372
      )

      screenTexture.needsUpdate = true
    }

    // Orbit drag & Raycasting state
    let isDragging = false
    let dragDistance = 0
    let prevX = 0
    let prevY = 0
    let targetYaw = 0
    let targetPitch = 0
    let currentYaw = 0
    let currentPitch = 0

    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()

    const getScreenUvHit = (clientX: number, clientY: number) => {
      const rect = renderer.domElement.getBoundingClientRect()
      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(pointer, camera)
      const hits = raycaster.intersectObject(screenMesh)
      if (hits.length === 0 || !hits[0].uv) return { hit: false, row: null as number | null }

      const canvasY = (1 - hits[0].uv.y) * screenCanvas.height
      for (let i = 0; i < MENU_TARGETS.length; i++) {
        const top = 112 + i * 52
        if (canvasY >= top && canvasY <= top + 42) {
          return { hit: true, row: i }
        }
      }
      return { hit: true, row: null as number | null }
    }

    const onPointerDown = (e: PointerEvent) => {
      if (e.target !== renderer.domElement) return
      isDragging = true
      dragDistance = 0
      prevX = e.clientX
      prevY = e.clientY
    }

    const onPointerMove = (e: PointerEvent) => {
      if (isDragging) {
        const dx = e.clientX - prevX
        const dy = e.clientY - prevY
        dragDistance += Math.abs(dx) + Math.abs(dy)
        prevX = e.clientX
        prevY = e.clientY
        targetYaw = THREE.MathUtils.clamp(targetYaw - dx * 0.005, -0.95, 0.95)
        targetPitch = THREE.MathUtils.clamp(targetPitch - dy * 0.0035, -0.25, 0.45)
        return
      }
      if (e.target === renderer.domElement) {
        const { hit, row } = getScreenUvHit(e.clientX, e.clientY)
        if (hoveredRowRef.current !== row) {
          hoveredRowRef.current = row
          setHoveredRow(row)
        }
        renderer.domElement.style.cursor = hit ? 'pointer' : 'grab'
      }
    }

    const onPointerUp = (e: PointerEvent) => {
      if (!isDragging) return
      isDragging = false
      if (dragDistance < 8 && e.target === renderer.domElement) {
        const { hit, row } = getScreenUvHit(e.clientX, e.clientY)
        if (hit && row !== null) {
          onSelectSection(MENU_TARGETS[row].id)
        } else if (hit) {
          onToggleMonitorFocus()
        }
      }
    }

    const domEl = renderer.domElement
    domEl.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)

    const resizeObserver = new ResizeObserver(() => {
      if (!container) return
      const w = container.clientWidth || window.innerWidth
      const h = container.clientHeight || window.innerHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    })
    resizeObserver.observe(container)

    const clock = new THREE.Clock()
    let frameCount = 0
    let lastFpsSample = performance.now()
    let fpsEstimate = 60
    let lastScreenDraw = 0
    let rafId = 0

    drawMonitorScreen(0, 60)

    const desiredPos = new THREE.Vector3()
    const desiredLook = new THREE.Vector3()

    const animate = () => {
      rafId = requestAnimationFrame(animate)
      const elapsed = clock.getElapsedTime()

      frameCount++
      const now = performance.now()
      if (now - lastFpsSample >= 1000) {
        fpsEstimate = Math.round((frameCount * 1000) / (now - lastFpsSample))
        frameCount = 0
        lastFpsSample = now
      }

      gridUniforms.uTime.value = elapsed
      coreUniforms.uTime.value = elapsed

      fans.forEach((f, idx) => {
        f.rotation.z = elapsed * (idx === 0 ? 4.2 : -3.8)
      })
      coreMesh.rotation.y = elapsed * 0.65
      coreMesh.rotation.x = Math.sin(elapsed * 0.5) * 0.2
      orbitRing.rotation.z = elapsed * 0.4

      nodeMeshes.forEach((node, idx) => {
        const angle = elapsed * 0.8 + (idx * Math.PI) / 2
        node.position.set(
          1.52 + Math.cos(angle) * 0.52,
          1.12 + Math.sin(angle * 1.4) * 0.16,
          -0.05 + Math.sin(angle) * 0.52
        )
        node.rotation.y = elapsed * 1.5
      })

      const t = (elapsed * 0.28) % 1
      busCurve.getPointAt(t, packetMesh.position)

      stars.rotation.y = elapsed * 0.015

      if (now - lastScreenDraw > 85) {
        drawMonitorScreen(elapsed, fpsEstimate)
        lastScreenDraw = now
      }

      currentYaw = THREE.MathUtils.lerp(currentYaw, targetYaw, 0.08)
      currentPitch = THREE.MathUtils.lerp(currentPitch, targetPitch, 0.08)

      if (focusRef.current) {
        // Aspect-safe framing so the entire monitor fits comfortably with zero cropping
        const halfTan = Math.tan(THREE.MathUtils.degToRad(21))
        const fitDist = Math.max(2.3, 1.45 / (halfTan * Math.min(camera.aspect, 1.75)))
        desiredPos.set(0.0, 1.32, -0.35 + fitDist)
        desiredLook.set(0.0, 1.24, -0.35)
      } else {
        const wp = SECTION_WAYPOINTS[sectionRef.current]
        desiredPos.set(...wp.pos)
        desiredLook.set(...wp.look)
        if (sectionRef.current === 'inicio') {
          desiredPos.x += Math.sin(currentYaw) * 1.8
          desiredPos.z += (Math.cos(currentYaw) - 1) * 1.1
          desiredPos.y = THREE.MathUtils.clamp(wp.pos[1] + currentPitch * 1.8, 1.35, 3.4)
        }
      }

      camera.position.lerp(desiredPos, 0.07)
      currentLookAt.lerp(desiredLook, 0.07)
      camera.lookAt(currentLookAt)

      renderer.render(scene, camera)
    }

    animate()

    return () => {
      cancelAnimationFrame(rafId)
      resizeObserver.disconnect()
      domEl.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      screenTexture.dispose()
      gridGeo.dispose()
      gridMat.dispose()
      coreMat.dispose()
      busGeo.dispose()
      busMat.dispose()
      starGeo.dispose()
      starMat.dispose()
      renderer.dispose()
      if (domEl.parentNode === container) {
        container.removeChild(domEl)
      }
    }
  }, [onFallback2D, onSelectSection, onToggleMonitorFocus])

  return (
    <div className="fixed inset-0 z-0 h-screen w-screen overflow-hidden bg-[#060a11]">
      <div
        ref={mountRef}
        className="h-full w-full"
        aria-label="Laboratorio 3D interactivo en Three.js y GLSL"
      />

      {/* Bottom HUD Bar (clear of hero card & navbar) */}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-20 mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5">
        <div className="pointer-events-auto flex flex-wrap items-center gap-2">
          <span className="hidden rounded-md border border-white/10 bg-[#0A0E14]/80 px-2.5 py-1.5 font-mono text-[10px] tracking-wider text-sky-300 backdrop-blur-md sm:inline-block">
            {labels.dragHint}
          </span>
          {hoveredRow !== null ? (
            <span className="rounded-md border border-emerald-400/35 bg-emerald-500/20 px-2.5 py-1.5 font-mono text-[10px] text-emerald-200 backdrop-blur-md">
              {locale === 'en' ? MENU_TARGETS[hoveredRow].labelEn : MENU_TARGETS[hoveredRow].labelEs}
            </span>
          ) : null}
        </div>

        <div className="pointer-events-auto flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onToggleMonitorFocus}
            className="rounded-md border border-sky-400/35 bg-[#0A0E14]/85 px-3 py-1.5 font-mono text-[11px] font-medium text-sky-200 backdrop-blur-md transition-colors hover:bg-sky-500/20"
          >
            {monitorFocused ? labels.resetCamera : labels.zoomMonitor}
          </button>
          <button
            type="button"
            onClick={onFallback2D}
            className="rounded-md border border-white/15 bg-[#0A0E14]/85 px-3 py-1.5 font-mono text-[11px] text-slate-300 backdrop-blur-md transition-colors hover:bg-white/10"
          >
            {labels.switch2d}
          </button>
        </div>
      </div>
    </div>
  )
}
