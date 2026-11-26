'use client'

import dynamic from 'next/dynamic'
import { useCallback, useState } from 'react'
import { SiteNav } from '@/components/site/site-nav'
import { Hero } from '@/components/site/hero'
import { ProjectsExplorer } from '@/components/site/projects-explorer'
import { CertificatesGrid } from '@/components/site/certificates-grid'
import { ContactSection } from '@/components/site/contact-section'
import { SiteFooter } from '@/components/site/site-footer'
import { LaptopOS } from '@/components/site/laptop-os'
import { usePortfolio } from '@/components/site/portfolio-context'
import type { Certificate, Profile, Project } from '@/lib/portfolio-types'

const Workbench3D = dynamic(
  () => import('@/components/site/workbench-3d').then((m) => m.Workbench3D),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[calc(100vh-3.5rem)] w-full items-center justify-center bg-[#06090F] font-mono text-xs text-sky-400">
        Cargando escritorio 3D interactivo…
      </div>
    ),
  }
)

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

function SectionHeading({
  id,
  eyebrow,
  title,
  description,
}: {
  id: string
  eyebrow: string
  title: string
  description?: string
}) {
  return (
    <div id={id} className="mb-8 scroll-mt-24">
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-sky-400">
        {eyebrow}
      </p>
      <h2 className="font-display mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-400">{description}</p>
      ) : null}
    </div>
  )
}

interface HomeViewProps {
  profile: Profile | null
  projects: Project[]
  certificates: Certificate[]
}

/**
 * @description 3D Laptop Workstation OS experience (zero overlapping floating cards) with instant 2D vertical portfolio toggle.
 */
export function HomeView({ profile, projects, certificates }: HomeViewProps) {
  const { locale, setLocale, viewMode, setViewMode, t } = usePortfolio()
  const [lidClosed, setLidClosed] = useState(false)
  const [resetSignal, setResetSignal] = useState(0)
  const [secretSignal, setSecretSignal] = useState(0)

  const handleToggleLid = useCallback(() => setLidClosed((prev) => !prev), [])
  const handleSwitch2D = useCallback(() => setViewMode('2d'), [setViewMode])
  const handleSecretTrigger = useCallback(() => setSecretSignal((n) => n + 1), [])

  const cvUrl = locale === 'en' ? '/cv/CV_Lorenzo_Roca_EN.pdf' : '/cv/CV_Lorenzo_Roca_ES.pdf'

  if (viewMode === '3d') {
    return (
      <div className="relative h-screen w-screen overflow-hidden bg-[#050911] text-slate-200">
        {/* Minimal Corner Floating Pill Bar (zero obstruction of the 3D Laptop) */}
        <div className="pointer-events-none fixed inset-x-4 top-3 z-30 flex items-center justify-between gap-2">
          <div className="pointer-events-auto flex items-center gap-2 rounded-lg border border-white/10 bg-[#070c14]/75 px-3 py-1.5 backdrop-blur-md">
            <span className="font-mono text-xs font-bold text-sky-300">LR</span>
            <span className="hidden text-xs font-semibold text-slate-200 sm:inline">
              Lorenzo Roca
            </span>
          </div>

          <div className="pointer-events-auto flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#070c14]/75 p-1 backdrop-blur-md">
            <button
              type="button"
              onClick={() => {
                setLidClosed(false)
                setResetSignal((n) => n + 1)
              }}
              className="rounded px-2.5 py-1 font-mono text-[11px] text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
            >
              {t.hero.sceneControls.resetCamera}
            </button>
            <div
              role="group"
              aria-label={t.nav.toggle3dTitle}
              className="inline-flex items-center rounded border border-white/15 bg-[#0d1420] p-0.5 font-mono text-[11px]"
            >
              <button
                type="button"
                onClick={handleSwitch2D}
                className="rounded px-2 py-0.5 font-semibold text-slate-400 transition-colors hover:text-white"
              >
                {t.nav.mode2d}
              </button>
              <button
                type="button"
                className="rounded bg-sky-500 px-2 py-0.5 font-semibold text-slate-950"
              >
                {t.nav.mode3d}
              </button>
            </div>
            <button
              type="button"
              onClick={() => setLocale(locale === 'es' ? 'en' : 'es')}
              className="rounded border border-white/15 bg-white/5 px-2 py-1 font-mono text-[11px] text-slate-200 transition-colors hover:bg-white/10"
            >
              {locale.toUpperCase()}
            </button>
            <a
              href={cvUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded bg-sky-500 px-2.5 py-1 text-[11px] font-semibold text-slate-950 transition-colors hover:bg-sky-400"
            >
              CV
            </a>
          </div>
        </div>

        <Workbench3D
          lidClosed={lidClosed}
          onToggleLid={handleToggleLid}
          resetSignal={resetSignal}
          onSwitch2D={handleSwitch2D}
          onSecretTrigger={handleSecretTrigger}
          labels={{
            dragHint: t.hero.sceneControls.dragHint,
            openLid: locale === 'en' ? 'Open Laptop' : 'Abrir Laptop',
            closeLid: locale === 'en' ? 'Close Lid' : 'Cerrar Tapa',
            resetCamera: t.hero.sceneControls.resetCamera,
            switch2d: t.hero.sceneControls.switch2d,
          }}
        >
          <LaptopOS
            profile={profile}
            projects={projects}
            certificates={certificates}
            secretSignal={secretSignal}
            onSwitch2D={handleSwitch2D}
            onToggleLid={handleToggleLid}
            onResetCamera={() => setResetSignal((n) => n + 1)}
          />
        </Workbench3D>
      </div>
    )
  }

  // Classic 2D Vertical-Scrolling Portfolio
  return (
    <div className="min-h-screen bg-[#0A0E14] text-slate-200">
      <SiteNav cvUrl={profile?.cv_pdf_url ?? null} />

      <Hero
        profile={profile}
        projectCount={projects.length}
        certificateCount={certificates.length}
      />

      <section className="border-b border-white/10">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <SectionHeading id="sobre-mi" eyebrow={t.about.eyebrow} title={t.about.title} />
          <div className="grid gap-10 md:grid-cols-[1.2fr_1fr]">
            <div className="space-y-4 text-sm leading-relaxed text-slate-300">
              <p>{t.about.p1}</p>
              <p>{t.about.p2}</p>
              <p>{t.about.p3}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#111721] p-6">
              <h3 className="font-display text-sm font-semibold text-white">{t.about.howTitle}</h3>
              <ul className="mt-4 space-y-3">
                {t.about.howItems.map((item) => (
                  <li key={item} className="flex gap-3 text-[13px] leading-relaxed text-slate-400">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#0D131C]">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <SectionHeading
            id="stack"
            eyebrow={t.stack.eyebrow}
            title={t.stack.title}
            description={t.stack.description}
          />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {STACK_GROUPS.map((group) => (
              <div key={group.labelEs} className="rounded-xl border border-white/10 bg-[#111721] p-5">
                <h3 className="font-mono text-xs font-semibold uppercase tracking-wide text-sky-400">
                  {locale === 'en' ? group.labelEn : group.labelEs}
                </h3>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {(locale === 'en' && group.itemsEn ? group.itemsEn : group.itemsEs).map((item) => (
                    <span
                      key={item}
                      className="rounded-md border border-white/10 bg-white/5 px-2 py-1 font-mono text-[11px] text-slate-300"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/10">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <SectionHeading
            id="proyectos"
            eyebrow={t.projects.eyebrow}
            title={t.projects.title}
            description={t.projects.description}
          />
          <ProjectsExplorer projects={projects} />
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#0D131C]">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <SectionHeading
            id="certificados"
            eyebrow={t.certificates.eyebrow}
            title={t.certificates.title}
          />
          <CertificatesGrid certificates={certificates} />
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-5 py-16">
          <SectionHeading id="contacto" eyebrow={t.contact.eyebrow} title={t.contact.title} />
          <ContactSection profile={profile} />
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
