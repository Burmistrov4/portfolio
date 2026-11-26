'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { COPY, type Locale } from '@/lib/i18n'

export type ViewMode = '3d' | '2d'

interface PortfolioContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
  t: (typeof COPY)[Locale]
}

const PortfolioContext = createContext<PortfolioContextValue | null>(null)

/**
 * @description Global client context for bilingual (ES/EN) copy and 3D/2D viewport mode.
 */
export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('es')
  const [viewMode, setViewModeState] = useState<ViewMode>('3d')

  useEffect(() => {
    const savedLocale = window.localStorage.getItem('portfolio_locale')
    if (savedLocale === 'es' || savedLocale === 'en') {
      setLocaleState(savedLocale)
    }
    const savedMode = window.localStorage.getItem('portfolio_view_mode')
    if (savedMode === '2d' || savedMode === '3d') {
      setViewModeState(savedMode)
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const setLocale = (next: Locale) => {
    setLocaleState(next)
    window.localStorage.setItem('portfolio_locale', next)
  }

  const setViewMode = (next: ViewMode) => {
    setViewModeState(next)
    window.localStorage.setItem('portfolio_view_mode', next)
  }

  return (
    <PortfolioContext.Provider
      value={{
        locale,
        setLocale,
        viewMode,
        setViewMode,
        t: COPY[locale],
      }}
    >
      {children}
    </PortfolioContext.Provider>
  )
}

export function usePortfolio() {
  const ctx = useContext(PortfolioContext)
  if (!ctx) {
    throw new Error('usePortfolio must be used within PortfolioProvider')
  }
  return ctx
}
