import type { Metadata } from 'next'
import { ThemeProvider } from '@/components/theme-provider'
import { ParticlesBackground } from '@/components/particles-background'
import './globals.css'

export const metadata: Metadata = {
  title: 'Lorenzo\'s Porfolio web App',
  description: 'Created with the new Next.js 13 App Router',
  generator: 'Next.js',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

/**
  * @description Root layout component for the application.
  * @param {Readonly<{children: React.ReactNode}>} props The props containing children.
  * @returns {JSX.Element} The layout.
  */
// Build fix applied - null characters removed
// Updated with cyberpunk theme and particles background
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased relative overflow-x-hidden`}>
        <ParticlesBackground />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}