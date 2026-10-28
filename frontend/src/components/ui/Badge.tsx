import React from 'react'

export interface BadgeProps {
  children: React.ReactNode
  variant?: 'critical' | 'high' | 'medium' | 'low' | 'info' | 'success' | 'warning' | 'default'
  size?: 'sm' | 'md'
  className?: string
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs font-medium',
    md: 'px-2.5 py-1 text-xs font-semibold',
  }

  const variantStyles = {
    critical: 'bg-danger-light text-danger-dark border border-danger/20',
    high: 'bg-warning-light text-warning-dark border border-warning/20',
    medium: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400 border border-yellow-300 dark:border-yellow-700/30',
    low: 'bg-primary-light text-primary-dark border border-primary/20',
    info: 'bg-info-light text-info-dark border border-info/20',
    success: 'bg-success-light text-success-dark border border-success/20',
    warning: 'bg-warning-light text-warning-dark border border-warning/20',
    default: 'bg-surface-muted text-text-muted border border-border',
  }

  return (
    <span className={`inline-flex items-center gap-1 rounded-full uppercase tracking-wider ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  )
}

export const SeverityBadge: React.FC<{ severity: string; size?: 'sm' | 'md' }> = ({ severity, size = 'md' }) => {
  const s = severity?.toLowerCase()
  if (s === 'critical') return <Badge variant="critical" size={size}>Critical</Badge>
  if (s === 'high') return <Badge variant="high" size={size}>High</Badge>
  if (s === 'medium') return <Badge variant="medium" size={size}>Medium</Badge>
  if (s === 'low') return <Badge variant="low" size={size}>Low</Badge>
  return <Badge variant="info" size={size}>Info</Badge>
}

export const StatusBadge: React.FC<{ status: string; size?: 'sm' | 'md' }> = ({ status, size = 'md' }) => {
  const s = status?.toLowerCase()
  if (s === 'resolved') return <Badge variant="success" size={size}>Resolved</Badge>
  if (s === 'in_progress') return <Badge variant="high" size={size}>In Progress</Badge>
  if (s === 'ignored') return <Badge variant="default" size={size}>Ignored</Badge>
  return <Badge variant="low" size={size}>Open</Badge>
}
