'use client'

import { useEffect, useRef, useState, type ChangeEvent, type PointerEvent as ReactPointerEvent } from 'react'

interface DoomPlayerProps {
  visible: boolean
  locale: 'es' | 'en'
  onClose: () => void
}

interface DoomModule {
  canvas: HTMLCanvasElement
  doomBlit?: (pixels: Uint8ClampedArray) => void
  audioRate?: () => number
  syncFS?: () => void
  onDoomQuit?: (endoom: Uint8Array | null) => void
  onDoomError?: (msg: string) => void
  preRun?: Array<() => void>
  onRuntimeInitialized?: () => void
  locateFile?: (path: string) => string
  print?: (msg: string) => void
  printErr?: (msg: string) => void
  ENV: Record<string, string>
  FS: {
    mkdir: (path: string) => void
    mount: (fs: unknown, opts: Record<string, unknown>, mountpoint: string) => void
    syncfs: (populate: boolean, cb: () => void) => void
    writeFile: (path: string, data: Uint8Array) => void
    chdir: (path: string) => void
  }
  IDBFS: unknown
  HEAPF32: Float32Array
  addRunDependency: (name: string) => void
  removeRunDependency: (name: string) => void
  callMain: (args: string[]) => void
  _malloc: (size: number) => number
  _I_WebKey: (down: number, key: number) => void
  _I_WebMouseMove: (dx: number, dy: number) => void
  _I_WebMouseButtons: (buttons: number) => void
  _I_WebMenuActive: () => number
  _I_WebMixAudio: (ptr: number, frames: number) => void
  _I_WebSaveDefaults: () => void
}

interface StoredWad {
  name: string
  data: Uint8Array
}

interface TouchPrefs {
  enabled: boolean
  size: 'sm' | 'md' | 'lg'
  opacity: number
  swapped: boolean
  padStyle: 'cross' | 'split'
}

const DEFAULT_TOUCH_PREFS: TouchPrefs = {
  enabled: false,
  size: 'md',
  opacity: 0.75,
  swapped: false,
  padStyle: 'cross',
}

const SCREEN_W = 320
const SCREEN_H = 200

const KEY_RIGHTARROW = 0xae
const KEY_LEFTARROW = 0xac
const KEY_UPARROW = 0xad
const KEY_DOWNARROW = 0xaf
const KEY_ESCAPE = 27
const KEY_ENTER = 13
const KEY_TAB = 9
const KEY_BACKSPACE = 127
const KEY_PAUSE = 0xff
const KEY_EQUALS = 0x3d
const KEY_MINUS = 0x2d
const KEY_RSHIFT = 0x80 + 0x36
const KEY_RCTRL = 0x80 + 0x1d
const KEY_RALT = 0x80 + 0x38
const KEY_SPACE = 32

const KEYMAP: Record<string, number> = {
  ArrowRight: KEY_RIGHTARROW,
  ArrowLeft: KEY_LEFTARROW,
  ArrowUp: KEY_UPARROW,
  ArrowDown: KEY_DOWNARROW,
  Escape: KEY_ESCAPE,
  Enter: KEY_ENTER,
  NumpadEnter: KEY_ENTER,
  Tab: KEY_TAB,
  Backspace: KEY_BACKSPACE,
  Delete: KEY_BACKSPACE,
  Pause: KEY_PAUSE,
  Equal: KEY_EQUALS,
  NumpadAdd: KEY_EQUALS,
  Minus: KEY_MINUS,
  NumpadSubtract: KEY_MINUS,
  ShiftLeft: KEY_RSHIFT,
  ShiftRight: KEY_RSHIFT,
  ControlLeft: KEY_RCTRL,
  ControlRight: KEY_RCTRL,
  AltLeft: KEY_RALT,
  AltRight: KEY_RALT,
  Space: KEY_SPACE,
  Comma: 44,
  Period: 46,
  Slash: 47,
  Semicolon: 59,
  Quote: 39,
  BracketLeft: 91,
  BracketRight: 93,
  Backslash: 92,
  Backquote: 96,
  F11: 0x80 + 0x57,
  F12: 0x80 + 0x58,
}
for (let i = 1; i <= 10; i++) KEYMAP[`F${i}`] = 0x80 + 0x3a + i
for (let i = 0; i <= 9; i++) KEYMAP[`Digit${i}`] = 48 + i
for (let c = 65; c <= 90; c++) KEYMAP[`Key${String.fromCharCode(c)}`] = c + 32

function openWadDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('doom-html', 1)
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains('wads')) {
        req.result.createObjectStore('wads')
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function storeWadOp<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T | undefined> {
  const db = await openWadDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('wads', mode)
    const req = fn(tx.objectStore('wads'))
    tx.oncomplete = () => resolve(req.result)
    tx.onerror = () => reject(tx.error)
  })
}

function identifyWad(bytes: Uint8Array, filename: string): { file?: string; label?: string; error?: string } {
  if (bytes.byteLength < 12) {
    return { error: 'Archivo WAD demasiado pequeño.' }
  }
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  const magic = String.fromCharCode(...bytes.subarray(0, 4))
  if (magic !== 'IWAD') {
    return {
      error:
        magic === 'PWAD'
          ? 'Eso es un PWAD (mod). Carga un IWAD completo como DOOM.WAD o DOOM2.WAD.'
          : 'El archivo seleccionado no es un IWAD válido de DOOM.',
    }
  }
  const count = view.getInt32(4, true)
  const dir = view.getInt32(8, true)
  const names = new Set<string>()
  for (let i = 0; i < count; i++) {
    const at = dir + i * 16 + 8
    if (at + 8 > bytes.length) break
    let name = ''
    for (let j = 0; j < 8 && bytes[at + j]; j++) {
      name += String.fromCharCode(bytes[at + j])
    }
    names.add(name.toUpperCase())
  }
  const lower = filename.toLowerCase()
  if (names.has('MAP01')) {
    if (lower.includes('tnt')) return { file: 'tnt.wad', label: 'Final Doom: TNT Evilution' }
    if (lower.includes('plutonia')) return { file: 'plutonia.wad', label: 'Final Doom: Plutonia' }
    return { file: 'doom2.wad', label: 'DOOM II' }
  }
  if (names.has('E4M1')) return { file: 'doomu.wad', label: 'The Ultimate DOOM' }
  if (names.has('E2M1')) return { file: 'doom.wad', label: 'DOOM (1993) Completo' }
  return { file: 'doom1.wad', label: 'DOOM Shareware v1.9' }
}

/**
 * @description Self-hosted WebAssembly DOOM (1993) rendered to <canvas> inside CSS3D,
 * with local DOOM.WAD loader and customizable multi-touch mobile controls.
 */
export function DoomPlayer({ visible, locale, onClose }: DoomPlayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const moduleRef = useRef<DoomModule | null>(null)
  const audioRef = useRef<AudioContext | null>(null)
  const runningRef = useRef(false)
  const visibleRef = useRef(visible)
  const weaponIdxRef = useRef(1)

  const [ready, setReady] = useState(false)
  const [started, setStarted] = useState(false)
  const [statusText, setStatusText] = useState(
    locale === 'en' ? 'Loading DOOM WebAssembly engine...' : 'Cargando motor DOOM WebAssembly...'
  )
  const [wadLabel, setWadLabel] = useState('DOOM Shareware v1.9')
  const [hasCustomWad, setHasCustomWad] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const [touchPrefs, setTouchPrefs] = useState<TouchPrefs>(DEFAULT_TOUCH_PREFS)
  const [customOpen, setCustomOpen] = useState(false)

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem('doom_touch_prefs')
      const coarse =
        window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<TouchPrefs>
        setTouchPrefs({
          ...DEFAULT_TOUCH_PREFS,
          ...parsed,
          enabled: typeof parsed.enabled === 'boolean' ? parsed.enabled : coarse,
        })
      } else if (coarse) {
        setTouchPrefs((prev) => ({ ...prev, enabled: true }))
      }
    } catch {
      // Ignore storage error
    }
  }, [])

  const updateTouchPrefs = (patch: Partial<TouchPrefs>) => {
    setTouchPrefs((prev) => {
      const next = { ...prev, ...patch }
      try {
        window.localStorage.setItem('doom_touch_prefs', JSON.stringify(next))
      } catch {
        // Ignore
      }
      return next
    })
  }

  useEffect(() => {
    visibleRef.current = visible
    const actx = audioRef.current
    if (actx) {
      if (visible && runningRef.current) {
        actx.resume().catch(() => {})
      } else {
        actx.suspend().catch(() => {})
      }
    }
    if (!visible && document.pointerLockElement === canvasRef.current) {
      document.exitPointerLock()
    }
  }, [visible])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return
    ctx.imageSmoothingEnabled = false

    const frame = document.createElement('canvas')
    frame.width = SCREEN_W
    frame.height = SCREEN_H
    const frameCtx = frame.getContext('2d')
    if (!frameCtx) return
    const frameImage = frameCtx.createImageData(SCREEN_W, SCREEN_H)

    let syncing = false
    const syncFS = () => {
      const mod = moduleRef.current
      if (syncing || !mod?.FS) return
      syncing = true
      mod.FS.syncfs(false, () => {
        syncing = false
      })
    }

    const doomMod: DoomModule = {
      canvas,
      locateFile: (p: string) => `/doom/${p}`,
      print: () => {},
      printErr: () => {},
      ENV: {},
      FS: {} as DoomModule['FS'],
      IDBFS: null,
      HEAPF32: new Float32Array(0),
      addRunDependency: () => {},
      removeRunDependency: () => {},
      callMain: () => {},
      _malloc: () => 0,
      _I_WebKey: () => {},
      _I_WebMouseMove: () => {},
      _I_WebMouseButtons: () => {},
      _I_WebMenuActive: () => 0,
      _I_WebMixAudio: () => {},
      _I_WebSaveDefaults: () => {},
      doomBlit: (pixels: Uint8ClampedArray) => {
        frameImage.data.set(pixels)
        frameCtx.putImageData(frameImage, 0, 0)
        ctx.imageSmoothingEnabled = false
        ctx.drawImage(frame, 0, 0, canvas.width, canvas.height)
      },
      audioRate: () => (audioRef.current ? audioRef.current.sampleRate : 44100),
      syncFS,
      onDoomQuit: () => {
        runningRef.current = false
        setStarted(false)
        setStatusText(
          locale === 'en' ? 'Session ended · Click to restart' : 'Sesión finalizada · Clic para reiniciar'
        )
        if (document.pointerLockElement === canvas) {
          document.exitPointerLock()
        }
      },
      onDoomError: (msg: string) => {
        runningRef.current = false
        setErrorMsg(msg || 'DOOM engine stopped')
      },
      preRun: [
        () => {
          const FS = doomMod.FS
          FS.mkdir('/wad')
          FS.mkdir('/save')
          FS.mount(doomMod.IDBFS, {}, '/save')
          doomMod.ENV.HOME = '/save'
          doomMod.ENV.DOOMWADDIR = '/wad'

          doomMod.addRunDependency('syncfs')
          FS.syncfs(true, () => doomMod.removeRunDependency('syncfs'))

          doomMod.addRunDependency('wad')
          ;(async () => {
            try {
              const saved = (await storeWadOp('readonly', (s) => s.get('iwad')).catch(
                () => null
              )) as StoredWad | null
              if (saved && saved.data) {
                const bytes =
                  saved.data instanceof Uint8Array ? saved.data : new Uint8Array(saved.data)
                const id = identifyWad(bytes, saved.name)
                if (id.file) {
                  FS.writeFile(`/wad/${id.file}`, bytes)
                  setWadLabel(`${saved.name} (${id.label})`)
                  setHasCustomWad(true)
                  doomMod.removeRunDependency('wad')
                  return
                }
              }
              setStatusText(
                locale === 'en' ? 'Fetching DOOM1.WAD shareware (4 MB)...' : 'Cargando DOOM1.WAD shareware (4 MB)...'
              )
              const res = await fetch('/doom/wad/doom1.wad')
              if (!res.ok) throw new Error(`HTTP ${res.status}`)
              const bytes = new Uint8Array(await res.arrayBuffer())
              FS.writeFile('/wad/doom1.wad', bytes)
              setWadLabel('DOOM Shareware v1.9 · Episodio 1')
              setHasCustomWad(false)
              doomMod.removeRunDependency('wad')
            } catch (err) {
              setErrorMsg(err instanceof Error ? err.message : 'WAD load error')
            }
          })()
        },
      ],
      onRuntimeInitialized: () => {
        setReady(true)
        setStatusText(
          locale === 'en'
            ? 'Engine ready · Click to start'
            : 'Motor listo · Toca o haz clic para jugar'
        )
      },
    }

    moduleRef.current = doomMod
    ;(window as unknown as { Module?: DoomModule }).Module = doomMod

    const script = document.createElement('script')
    script.src = '/doom/doom.js'
    script.async = true
    document.body.appendChild(script)

    const onKey = (e: KeyboardEvent) => {
      if (!runningRef.current || !visibleRef.current) return
      const key = KEYMAP[e.code]
      if (key === undefined) return
      e.preventDefault()
      e.stopPropagation()
      doomMod._I_WebKey(e.type === 'keydown' ? 1 : 0, key)
    }

    const locked = () => document.pointerLockElement === canvas

    const onMouseMove = (e: MouseEvent) => {
      if (runningRef.current && visibleRef.current && locked()) {
        doomMod._I_WebMouseMove(e.movementX, 0)
      }
    }

    const onMouseButton = (e: MouseEvent) => {
      if (runningRef.current && visibleRef.current && locked()) {
        e.preventDefault()
        doomMod._I_WebMouseButtons(e.buttons & 7)
      }
    }

    const onPointerLockChange = () => {
      if (runningRef.current && visibleRef.current && !locked() && !doomMod._I_WebMenuActive()) {
        doomMod._I_WebKey(1, KEY_ESCAPE)
        doomMod._I_WebKey(0, KEY_ESCAPE)
      }
    }

    const syncInterval = window.setInterval(() => {
      if (runningRef.current) syncFS()
    }, 5000)

    window.addEventListener('keydown', onKey)
    window.addEventListener('keyup', onKey)
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mousedown', onMouseButton)
    document.addEventListener('mouseup', onMouseButton)
    document.addEventListener('pointerlockchange', onPointerLockChange)

    return () => {
      window.clearInterval(syncInterval)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('keyup', onKey)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mousedown', onMouseButton)
      document.removeEventListener('mouseup', onMouseButton)
      document.removeEventListener('pointerlockchange', onPointerLockChange)
      runningRef.current = false
      if (audioRef.current) {
        audioRef.current.close().catch(() => {})
        audioRef.current = null
      }
      if (script.parentNode) script.parentNode.removeChild(script)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const startGame = () => {
    const mod = moduleRef.current
    const canvas = canvasRef.current
    if (!mod || !canvas || !ready || started) return

    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (AC && !audioRef.current) {
      const actx = new AC()
      const FRAMES = 1024
      const node = actx.createScriptProcessor(FRAMES, 0, 2)
      const buffer = mod._malloc(FRAMES * 2 * 4)
      node.onaudioprocess = (ev) => {
        const left = ev.outputBuffer.getChannelData(0)
        const right = ev.outputBuffer.getChannelData(1)
        const n = left.length
        mod._I_WebMixAudio(buffer, n)
        const heap = mod.HEAPF32
        let p = buffer >> 2
        for (let i = 0; i < n; i++) {
          left[i] = heap[p++]
          right[i] = heap[p++]
        }
      }
      node.connect(actx.destination)
      actx.resume().catch(() => {})
      audioRef.current = actx
    }

    setStarted(true)
    runningRef.current = true
    canvas.focus()
    if (!touchPrefs.enabled && !window.matchMedia('(pointer: coarse)').matches) {
      try {
        const pl = canvas.requestPointerLock?.() as unknown as Promise<void> | undefined
        if (pl && typeof pl.catch === 'function') pl.catch(() => {})
      } catch {
        // Ignore pointer lock rejection cleanly
      }
    }
    mod.FS.chdir('/save')
    mod.callMain([])
  }

  const sendVirtualKey = (keyCode: number, isDown: boolean) => {
    const mod = moduleRef.current
    if (!mod || !runningRef.current) return
    mod._I_WebKey(isDown ? 1 : 0, keyCode)
  }

  const cycleWeapon = () => {
    weaponIdxRef.current = (weaponIdxRef.current % 5) + 1
    const code = 48 + weaponIdxRef.current
    sendVirtualKey(code, true)
    window.setTimeout(() => sendVirtualKey(code, false), 90)
  }

  const handleUploadWad = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const bytes = new Uint8Array(await file.arrayBuffer())
    const id = identifyWad(bytes, file.name)
    if (id.error || !id.file) {
      setErrorMsg(id.error || 'WAD inválido')
      return
    }
    await storeWadOp('readwrite', (s) => s.put({ name: file.name, data: bytes }, 'iwad'))
    setWadLabel(`${file.name} (${id.label})`)
    setHasCustomWad(true)
    const mod = moduleRef.current
    if (!started && mod?.FS) {
      mod.FS.writeFile(`/wad/${id.file}`, bytes)
      setStatusText(
        locale === 'en'
          ? `${file.name} loaded · Click to play`
          : `${file.name} cargado · Haz clic para jugar`
      )
    } else {
      window.location.reload()
    }
  }

  const handleUseShareware = async () => {
    await storeWadOp('readwrite', (s) => s.delete('iwad'))
    window.location.reload()
  }

  const padBtnCls =
    touchPrefs.size === 'lg'
      ? 'h-14 w-14 text-lg'
      : touchPrefs.size === 'sm'
        ? 'h-9 w-9 text-xs'
        : 'h-11 w-11 text-sm'

  const actionBtnCls =
    touchPrefs.size === 'lg'
      ? 'h-14 px-4 text-xs'
      : touchPrefs.size === 'sm'
        ? 'h-9 px-2.5 text-[10px]'
        : 'h-11 px-3 text-[11px]'

  const makeKeyButton = (keyCode: number, label: string, className: string, extraClick?: () => void) => (
    <button
      type="button"
      onPointerDown={(e: ReactPointerEvent<HTMLButtonElement>) => {
        e.preventDefault()
        e.stopPropagation()
        if (extraClick) extraClick()
        else sendVirtualKey(keyCode, true)
      }}
      onPointerUp={(e: ReactPointerEvent<HTMLButtonElement>) => {
        e.preventDefault()
        e.stopPropagation()
        if (!extraClick) sendVirtualKey(keyCode, false)
      }}
      onPointerLeave={() => {
        if (!extraClick) sendVirtualKey(keyCode, false)
      }}
      onPointerCancel={() => {
        if (!extraClick) sendVirtualKey(keyCode, false)
      }}
      className={`select-none touch-none rounded-lg border font-mono font-bold shadow-lg active:scale-95 ${className}`}
    >
      {label}
    </button>
  )

  const movementPad = (
    <div
      style={{ opacity: touchPrefs.opacity }}
      className={
        touchPrefs.padStyle === 'cross'
          ? 'grid grid-cols-3 gap-1'
          : 'flex items-center gap-1.5'
      }
    >
      {touchPrefs.padStyle === 'cross' ? <span /> : null}
      {makeKeyButton(
        KEY_UPARROW,
        '▲',
        `${padBtnCls} border-sky-400/50 bg-[#0c1424]/85 text-sky-200`
      )}
      {touchPrefs.padStyle === 'cross' ? <span /> : null}

      {makeKeyButton(
        KEY_LEFTARROW,
        '◀',
        `${padBtnCls} border-sky-400/50 bg-[#0c1424]/85 text-sky-200`
      )}
      {makeKeyButton(
        KEY_DOWNARROW,
        '▼',
        `${padBtnCls} border-sky-400/50 bg-[#0c1424]/85 text-sky-200`
      )}
      {makeKeyButton(
        KEY_RIGHTARROW,
        '▶',
        `${padBtnCls} border-sky-400/50 bg-[#0c1424]/85 text-sky-200`
      )}
    </div>
  )

  const actionPad = (
    <div style={{ opacity: touchPrefs.opacity }} className="flex flex-col items-end gap-1.5">
      <div className="flex gap-1.5">
        {makeKeyButton(
          KEY_ESCAPE,
          'ESC',
          `${actionBtnCls} border-white/25 bg-[#121926]/85 text-slate-200`
        )}
        {makeKeyButton(
          KEY_ENTER,
          'OK',
          `${actionBtnCls} border-emerald-400/45 bg-emerald-950/80 text-emerald-200`
        )}
        {makeKeyButton(
          0,
          'ARM',
          `${actionBtnCls} border-amber-400/45 bg-amber-950/80 text-amber-200`,
          cycleWeapon
        )}
      </div>
      <div className="flex gap-1.5">
        {makeKeyButton(
          KEY_RSHIFT,
          'RUN',
          `${actionBtnCls} border-sky-400/45 bg-sky-950/80 text-sky-200`
        )}
        {makeKeyButton(
          KEY_SPACE,
          locale === 'en' ? 'USE' : 'ABRIR',
          `${actionBtnCls} border-emerald-400/50 bg-emerald-900/80 text-white`
        )}
        {makeKeyButton(
          KEY_RCTRL,
          locale === 'en' ? 'FIRE' : 'FUEGO',
          `${actionBtnCls} border-red-400/70 bg-red-600/85 text-white`
        )}
      </div>
    </div>
  )

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-black">
      {/* Window Header */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-red-500/35 bg-[#190909] px-3 py-1.5 text-xs">
        <div className="flex items-center gap-2 font-mono text-red-200">
          <span>🔥 DOOM (1993)</span>
          <span className="hidden rounded border border-red-400/25 bg-red-500/10 px-1.5 py-0.5 text-[10px] text-amber-200 sm:inline">
            {wadLabel}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => updateTouchPrefs({ enabled: !touchPrefs.enabled })}
            className={`rounded border px-2 py-0.5 font-mono text-[10px] transition-colors ${
              touchPrefs.enabled
                ? 'border-sky-400/50 bg-sky-500/20 text-sky-200'
                : 'border-white/15 bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            🎮 {locale === 'en' ? 'Touch Pad' : 'Controles Táctiles'}
          </button>
          <button
            type="button"
            onClick={() => setCustomOpen((v) => !v)}
            className="rounded border border-white/15 bg-white/5 px-2 py-0.5 font-mono text-[10px] text-slate-200 hover:bg-white/10"
          >
            ⚙ {locale === 'en' ? 'Customize' : 'Personalizar'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".wad,.WAD"
            onChange={handleUploadWad}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded border border-amber-400/35 bg-amber-500/15 px-2 py-0.5 font-mono text-[10px] text-amber-200 hover:bg-amber-500/25"
          >
            {locale === 'en' ? 'Load WAD' : 'Cargar DOOM.WAD'}
          </button>
          {hasCustomWad ? (
            <button
              type="button"
              onClick={handleUseShareware}
              className="rounded border border-white/15 bg-white/5 px-2 py-0.5 font-mono text-[10px] text-slate-300 hover:bg-white/10"
            >
              Shareware
            </button>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="rounded bg-red-600/85 px-2 py-0.5 font-mono text-[11px] font-bold text-white hover:bg-red-500"
          >
            ×
          </button>
        </div>
      </div>

      {/* Native Canvas Viewport */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-black">
        <canvas
          ref={canvasRef}
          width={960}
          height={720}
          tabIndex={0}
          onClick={() => {
            if (!started && ready) startGame()
            else if (started) {
              canvasRef.current?.focus()
              if (!touchPrefs.enabled && !window.matchMedia('(pointer: coarse)').matches) {
                try {
                  const pl = canvasRef.current?.requestPointerLock?.() as unknown as Promise<void> | undefined
                  if (pl && typeof pl.catch === 'function') pl.catch(() => {})
                } catch {
                  // Ignore
                }
              }
            }
          }}
          className="h-full max-h-full w-auto max-w-full cursor-pointer object-contain outline-none"
        />

        {/* Customizable Touchscreen Controls Overlay */}
        {started && touchPrefs.enabled ? (
          <div className="pointer-events-none absolute inset-x-3 bottom-3 z-20 flex items-end justify-between gap-2">
            <div className="pointer-events-auto">
              {touchPrefs.swapped ? actionPad : movementPad}
            </div>
            <div className="pointer-events-auto">
              {touchPrefs.swapped ? movementPad : actionPad}
            </div>
          </div>
        ) : null}

        {/* Touch Customization Popover */}
        {customOpen ? (
          <div className="absolute right-3 top-3 z-40 w-64 space-y-2.5 rounded-xl border border-white/15 bg-[#0c1320]/95 p-3 font-mono text-[11px] text-slate-200 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
              <span className="font-bold text-sky-300">
                {locale === 'en' ? 'Touch Controls Config' : 'Personalizar Táctil'}
              </span>
              <button
                type="button"
                onClick={() => setCustomOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ×
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span>{locale === 'en' ? 'Show HUD' : 'Mostrar HUD'}</span>
              <button
                type="button"
                onClick={() => updateTouchPrefs({ enabled: !touchPrefs.enabled })}
                className={`rounded px-2 py-0.5 ${
                  touchPrefs.enabled ? 'bg-sky-500 text-slate-950 font-bold' : 'bg-white/10'
                }`}
              >
                {touchPrefs.enabled ? 'ON' : 'OFF'}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span>{locale === 'en' ? 'Size' : 'Tamaño'}</span>
              <div className="flex gap-1">
                {(['sm', 'md', 'lg'] as const).map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => updateTouchPrefs({ size: sz })}
                    className={`rounded px-2 py-0.5 uppercase ${
                      touchPrefs.size === sz ? 'bg-sky-500 text-slate-950 font-bold' : 'bg-white/10'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>{locale === 'en' ? 'Pad Style' : 'Cruceta'}</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => updateTouchPrefs({ padStyle: 'cross' })}
                  className={`rounded px-2 py-0.5 ${
                    touchPrefs.padStyle === 'cross' ? 'bg-sky-500 text-slate-950 font-bold' : 'bg-white/10'
                  }`}
                >
                  D-Pad
                </button>
                <button
                  type="button"
                  onClick={() => updateTouchPrefs({ padStyle: 'split' })}
                  className={`rounded px-2 py-0.5 ${
                    touchPrefs.padStyle === 'split' ? 'bg-sky-500 text-slate-950 font-bold' : 'bg-white/10'
                  }`}
                >
                  {locale === 'en' ? 'Row' : 'Fila'}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>{locale === 'en' ? 'Swap Hands' : 'Invertir Lados'}</span>
              <button
                type="button"
                onClick={() => updateTouchPrefs({ swapped: !touchPrefs.swapped })}
                className={`rounded px-2 py-0.5 ${
                  touchPrefs.swapped ? 'bg-sky-500 text-slate-950 font-bold' : 'bg-white/10'
                }`}
              >
                {touchPrefs.swapped ? 'L↔R' : 'Std'}
              </button>
            </div>
            <div>
              <div className="flex justify-between">
                <span>{locale === 'en' ? 'Opacity' : 'Opacidad'}</span>
                <span>{Math.round(touchPrefs.opacity * 100)}%</span>
              </div>
              <input
                type="range"
                min={0.3}
                max={1}
                step={0.05}
                value={touchPrefs.opacity}
                onChange={(e) => updateTouchPrefs({ opacity: Number(e.target.value) })}
                className="mt-1 w-full accent-sky-400"
              />
            </div>
          </div>
        ) : null}

        {!started && !errorMsg ? (
          <button
            type="button"
            disabled={!ready}
            onClick={startGame}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-black/75 p-6 text-center backdrop-blur-[2px] disabled:cursor-wait"
          >
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-red-400">
              id Software · WASM Engine
            </span>
            <span className="font-display text-2xl font-bold text-white">
              {ready
                ? locale === 'en'
                  ? 'Click to launch DOOM (1993)'
                  : 'Toca o haz clic para jugar DOOM (1993)'
                : locale === 'en'
                  ? 'Initializing WebAssembly...'
                  : 'Inicializando WebAssembly...'}
            </span>
            <span className="font-mono text-xs text-amber-200/80">{statusText}</span>
            <span className="mt-2 rounded border border-white/15 bg-white/5 px-3 py-1 font-mono text-[11px] text-slate-300">
              {locale === 'en'
                ? 'Desktop: Arrows + Ctrl + Space · Mobile: Customizable Touch Pad'
                : 'PC: Flechas + Ctrl + Espacio · Móvil: Controles Táctiles personalizables'}
            </span>
          </button>
        ) : null}

        {errorMsg ? (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-black/90 p-6 text-center">
            <p className="font-display text-lg font-semibold text-red-400">DOOM Error</p>
            <pre className="max-w-md whitespace-pre-wrap font-mono text-xs text-slate-300">
              {errorMsg}
            </pre>
            <button
              type="button"
              onClick={() => setErrorMsg(null)}
              className="rounded border border-white/20 bg-white/10 px-3 py-1 text-xs text-white"
            >
              OK
            </button>
          </div>
        ) : null}
      </div>

      {/* Controls Status Bar */}
      <div className="flex items-center justify-between border-t border-white/10 bg-[#0d0d10] px-3 py-1 font-mono text-[10px] text-slate-400">
        <span>Flechas · Ctrl (Disparar) · Espacio (Abrir) · Esc (Menú) · Controles Táctiles</span>
        <span>WebAssembly · In-Browser</span>
      </div>
    </div>
  )
}
