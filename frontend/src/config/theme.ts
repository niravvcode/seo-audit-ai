// Centralized Theme Configuration & Chart Token Helper

export type ThemeMode = 'light' | 'dark'

export interface ThemeColors {
  primary: string
  background: string
  surface: string
  text: string
  muted: string
  border: string
  success: string
  warning: string
  danger: string
  info: string
  charts: {
    critical: string
    high: string
    medium: string
    low: string
    info: string
    scoreGood: string
    scoreAverage: string
    scorePoor: string
  }
}

export const THEME_CONFIG: Record<ThemeMode, ThemeColors> = {
  light: {
    primary: '#3b82f6',
    background: '#f8fafc',
    surface: '#ffffff',
    text: '#0f172a',
    muted: '#64748b',
    border: '#e2e8f0',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#0284c7',
    charts: {
      critical: '#ef4444',
      high: '#f97316',
      medium: '#f59e0b',
      low: '#3b82f6',
      info: '#10b981',
      scoreGood: '#10b981',
      scoreAverage: '#f59e0b',
      scorePoor: '#ef4444',
    },
  },
  dark: {
    primary: '#60a5fa',
    background: '#090d16',
    surface: '#111827',
    text: '#f8fafc',
    muted: '#94a3b8',
    border: '#1e293b',
    success: '#34d399',
    warning: '#fbbf24',
    danger: '#f87171',
    info: '#38bdf8',
    charts: {
      critical: '#f87171',
      high: '#fb923c',
      medium: '#fbbf24',
      low: '#60a5fa',
      info: '#34d399',
      scoreGood: '#34d399',
      scoreAverage: '#fbbf24',
      scorePoor: '#f87171',
    },
  },
}

export const getSeverityColor = (severity: string, isDark: boolean = false): string => {
  const mode = isDark ? 'dark' : 'light'
  const charts = THEME_CONFIG[mode].charts
  switch (severity?.toUpperCase()) {
    case 'CRITICAL':
      return charts.critical
    case 'HIGH':
      return charts.high
    case 'MEDIUM':
      return charts.medium
    case 'LOW':
      return charts.low
    case 'INFO':
    default:
      return charts.info
  }
}

export const getHealthScoreColor = (score: number, isDark: boolean = false): string => {
  const mode = isDark ? 'dark' : 'light'
  const charts = THEME_CONFIG[mode].charts
  if (score >= 80) return charts.scoreGood
  if (score >= 50) return charts.scoreAverage
  return charts.scorePoor
}
