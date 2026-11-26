'use client'

import Link from 'next/link'
import { usePortfolio } from '@/components/site/portfolio-context'
import type { SpatialSection } from '@/components/site/workbench-3d'

interface SiteNavProps {
  cvUrl: string | null
  activeSection?: SpatialSection
  onSelectSection?: (section: SpatialSection) => void
}

/**
 * @description Sticky top navigation bar supporting spatial 3D section switching, 2D anchor scrolling, ES/EN, and CV download.
 */
export function SiteNav({ cvUrl: _cvUrl, activeSection, onSelectSection }: SiteNavProps) {
  const { locale, setLocale, viewMode, setViewMode, t } = usePortfolio()

  const links: Array<{ id: SpatialSection; href: string; label: string }> = [
    { id: 'proyectos', href: '/#proyectos', label: t.nav.projects },
    { id: 'stack', href: '/#stack', label: t.nav.stack },
    { id: 'certificados', href: '/#certificados', label: t.nav.certificates },
    { id: 'contacto', href: '/#contacto', label: t.nav.contact },
  ]

  const activeCvUrl =
    locale === 'en' ? '/cv/CV_Lorenzo_Roca_EN.pdf' : '/cv/CV_Lorenzo_Roca_ES.pdf'

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0A0E14]/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-3">
        {onSelectSection && viewMode === '3d' ? (
          <button
            type="button"
            onClick={() => onSelectSection('inicio')}
            className="group flex items-center gap-2 text-left"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-sky-500/15 font-mono text-sm font-bold text-sky-300 ring-1 ring-sky-400/30">
              LR
            </span>
            <span className="hidden text-sm font-semibold tracking-tight text-slate-100 sm:block">
              Lorenzo Roca
            </span>
          </button>
        ) : (
          <Link href="/" className="group flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-sky-500/15 font-mono text-sm font-bold text-sky-300 ring-1 ring-sky-400/30">
              LR
            </span>
            <span className="hidden text-sm font-semibold tracking-tight text-slate-100 sm:block">
              Lorenzo Roca
            </span>
          </Link>
        )}

        <div className="flex flex-wrap items-center gap-1.5 text-sm text-slate-300">
          {onSelectSection && viewMode === '3d' ? (
            <>
              <button
                type="button"
                onClick={() => onSelectSection('inicio')}
                className={`rounded-md px-2.5 py-1.5 text-xs transition-colors sm:text-sm ${
                  activeSection === 'inicio'
                    ? 'bg-sky-500/20 text-sky-300'
                    : 'hover:bg-white/5 hover:text-white'
                }`}
              >
                {locale === 'en' ? 'Home' : 'Inicio'}
              </button>
              <button
                type="button"
                onClick={() => onSelectSection('sobre-mi')}
                className={`hidden rounded-md px-2.5 py-1.5 text-xs transition-colors sm:text-sm md:inline-block ${
                  activeSection === 'sobre-mi'
                    ? 'bg-sky-500/20 text-sky-300'
                    : 'hover:bg-white/5 hover:text-white'
                }`}
              >
                {locale === 'en' ? 'About' : 'Sobre mí'}
              </button>
              {links.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => onSelectSection(l.id)}
                  className={`rounded-md px-2.5 py-1.5 text-xs transition-colors sm:text-sm ${
                    activeSection === l.id
                      ? 'bg-sky-500/20 text-sky-300'
                      : 'hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </>
          ) : (
            links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="hidden rounded-md px-2.5 py-1.5 transition-colors hover:bg-white/5 hover:text-white md:inline-block"
              >
                {l.label}
              </a>
            ))
          )}

          {/* 3D / 2D Toggle */}
          <button
            type="button"
            title={t.nav.toggle3dTitle}
            onClick={() => setViewMode(viewMode === '3d' ? '2d' : '3d')}
            className="rounded-md border border-sky-400/35 bg-sky-500/10 px-2.5 py-1.5 font-mono text-xs font-semibold text-sky-300 transition-colors hover:bg-sky-500/20"
          >
            {viewMode === '3d' ? t.nav.mode3d : t.nav.mode2d}
          </button>

          {/* ES / EN Toggle */}
          <button
            type="button"
            onClick={() => setLocale(locale === 'es' ? 'en' : 'es')}
            className="rounded-md border border-white/15 bg-white/5 px-2.5 py-1.5 font-mono text-xs text-slate-200 transition-colors hover:border-white/30 hover:bg-white/10"
            aria-label="Cambiar idioma / Switch language"
          >
            {locale.toUpperCase()}
          </button>

          {activeCvUrl ? (
            <a
              href={activeCvUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 rounded-md bg-sky-500 px-3 py-1.5 text-xs font-semibold text-slate-950 transition-colors hover:bg-sky-400 sm:text-sm"
            >
              {t.nav.downloadCv}
            </a>
          ) : null}
        </div>
      </nav>
    </header>
  )
}
