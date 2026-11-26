'use client'

import { SiteNav } from '@/components/site/site-nav'
import { Hero } from '@/components/site/hero'
import { ProjectsExplorer } from '@/components/site/projects-explorer'
import { CertificatesGrid } from '@/components/site/certificates-grid'
import { ContactSection } from '@/components/site/contact-section'
import { SiteFooter } from '@/components/site/site-footer'
import { usePortfolio } from '@/components/site/portfolio-context'
import { curateCertificate, matchDetail } from '@/lib/project-details'
import type { Certificate, Profile, Project } from '@/lib/portfolio-types'

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
 * @description Bilingual client wrapper for the public portfolio landing page.
 */
export function HomeView({ profile, projects, certificates }: HomeViewProps) {
  const { locale, t } = usePortfolio()

  const flagshipCount = projects.filter((p) => !matchDetail(p.title)?.legacy).length
  const techCertCount = certificates.filter((c) => curateCertificate(c).isTechnical).length

  return (
    <div className="min-h-screen bg-[#0A0E14] text-slate-200">
      <SiteNav cvUrl={profile?.cv_pdf_url ?? null} />

      <Hero
        profile={profile}
        projectCount={flagshipCount || projects.length}
        certificateCount={techCertCount || certificates.length}
      />

      {/* Sobre mí */}
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

      {/* Stack */}
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

      {/* Proyectos */}
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

      {/* Certificados */}
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

      {/* Contacto */}
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
