import { CONTACT } from '@/lib/portfolio'

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#0A0E14]">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} Lorenzo Roca · Valencia, Carabobo, Venezuela
        </p>
        <div className="flex flex-wrap gap-4">
          <a href={CONTACT.github} target="_blank" rel="noopener noreferrer" className="hover:text-slate-300">
            GitHub
          </a>
          <a href={CONTACT.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-slate-300">
            LinkedIn
          </a>
          <a href={`mailto:${CONTACT.email}`} className="hover:text-slate-300">
            {CONTACT.email}
          </a>
        </div>
      </div>
    </footer>
  )
}
