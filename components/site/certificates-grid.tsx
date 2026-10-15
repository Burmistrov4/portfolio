import type { Certificate } from '@/lib/portfolio'

interface CertificatesGridProps {
  certificates: Certificate[]
}

export function CertificatesGrid({ certificates }: CertificatesGridProps) {
  if (certificates.length === 0) return null

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {certificates.map((cert) => (
        <article
          key={cert.id}
          className="flex flex-col rounded-xl border border-white/10 bg-[#111721] p-5 transition-colors hover:border-sky-400/30"
        >
          <h3 className="text-sm font-semibold text-white">{cert.title}</h3>
          {cert.description ? (
            <p className="mt-2 flex-1 text-[13px] leading-relaxed text-slate-400">
              {cert.description.length > 220
                ? `${cert.description.slice(0, 220)}…`
                : cert.description}
            </p>
          ) : null}
          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            {(cert.technologies ?? []).slice(0, 4).map((t) => (
              <span
                key={t}
                className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-slate-300"
              >
                {t}
              </span>
            ))}
            {cert.cert_url ? (
              <a
                href={cert.cert_url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto text-[11px] font-medium text-sky-300 hover:text-sky-200"
              >
                Ver certificado
              </a>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  )
}
