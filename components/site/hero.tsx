'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useCallback } from 'react'
import { CONTACT, type Profile } from '@/lib/portfolio-types'
import { usePortfolio } from '@/components/site/portfolio-context'

const Workbench3D = dynamic(
  () => import('@/components/site/workbench-3d').then((m) => m.Workbench3D),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[360px] w-full items-center justify-center rounded-2xl border border-sky-400/20 bg-[#070b11] font-mono text-xs text-sky-300 sm:h-[430px]">
        Inicializando escena WebGL / Three.js…
      </div>
    ),
  }
)

interface HeroProps {
  profile: Profile | null
  projectCount: number
  certificateCount: number
}

/**
 * @description Hero section supporting progressive Three.js + GLSL 3D workstation and instant 2D fallback.
 */
export function Hero({ profile, projectCount, certificateCount }: HeroProps) {
  const { locale, viewMode, setViewMode, t } = usePortfolio()
  const name = profile?.full_name ?? 'Lorenzo Roca'
  const photo = profile?.profile_image_url
  const github = profile?.github_url ?? CONTACT.github
  const linkedin = profile?.linkedin_url ?? CONTACT.linkedin
  const cvUrl =
    locale === 'en' ? '/cv/CV_Lorenzo_Roca_EN.pdf' : '/cv/CV_Lorenzo_Roca_ES.pdf'

  const handleNavigateSection = useCallback((sectionId: string) => {
    const el = document.getElementById(sectionId)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  const stats = [
    { value: `${projectCount}`, label: t.hero.stats.projects },
    { value: `${certificateCount}`, label: t.hero.stats.certificates },
    { value: '2021', label: t.hero.stats.supportSince },
    { value: locale === 'en' ? '5th' : '5.º', label: t.hero.stats.semester },
  ]

  return (
    <section className="relative overflow-hidden border-b border-white/10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, rgba(56,189,248,0.18), transparent 45%), radial-gradient(circle at 80% 0%, rgba(34,211,238,0.12), transparent 40%)',
        }}
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 py-12 lg:grid-cols-[1.15fr_1fr] lg:py-16">
        <div>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <p className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {t.hero.availability}
            </p>
            {photo && viewMode === '3d' ? (
              <div className="relative h-8 w-8 overflow-hidden rounded-full border border-white/20 bg-[#111721]">
                <Image src={photo} alt={name} fill sizes="32px" className="object-cover" priority />
              </div>
            ) : null}
          </div>

          <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
            {name}
          </h1>

          <p className="mt-3 text-lg text-sky-300 sm:text-xl">{t.hero.subtitle}</p>

          <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-slate-300">{t.hero.pitch}</p>

          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href="#proyectos"
              className="rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-sky-400"
            >
              {t.hero.ctaProjects}
            </a>
            <a
              href={github}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-100 transition-colors hover:border-white/30 hover:bg-white/10"
            >
              GitHub
            </a>
            <a
              href={linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-100 transition-colors hover:border-white/30 hover:bg-white/10"
            >
              LinkedIn
            </a>
            <a
              href={cvUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-sky-400/30 bg-sky-400/10 px-4 py-2.5 text-sm font-medium text-sky-200 transition-colors hover:bg-sky-400/20"
            >
              {t.hero.ctaCv}
            </a>
          </div>
        </div>

        {/* Interactive 3D Three.js + GLSL Workbench OR Instant 2D Profile */}
        <div>
          {viewMode === '3d' ? (
            <Workbench3D
              locale={locale}
              projectCount={projectCount}
              onNavigateSection={handleNavigateSection}
              onFallback2D={() => setViewMode('2d')}
              labels={t.hero.sceneControls}
            />
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#111721]/80 p-8 text-center">
              <div className="relative h-44 w-44 overflow-hidden rounded-full border border-white/15 bg-[#0A0E14] sm:h-52 sm:w-52">
                {photo ? (
                  <Image
                    src={photo}
                    alt={name}
                    fill
                    sizes="208px"
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-slate-500">
                    LR
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => setViewMode('3d')}
                className="mt-6 rounded-md border border-sky-400/30 bg-sky-500/10 px-3.5 py-1.5 font-mono text-xs text-sky-300 transition-colors hover:bg-sky-500/20"
              >
                {locale === 'en' ? 'Enable 3D Workstation' : 'Activar Estación 3D'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="relative mx-auto max-w-6xl px-5 pb-10">
        <dl className="grid grid-cols-2 gap-4 border-t border-white/10 pt-8 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label}>
              <dt className="font-display text-2xl font-bold text-white">{s.value}</dt>
              <dd className="mt-1 text-xs leading-relaxed text-slate-400">{s.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
