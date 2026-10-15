import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProfile, getProject } from '@/lib/portfolio'
import { matchDetail, shortSummary, techOf } from '@/lib/project-details'
import { SiteNav } from '@/components/site/site-nav'
import { SiteFooter } from '@/components/site/site-footer'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: { id: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const project = await getProject(params.id)
  if (!project) return { title: 'Proyecto no encontrado — Lorenzo Roca' }
  const detail = matchDetail(project.title)
  return {
    title: `${project.title} — Lorenzo Roca`,
    description: detail?.tagline ?? shortSummary(project.ai_summary),
  }
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-white/10 py-8">
      <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-400">{title}</h2>
      <div className="mt-4 text-sm leading-relaxed text-slate-300">{children}</div>
    </section>
  )
}

export default async function ProjectPage({ params }: PageProps) {
  const [project, profile] = await Promise.all([getProject(params.id), getProfile()])
  if (!project) notFound()

  const detail = matchDetail(project.title)
  const tech = techOf(project)
  const images = project.file_paths ?? []

  return (
    <div className="min-h-screen bg-[#0A0E14] text-slate-200">
      <SiteNav cvUrl={profile?.cv_pdf_url ?? null} />

      <article className="mx-auto max-w-4xl px-5 py-12">
        <Link href="/#proyectos" className="text-xs font-medium text-sky-400 hover:text-sky-300">
          ← Volver a los proyectos
        </Link>

        <header className="mt-6">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {project.title}
          </h1>
          {detail ? (
            <p className="mt-3 text-base text-slate-300">{detail.tagline}</p>
          ) : project.ai_summary ? (
            <p className="mt-3 text-base text-slate-300">{shortSummary(project.ai_summary)}</p>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-1.5">
            {tech.map((t) => (
              <span
                key={t}
                className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[11px] font-medium text-slate-300"
              >
                {t}
              </span>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {project.github_link ? (
              <a
                href={project.github_link}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 transition-colors hover:bg-white/10"
              >
                Ver repositorio
              </a>
            ) : null}
            {project.demo_link ? (
              <a
                href={project.demo_link}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-sky-400"
              >
                Abrir demo
              </a>
            ) : null}
          </div>

          {detail ? (
            <dl className="mt-8 grid gap-4 rounded-xl border border-white/10 bg-[#111721] p-5 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">Año</dt>
                <dd className="mt-1 text-slate-300">{detail.year}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">Mi rol</dt>
                <dd className="mt-1 text-slate-300">{detail.role}</dd>
              </div>
            </dl>
          ) : null}
        </header>

        {images.length > 0 ? (
          <div className="mt-10 space-y-4">
            {images.map((src, i) => (
              <div
                key={src}
                className="relative w-full overflow-hidden rounded-xl border border-white/10 bg-[#111721]"
                style={{ aspectRatio: '16 / 10' }}
              >
                <Image
                  src={src}
                  alt={`${project.title} — captura ${i + 1}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 900px"
                  className="object-cover object-top"
                  priority={i === 0}
                />
              </div>
            ))}
          </div>
        ) : null}

        {detail ? (
          <>
            <Block title="El problema">
              <p>{detail.problem}</p>
            </Block>

            <Block title="Qué hace">
              <ul className="space-y-2">
                {detail.features.map((f) => (
                  <li key={f} className="flex gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400" />
                    {f}
                  </li>
                ))}
              </ul>
            </Block>

            <Block title="Decisiones técnicas">
              <dl className="space-y-4">
                {detail.stackNotes.map((s) => (
                  <div key={s.tech} className="rounded-lg border border-white/10 bg-[#111721] p-4">
                    <dt className="text-sm font-semibold text-white">{s.tech}</dt>
                    <dd className="mt-1 text-[13px] leading-relaxed text-slate-400">{s.note}</dd>
                  </div>
                ))}
              </dl>
            </Block>

            <Block title="Mi aporte">
              <p>{detail.contribution}</p>
            </Block>

            <Block title="Evidencia">
              <ul className="space-y-2">
                {detail.evidence.map((e) => (
                  <li key={e} className="flex gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                    {e}
                  </li>
                ))}
              </ul>
            </Block>
          </>
        ) : (
          <Block title="Descripción">
            <p>{project.ai_description ?? project.ai_summary ?? 'Sin descripción.'}</p>
          </Block>
        )}

        <div className="mt-12 rounded-xl border border-white/10 bg-[#111721] p-6">
          <p className="text-sm text-slate-300">
            ¿Quieres ver cómo trabajo o hablar de una oportunidad?
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href="mailto:lorenzoroca333@gmail.com?subject=Oportunidad%20laboral"
              className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-sky-400"
            >
              Escribirme
            </a>
            <Link
              href="/#proyectos"
              className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 transition-colors hover:bg-white/10"
            >
              Ver más proyectos
            </Link>
          </div>
        </div>
      </article>

      <SiteFooter />
    </div>
  )
}
