'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { usePortfolio } from '@/components/site/portfolio-context'
import { DoomPlayer } from '@/components/site/doom-player'
import { curateCertificate, matchDetail, shortSummary, techOf } from '@/lib/project-details'
import { CONTACT, type Certificate, type Profile, type Project } from '@/lib/portfolio-types'

export type BrowserTabId =
  | 'inicio'
  | 'sobre-mi'
  | 'proyectos'
  | 'stack'
  | 'certificados'
  | 'contacto'
  | 'proyecto-detalle'

interface LaptopOSProps {
  profile: Profile | null
  projects: Project[]
  certificates: Certificate[]
  secretSignal?: number
  onSwitch2D: () => void
  onToggleLid: () => void
  onResetCamera: () => void
}

const STACK_GROUPS: Array<{
  labelEs: string
  labelEn: string
  itemsEs: string[]
  itemsEn?: string[]
}> = [
  {
    labelEs: 'Lenguajes',
    labelEn: 'Languages',
    itemsEs: ['Python', 'TypeScript', 'JavaScript', 'Dart', 'C#', 'SQL', 'GLSL', 'HTML/CSS'],
  },
  {
    labelEs: 'Frontend y 3D',
    labelEn: 'Frontend & 3D',
    itemsEs: ['React', 'Next.js', 'Three.js', 'Flutter', 'Jinja2', 'Tailwind CSS'],
  },
  {
    labelEs: 'Backend y APIs',
    labelEn: 'Backend & APIs',
    itemsEs: ['FastAPI', 'Node.js', 'Fastify', 'Express', 'Flask', 'APIs REST', 'OpenAPI 3.1', 'JWT'],
    itemsEn: ['FastAPI', 'Node.js', 'Fastify', 'Express', 'Flask', 'REST APIs', 'OpenAPI 3.1', 'JWT'],
  },
  {
    labelEs: 'Datos',
    labelEn: 'Databases',
    itemsEs: ['PostgreSQL', 'MySQL', 'SQLite', 'Supabase', 'Prisma', 'RLS y triggers', 'Migraciones versionadas'],
    itemsEn: ['PostgreSQL', 'MySQL', 'SQLite', 'Supabase', 'Prisma', 'RLS & triggers', 'Versioned migrations'],
  },
  {
    labelEs: 'Soporte TI',
    labelEn: 'IT Support',
    itemsEs: ['Diagnóstico de hardware', 'Ensamblaje de PC y laptops', 'Windows', 'Linux', 'Redes informáticas', 'Atención a usuarios'],
    itemsEn: ['Hardware diagnostics', 'PC & laptop assembly', 'Windows', 'Linux', 'Networking', 'End-user support'],
  },
  {
    labelEs: 'Herramientas',
    labelEn: 'Tooling',
    itemsEs: ['Git', 'GitHub', 'Vercel', 'Cloudflare R2', 'Docker', 'Pruebas automatizadas'],
    itemsEn: ['Git', 'GitHub', 'Vercel', 'Cloudflare R2', 'Docker', 'Automated testing'],
  },
]

/**
 * @description Interactive Desktop OS + Multi-Tab Browser + Playable DOOM (1993) rendered inside the 3D laptop screen.
 */
export function LaptopOS({
  profile,
  projects,
  certificates,
  secretSignal = 0,
  onSwitch2D,
  onToggleLid,
  onResetCamera,
}: LaptopOSProps) {
  const { locale, setLocale, t } = usePortfolio()
  const [browserOpen, setBrowserOpen] = useState(true)
  const [browserMinimized, setBrowserMinimized] = useState(false)
  const [doomUnlocked, setDoomUnlocked] = useState(false)
  const [doomBooted, setDoomBooted] = useState(false)
  const [doomOpen, setDoomOpen] = useState(false)
  const [activeApp, setActiveApp] = useState<'browser' | 'doom'>('browser')
  const [startMenuOpen, setStartMenuOpen] = useState(false)
  const [addressDraft, setAddressDraft] = useState('')
  const [addressEditing, setAddressEditing] = useState(false)
  const clockTapsRef = useRef({ count: 0, last: 0 })

  const [activeTab, setActiveTab] = useState<BrowserTabId>('inicio')
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [selectedTech, setSelectedTech] = useState<string | null>(null)
  const [onlyFeatured, setOnlyFeatured] = useState(false)
  const [onlyTechCerts, setOnlyTechCerts] = useState(false)
  const [clockText, setClockText] = useState('01:20')

  useEffect(() => {
    const updateClock = () => {
      setClockText(
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      )
    }
    updateClock()
    const id = setInterval(updateClock, 15000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    projects.forEach((p) => {
      const thumb = p.file_paths?.[0]
      if (thumb) {
        const pre = new window.Image()
        pre.src = thumb
      }
    })
  }, [projects])

  const name = profile?.full_name ?? 'Lorenzo Roca'
  const photo = profile?.profile_image_url
  const github = profile?.github_url ?? CONTACT.github
  const linkedin = profile?.linkedin_url ?? CONTACT.linkedin
  const cvUrl = locale === 'en' ? '/cv/CV_Lorenzo_Roca_EN.pdf' : '/cv/CV_Lorenzo_Roca_ES.pdf'

  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => {
      const fa = matchDetail(a.title)?.featured ? 0 : 1
      const fb = matchDetail(b.title)?.featured ? 0 : 1
      return fa - fb
    })
  }, [projects])

  const projectPool = useMemo(
    () => (onlyFeatured ? sortedProjects.filter((p) => matchDetail(p.title)?.featured) : sortedProjects),
    [onlyFeatured, sortedProjects]
  )

  const allTech = useMemo(() => {
    const set = new Set<string>()
    projectPool.forEach((p) => techOf(p).forEach((item) => set.add(item)))
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [projectPool])

  const visibleProjects = useMemo(() => {
    if (!selectedTech) return projectPool
    return projectPool.filter((p) => techOf(p).includes(selectedTech))
  }, [projectPool, selectedTech])

  const enrichedCerts = useMemo(() => {
    const list = certificates
      .map((cert) => ({ cert, ...curateCertificate(cert) }))
      .sort((a, b) => (a.isTechnical === b.isTechnical ? 0 : a.isTechnical ? -1 : 1))
    return onlyTechCerts ? list.filter((c) => c.isTechnical) : list
  }, [certificates, onlyTechCerts])

  const openBrowserTab = (tab: BrowserTabId) => {
    setBrowserOpen(true)
    setBrowserMinimized(false)
    setActiveApp('browser')
    setActiveTab(tab)
    setStartMenuOpen(false)
  }

  const openProjectDetail = (project: Project) => {
    setSelectedProject(project)
    setBrowserOpen(true)
    setBrowserMinimized(false)
    setActiveApp('browser')
    setActiveTab('proyecto-detalle')
  }

  const launchDoom = () => {
    setDoomUnlocked(true)
    setDoomBooted(true)
    setDoomOpen(true)
    setActiveApp('doom')
    setStartMenuOpen(false)
  }

  useEffect(() => {
    if (secretSignal > 0) {
      launchDoom()
    }
  }, [secretSignal])

  useEffect(() => {
    let textBuffer = ''
    const konami = [
      'ArrowUp',
      'ArrowUp',
      'ArrowDown',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'ArrowLeft',
      'ArrowRight',
    ]
    let konamiIdx = 0

    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return
      if (doomOpen) return

      if (e.key === konami[konamiIdx]) {
        konamiIdx++
        if (konamiIdx === konami.length) {
          konamiIdx = 0
          launchDoom()
          return
        }
      } else {
        konamiIdx = e.key === konami[0] ? 1 : 0
      }

      if (e.key.length === 1) {
        textBuffer = (textBuffer + e.key.toLowerCase()).slice(-10)
        if (
          textBuffer.endsWith('iddqd') ||
          textBuffer.endsWith('idkfa') ||
          textBuffer.endsWith('doom')
        ) {
          textBuffer = ''
          launchDoom()
        }
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [doomOpen])

  const urlBar =
    activeTab === 'proyecto-detalle' && selectedProject
      ? `https://lorenzoroca.vercel.app/projects/${selectedProject.id.slice(0, 8)}…`
      : `https://lorenzoroca.vercel.app/${activeTab === 'inicio' ? '' : `#${activeTab}`}`

  const tabs: Array<{ id: BrowserTabId; label: string }> = [
    { id: 'inicio', label: locale === 'en' ? 'Home' : 'Inicio' },
    { id: 'sobre-mi', label: locale === 'en' ? 'About' : 'Sobre mí' },
    { id: 'proyectos', label: `${t.nav.projects} (${projects.length})` },
    { id: 'stack', label: t.nav.stack },
    { id: 'certificados', label: `${t.nav.certificates} (${certificates.length})` },
    { id: 'contacto', label: t.nav.contact },
  ]

  return (
    <div
      className="relative flex h-[700px] w-[1120px] select-none flex-col overflow-hidden bg-[#060b14] font-sans text-slate-100"
      style={{
        backgroundImage:
          'radial-gradient(circle at 75% 20%, rgba(14,165,233,0.18), transparent 45%), radial-gradient(circle at 20% 80%, rgba(16,185,129,0.12), transparent 45%), linear-gradient(to right, rgba(56,189,248,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(56,189,248,0.04) 1px, transparent 1px)',
        backgroundSize: '100% 100%, 100% 100%, 36px 36px, 36px 36px',
      }}
    >
      {/* Desktop Workspace Area */}
      <div className="relative flex-1 overflow-hidden p-4">
        {/* Desktop Shortcut Icons (left column, visible whenever browser is minimized/closed) */}
        <div className="flex w-24 flex-col gap-3">
          <button
            type="button"
            onClick={() => openBrowserTab('inicio')}
            className="group flex flex-col items-center gap-1.5 rounded-lg p-2 text-center transition-colors hover:bg-white/10"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-sky-400/40 bg-sky-500/20 text-xl shadow-md">
              🌐
            </div>
            <span className="text-[11px] font-medium leading-tight text-slate-200 drop-shadow">
              Portfolio
            </span>
          </button>

          <a
            href={cvUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center gap-1.5 rounded-lg p-2 text-center transition-colors hover:bg-white/10"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-400/40 bg-emerald-500/20 text-xl shadow-md">
              📄
            </div>
            <span className="text-[11px] font-medium leading-tight text-slate-200 drop-shadow">
              CV_ATS.pdf
            </span>
          </a>

          <a
            href={github}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center gap-1.5 rounded-lg p-2 text-center transition-colors hover:bg-white/10"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-slate-800/80 text-lg font-mono font-bold text-white shadow-md">
              GH
            </div>
            <span className="text-[11px] font-medium leading-tight text-slate-200 drop-shadow">
              GitHub
            </span>
          </a>
        </div>

        {/* Desktop Wallpaper Watermark */}
        <div className="pointer-events-none absolute right-6 bottom-5 text-right font-mono text-xs text-sky-400/30">
          <p className="font-bold tracking-widest">LORENZO OS // SYS-WORKBENCH</p>
          <p>THREE.JS + CSS3D · INTERACTIVE WORKSPACE</p>
        </div>

        {/* Portfolio Browser Window */}
        {browserOpen && !browserMinimized ? (
          <div
            onMouseDown={() => setActiveApp('browser')}
            className={`absolute inset-3 flex flex-col overflow-hidden rounded-xl border bg-[#0A0E14]/96 shadow-2xl transition-all ${
              activeApp === 'browser'
                ? 'z-20 border-sky-400/45 shadow-black/80'
                : 'z-10 border-white/15 opacity-95'
            }`}
          >
            {/* Window Title & Tab Strip */}
            <div className="flex items-center gap-2 border-b border-white/10 bg-[#0d131d] px-3 pt-2">
              <div className="flex items-center gap-1.5 pb-2 pr-2">
                <button
                  type="button"
                  title="Cerrar navegador"
                  onClick={() => setBrowserOpen(false)}
                  className="h-3 w-3 rounded-full bg-rose-500 hover:bg-rose-400"
                />
                <button
                  type="button"
                  title="Minimizar al escritorio"
                  onClick={() => setBrowserMinimized(true)}
                  className="h-3 w-3 rounded-full bg-amber-400 hover:bg-amber-300"
                />
                <button
                  type="button"
                  title="Centrar vista"
                  onClick={onResetCamera}
                  className="h-3 w-3 rounded-full bg-emerald-500 hover:bg-emerald-400"
                />
              </div>

              <div className="flex flex-1 items-end gap-1 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`shrink-0 rounded-t-lg border-x border-t px-3 py-1.5 text-xs font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'border-white/15 bg-[#0A0E14] text-sky-300'
                        : 'border-transparent bg-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
                {selectedProject ? (
                  <div
                    className={`flex shrink-0 items-center gap-1.5 rounded-t-lg border-x border-t px-3 py-1.5 text-xs font-medium ${
                      activeTab === 'proyecto-detalle'
                        ? 'border-white/15 bg-[#0A0E14] text-emerald-300'
                        : 'border-transparent text-slate-400 hover:bg-white/5'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveTab('proyecto-detalle')}
                      className="max-w-[140px] truncate"
                    >
                      {selectedProject.title}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProject(null)
                        if (activeTab === 'proyecto-detalle') setActiveTab('proyectos')
                      }}
                      className="text-slate-500 hover:text-white"
                    >
                      ×
                    </button>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Browser Address Bar (supports secret console commands like iddqd / doom) */}
            <div className="flex items-center gap-2 border-b border-white/10 bg-[#0A0E14] px-3 py-2 text-xs">
              <button
                type="button"
                onClick={() =>
                  setActiveTab(activeTab === 'proyecto-detalle' ? 'proyectos' : 'inicio')
                }
                className="rounded px-2 py-1 text-slate-400 hover:bg-white/10 hover:text-white"
              >
                ←
              </button>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const cmd = addressDraft.trim().toLowerCase()
                  if (cmd === 'doom' || cmd === 'about:doom' || cmd === 'iddqd' || cmd === 'idkfa') {
                    launchDoom()
                  }
                  setAddressEditing(false)
                  setAddressDraft('')
                }}
                className="flex flex-1 items-center gap-2 rounded-md border border-white/10 bg-[#111721] px-3 py-1 font-mono text-[11px] text-slate-300"
              >
                <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
                <input
                  type="text"
                  aria-label="URL"
                  value={addressEditing ? addressDraft : urlBar}
                  onFocus={() => {
                    setAddressEditing(true)
                    setAddressDraft(urlBar)
                  }}
                  onBlur={() => {
                    setAddressEditing(false)
                    setAddressDraft('')
                  }}
                  onChange={(e) => setAddressDraft(e.target.value)}
                  className="w-full bg-transparent text-slate-300 outline-none"
                />
              </form>
              <button
                type="button"
                onClick={() => setLocale(locale === 'es' ? 'en' : 'es')}
                className="rounded border border-white/15 bg-white/5 px-2 py-1 font-mono text-[11px] text-slate-200 hover:bg-white/10"
              >
                {locale.toUpperCase()}
              </button>
              <a
                href={cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded bg-sky-500 px-2.5 py-1 text-[11px] font-semibold text-slate-950 hover:bg-sky-400"
              >
                {t.nav.downloadCv}
              </a>
            </div>

            {/* Browser Viewport Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'inicio' ? (
                <div className="flex h-full flex-col justify-between gap-6">
                  <div className="grid items-center gap-8 md:grid-cols-[1.45fr_1fr]">
                    <div>
                      <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        {t.hero.availability}
                      </p>
                      <h1 className="font-display text-4xl font-bold tracking-tight text-white">
                        {name}
                      </h1>
                      <p className="mt-2 text-lg text-sky-300">{t.hero.subtitle}</p>
                      <p className="mt-4 text-sm leading-relaxed text-slate-300">{t.hero.pitch}</p>

                      <div className="mt-6 flex flex-wrap gap-2.5">
                        <button
                          type="button"
                          onClick={() => setActiveTab('proyectos')}
                          className="rounded-lg bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-sky-400"
                        >
                          {t.hero.ctaProjects}
                        </button>
                        <a
                          href={github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-slate-100 hover:bg-white/10"
                        >
                          GitHub
                        </a>
                        <a
                          href={linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-slate-100 hover:bg-white/10"
                        >
                          LinkedIn
                        </a>
                        <a
                          href={cvUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg border border-sky-400/35 bg-sky-400/10 px-4 py-2 text-xs font-medium text-sky-200 hover:bg-sky-400/20"
                        >
                          {t.hero.ctaCv}
                        </a>
                      </div>
                    </div>

                    {/* Prominent Profile Photo right inside Laptop Browser Home */}
                    <div className="flex flex-col items-center">
                      <div className="relative">
                        <div
                          aria-hidden
                          className="absolute -inset-3 rounded-full bg-gradient-to-tr from-sky-500/30 to-cyan-400/15 blur-xl"
                        />
                        <div className="relative h-44 w-44 overflow-hidden rounded-full border-2 border-sky-400/50 bg-[#111721] shadow-xl">
                          {photo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={photo}
                              alt={name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-slate-500">
                              LR
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <dl className="grid grid-cols-4 gap-4 border-t border-white/10 pt-5">
                    <div>
                      <dt className="font-display text-2xl font-bold text-white">
                        {projects.length}
                      </dt>
                      <dd className="mt-0.5 text-xs text-slate-400">{t.hero.stats.projects}</dd>
                    </div>
                    <div>
                      <dt className="font-display text-2xl font-bold text-white">
                        {certificates.length}
                      </dt>
                      <dd className="mt-0.5 text-xs text-slate-400">
                        {t.hero.stats.certificates}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-display text-2xl font-bold text-white">2021</dt>
                      <dd className="mt-0.5 text-xs text-slate-400">
                        {t.hero.stats.supportSince}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-display text-2xl font-bold text-white">
                        {locale === 'en' ? '5th' : '5.º'}
                      </dt>
                      <dd className="mt-0.5 text-xs text-slate-400">{t.hero.stats.semester}</dd>
                    </div>
                  </dl>
                </div>
              ) : null}

              {activeTab === 'sobre-mi' ? (
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.18em] text-sky-400">
                    {t.about.eyebrow}
                  </p>
                  <h2 className="font-display mt-1 text-2xl font-bold text-white">
                    {t.about.title}
                  </h2>
                  <div className="mt-6 grid gap-6 md:grid-cols-[1.2fr_1fr]">
                    <div className="space-y-3 text-sm leading-relaxed text-slate-300">
                      <p>{t.about.p1}</p>
                      <p>{t.about.p2}</p>
                      <p>{t.about.p3}</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-[#111721] p-5">
                      <h3 className="font-display text-sm font-semibold text-white">
                        {t.about.howTitle}
                      </h3>
                      <ul className="mt-3 space-y-2.5">
                        {t.about.howItems.map((item) => (
                          <li
                            key={item}
                            className="flex gap-2.5 text-xs leading-relaxed text-slate-400"
                          >
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : null}

              {activeTab === 'proyectos' ? (
                <div>
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-mono text-xs uppercase tracking-[0.18em] text-sky-400">
                        {t.projects.eyebrow}
                      </p>
                      <h2 className="font-display mt-1 text-2xl font-bold text-white">
                        {t.projects.title}
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setOnlyFeatured((v) => !v)
                        setSelectedTech(null)
                      }}
                      className={`rounded-md border px-3 py-1.5 font-mono text-[11px] ${
                        onlyFeatured
                          ? 'border-sky-400/50 bg-sky-500/15 text-sky-300'
                          : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      {onlyFeatured ? t.projects.showAll : t.projects.onlyFeatured}
                    </button>
                  </div>

                  <div className="mb-5 flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedTech(null)}
                      className={`rounded-md px-2.5 py-1 text-[11px] font-medium ${
                        selectedTech === null
                          ? 'bg-sky-500 text-slate-950'
                          : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      {t.projects.all}
                    </button>
                    {allTech.map((tech) => (
                      <button
                        key={tech}
                        type="button"
                        onClick={() => setSelectedTech(selectedTech === tech ? null : tech)}
                        className={`rounded-md px-2.5 py-1 text-[11px] font-medium ${
                          selectedTech === tech
                            ? 'bg-sky-500 text-slate-950'
                            : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        {tech}
                      </button>
                    ))}
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    {visibleProjects.map((project) => {
                      const detail = matchDetail(project.title)
                      const tech = techOf(project)
                      const image = project.file_paths?.[0]
                      return (
                        <button
                          key={project.id}
                          type="button"
                          onClick={() => openProjectDetail(project)}
                          className="group flex flex-col overflow-hidden rounded-xl border border-white/10 bg-[#111721] text-left transition-all hover:border-sky-400/45"
                        >
                          <div className="relative h-32 w-full shrink-0 overflow-hidden border-b border-white/10 bg-[#0A0E14]">
                            {image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={image}
                                alt={project.title}
                                loading="eager"
                                decoding="sync"
                                className="block h-32 w-full object-cover object-top"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-xs text-slate-600">
                                Sin captura
                              </div>
                            )}
                            {detail?.featured ? (
                              <span className="absolute left-2 top-2 rounded bg-sky-500/90 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase text-slate-950">
                                {t.projects.featured}
                              </span>
                            ) : null}
                          </div>
                          <div className="flex flex-1 flex-col p-3.5">
                            <h3 className="font-display text-sm font-semibold text-white group-hover:text-sky-300">
                              {project.title}
                            </h3>
                            <p className="mt-1.5 line-clamp-2 flex-1 text-xs text-slate-400">
                              {shortSummary(project.ai_summary) || detail?.tagline || ''}
                            </p>
                            <div className="mt-2.5 flex flex-wrap gap-1">
                              {tech.slice(0, 3).map((item) => (
                                <span
                                  key={item}
                                  className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-slate-300"
                                >
                                  {item}
                                </span>
                              ))}
                              {tech.length > 3 ? (
                                <span className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-slate-300">
                                  +{tech.length - 3}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ) : null}

              {activeTab === 'proyecto-detalle' && selectedProject ? (() => {
                const detail = matchDetail(selectedProject.title)
                const tech = techOf(selectedProject)
                const images = selectedProject.file_paths ?? []
                return (
                  <div className="space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setActiveTab('proyectos')}
                        className="text-xs font-medium text-sky-400 hover:text-sky-300"
                      >
                        ← {locale === 'en' ? 'Back to projects' : 'Volver a proyectos'}
                      </button>
                      <div className="flex gap-2">
                        {selectedProject.github_link ? (
                          <a
                            href={selectedProject.github_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-md border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-100 hover:bg-white/10"
                          >
                            GitHub
                          </a>
                        ) : null}
                        {selectedProject.demo_link ? (
                          <a
                            href={selectedProject.demo_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-md bg-sky-500 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-sky-400"
                          >
                            Demo
                          </a>
                        ) : null}
                      </div>
                    </div>

                    <div>
                      <h2 className="font-display text-2xl font-bold text-white">
                        {selectedProject.title}
                      </h2>
                      <p className="mt-1 text-sm text-slate-300">
                        {detail?.tagline ?? shortSummary(selectedProject.ai_summary)}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {tech.map((item) => (
                          <span
                            key={item}
                            className="rounded border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[11px] text-slate-300"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    {images.length > 0 ? (
                      <div className="grid gap-3 md:grid-cols-2">
                        {images.map((src, i) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            key={src}
                            src={src}
                            alt={`${selectedProject.title} ${i + 1}`}
                            className="w-full rounded-lg border border-white/10 object-cover"
                          />
                        ))}
                      </div>
                    ) : null}

                    {detail ? (
                      <div className="space-y-4 text-xs leading-relaxed text-slate-300">
                        <div className="rounded-lg border border-white/10 bg-[#111721] p-4">
                          <h3 className="font-mono text-[11px] uppercase tracking-wider text-sky-400">
                            El problema
                          </h3>
                          <p className="mt-1.5">{detail.problem}</p>
                        </div>
                        {detail.diagramPath ? (
                          <div className="rounded-lg border border-white/10 bg-[#090d14] p-4">
                            <h3 className="mb-2 font-mono text-[11px] uppercase tracking-wider text-sky-400">
                              Arquitectura del sistema
                            </h3>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={detail.diagramPath}
                              alt={`Arquitectura ${selectedProject.title}`}
                              className="w-full rounded"
                            />
                          </div>
                        ) : null}
                        <div className="rounded-lg border border-white/10 bg-[#111721] p-4">
                          <h3 className="font-mono text-[11px] uppercase tracking-wider text-sky-400">
                            Decisiones técnicas
                          </h3>
                          <ul className="mt-2 space-y-1.5">
                            {detail.stackNotes.map((s) => (
                              <li key={s.tech}>
                                <strong className="text-white">{s.tech}:</strong> {s.note}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )
              })() : null}

              {activeTab === 'stack' ? (
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.18em] text-sky-400">
                    {t.stack.eyebrow}
                  </p>
                  <h2 className="font-display mt-1 text-2xl font-bold text-white">
                    {t.stack.title}
                  </h2>
                  <p className="mt-2 text-xs text-slate-400">{t.stack.description}</p>
                  <div className="mt-5 grid gap-3 md:grid-cols-3">
                    {STACK_GROUPS.map((group) => (
                      <div
                        key={group.labelEs}
                        className="rounded-xl border border-white/10 bg-[#111721] p-4"
                      >
                        <h3 className="font-mono text-xs font-semibold uppercase text-sky-400">
                          {locale === 'en' ? group.labelEn : group.labelEs}
                        </h3>
                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                          {(locale === 'en' && group.itemsEn ? group.itemsEn : group.itemsEs).map(
                            (item) => (
                              <span
                                key={item}
                                className="rounded border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[11px] text-slate-300"
                              >
                                {item}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {activeTab === 'certificados' ? (
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="font-mono text-xs uppercase tracking-[0.18em] text-sky-400">
                        {t.certificates.eyebrow}
                      </p>
                      <h2 className="font-display mt-1 text-2xl font-bold text-white">
                        {t.certificates.title}
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOnlyTechCerts((v) => !v)}
                      className={`rounded-md border px-3 py-1.5 font-mono text-[11px] ${
                        onlyTechCerts
                          ? 'border-sky-400/50 bg-sky-500/15 text-sky-300'
                          : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      {onlyTechCerts ? t.certificates.showAll : t.certificates.onlyTech}
                    </button>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    {enrichedCerts.map(({ cert, cleanDescription }) => (
                      <article
                        key={cert.id}
                        className="flex flex-col rounded-xl border border-white/10 bg-[#111721] p-4"
                      >
                        <h3 className="font-display text-sm font-semibold text-white">
                          {cert.title}
                        </h3>
                        {cleanDescription ? (
                          <p className="mt-1.5 line-clamp-3 flex-1 text-xs text-slate-400">
                            {cleanDescription}
                          </p>
                        ) : null}
                        <div className="mt-3 flex flex-wrap items-center gap-1.5">
                          {(cert.technologies ?? []).slice(0, 4).map((tech) => (
                            <span
                              key={tech}
                              className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-slate-300"
                            >
                              {tech}
                            </span>
                          ))}
                          {cert.cert_url ? (
                            <a
                              href={cert.cert_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-auto text-[11px] font-medium text-sky-300 hover:text-sky-200"
                            >
                              {t.certificates.view}
                            </a>
                          ) : null}
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ) : null}

              {activeTab === 'contacto' ? (
                <div className="rounded-xl border border-white/10 bg-[#111721] p-6">
                  <h2 className="font-display text-2xl font-bold text-white">
                    {t.contact.heading}
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm text-slate-300">{t.contact.description}</p>
                  <div className="mt-5 flex flex-wrap gap-2.5">
                    <a
                      href={`mailto:${CONTACT.email}?subject=Oportunidad%20laboral`}
                      className="rounded-lg bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-sky-400"
                    >
                      {CONTACT.email}
                    </a>
                    <a
                      href={linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-slate-100 hover:bg-white/10"
                    >
                      LinkedIn
                    </a>
                    <a
                      href={github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-slate-100 hover:bg-white/10"
                    >
                      GitHub
                    </a>
                    <a
                      href={cvUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border border-sky-400/35 bg-sky-400/10 px-4 py-2 text-xs font-medium text-sky-200 hover:bg-sky-400/20"
                    >
                      {t.hero.ctaCv}
                    </a>
                  </div>
                  <dl className="mt-6 grid grid-cols-3 gap-4 border-t border-white/10 pt-4 text-xs">
                    <div>
                      <dt className="uppercase text-slate-500">{t.contact.locationLabel}</dt>
                      <dd className="mt-1 text-slate-300">{CONTACT.location}</dd>
                    </div>
                    <div>
                      <dt className="uppercase text-slate-500">{t.contact.phoneLabel}</dt>
                      <dd className="mt-1 text-slate-300">{CONTACT.phone}</dd>
                    </div>
                    <div>
                      <dt className="uppercase text-slate-500">{t.contact.modalityLabel}</dt>
                      <dd className="mt-1 text-slate-300">{t.contact.modalityValue}</dd>
                    </div>
                  </dl>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {/* DOOM (1993) Native WebAssembly Canvas Window */}
        {doomBooted ? (
          <div
            onMouseDown={() => setActiveApp('doom')}
            className={`absolute inset-6 overflow-hidden rounded-xl border bg-black shadow-2xl ${
              doomOpen
                ? activeApp === 'doom'
                  ? 'z-30 flex flex-col border-red-500/60 shadow-black/90'
                  : 'z-10 flex flex-col border-white/20'
                : 'hidden'
            }`}
          >
            <DoomPlayer
              visible={doomOpen}
              locale={locale}
              onClose={() => setDoomOpen(false)}
            />
          </div>
        ) : null}

        {/* Start Menu Popup */}
        {startMenuOpen ? (
          <div className="absolute bottom-2 left-2 z-40 w-64 rounded-xl border border-white/15 bg-[#0c1320]/95 p-3 shadow-2xl backdrop-blur-xl">
            <p className="mb-2 px-2 font-mono text-[10px] uppercase tracking-wider text-sky-400">
              Lorenzo OS · Aplicaciones
            </p>
            <div className="space-y-1 text-xs">
              <button
                type="button"
                onClick={() => openBrowserTab('inicio')}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left hover:bg-white/10"
              >
                <span>🌐</span> Portfolio Browser
              </button>
              <a
                href={cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left hover:bg-white/10"
              >
                <span>📄</span> Curriculum Vitae (PDF)
              </a>
              <button
                type="button"
                onClick={() => {
                  setStartMenuOpen(false)
                  onToggleLid()
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left hover:bg-white/10"
              >
                <span>💻</span> {locale === 'en' ? 'Close / Open Laptop Lid' : 'Abrir / Cerrar Tapa 3D'}
              </button>
              <button
                type="button"
                onClick={onSwitch2D}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sky-300 hover:bg-sky-500/15"
              >
                <span>⚡</span> {locale === 'en' ? 'Switch to 2D View' : 'Cambiar a Vista 2D'}
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* Bottom Desktop Taskbar */}
      <footer className="z-40 flex h-11 items-center justify-between border-t border-white/15 bg-[#090e18]/95 px-3 text-xs backdrop-blur-md">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setStartMenuOpen((v) => !v)}
            className="flex items-center gap-1.5 rounded-md border border-sky-400/35 bg-sky-500/15 px-2.5 py-1 font-mono text-[11px] font-bold text-sky-300 hover:bg-sky-500/25"
          >
            LR
          </button>

          <button
            type="button"
            onClick={() => {
              if (!browserOpen || browserMinimized) {
                setBrowserOpen(true)
                setBrowserMinimized(false)
                setActiveApp('browser')
              } else if (activeApp === 'browser') {
                setBrowserMinimized(true)
              } else {
                setActiveApp('browser')
              }
            }}
            className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] transition-colors ${
              browserOpen && !browserMinimized && activeApp === 'browser'
                ? 'border-sky-400/40 bg-sky-500/20 text-white'
                : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <span>🌐</span> Portfolio
          </button>

          {doomUnlocked && doomOpen ? (
            <button
              type="button"
              onClick={() => setActiveApp('doom')}
              className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] transition-colors ${
                activeApp === 'doom'
                  ? 'border-red-400/50 bg-red-500/25 text-white'
                  : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              <span>🔥</span> DOOM (1993)
            </button>
          ) : null}
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px] text-slate-300">
          <button
            type="button"
            onClick={() => setLocale(locale === 'es' ? 'en' : 'es')}
            className="rounded border border-white/10 bg-white/5 px-2 py-0.5 hover:bg-white/10"
          >
            {locale.toUpperCase()}
          </button>
          <div className="inline-flex items-center rounded border border-white/15 bg-[#0d1420] p-0.5">
            <button
              type="button"
              onClick={onSwitch2D}
              className="rounded px-1.5 py-0.5 text-slate-400 hover:text-white"
            >
              2D
            </button>
            <span className="rounded bg-sky-500 px-1.5 py-0.5 font-semibold text-slate-950">
              3D
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              const now = Date.now()
              const prev = clockTapsRef.current
              const count = now - prev.last < 1500 ? prev.count + 1 : 1
              clockTapsRef.current = { count, last: now }
              if (count >= 5) {
                clockTapsRef.current = { count: 0, last: 0 }
                launchDoom()
              }
            }}
            className="px-1 text-slate-400 hover:text-slate-200"
          >
            {clockText}
          </button>
        </div>
      </footer>
    </div>
  )
}
