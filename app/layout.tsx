import type { Metadata } from 'next'
import { Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { PortfolioProvider } from '@/components/site/portfolio-context'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' })
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono' })

const SITE_URL = 'https://lorenzoroca.vercel.app'
const TITLE = 'Lorenzo Roca — Desarrollo Full-Stack, Sistemas 3D y Soporte TI'
const DESCRIPTION =
  'Portafolio de Lorenzo Roca, estudiante de 5.º semestre de Análisis de Sistemas (IUTEPI): proyectos full-stack con arquitectura documentada, escena interactiva Three.js + GLSL y soporte TI desde 2021.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: '%s',
  },
  description: DESCRIPTION,
  keywords: [
    'Lorenzo Roca',
    'desarrollador full-stack',
    'analista de sistemas',
    'Three.js',
    'GLSL',
    'Python',
    'TypeScript',
    'React',
    'Next.js',
    'FastAPI',
    'Flutter',
    'SQL',
    'Valencia',
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
 * @description Root layout: Google typography triad, metadata, theme and portfolio context.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <body className="bg-[#0A0E14] font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <PortfolioProvider>{children}</PortfolioProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
