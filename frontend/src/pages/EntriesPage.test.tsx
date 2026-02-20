import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EntriesPage } from '@/pages/EntriesPage'
import { AuthProvider } from '@/context/AuthContext'
import { ThemeProvider } from '@/context/ThemeContext'

const renderEntriesPage = () =>
  render(
    <ThemeProvider>
      <AuthProvider>
        <EntriesPage />
      </AuthProvider>
    </ThemeProvider>
  )

describe('EntriesPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('shows empty state when no sessions', () => {
    renderEntriesPage()
    expect(screen.getByText(/no journal entries yet/i)).toBeInTheDocument()
  })

  it('shows sessions when localStorage has data', async () => {
    const messages = [
      { id: '1', role: 'user', content: 'Hello', timestamp: new Date().toISOString() },
      { id: '2', role: 'assistant', content: 'Hi', timestamp: new Date().toISOString() },
    ]
    localStorage.setItem('mindspace-session-abc123', JSON.stringify(messages))

    renderEntriesPage()
    expect(await screen.findByText(/hello/i)).toBeInTheDocument()
  })

  it('delete removes session', async () => {
    const user = userEvent.setup()
    const messages = [
      { id: '1', role: 'user', content: 'Test entry', timestamp: new Date().toISOString() },
    ]
    localStorage.setItem('mindspace-session-xyz', JSON.stringify(messages))

    renderEntriesPage()
    expect(await screen.findByText(/test entry/i)).toBeInTheDocument()

    const deleteBtn = screen.getAllByRole('button').find((b) => !b.textContent?.includes('View'))
    await user.click(deleteBtn!)
    expect(localStorage.getItem('mindspace-session-xyz')).toBeNull()
  })
})
