'use client'

import { useState } from 'react'
import type { Certificate } from '@/lib/portfolio-types'
import { curateCertificate } from '@/lib/project-details'
import { usePortfolio } from '@/components/site/portfolio-context'

interface CertificatesGridProps {
  certificates: Certificate[]
}

/**
 * @description Curated certificates grid prioritizing IT/Software certifications and hiding placeholder text.
 */
export function CertificatesGrid({ certificates }: CertificatesGridProps) {
  const [showOther, setShowOther] = useState(false)
  const { t } = usePortfolio()

  if (certificates.length === 0) return null

  const enriched = certificates.map((cert) => ({
    cert,
    ...curateCertificate(cert),
  }))

  const technical = enriched.filter((c) => c.isTechnical)
  const complementary = enriched.filter((c) => !c.isTechnical)
  const visible = showOther ? [...technical, ...complementary] : technical

  return (
    <div>
      {complementary.length > 0 ? (
        <div className="mb-6 flex justify-end">
          <button
            type="button"
            onClick={() => setShowOther((prev) => !prev)}
            className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-[11px] text-slate-400 transition-colors hover:border-white/25 hover:text-slate-200"
          >
            {showOther ? t.certificates.hideOther : t.certificates.showOther} ({complementary.length})
          </button>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {visible.map(({ cert, cleanDescription }) => (
          <article
            key={cert.id}
            className="flex flex-col rounded-xl border border-white/10 bg-[#111721] p-5 transition-colors hover:border-sky-400/30"
          >
            <h3 className="font-display text-sm font-semibold text-white">{cert.title}</h3>
            {cleanDescription ? (
              <p className="mt-2 flex-1 text-[13px] leading-relaxed text-slate-400">
                {cleanDescription.length > 220
                  ? `${cleanDescription.slice(0, 220)}…`
                  : cleanDescription}
              </p>
            ) : null}
            <div className="mt-4 flex flex-wrap items-center gap-1.5">
              {(cert.technologies ?? []).slice(0, 4).map((tech) => (
                <span
                  key={tech}
                  className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[11px] text-slate-300"
                >
                  {tech}
                </span>
              ))}
              {cert.cert_url ? (
                <a
                  href={cert.cert_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto text-[11px] font-medium text-sky-300 hover:text-sky-200"
                >
                  {t.certificates.view}
                </a>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
