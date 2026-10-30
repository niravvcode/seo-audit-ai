import React from 'react'

export interface BadgeProps {
  children: React.ReactNode
  variant?: 'critical' | 'high' | 'medium' | 'low' | 'info' | 'success' | 'warning' | 'default'
  size?: 'xs' | 'sm' | 'md'
  className?: string
  dot?: boolean
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'sm',
  className = '',
  dot = false,
}) => {
  const sizeStyles = {
    xs: 'px-1.5 py-0.5 text-[10px] font-medium leading-none',
    sm: 'px-2 py-0.5 text-xs font-medium',
    md: 'px-2.5 py-1 text-xs font-semibold',
  }

  const variantStyles = {
    critical: 'bg-danger-light text-danger border border-danger/20',
    high: 'bg-warning-light text-warning-dark border border-warning/20',
    medium: 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700/30',
    low: 'bg-surface-muted text-text-muted border border-border',
    info: 'bg-info-light text-info-dark border border-info/20',
    success: 'bg-success-light text-success-dark border border-success/20',
    warning: 'bg-warning-light text-warning-dark border border-warning/20',
    default: 'bg-surface-muted text-text-muted border border-border',
  }

  const dotColors = {
    critical: 'bg-danger',
    high: 'bg-warning',
    medium: 'bg-amber-500',
    low: 'bg-text-subtle',
    info: 'bg-info',
    success: 'bg-success',
    warning: 'bg-warning',
    default: 'bg-text-subtle',
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md font-mono ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />}
      {children}
    </span>
  )
}

export const SeverityBadge: React.FC<{ severity: string; size?: 'xs' | 'sm' | 'md' }> = ({ severity, size = 'sm' }) => {
  const s = severity?.toLowerCase()
  if (s === 'critical') return <Badge variant="critical" size={size} dot>Critical</Badge>
  if (s === 'high') return <Badge variant="high" size={size} dot>High</Badge>
  if (s === 'medium') return <Badge variant="medium" size={size} dot>Medium</Badge>
  if (s === 'low') return <Badge variant="low" size={size} dot>Low</Badge>
  return <Badge variant="info" size={size} dot>Info</Badge>
}

export const StatusBadge: React.FC<{ status: string; size?: 'xs' | 'sm' | 'md' }> = ({ status, size = 'sm' }) => {
  const s = status?.toLowerCase()
  if (s === 'resolved') return <Badge variant="success" size={size} dot>Resolved</Badge>
  if (s === 'in_progress') return <Badge variant="high" size={size} dot>In Progress</Badge>
  if (s === 'ignored') return <Badge variant="default" size={size}>Ignored</Badge>
  return <Badge variant="low" size={size} dot>Open</Badge>
}
