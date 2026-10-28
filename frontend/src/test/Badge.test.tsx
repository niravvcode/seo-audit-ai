import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { SeverityBadge, StatusBadge } from '../components/ui/Badge'

describe('Badge components', () => {
  it('renders critical severity badge correctly', () => {
    render(<SeverityBadge severity="CRITICAL" />)
    const badge = screen.getByText('Critical')
    expect(badge).toBeInTheDocument()
    expect(badge.className).toContain('bg-danger-light')
  })

  it('renders high severity badge correctly', () => {
    render(<SeverityBadge severity="HIGH" />)
    expect(screen.getByText('High')).toBeInTheDocument()
  })

  it('renders resolved status badge correctly', () => {
    render(<StatusBadge status="RESOLVED" />)
    const badge = screen.getByText('Resolved')
    expect(badge).toBeInTheDocument()
    expect(badge.className).toContain('bg-success-light')
  })
})
