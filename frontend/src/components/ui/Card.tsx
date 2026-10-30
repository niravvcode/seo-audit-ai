import React from 'react'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  ...props
}) => {
  return (
    <div
      className={`bg-surface border border-border rounded-xl shadow-sm transition-all duration-200 ${
        hover
          ? 'hover:border-border-focus/40 hover:shadow-md'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div className={`px-5 py-4 border-b border-border flex items-center justify-between ${className}`} {...props}>
    {children}
  </div>
)

export const CardBody: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div className={`p-5 ${className}`} {...props}>
    {children}
  </div>
)

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div className={`px-5 py-3.5 border-t border-border bg-surface-muted/50 rounded-b-xl flex items-center justify-between ${className}`} {...props}>
    {children}
  </div>
)
