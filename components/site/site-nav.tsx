import Link from 'next/link'

interface SiteNavProps {
  cvUrl: string | null
}

const links = [
  { href: '/#proyectos', label: 'Proyectos' },
  { href: '/#stack', label: 'Stack' },
  { href: '/#certificados', label: 'Certificados' },
  { href: '/#contacto', label: 'Contacto' },
]

export function SiteNav({ cvUrl }: SiteNavProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0A0E14]/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <Link href="/" className="group flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-sky-500/15 text-sm font-bold text-sky-300 ring-1 ring-sky-400/30">
            LR
          </span>
          <span className="hidden text-sm font-semibold tracking-tight text-slate-100 sm:block">
            Lorenzo Roca
          </span>
        </Link>

        <div className="flex items-center gap-1 text-sm text-slate-300">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-md px-2.5 py-1.5 transition-colors hover:bg-white/5 hover:text-white"
            >
              {l.label}
            </a>
          ))}
          {cvUrl ? (
            <a
              href={cvUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 rounded-md bg-sky-500 px-3 py-1.5 font-medium text-slate-950 transition-colors hover:bg-sky-400"
            >
              Descargar CV
            </a>
          ) : null}
        </div>
      </nav>
    </header>
  )
}
