import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, useTheme } from '@/context/ThemeContext'

const TestConsumer = () => {
  const { theme, toggleTheme, isDark } = useTheme()
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="isDark">{String(isDark)}</span>
      <button onClick={toggleTheme}>Toggle</button>
    </div>
  )
}

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('provides theme state', () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    )
    expect(screen.getByTestId('theme')).toBeInTheDocument()
    expect(['light', 'dark']).toContain(screen.getByTestId('theme').textContent)
  })

  it('toggleTheme switches between light and dark', async () => {
    const user = userEvent.setup()
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    )
    const themeEl = screen.getByTestId('theme')
    const initial = themeEl.textContent
    await user.click(screen.getByText('Toggle'))
    expect(themeEl.textContent).not.toBe(initial)
    await user.click(screen.getByText('Toggle'))
    expect(themeEl.textContent).toBe(initial)
  })

  it('persists theme to localStorage', async () => {
    const user = userEvent.setup()
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    )
    await user.click(screen.getByText('Toggle'))
    expect(localStorage.getItem('mindspace-theme')).toBeTruthy()
  })

  it('useTheme throws when used outside provider', () => {
    expect(() => render(<TestConsumer />)).toThrow('useTheme must be used within ThemeProvider')
  })
})
