import React from 'react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  isLoading?: boolean
  icon?: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed select-none rounded-lg'

  const sizeStyles = {
    xs: 'px-2.5 py-1 text-xs gap-1.5 h-7',
    sm: 'px-3 py-1.5 text-xs gap-1.5 h-8',
    md: 'px-3.5 py-2 text-sm gap-2 h-9',
    lg: 'px-4 py-2.5 text-sm gap-2 h-10',
  }

  const variantStyles = {
    primary: 'bg-primary text-text-inverse hover:bg-primary-hover shadow-sm active:scale-[0.98]',
    secondary: 'bg-surface-muted text-text hover:bg-surface-hover border border-border active:scale-[0.98]',
    danger: 'bg-danger text-text-inverse hover:bg-danger-dark shadow-sm active:scale-[0.98]',
    outline: 'border border-border bg-surface hover:bg-surface-hover hover:border-text-subtle text-text shadow-sm active:scale-[0.98]',
    ghost: 'hover:bg-surface-hover text-text-muted hover:text-text active:scale-[0.98]',
  }

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin -ml-0.5 mr-2 h-3.5 w-3.5 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      <span>{children}</span>
    </button>
  )
}
