'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import * as THREE from 'three'
import { CSS3DObject, CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer.js'
import {
  CORE_FRAGMENT_SHADER,
  CORE_VERTEX_SHADER,
  GRID_FRAGMENT_SHADER,
  GRID_VERTEX_SHADER,
} from '@/components/site/shaders'

interface Workbench3DProps {
  children: ReactNode
  lidClosed: boolean
  onToggleLid: () => void
  resetSignal: number
  onSwitch2D: () => void
  labels: {
    dragHint: string
    openLid: string
    closeLid: string
    resetCamera: string
    switch2d: string
  }
}

const ACCENT_PALETTES = [
  { name: 'Sky', primary: 0x0284c7, accent: 0x38bdf8 },
  { name: 'Emerald', primary: 0x059669, accent: 0x34d399 },
  { name: 'Amber', primary: 0xd97706, accent: 0xfbbf24 },
]

/**
 * @description Hybrid WebGL + CSS3DRenderer 3D Laptop Workstation with articulated lid hinge,
 * mouse-wheel zoom, and interactive desk objects (lamp, mouse, server cube, GLSL core).
 */
export function Workbench3D({
  children,
  lidClosed,
  onToggleLid,
  resetSignal,
  onSwitch2D,
  labels,
}: Workbench3DProps) {
  const webglMountRef = useRef<HTMLDivElement>(null)
  const cssMountRef = useRef<HTMLDivElement>(null)
  const screenDomRef = useRef<HTMLDivElement>(null)

  const [hoveredHint, setHoveredHint] = useState<string | null>(null)
  const lidClosedRef = useRef(lidClosed)
  const onToggleLidRef = useRef(onToggleLid)
  const resetRef = useRef(resetSignal)

  useEffect(() => {
    lidClosedRef.current = lidClosed
  }, [lidClosed])

  useEffect(() => {
    onToggleLidRef.current = onToggleLid
  }, [onToggleLid])

  useEffect(() => {
    resetRef.current = resetSignal
  }, [resetSignal])

  useEffect(() => {
    const webglContainer = webglMountRef.current
    const cssContainer = cssMountRef.current
    const screenEl = screenDomRef.current
    if (!webglContainer || !cssContainer || !screenEl) return

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      })
    } catch {
      onSwitch2D()
      return
    }

    const width = webglContainer.clientWidth || window.innerWidth
    const height = webglContainer.clientHeight || window.innerHeight
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setSize(width, height)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.15
    webglContainer.appendChild(renderer.domElement)

    const cssRenderer = new CSS3DRenderer()
    cssRenderer.setSize(width, height)
    cssRenderer.domElement.style.position = 'absolute'
    cssRenderer.domElement.style.inset = '0'
    cssRenderer.domElement.style.pointerEvents = 'none'
    cssContainer.appendChild(cssRenderer.domElement)

    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x050911, 0.04)

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 140)
    const lookTarget = new THREE.Vector3(0, 0.74, -0.72)
    camera.position.set(0, 0.96, 1.56)
    const currentLookAt = lookTarget.clone()
    camera.lookAt(currentLookAt)

    // Lighting
    const ambient = new THREE.AmbientLight(0x94a3b8, 0.95)
    scene.add(ambient)

    const keyLight = new THREE.DirectionalLight(0x38bdf8, 2.0)
    keyLight.position.set(3.5, 5.5, 4.0)
    scene.add(keyLight)

    const deskLampLight = new THREE.SpotLight(0xfef3c7, 2.4, 8, Math.PI / 3.2, 0.5)
    deskLampLight.position.set(-1.55, 1.35, -0.45)
    deskLampLight.target.position.set(0, 0.05, 0)
    scene.add(deskLampLight)
    scene.add(deskLampLight.target)

    const rimLight = new THREE.PointLight(0x22d3ee, 2.2, 16)
    rimLight.position.set(2.4, 1.8, -1.5)
    scene.add(rimLight)

    // 1. Wide GLSL Telemetry Grid Floor
    const gridGeo = new THREE.PlaneGeometry(60, 60, 80, 80)
    gridGeo.rotateX(-Math.PI / 2)
    const gridUniforms = {
      uTime: { value: 0 },
      uPrimaryColor: { value: new THREE.Color(ACCENT_PALETTES[0].primary) },
      uAccentColor: { value: new THREE.Color(ACCENT_PALETTES[0].accent) },
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
    gridMesh.position.y = -0.62
    scene.add(gridMesh)

    // 2. Desk Surface & Legs
    const deskGroup = new THREE.Group()
    scene.add(deskGroup)

    const deskMat = new THREE.MeshStandardMaterial({
      color: 0x0e1523,
      metalness: 0.55,
      roughness: 0.42,
    })
    const aluminumMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.78,
      roughness: 0.26,
    })
    const darkChassMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.72,
      roughness: 0.3,
    })
    const accentGlowMat = new THREE.MeshBasicMaterial({ color: ACCENT_PALETTES[0].accent })
    const lidRimMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.8,
      roughness: 0.25,
      emissive: new THREE.Color(0x0284c7),
      emissiveIntensity: 0.15,
    })

    const deskSlab = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.09, 2.2), deskMat)
    deskSlab.position.set(0, -0.045, -0.1)
    deskGroup.add(deskSlab)

    const deskFrontLed = new THREE.Mesh(new THREE.BoxGeometry(4.76, 0.016, 0.02), accentGlowMat)
    deskFrontLed.position.set(0, -0.045, 1.005)
    deskGroup.add(deskFrontLed)

    for (const lx of [-2.15, 2.15]) {
      for (const lz of [-0.95, 0.75]) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.58, 0.09), aluminumMat)
        leg.position.set(lx, -0.34, lz)
        deskGroup.add(leg)
      }
    }

    // Desk Mat under laptop & mouse
    const deskMatPad = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 0.008, 1.35),
      new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.85, metalness: 0.1 })
    )
    deskMatPad.position.set(0.22, 0.004, 0.06)
    deskGroup.add(deskMatPad)

    // 3. 3D Laptop Base + Sculpted Keyboard + Trackpad
    const laptopBase = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.042, 1.42), aluminumMat)
    laptopBase.position.set(0, 0.025, 0.05)
    deskGroup.add(laptopBase)

    const kbRecess = new THREE.Mesh(new THREE.BoxGeometry(1.88, 0.006, 0.68), darkChassMat)
    kbRecess.position.set(0, 0.047, -0.12)
    deskGroup.add(kbRecess)

    const kbGlow = new THREE.Mesh(new THREE.PlaneGeometry(1.86, 0.66), accentGlowMat)
    kbGlow.rotation.x = -Math.PI / 2
    kbGlow.position.set(0, 0.048, -0.12)
    deskGroup.add(kbGlow)

    const keyMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.45 })
    const keyGeo = new THREE.BoxGeometry(0.105, 0.012, 0.095)
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 14; col++) {
        const key = new THREE.Mesh(keyGeo, keyMat)
        key.position.set(-0.845 + col * 0.13, 0.054, -0.37 + row * 0.125)
        deskGroup.add(key)
      }
    }

    const trackpad = new THREE.Mesh(
      new THREE.BoxGeometry(0.76, 0.006, 0.44),
      new THREE.MeshStandardMaterial({ color: 0x162032, metalness: 0.4, roughness: 0.2 })
    )
    trackpad.position.set(0, 0.048, 0.49)
    deskGroup.add(trackpad)

    // Hinge cylinder
    const hinge = new THREE.Mesh(
      new THREE.CylinderGeometry(0.024, 0.024, 1.65, 16),
      darkChassMat
    )
    hinge.rotation.z = Math.PI / 2
    hinge.position.set(0, 0.048, -0.66)
    deskGroup.add(hinge)

    // 4. Articulated Laptop Lid + Live CSS3DObject Screen
    const lidPivot = new THREE.Group()
    lidPivot.position.set(0, 0.05, -0.66)
    lidPivot.rotation.x = lidClosedRef.current ? Math.PI / 2 - 0.02 : -0.14
    deskGroup.add(lidPivot)

    const lidBack = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.42, 0.024), aluminumMat)
    lidBack.position.set(0, 0.71, -0.005)
    lidPivot.add(lidBack)

    // Glowing LR emblem on back of laptop lid (visible when closed!)
    const logoCanvas = document.createElement('canvas')
    logoCanvas.width = 512
    logoCanvas.height = 256
    const lctx = logoCanvas.getContext('2d')
    if (lctx) {
      lctx.fillStyle = '#0f172a'
      lctx.fillRect(0, 0, 512, 256)
      lctx.strokeStyle = 'rgba(56, 189, 248, 0.45)'
      lctx.lineWidth = 4
      lctx.strokeRect(14, 14, 484, 228)
      lctx.fillStyle = '#38bdf8'
      lctx.font = 'bold 112px monospace'
      lctx.textAlign = 'center'
      lctx.textBaseline = 'middle'
      lctx.fillText('LR', 256, 112)
      lctx.fillStyle = '#94a3b8'
      lctx.font = '24px monospace'
      lctx.fillText('LORENZO ROCA // 3D OS', 256, 198)
    }
    const logoTex = new THREE.CanvasTexture(logoCanvas)
    const backLogo = new THREE.Mesh(
      new THREE.PlaneGeometry(0.68, 0.34),
      new THREE.MeshBasicMaterial({ map: logoTex })
    )
    backLogo.rotation.y = Math.PI
    backLogo.position.set(0, 0.72, -0.019)
    lidPivot.add(backLogo)

    // Screen Bezel Borders (interactive hover/click targets for opening/closing lid!)
    const topBezel = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.06, 0.04), lidRimMat)
    topBezel.position.set(0, 1.39, 0.012)
    lidPivot.add(topBezel)

    const bottomBezel = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.06, 0.04), lidRimMat)
    bottomBezel.position.set(0, 0.03, 0.012)
    lidPivot.add(bottomBezel)

    const leftBezel = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.42, 0.04), lidRimMat)
    leftBezel.position.set(-1.07, 0.71, 0.012)
    lidPivot.add(leftBezel)

    const rightBezel = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.42, 0.04), lidRimMat)
    rightBezel.position.set(1.07, 0.71, 0.012)
    lidPivot.add(rightBezel)

    const webcamDot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.01, 0.01, 0.01, 12),
      new THREE.MeshBasicMaterial({ color: 0x34d399 })
    )
    webcamDot.rotation.x = Math.PI / 2
    webcamDot.position.set(0, 1.39, 0.032)
    lidPivot.add(webcamDot)

    // Mount live React LaptopOS DOM into CSS3DObject flush inside bezel
    const cssObj = new CSS3DObject(screenEl)
    const screenScale = 2.08 / 1120
    cssObj.scale.setScalar(screenScale)
    cssObj.position.set(0, 0.71, 0.022)
    lidPivot.add(cssObj)

    const lidInteractiveMeshes: THREE.Object3D[] = [
      topBezel,
      bottomBezel,
      leftBezel,
      rightBezel,
      lidBack,
      backLogo,
    ]

    // 5. Interactive Desk Props
    // 5a. Wireless Mouse (right of laptop)
    const mouseGroup = new THREE.Group()
    mouseGroup.position.set(1.42, 0.028, 0.25)
    deskGroup.add(mouseGroup)
    const mouseBody = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.048, 0.30), darkChassMat)
    mouseGroup.add(mouseBody)
    const mouseWheel = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.03, 12), accentGlowMat)
    mouseWheel.rotation.z = Math.PI / 2
    mouseWheel.position.set(0, 0.022, -0.07)
    mouseGroup.add(mouseWheel)

    // 5b. Articulated Desk Lamp (left-back)
    const lampGroup = new THREE.Group()
    lampGroup.position.set(-1.92, 0, -0.78)
    deskGroup.add(lampGroup)
    const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.21, 0.04, 24), aluminumMat)
    lampBase.position.y = 0.02
    lampGroup.add(lampBase)
    const lampArm1 = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.78, 12), aluminumMat)
    lampArm1.position.set(-0.06, 0.38, -0.06)
    lampArm1.rotation.z = -0.18
    lampGroup.add(lampArm1)
    const lampArm2 = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.62, 12), aluminumMat)
    lampArm2.position.set(0.12, 0.88, 0.06)
    lampArm2.rotation.z = 0.65
    lampArm2.rotation.x = 0.2
    lampGroup.add(lampArm2)
    const lampShade = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.22, 20), darkChassMat)
    lampShade.position.set(0.32, 1.02, 0.14)
    lampShade.rotation.z = -0.45
    lampGroup.add(lampShade)
    const lampBulbMat = new THREE.MeshBasicMaterial({ color: 0xfef3c7 })
    const lampBulb = new THREE.Mesh(new THREE.SphereGeometry(0.075, 16, 16), lampBulbMat)
    lampBulb.position.set(0.36, 0.94, 0.14)
    lampGroup.add(lampBulb)

    // 5c. Mini Server Cube (left desk prop)
    const serverGroup = new THREE.Group()
    serverGroup.position.set(-1.56, 0.26, 0.24)
    deskGroup.add(serverGroup)
    const serverBox = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.52, 0.56), darkChassMat)
    serverGroup.add(serverBox)
    const serverFan = new THREE.Group()
    serverFan.position.set(0, -0.02, 0.285)
    serverFan.add(new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.015, 8, 24), accentGlowMat))
    for (let b = 0; b < 4; b++) {
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.026, 0.01), aluminumMat)
      blade.rotation.z = (b * Math.PI) / 4
      serverFan.add(blade)
    }
    serverGroup.add(serverFan)

    // 5d. Holographic GLSL Architecture Core (far right)
    const coreUniforms = {
      uTime: { value: 0 },
      uColorA: { value: new THREE.Color(ACCENT_PALETTES[0].primary) },
      uColorB: { value: new THREE.Color(ACCENT_PALETTES[0].accent) },
    }
    const coreMat = new THREE.ShaderMaterial({
      uniforms: coreUniforms,
      vertexShader: CORE_VERTEX_SHADER,
      fragmentShader: CORE_FRAGMENT_SHADER,
      transparent: true,
      wireframe: true,
    })
    const coreMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(0.26, 2), coreMat)
    coreMesh.position.set(1.84, 0.44, -0.42)
    deskGroup.add(coreMesh)

    const corePedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.34, 0.06, 24),
      aluminumMat
    )
    corePedestal.position.set(1.84, 0.03, -0.42)
    deskGroup.add(corePedestal)

    const orbitRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.42, 0.008, 8, 48),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.55 })
    )
    orbitRing.position.copy(coreMesh.position)
    orbitRing.rotation.x = Math.PI / 2.6
    deskGroup.add(orbitRing)

    // Ambient background particles
    const starCount = 180
    const starPositions = new Float32Array(starCount * 3)
    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 24
      starPositions[i * 3 + 1] = Math.random() * 8 - 0.5
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 18 - 2
    }
    const starGeo = new THREE.BufferGeometry()
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
    const starMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.045,
      transparent: true,
      opacity: 0.5,
    })
    const stars = new THREE.Points(starGeo, starMat)
    scene.add(stars)

    // Interaction state
    let isDragging = false
    let dragDistance = 0
    let prevX = 0
    let prevY = 0
    let targetYaw = 0
    let targetPitch = 0.08
    let currentYaw = 0
    let currentPitch = 0.08
    let targetZoom = 0
    let currentZoom = 0
    let lastReset = resetRef.current

    let lidHover = false
    let lampOn = true
    let paletteIndex = 0
    let coreTurbo = false
    let mouseBounce = 0

    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()

    const intersectProps = (clientX: number, clientY: number) => {
      const rect = renderer.domElement.getBoundingClientRect()
      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(pointer, camera)

      if (raycaster.intersectObjects(lidInteractiveMeshes, true).length > 0) return 'lid'
      if (raycaster.intersectObject(lampGroup, true).length > 0) return 'lamp'
      if (raycaster.intersectObject(serverGroup, true).length > 0) return 'server'
      if (raycaster.intersectObject(coreMesh, true).length > 0) return 'core'
      if (raycaster.intersectObject(mouseGroup, true).length > 0) return 'mouse'
      return null
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
        targetYaw = THREE.MathUtils.clamp(targetYaw - dx * 0.0055, -1.15, 1.15)
        targetPitch = THREE.MathUtils.clamp(targetPitch + dy * 0.004, -0.1, 0.72)
        return
      }
      if (e.target !== renderer.domElement) {
        if (lidHover) {
          lidHover = false
          setHoveredHint(null)
        }
        return
      }
      const hit = intersectProps(e.clientX, e.clientY)
      lidHover = hit === 'lid'
      lidRimMat.emissiveIntensity = lidHover ? 0.95 : 0.15
      renderer.domElement.style.cursor =
        hit === 'lid' ? 'ns-resize' : hit ? 'pointer' : 'grab'

      if (hit === 'lid') {
        setHoveredHint(lidClosedRef.current ? 'Clic en tapa: Abrir Laptop' : 'Clic en borde: Cerrar Tapa')
      } else if (hit === 'lamp') {
        setHoveredHint('Clic: Encender / Apagar Lámpara')
      } else if (hit === 'server') {
        setHoveredHint('Clic: Cambiar iluminación RGB')
      } else if (hit === 'core') {
        setHoveredHint('Clic: Velocidad Núcleo GLSL')
      } else if (hit === 'mouse') {
        setHoveredHint('Mouse inalámbrico')
      } else {
        setHoveredHint(null)
      }
    }

    const onPointerUp = (e: PointerEvent) => {
      if (!isDragging) return
      isDragging = false
      if (dragDistance < 8 && e.target === renderer.domElement) {
        const hit = intersectProps(e.clientX, e.clientY)
        if (hit === 'lid') {
          onToggleLidRef.current()
        } else if (hit === 'lamp') {
          lampOn = !lampOn
          deskLampLight.intensity = lampOn ? 2.4 : 0.0
          lampBulbMat.color.setHex(lampOn ? 0xfef3c7 : 0x334155)
        } else if (hit === 'server') {
          paletteIndex = (paletteIndex + 1) % ACCENT_PALETTES.length
          const pal = ACCENT_PALETTES[paletteIndex]
          accentGlowMat.color.setHex(pal.accent)
          gridUniforms.uPrimaryColor.value.setHex(pal.primary)
          gridUniforms.uAccentColor.value.setHex(pal.accent)
          coreUniforms.uColorA.value.setHex(pal.primary)
          coreUniforms.uColorB.value.setHex(pal.accent)
          orbitRing.material.color.setHex(pal.accent)
        } else if (hit === 'core') {
          coreTurbo = !coreTurbo
        } else if (hit === 'mouse') {
          mouseBounce = 1.0
        }
      }
    }

    const onWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement | null
      if (target && target.closest('.laptop-screen-root')) {
        return // Let internal Browser/OS scroll naturally
      }
      e.preventDefault()
      const step = -Math.sign(e.deltaY) * 0.38
      targetZoom = THREE.MathUtils.clamp(targetZoom + step, -3.8, 1.05)
    }

    const domEl = renderer.domElement
    domEl.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)

    const resizeObserver = new ResizeObserver(() => {
      if (!webglContainer) return
      const w = webglContainer.clientWidth || window.innerWidth
      const h = webglContainer.clientHeight || window.innerHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
      cssRenderer.setSize(w, h)
    })
    resizeObserver.observe(webglContainer)

    const clock = new THREE.Clock()
    let rafId = 0
    let prevElapsed = 0
    let wasLidClosed = lidClosedRef.current

    const animate = () => {
      rafId = requestAnimationFrame(animate)
      const elapsed = clock.getElapsedTime()
      const dt = Math.min(Math.max(elapsed - prevElapsed, 0.008), 0.08)
      prevElapsed = elapsed
      const damp = 1 - Math.exp(-dt * 8.5)
      const dampFast = 1 - Math.exp(-dt * 10.5)

      if (lidClosedRef.current !== wasLidClosed) {
        wasLidClosed = lidClosedRef.current
        if (lidClosedRef.current) {
          targetPitch = 0.62
          targetYaw = 0.28
          targetZoom = -1.65
        } else {
          targetPitch = 0.08
          targetYaw = 0
          targetZoom = 0
        }
      }

      if (resetRef.current !== lastReset) {
        targetYaw = 0
        targetPitch = 0.08
        targetZoom = 0
        lastReset = resetRef.current
      }

      gridUniforms.uTime.value = elapsed
      coreUniforms.uTime.value = elapsed

      serverFan.rotation.z = elapsed * 4.5
      coreMesh.rotation.y = elapsed * (coreTurbo ? 2.4 : 0.7)
      coreMesh.rotation.x = Math.sin(elapsed * 0.6) * 0.22
      orbitRing.rotation.z = elapsed * (coreTurbo ? 1.5 : 0.45)
      stars.rotation.y = elapsed * 0.015

      if (mouseBounce > 0.01) {
        mouseGroup.position.y = 0.028 + Math.sin(mouseBounce * Math.PI) * 0.035
        mouseBounce = THREE.MathUtils.lerp(mouseBounce, 0, dampFast)
      } else {
        mouseGroup.position.y = 0.028
      }

      // Smooth articulated laptop lid hinge with hover tilt cue
      const targetLidRot = lidClosedRef.current
        ? Math.PI / 2 - 0.02 - (lidHover ? 0.14 : 0)
        : -0.14 + (lidHover ? 0.07 : 0)
      lidPivot.rotation.x = THREE.MathUtils.lerp(lidPivot.rotation.x, targetLidRot, dampFast)

      // Hide DOM screen when lid folds shut so it never pokes through lid back
      const isVisible = lidPivot.rotation.x < 1.05
      screenEl.style.opacity = isVisible ? '1' : '0'
      screenEl.style.pointerEvents = isVisible ? 'auto' : 'none'

      // Smooth orbit + aspect-safe close-up laptop camera framing + mouse-wheel zoom
      currentYaw = THREE.MathUtils.lerp(currentYaw, targetYaw, damp)
      currentPitch = THREE.MathUtils.lerp(currentPitch, targetPitch, damp)
      currentZoom = THREE.MathUtils.lerp(currentZoom, targetZoom, damp)

      const halfTan = Math.tan(THREE.MathUtils.degToRad(21))
      const fitV = 0.85 / halfTan
      const fitH = 1.24 / (halfTan * Math.max(camera.aspect, 0.75))
      const baseDist = Math.max(2.15, fitV, fitH)
      const dist = THREE.MathUtils.clamp(baseDist - currentZoom, 1.28, 6.2)

      const orbitTarget = lidClosedRef.current
        ? new THREE.Vector3(0, 0.12, -0.02)
        : lookTarget
      currentLookAt.lerp(orbitTarget, dampFast)

      const camX = currentLookAt.x + Math.sin(currentYaw) * dist
      const camY = currentLookAt.y + Math.sin(currentPitch) * dist * 0.85 + 0.08
      const camZ = currentLookAt.z + Math.cos(currentYaw) * Math.cos(currentPitch) * dist
      camera.position.lerp(new THREE.Vector3(camX, Math.max(camY, 0.12), camZ), dampFast)
      camera.lookAt(currentLookAt)

      renderer.render(scene, camera)
      cssRenderer.render(scene, camera)
    }

    // Immediate first paint before async RAF tick
    renderer.render(scene, camera)
    cssRenderer.render(scene, camera)
    animate()

    return () => {
      cancelAnimationFrame(rafId)
      resizeObserver.disconnect()
      domEl.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      gridGeo.dispose()
      gridMat.dispose()
      coreMat.dispose()
      starGeo.dispose()
      starMat.dispose()
      renderer.dispose()
      if (domEl.parentNode === webglContainer) webglContainer.removeChild(domEl)
      if (cssRenderer.domElement.parentNode === cssContainer) {
        cssContainer.removeChild(cssRenderer.domElement)
      }
    }
  }, [onSwitch2D])

  return (
    <div className="fixed inset-0 h-screen w-screen overflow-hidden bg-[#050911]">
      {/* WebGL 3D World */}
      <div ref={webglMountRef} className="absolute inset-0 z-0 h-full w-full" />

      {/* Synchronized CSS3D Interactive Laptop Screen */}
      <div ref={cssMountRef} className="pointer-events-none absolute inset-0 z-10 h-full w-full">
        <div
          ref={screenDomRef}
          className="laptop-screen-root overflow-hidden rounded-md shadow-inner"
          style={{ width: '1120px', height: '700px', pointerEvents: 'auto' }}
        >
          {children}
        </div>
      </div>

      {/* Hover Tooltip on 3D Interactive Objects */}
      {hoveredHint ? (
        <div className="pointer-events-none fixed bottom-14 left-1/2 z-30 -translate-x-1/2 rounded-full border border-sky-400/40 bg-[#070c14]/90 px-3.5 py-1 font-mono text-[11px] text-sky-200 shadow-lg backdrop-blur-md">
          {hoveredHint}
        </div>
      ) : null}

      {/* Minimal Bottom Legend (no intrusive boxes) */}
      <div className="pointer-events-none fixed inset-x-4 bottom-3 z-20 flex flex-wrap items-center justify-between gap-2">
        <span className="hidden rounded-md border border-white/10 bg-[#070c14]/75 px-2.5 py-1 font-mono text-[10px] tracking-wider text-slate-300 backdrop-blur-md md:inline-block">
          {labels.dragHint}
        </span>
        <div className="pointer-events-auto flex items-center gap-2 ml-auto">
          <button
            type="button"
            onClick={onToggleLid}
            className="rounded-md border border-white/15 bg-[#070c14]/80 px-2.5 py-1 font-mono text-[11px] text-slate-200 backdrop-blur-md transition-colors hover:border-sky-400/40 hover:text-sky-200"
          >
            {lidClosed ? labels.openLid : labels.closeLid}
          </button>
        </div>
      </div>
    </div>
  )
}
