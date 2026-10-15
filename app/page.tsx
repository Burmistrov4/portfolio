import { SiteNav } from '@/components/site/site-nav'
import { Hero } from '@/components/site/hero'
import { ProjectsExplorer } from '@/components/site/projects-explorer'
import { CertificatesGrid } from '@/components/site/certificates-grid'
import { ContactSection } from '@/components/site/contact-section'
import { SiteFooter } from '@/components/site/site-footer'
import {
  getCertificates,
  getProfile,
  getProjects,
  type Profile,
} from '@/lib/portfolio'

export const dynamic = 'force-dynamic'

const STACK_GROUPS: Array<{ label: string; items: string[] }> = [
  { label: 'Lenguajes', items: ['Python', 'TypeScript', 'JavaScript', 'Dart', 'C#', 'SQL', 'HTML/CSS'] },
  { label: 'Frontend', items: ['React', 'Next.js', 'Flutter', 'Jinja2', 'Tailwind CSS'] },
  { label: 'Backend y APIs', items: ['FastAPI', 'Node.js', 'Fastify', 'Express', 'Flask', 'APIs REST', 'OpenAPI', 'JWT'] },
  { label: 'Datos', items: ['PostgreSQL', 'MySQL', 'SQLite', 'Supabase', 'Prisma', 'RLS y triggers', 'Migraciones versionadas'] },
  { label: 'Soporte TI', items: ['Diagnóstico de hardware', 'Ensamblaje de PC y laptops', 'Windows', 'Linux', 'Redes informáticas', 'Atención a usuarios'] },
  { label: 'Herramientas', items: ['Git', 'GitHub', 'Vercel', 'Cloudflare R2', 'Docker', 'Pruebas automatizadas'] },
]

const HOW_I_WORK = [
  'Entiendo el problema antes de escribir código: modelo los datos y las reglas del negocio primero.',
  'Entrego funcionando: cada proyecto tiene demo o repositorio que se puede abrir y probar.',
  'Pruebo lo que construyo (unitarias, integración y de base de datos) y documento las decisiones.',
  'Trabajo en equipo y con tutoría: mi proyecto de grado se desarrolla con tres compañeros y una tutora.',
]

function SectionHeading({ id, eyebrow, title, description }: { id: string; eyebrow: string; title: string; description?: string }) {
  return (
    <div id={id} className="mb-8 scroll-mt-24">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-400">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">{title}</h2>
      {description ? (
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-400">{description}</p>
      ) : null}
    </div>
  )
}

export default async function Home() {
  const [profileData, projects, certificates] = await Promise.all([
    getProfile(),
    getProjects(),
    getCertificates(),
  ])

  const profile: Profile | null = profileData

  return (
    <div className="min-h-screen bg-[#0A0E14] text-slate-200">
      <SiteNav cvUrl={profile?.cv_pdf_url ?? null} />

      <Hero
        profile={profile}
        projectCount={projects.length}
        certificateCount={certificates.length}
      />

      {/* Sobre mi */}
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <SectionHeading
            id="sobre-mi"
            eyebrow="Sobre mí"
            title="Análisis de Sistemas, software y soporte"
          />
          <div className="grid gap-10 md:grid-cols-[1.2fr_1fr]">
            <div className="space-y-4 text-sm leading-relaxed text-slate-300">
              <p>
                Soy estudiante de 4.º semestre de Análisis de Sistemas en el IUTEPI (Valencia,
                Carabobo). Empecé en tecnología por el lado del hardware: desde 2021 hago
                diagnóstico, mantenimiento y ensamblaje de equipos de forma independiente, y de ahí
                pasé al software.
              </p>
              <p>
                Hoy construyo aplicaciones completas: modelo los datos, escribo la API, armo la
                interfaz y la despliego. Mi trabajo de grado es un sistema de gestión académica para
                el CFS Nacional de Soldadura &ldquo;Rafael Urdaneta&rdquo; del INCES La Isabelica,
                desarrollado en equipo con tutoría académica.
              </p>
              <p>
                Busco mi primera oportunidad formal en desarrollo de software, análisis de sistemas
                o soporte TI. Tengo disponibilidad inmediata, en Valencia o en remoto.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#111721] p-6">
              <h3 className="text-sm font-semibold text-white">Cómo trabajo</h3>
              <ul className="mt-4 space-y-3">
                {HOW_I_WORK.map((item) => (
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
            eyebrow="Stack"
            title="Con qué trabajo"
            description="Tecnologías que uso en proyectos reales, no listas de cursos: cada una aparece en al menos uno de los proyectos de abajo."
          />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {STACK_GROUPS.map((group) => (
              <div key={group.label} className="rounded-xl border border-white/10 bg-[#111721] p-5">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-sky-400">
                  {group.label}
                </h3>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {group.items.map((item) => (
                    <span
                      key={item}
                      className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-slate-300"
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
            eyebrow="Proyectos"
            title="Lo que he construido"
            description="Cada tarjeta abre la ficha completa: el problema, qué hace, las decisiones técnicas, mi aporte y la evidencia. Filtra por tecnología si buscas algo concreto."
          />
          <ProjectsExplorer projects={projects} />
        </div>
      </section>

      {/* Certificados */}
      <section className="border-b border-white/10 bg-[#0D131C]">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <SectionHeading
            id="certificados"
            eyebrow="Formación"
            title="Certificados y cursos"
          />
          <CertificatesGrid certificates={certificates} />
        </div>
      </section>

      {/* Contacto */}
      <section>
        <div className="mx-auto max-w-6xl px-5 py-16">
          <SectionHeading id="contacto" eyebrow="Contacto" title="Hablemos" />
          <ContactSection profile={profile} />
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
