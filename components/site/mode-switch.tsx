'use client'

import { usePortfolio } from '@/components/site/portfolio-context'

interface ModeSwitchProps {
  compact?: boolean
  onSelectMode?: (mode: '2d' | '3d') => void
}

/**
 * @description Unified segmented 2D / 3D mode switch shared across navigation, 3D HUD, and Laptop OS taskbar.
 */
export function ModeSwitch({ compact = false, onSelectMode }: ModeSwitchProps) {
  const { viewMode, setViewMode, t } = usePortfolio()

  const handleSelect = (mode: '2d' | '3d') => {
    if (onSelectMode) {
      onSelectMode(mode)
    } else {
      setViewMode(mode)
    }
  }

  return (
    <div
      role="group"
      aria-label={t.nav.toggle3dTitle}
      title={t.nav.toggle3dTitle}
      className={`inline-flex items-center rounded-md border border-white/15 bg-[#0d1420] p-0.5 font-mono ${
        compact ? 'text-[11px]' : 'text-xs'
      }`}
    >
      <button
        type="button"
        onClick={() => handleSelect('2d')}
        className={`rounded font-semibold transition-colors ${
          compact ? 'px-1.5 py-0.5' : 'px-2 py-1'
        } ${
          viewMode === '2d'
            ? 'bg-sky-500 text-slate-950'
            : 'text-slate-400 hover:text-white'
        }`}
      >
        {t.nav.mode2d}
      </button>
      <button
        type="button"
        onClick={() => handleSelect('3d')}
        className={`rounded font-semibold transition-colors ${
          compact ? 'px-1.5 py-0.5' : 'px-2 py-1'
        } ${
          viewMode === '3d'
            ? 'bg-sky-500 text-slate-950'
            : 'text-slate-400 hover:text-white'
        }`}
      >
        {t.nav.mode3d}
      </button>
    </div>
  )
}
