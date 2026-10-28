import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Button } from '../components/ui/Button'

describe('Button component', () => {
  it('renders children correctly', () => {
    render(<Button>Click Me</Button>)
    expect(screen.getByText('Click Me')).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Submit</Button>)
    fireEvent.click(screen.getByText('Submit'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('disables button when isLoading is true', () => {
    render(<Button isLoading>Processing</Button>)
    const btn = screen.getByRole('button')
    expect(btn).toBeDisabled()
  })

  it('renders primary variant styles', () => {
    render(<Button variant="primary">Primary Action</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('bg-primary')
  })
})
