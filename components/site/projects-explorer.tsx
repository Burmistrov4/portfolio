'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Project } from '@/lib/portfolio-types'
import { matchDetail, shortSummary, techOf } from '@/lib/project-details'
import { usePortfolio } from '@/components/site/portfolio-context'

interface ProjectsExplorerProps {
  projects: Project[]
}

function TechChip({ label }: { label: string }) {
  return (
    <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[11px] font-medium text-slate-300">
      {label}
    </span>
  )
}

/**
 * @description Filterable project grid displaying all projects by default with flagship systems ordered first.
 */
export function ProjectsExplorer({ projects }: ProjectsExplorerProps) {
  const [selectedTech, setSelectedTech] = useState<string | null>(null)
  const [onlyFeatured, setOnlyFeatured] = useState(false)
  const { t } = usePortfolio()

  const sorted = useMemo(() => {
    return [...projects].sort((a, b) => {
      const fa = matchDetail(a.title)?.featured ? 0 : 1
      const fb = matchDetail(b.title)?.featured ? 0 : 1
      return fa - fb
    })
  }, [projects])

  const pool = useMemo(
    () => (onlyFeatured ? sorted.filter((p) => matchDetail(p.title)?.featured) : sorted),
    [onlyFeatured, sorted]
  )

  const allTech = useMemo(() => {
    const set = new Set<string>()
    pool.forEach((p) => techOf(p).forEach((tech) => set.add(tech)))
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [pool])

  const visible = useMemo(() => {
    if (!selectedTech) return pool
    return pool.filter((p) => techOf(p).includes(selectedTech))
  }, [pool, selectedTech])

  return (
    <div>
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="w-full min-w-0 overflow-x-auto pb-1.5 sm:flex-1 sm:overflow-visible sm:pb-0">
          <div className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
            <button
              type="button"
              onClick={() => setSelectedTech(null)}
              className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
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
                className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  selectedTech === tech
                    ? 'bg-sky-500 text-slate-950'
                    : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                {tech}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setOnlyFeatured((prev) => !prev)
            setSelectedTech(null)
          }}
          className={`self-start shrink-0 rounded-md border px-3 py-1.5 font-mono text-[11px] transition-colors ${
            onlyFeatured
              ? 'border-sky-400/50 bg-sky-500/15 text-sky-300'
              : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/25 hover:text-slate-200'
          }`}
        >
          {onlyFeatured ? t.projects.showAll : t.projects.onlyFeatured}
        </button>
      </div>

      {visible.length === 0 ? (
        <p className="rounded-lg border border-white/10 bg-white/5 p-6 text-sm text-slate-400">
          {t.projects.empty}
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((project) => {
            const detail = matchDetail(project.title)
            const tech = techOf(project)
            const image = project.file_paths?.[0]
            return (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="group flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-[#111721] transition-all duration-200 hover:-translate-y-1 hover:border-sky-400/40 hover:shadow-xl hover:shadow-sky-500/10"
              >
                <div className="relative h-44 w-full overflow-hidden border-b border-white/10 bg-[#0A0E14]">
                  {image ? (
                    <Image
                      src={image}
                      alt={project.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 380px"
                      className="object-cover object-top transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-slate-600">
                      Sin captura
                    </div>
                  )}
                  {detail?.featured ? (
                    <span className="absolute left-3 top-3 rounded-md bg-sky-500/90 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide text-slate-950">
                      {t.projects.featured}
                    </span>
                  ) : null}
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-display text-base font-semibold text-white group-hover:text-sky-300">
                    {project.title}
                  </h3>
                  {detail ? (
                    <p className="mt-1 font-mono text-xs text-sky-300/80">{detail.year}</p>
                  ) : null}
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-400">
                    {shortSummary(project.ai_summary) || detail?.tagline || ''}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {tech.slice(0, 4).map((techLabel) => (
                      <TechChip key={techLabel} label={techLabel} />
                    ))}
                    {tech.length > 4 ? <TechChip label={`+${tech.length - 4}`} /> : null}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
