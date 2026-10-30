import React from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  icon?: React.ReactNode
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  icon,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-text">
          {label}
        </label>
      )}
      <div className="relative rounded-lg shadow-sm">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-subtle">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={`w-full rounded-lg border bg-surface py-2 text-sm text-text placeholder:text-text-subtle transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent ${
            icon ? 'pl-9 pr-3' : 'px-3'
          } ${
            error
              ? 'border-danger focus:border-danger focus:ring-danger/20'
              : 'border-border hover:border-text-subtle'
          } ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-danger font-medium mt-1">{error}</p>}
      {helperText && !error && (
        <p className="text-xs text-text-muted mt-1 leading-relaxed">{helperText}</p>
      )}
    </div>
  )
}
