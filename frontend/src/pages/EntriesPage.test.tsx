import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
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
})