'use client'

import { CONTACT, type Profile } from '@/lib/portfolio-types'
import { usePortfolio } from '@/components/site/portfolio-context'

interface ContactSectionProps {
  profile: Profile | null
}

/**
 * @description Contact and availability call-to-action block synchronized with ES/EN ATS CV PDFs.
 */
export function ContactSection({ profile }: ContactSectionProps) {
  const { locale, t } = usePortfolio()
  const email = CONTACT.email
  const linkedin = profile?.linkedin_url ?? CONTACT.linkedin
  const github = profile?.github_url ?? CONTACT.github
  const cvUrl =
    locale === 'en' ? '/cv/CV_Lorenzo_Roca_EN.pdf' : '/cv/CV_Lorenzo_Roca_ES.pdf'

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#111721] to-[#0D1420] p-8 sm:p-10">
      <h2 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
        {t.contact.heading}
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300">
        {t.contact.description}
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <a
          href={`mailto:${email}?subject=Oportunidad%20laboral`}
          className="rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-sky-400"
        >
          {email}
        </a>
        <a
          href={linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-100 transition-colors hover:bg-white/10"
        >
          LinkedIn
        </a>
        <a
          href={github}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-100 transition-colors hover:bg-white/10"
        >
          GitHub
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

      <dl className="mt-8 grid gap-4 border-t border-white/10 pt-6 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-500">
            {t.contact.locationLabel}
          </dt>
          <dd className="mt-1 text-slate-300">{CONTACT.location}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-500">
            {t.contact.phoneLabel}
          </dt>
          <dd className="mt-1 text-slate-300">{CONTACT.phone}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-500">
            {t.contact.modalityLabel}
          </dt>
          <dd className="mt-1 text-slate-300">{t.contact.modalityValue}</dd>
        </div>
      </dl>
    </div>
  )
}
