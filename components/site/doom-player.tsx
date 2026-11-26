'use client'

import { useEffect, useRef, useState, type ChangeEvent } from 'react'

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
  Space: 32,
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
 * @description Self-hosted WebAssembly DOOM (1993) rendered directly to <canvas> inside CSS3D,
 * supporting built-in shareware doom1.wad and local user DOOM.WAD upload in-memory.
 */
export function DoomPlayer({ visible, locale, onClose }: DoomPlayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const moduleRef = useRef<DoomModule | null>(null)
  const audioRef = useRef<AudioContext | null>(null)
  const runningRef = useRef(false)
  const visibleRef = useRef(visible)

  const [ready, setReady] = useState(false)
  const [started, setStarted] = useState(false)
  const [statusText, setStatusText] = useState(
    locale === 'en' ? 'Loading DOOM WebAssembly engine...' : 'Cargando motor DOOM WebAssembly...'
  )
  const [wadLabel, setWadLabel] = useState('DOOM Shareware v1.9')
  const [hasCustomWad, setHasCustomWad] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

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
            : 'Motor listo · Haz clic para jugar'
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
    try {
      const pl = canvas.requestPointerLock?.() as unknown as Promise<void> | undefined
      if (pl && typeof pl.catch === 'function') pl.catch(() => {})
    } catch {
      // Ignore pointer lock rejection cleanly
    }
    mod.FS.chdir('/save')
    mod.callMain([])
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

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-black">
      {/* Window Header */}
      <div className="flex items-center justify-between border-b border-red-500/35 bg-[#190909] px-3 py-1.5 text-xs">
        <div className="flex items-center gap-2 font-mono text-red-200">
          <span>🔥 DOOM (1993)</span>
          <span className="hidden rounded border border-red-400/25 bg-red-500/10 px-1.5 py-0.5 text-[10px] text-amber-200 sm:inline">
            {wadLabel}
          </span>
        </div>
        <div className="flex items-center gap-2">
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
            {locale === 'en' ? 'Load DOOM.WAD' : 'Cargar DOOM.WAD'}
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
              try {
                const pl = canvasRef.current?.requestPointerLock?.() as unknown as Promise<void> | undefined
                if (pl && typeof pl.catch === 'function') pl.catch(() => {})
              } catch {
                // Ignore
              }
            }
          }}
          className="h-full max-h-full w-auto max-w-full cursor-pointer object-contain outline-none"
        />

        {!started && !errorMsg ? (
          <button
            type="button"
            disabled={!ready}
            onClick={startGame}
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/75 p-6 text-center backdrop-blur-[2px] disabled:cursor-wait"
          >
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-red-400">
              id Software · WASM Engine
            </span>
            <span className="font-display text-2xl font-bold text-white">
              {ready
                ? locale === 'en'
                  ? 'Click to launch DOOM (1993)'
                  : 'Haz clic para jugar DOOM (1993)'
                : locale === 'en'
                  ? 'Initializing WebAssembly...'
                  : 'Inicializando WebAssembly...'}
            </span>
            <span className="font-mono text-xs text-amber-200/80">{statusText}</span>
            <span className="mt-2 rounded border border-white/15 bg-white/5 px-3 py-1 font-mono text-[11px] text-slate-300">
              {locale === 'en'
                ? 'Arrows: Move · Ctrl: Fire · Space: Doors · Esc: Menu'
                : 'Flechas: Mover · Ctrl: Disparar · Espacio: Puertas · Esc: Menú'}
            </span>
          </button>
        ) : null}

        {errorMsg ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/90 p-6 text-center">
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
        <span>Flechas · Ctrl (Disparar) · Espacio (Abrir) · Shift (Correr) · Esc (Menú)</span>
        <span>WebAssembly · In-Browser</span>
      </div>
    </div>
  )
}
