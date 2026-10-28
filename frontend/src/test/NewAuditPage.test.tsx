import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import { NewAuditPage } from '../pages/NewAuditPage'

describe('NewAuditPage', () => {
  it('renders target URL input and launch button', () => {
    render(
      <BrowserRouter>
        <NewAuditPage />
      </BrowserRouter>
    )

    expect(screen.getByLabelText(/Target Website URL/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Launch SEO Audit/i })).toBeInTheDocument()
  })

  it('validates empty URL input on form submission', () => {
    const { container } = render(
      <BrowserRouter>
        <NewAuditPage />
      </BrowserRouter>
    )

    const form = container.querySelector('form')!
    fireEvent.submit(form)

    expect(screen.getByText(/Please enter a target website URL/i)).toBeInTheDocument()
  })

  it('validates and rejects localhost for SSRF protection', () => {
    const { container } = render(
      <BrowserRouter>
        <NewAuditPage />
      </BrowserRouter>
    )

    const input = screen.getByLabelText(/Target Website URL/i)
    fireEvent.change(input, { target: { value: 'http://localhost:8000' } })

    const form = container.querySelector('form')!
    fireEvent.submit(form)

    expect(
      screen.getByText(/Localhost and private internal network addresses are forbidden/i)
    ).toBeInTheDocument()
  })
})
