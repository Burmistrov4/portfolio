'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'
import { SiteNav } from '@/components/site/site-nav'
import { Hero } from '@/components/site/hero'
import { ProjectsExplorer } from '@/components/site/projects-explorer'
import { CertificatesGrid } from '@/components/site/certificates-grid'
import { ContactSection } from '@/components/site/contact-section'
import { SiteFooter } from '@/components/site/site-footer'
import { usePortfolio } from '@/components/site/portfolio-context'
import { curateCertificate, matchDetail } from '@/lib/project-details'
import { CONTACT, type Certificate, type Profile, type Project } from '@/lib/portfolio-types'
import type { SpatialSection } from '@/components/site/workbench-3d'

const Workbench3D = dynamic(
  () => import('@/components/site/workbench-3d').then((m) => m.Workbench3D),
  { ssr: false }
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

const SECTION_ORDER: SpatialSection[] = [
  'inicio',
  'sobre-mi',
  'stack',
  'proyectos',
  'certificados',
  'contacto',
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
 * @description Full-bleed 3D spatial experience with per-section camera waypoints and instant 2D vertical fallback.
 */
export function HomeView({ profile, projects, certificates }: HomeViewProps) {
  const { locale, viewMode, setViewMode, t } = usePortfolio()
  const [activeSection, setActiveSection] = useState<SpatialSection>('inicio')
  const [monitorFocused, setMonitorFocused] = useState(false)

  const flagshipCount = projects.filter((p) => !matchDetail(p.title)?.legacy).length
  const techCertCount = certificates.filter((c) => curateCertificate(c).isTechnical).length
  const displayProjectCount = flagshipCount || projects.length
  const displayCertCount = techCertCount || certificates.length

  const name = profile?.full_name ?? 'Lorenzo Roca'
  const photo = profile?.profile_image_url
  const github = profile?.github_url ?? CONTACT.github
  const linkedin = profile?.linkedin_url ?? CONTACT.linkedin
  const cvUrl = locale === 'en' ? '/cv/CV_Lorenzo_Roca_EN.pdf' : '/cv/CV_Lorenzo_Roca_ES.pdf'

  const handleSelectSection = useCallback((section: SpatialSection) => {
    setActiveSection(section)
    setMonitorFocused(false)
  }, [])

  const handleToggleMonitorFocus = useCallback(() => {
    setMonitorFocused((prev) => !prev)
  }, [])

  useEffect(() => {
    if (viewMode !== '3d') return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveSection('inicio')
        setMonitorFocused(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [viewMode])

  if (viewMode === '3d') {
    const activeIdx = SECTION_ORDER.indexOf(activeSection)
    const prevSection = activeIdx > 0 ? SECTION_ORDER[activeIdx - 1] : null
    const nextSection = activeIdx < SECTION_ORDER.length - 1 ? SECTION_ORDER[activeIdx + 1] : null

    return (
      <div className="relative h-screen w-screen overflow-hidden bg-[#060a11] text-slate-200">
        <Workbench3D
          locale={locale}
          projectCount={displayProjectCount}
          activeSection={activeSection}
          monitorFocused={monitorFocused}
          onToggleMonitorFocus={handleToggleMonitorFocus}
          onSelectSection={handleSelectSection}
          onFallback2D={() => setViewMode('2d')}
          labels={t.hero.sceneControls}
        />

        <SiteNav
          cvUrl={profile?.cv_pdf_url ?? null}
          activeSection={activeSection}
          onSelectSection={handleSelectSection}
        />

        {/* 3D Hero Floating Spatial Card (left side, leaves wide 3D world open on right) */}
        {activeSection === 'inicio' && !monitorFocused ? (
          <main className="pointer-events-none relative z-10 mx-auto flex h-[calc(100vh-4rem)] max-w-6xl items-center px-5 pb-14">
            <div className="pointer-events-auto max-w-xl rounded-2xl border border-white/15 bg-[#070c14]/72 p-6 shadow-2xl shadow-black/50 backdrop-blur-xl sm:p-7">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                {/* Prominent Profile Photo */}
                <div className="relative shrink-0 self-start sm:self-center">
                  <div
                    aria-hidden
                    className="absolute -inset-2 rounded-full bg-gradient-to-tr from-sky-500/35 to-cyan-400/20 blur-md"
                  />
                  <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-sky-400/60 bg-[#111721] shadow-lg sm:h-28 sm:w-28">
                    {photo ? (
                      <Image
                        src={photo}
                        alt={name}
                        fill
                        sizes="112px"
                        className="object-cover"
                        priority
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-slate-500">
                        LR
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <p className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    {t.hero.availability}
                  </p>
                  <h1 className="font-display mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                    {name}
                  </h1>
                  <p className="mt-1 text-sm font-medium text-sky-300">{t.hero.subtitle}</p>
                </div>
              </div>

              <p className="mt-4 text-[13.5px] leading-relaxed text-slate-300">{t.hero.pitch}</p>

              <div className="mt-5 flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() => handleSelectSection('proyectos')}
                  className="rounded-lg bg-sky-500 px-3.5 py-2 text-xs font-semibold text-slate-950 transition-colors hover:bg-sky-400 sm:text-sm"
                >
                  {t.hero.ctaProjects}
                </button>
                <a
                  href={github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-medium text-slate-100 transition-colors hover:bg-white/10 sm:text-sm"
                >
                  GitHub
                </a>
                <a
                  href={linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-medium text-slate-100 transition-colors hover:bg-white/10 sm:text-sm"
                >
                  LinkedIn
                </a>
                <a
                  href={cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-sky-400/35 bg-sky-400/10 px-3.5 py-2 text-xs font-medium text-sky-200 transition-colors hover:bg-sky-400/20 sm:text-sm"
                >
                  {t.hero.ctaCv}
                </a>
              </div>

              <dl className="mt-5 grid grid-cols-4 gap-3 border-t border-white/10 pt-4">
                <div>
                  <dt className="font-display text-lg font-bold text-white">{displayProjectCount}</dt>
                  <dd className="text-[10px] leading-tight text-slate-400">{t.hero.stats.projects}</dd>
                </div>
                <div>
                  <dt className="font-display text-lg font-bold text-white">{displayCertCount}</dt>
                  <dd className="text-[10px] leading-tight text-slate-400">{t.hero.stats.certificates}</dd>
                </div>
                <div>
                  <dt className="font-display text-lg font-bold text-white">2021</dt>
                  <dd className="text-[10px] leading-tight text-slate-400">{t.hero.stats.supportSince}</dd>
                </div>
                <div>
                  <dt className="font-display text-lg font-bold text-white">
                    {locale === 'en' ? '5th' : '5.º'}
                  </dt>
                  <dd className="text-[10px] leading-tight text-slate-400">{t.hero.stats.semester}</dd>
                </div>
              </dl>
            </div>
          </main>
        ) : null}

        {/* Spatial Frosted Glass Section Overlay (for Sobre mí, Stack, Proyectos, Certificados, Contacto) */}
        {activeSection !== 'inicio' ? (
          <div className="pointer-events-none fixed inset-0 top-14 bottom-14 z-30 flex items-center justify-center px-4 py-4">
            <section
              role="region"
              aria-label={activeSection}
              className="pointer-events-auto relative flex max-h-full w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-sky-400/25 bg-[#080d16]/84 shadow-2xl shadow-black/70 backdrop-blur-xl"
            >
              {/* Overlay Header with Close & Section Stepper */}
              <div className="flex items-center justify-between border-b border-white/10 px-6 py-3.5">
                <div className="flex items-center gap-2 font-mono text-xs text-sky-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span>{activeSection.toUpperCase()}</span>
                </div>
                <div className="flex items-center gap-2">
                  {prevSection ? (
                    <button
                      type="button"
                      onClick={() => handleSelectSection(prevSection)}
                      className="rounded-md border border-white/15 bg-white/5 px-2.5 py-1 font-mono text-xs text-slate-300 hover:bg-white/10"
                    >
                      ←
                    </button>
                  ) : null}
                  {nextSection ? (
                    <button
                      type="button"
                      onClick={() => handleSelectSection(nextSection)}
                      className="rounded-md border border-white/15 bg-white/5 px-2.5 py-1 font-mono text-xs text-slate-300 hover:bg-white/10"
                    >
                      →
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => handleSelectSection('inicio')}
                    aria-label="Cerrar sección"
                    className="ml-2 rounded-md border border-white/15 bg-white/5 px-2.5 py-1 font-mono text-xs text-slate-200 hover:border-sky-400/40 hover:bg-sky-500/15"
                  >
                    × {locale === 'en' ? 'Close' : 'Cerrar'}
                  </button>
                </div>
              </div>

              {/* Scrollable Section Body */}
              <div className="overflow-y-auto p-6 sm:p-8">
                {activeSection === 'sobre-mi' ? (
                  <div>
                    <SectionHeading id="sobre-mi" eyebrow={t.about.eyebrow} title={t.about.title} />
                    <div className="grid gap-8 md:grid-cols-[1.2fr_1fr]">
                      <div className="space-y-4 text-sm leading-relaxed text-slate-300">
                        <p>{t.about.p1}</p>
                        <p>{t.about.p2}</p>
                        <p>{t.about.p3}</p>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-[#111721]/90 p-5">
                        <h3 className="font-display text-sm font-semibold text-white">
                          {t.about.howTitle}
                        </h3>
                        <ul className="mt-4 space-y-3">
                          {t.about.howItems.map((item) => (
                            <li
                              key={item}
                              className="flex gap-3 text-[13px] leading-relaxed text-slate-400"
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

                {activeSection === 'stack' ? (
                  <div>
                    <SectionHeading
                      id="stack"
                      eyebrow={t.stack.eyebrow}
                      title={t.stack.title}
                      description={t.stack.description}
                    />
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {STACK_GROUPS.map((group) => (
                        <div
                          key={group.labelEs}
                          className="rounded-xl border border-white/10 bg-[#111721]/90 p-5"
                        >
                          <h3 className="font-mono text-xs font-semibold uppercase tracking-wide text-sky-400">
                            {locale === 'en' ? group.labelEn : group.labelEs}
                          </h3>
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {(locale === 'en' && group.itemsEn ? group.itemsEn : group.itemsEs).map(
                              (item) => (
                                <span
                                  key={item}
                                  className="rounded-md border border-white/10 bg-white/5 px-2 py-1 font-mono text-[11px] text-slate-300"
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

                {activeSection === 'proyectos' ? (
                  <div>
                    <SectionHeading
                      id="proyectos"
                      eyebrow={t.projects.eyebrow}
                      title={t.projects.title}
                      description={t.projects.description}
                    />
                    <ProjectsExplorer projects={projects} />
                  </div>
                ) : null}

                {activeSection === 'certificados' ? (
                  <div>
                    <SectionHeading
                      id="certificados"
                      eyebrow={t.certificates.eyebrow}
                      title={t.certificates.title}
                    />
                    <CertificatesGrid certificates={certificates} />
                  </div>
                ) : null}

                {activeSection === 'contacto' ? (
                  <div>
                    <SectionHeading
                      id="contacto"
                      eyebrow={t.contact.eyebrow}
                      title={t.contact.title}
                    />
                    <ContactSection profile={profile} />
                  </div>
                ) : null}
              </div>
            </section>
          </div>
        ) : null}
      </div>
    )
  }

  // Classic 2D Vertical-Scrolling Portfolio
  return (
    <div className="min-h-screen bg-[#0A0E14] text-slate-200">
      <SiteNav cvUrl={profile?.cv_pdf_url ?? null} />

      <Hero
        profile={profile}
        projectCount={displayProjectCount}
        certificateCount={displayCertCount}
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
