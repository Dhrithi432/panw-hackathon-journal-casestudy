import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { InsightsPage } from '@/pages/InsightsPage'
import { ThemeProvider } from '@/context/ThemeContext'
import * as api from '@/services/api'

vi.mock('@/services/api', () => ({
  apiService: {
    generateUnifiedInsights: vi.fn(),
  },
}))

const renderInsightsPage = () =>
  render(
    <ThemeProvider>
      <InsightsPage />
    </ThemeProvider>
  )

describe('InsightsPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('shows empty state when no sessions', async () => {
    renderInsightsPage()
    await waitFor(() => {
      expect(screen.getByText(/no insights yet/i)).toBeInTheDocument()
    })
  })

  it('shows loading then insights when sessions exist', async () => {
    const messages = [
      { id: '1', role: 'user', content: 'Work stress', timestamp: new Date().toISOString() },
    ]
    localStorage.setItem('mindspace-session-s1', JSON.stringify(messages))

    vi.mocked(api.apiService.generateUnifiedInsights).mockResolvedValue({
      central_theme: 'Work Stress',
      central_emoji: '💼',
      theme_description: 'Your theme',
      theme_color: '#9333ea',
      related_words: [{ word: 'work', size: 5 }],
      core_themes: [],
      connections: [],
      narrative: 'Narrative',
      hidden_pattern: 'Pattern',
      future_prompt: 'Question?',
    })

    renderInsightsPage()
    await waitFor(
      () => {
        expect(screen.getByText(/work stress/i)).toBeInTheDocument()
      },
      { timeout: 3000 }
    )
  })
})
