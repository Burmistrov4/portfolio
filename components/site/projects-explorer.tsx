'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Project } from '@/lib/portfolio'
import { matchDetail, shortSummary, techOf } from '@/lib/project-details'

interface ProjectsExplorerProps {
  projects: Project[]
}

function TechChip({ label }: { label: string }) {
  return (
    <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-medium text-slate-300">
      {label}
    </span>
  )
}

/**
 * @description Grid de proyectos con filtro por tecnologia.
 * El contenido es visible por defecto: no depende de animaciones ni de
 * observadores de interseccion para mostrarse.
 */
export function ProjectsExplorer({ projects }: ProjectsExplorerProps) {
  const [selectedTech, setSelectedTech] = useState<string | null>(null)

  const sorted = useMemo(() => {
    return [...projects].sort((a, b) => {
      const fa = matchDetail(a.title)?.featured ? 0 : 1
      const fb = matchDetail(b.title)?.featured ? 0 : 1
      return fa - fb
    })
  }, [projects])

  const allTech = useMemo(() => {
    const set = new Set<string>()
    sorted.forEach((p) => techOf(p).forEach((t) => set.add(t)))
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [sorted])

  const visible = useMemo(() => {
    if (!selectedTech) return sorted
    return sorted.filter((p) => techOf(p).includes(selectedTech))
  }, [sorted, selectedTech])

  return (
    <div>
      <div className="mb-8 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setSelectedTech(null)}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            selectedTech === null
              ? 'bg-sky-500 text-slate-950'
              : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
          }`}
        >
          Todos
        </button>
        {allTech.map((tech) => (
          <button
            key={tech}
            type="button"
            onClick={() => setSelectedTech(selectedTech === tech ? null : tech)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              selectedTech === tech
                ? 'bg-sky-500 text-slate-950'
                : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            {tech}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="rounded-lg border border-white/10 bg-white/5 p-6 text-sm text-slate-400">
          No hay proyectos con esa tecnología.
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
                    <span className="absolute left-3 top-3 rounded-md bg-sky-500/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-950">
                      Destacado
                    </span>
                  ) : null}
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-base font-semibold text-white group-hover:text-sky-300">
                    {project.title}
                  </h3>
                  {detail ? (
                    <p className="mt-1 text-xs text-sky-300/80">{detail.year}</p>
                  ) : null}
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-400">
                    {shortSummary(project.ai_summary) || detail?.tagline || ''}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {tech.slice(0, 4).map((t) => (
                      <TechChip key={t} label={t} />
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
