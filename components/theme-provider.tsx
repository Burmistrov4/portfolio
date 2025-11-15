'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

/**
 * @description Theme provider component using next-themes.
 * @param {ThemeProviderProps} props The props for the theme provider.
 * @returns {JSX.Element} The theme provider.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
