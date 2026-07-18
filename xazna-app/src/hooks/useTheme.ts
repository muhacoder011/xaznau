import { useState, useEffect, useCallback } from 'react'

// Rang mavzulari (primary rang palitralari)
export interface ThemeColors {
  name: string
  label: string
  colors: {
    50: string; 100: string; 200: string; 300: string
    400: string; 500: string; 600: string; 700: string
    800: string; 900: string; 950: string
  }
}

export const THEME_COLORS: ThemeColors[] = [
  {
    name: 'blue',
    label: 'Ko\'k',
    colors: {
      50: '#f0f9ff', 100: '#e0f2fe', 200: '#bae6fd', 300: '#7dd3fc',
      400: '#38bdf8', 500: '#0ea5e9', 600: '#0284c7', 700: '#0369a1',
      800: '#075985', 900: '#0c4a6e', 950: '#082f49',
    },
  },
  {
    name: 'emerald',
    label: 'Yashil',
    colors: {
      50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7',
      400: '#34d399', 500: '#10b981', 600: '#059669', 700: '#047857',
      800: '#065f46', 900: '#064e3b', 950: '#022c22',
    },
  },
  {
    name: 'violet',
    label: 'Binafsha',
    colors: {
      50: '#f5f3ff', 100: '#ede9fe', 200: '#ddd6fe', 300: '#c4b5fd',
      400: '#a78bfa', 500: '#8b5cf6', 600: '#7c3aed', 700: '#6d28d9',
      800: '#5b21b6', 900: '#4c1d95', 950: '#2e1065',
    },
  },
  {
    name: 'rose',
    label: 'Pushti',
    colors: {
      50: '#fff1f2', 100: '#ffe4e6', 200: '#fecdd3', 300: '#fda4af',
      400: '#fb7185', 500: '#f43f5e', 600: '#e11d48', 700: '#be123c',
      800: '#9f1239', 900: '#881337', 950: '#4c0519',
    },
  },
  {
    name: 'amber',
    label: 'Sariq',
    colors: {
      50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d',
      400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309',
      800: '#92400e', 900: '#78350f', 950: '#451a03',
    },
  },
  {
    name: 'cyan',
    label: 'Havo rang',
    colors: {
      50: '#ecfeff', 100: '#cffafe', 200: '#a5f3fc', 300: '#67e8f9',
      400: '#22d3ee', 500: '#06b6d4', 600: '#0891b2', 700: '#0e7490',
      800: '#155e75', 900: '#164e63', 950: '#083344',
    },
  },
]

interface ThemeSettings {
  isDark: boolean
  themeColor: string // theme name (e.g. 'blue', 'emerald')
}

export function useTheme() {
  const [settings, setSettings] = useState<ThemeSettings>(() => {
    try {
      const saved = localStorage.getItem('xazna_theme')
      if (saved) return JSON.parse(saved)
    } catch {}
    return {
      isDark: window.matchMedia('(prefers-color-scheme: dark)').matches,
      themeColor: 'blue',
    }
  })

  // Apply dark class
  useEffect(() => {
    if (settings.isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [settings.isDark])

  // Apply theme colors via CSS custom properties
  useEffect(() => {
    const theme = THEME_COLORS.find(t => t.name === settings.themeColor)
    if (theme) {
      const root = document.documentElement
      Object.entries(theme.colors).forEach(([key, value]) => {
        root.style.setProperty(`--primary-${key}`, value)
      })
    }
  }, [settings.themeColor])

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('xazna_theme', JSON.stringify(settings))
  }, [settings])

  const toggleDarkMode = useCallback(() => {
    setSettings(prev => ({ ...prev, isDark: !prev.isDark }))
  }, [])

  const setThemeColor = useCallback((colorName: string) => {
    setSettings(prev => ({ ...prev, themeColor: colorName }))
  }, [])

  const setDarkMode = useCallback((dark: boolean) => {
    setSettings(prev => ({ ...prev, isDark: dark }))
  }, [])

  // Add CSS variables to document head
  useEffect(() => {
    const style = document.createElement('style')
    style.id = 'xazna-theme-vars'
    style.textContent = `
      :root {
        ${THEME_COLORS[0] ? Object.entries(THEME_COLORS[0].colors).map(([k, v]) => `--primary-${k}: ${v};`).join('\n') : ''}
      }
    `
    const existing = document.getElementById('xazna-theme-vars')
    if (existing) existing.remove()
    document.head.appendChild(style)

    return () => {
      const s = document.getElementById('xazna-theme-vars')
      if (s) s.remove()
    }
  }, [])

  return {
    isDark: settings.isDark,
    themeColor: settings.themeColor,
    themeColors: THEME_COLORS,
    currentTheme: THEME_COLORS.find(t => t.name === settings.themeColor) || THEME_COLORS[0],
    toggleDarkMode,
    setDarkMode,
    setThemeColor,
  }
}
