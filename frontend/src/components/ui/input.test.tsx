import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from './input'
import { ThemeProvider } from '@/context/ThemeContext'

const renderInput = (props = {}) =>
  render(
    <ThemeProvider>
      <Input {...props} />
    </ThemeProvider>
  )

describe('Input', () => {
  it('renders input', () => {
    renderInput({ placeholder: 'Enter text' })
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
  })

  it('renders with label', () => {
    renderInput({ label: 'Username', id: 'user-input' })
    expect(screen.getByLabelText('Username')).toBeInTheDocument()
  })

  it('shows error message', () => {
    renderInput({ error: 'Invalid input' })
    expect(screen.getByText('Invalid input')).toBeInTheDocument()
  })

  it('accepts user input', async () => {
    const user = userEvent.setup()
    renderInput({ placeholder: 'Type here' })
    const input = screen.getByPlaceholderText('Type here')
    await user.type(input, 'hello')
    expect(input).toHaveValue('hello')
  })
})
