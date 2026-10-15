import type { Metadata } from 'next'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

const SITE_URL = 'https://lorenzoroca.vercel.app'
const TITLE = 'Lorenzo Roca — Desarrollo de software y soporte TI | Valencia, Carabobo'
const DESCRIPTION =
  'Portafolio de Lorenzo Roca, estudiante de Análisis de Sistemas (IUTEPI): proyectos de software con repositorio, demo y documentación, soporte técnico independiente desde 2021 y certificados.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: '%s',
  },
  description: DESCRIPTION,
  keywords: [
    'Lorenzo Roca',
    'desarrollador junior Valencia',
    'analista de sistemas',
    'soporte técnico Valencia',
    'Python',
    'TypeScript',
    'React',
    'Next.js',
    'FastAPI',
    'Flutter',
    'SQL',
    'Venezuela',
    'Carabobo',
  ],
  authors: [{ name: 'Lorenzo Roca' }],
  creator: 'Lorenzo Roca',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    title: TITLE,
    description: DESCRIPTION,
    siteName: 'Lorenzo Roca',
    locale: 'es_VE',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-light-32x32.png', sizes: '32x32', type: 'image/png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', sizes: '32x32', type: 'image/png', media: '(prefers-color-scheme: dark)' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: '/icon.svg',
  },
}

/**
 * @description Root layout: metadata del sitio y proveedor de tema.
 * El fondo oscuro es parte de la identidad visual del portafolio público.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className="font-sans antialiased bg-[#0A0E14]">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
