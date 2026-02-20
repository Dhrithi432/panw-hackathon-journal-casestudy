import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChatPage } from '@/pages/ChatPage'
import { AuthProvider } from '@/context/AuthContext'
import { ThemeProvider } from '@/context/ThemeContext'
import * as api from '@/services/api'

vi.mock('@/services/api', () => ({
  apiService: {
    getOpeningPrompt: vi.fn(),
    sendMessage: vi.fn(),
  },
}))

const renderChatPage = () =>
  render(
    <ThemeProvider>
      <AuthProvider>
        <ChatPage />
      </AuthProvider>
    </ThemeProvider>
  )

describe('ChatPage', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.mocked(api.apiService.getOpeningPrompt).mockResolvedValue("Hi! I'm Mira. What's on your mind?")
    vi.mocked(api.apiService.sendMessage).mockResolvedValue("I hear you. That sounds meaningful.")
  })

  it('shows loading initially then displays messages', async () => {
    renderChatPage()
    await waitFor(() => {
      expect(screen.getByText(/what's on your mind/i)).toBeInTheDocument()
    })
  })

  it('sends message when user types and submits', async () => {
    const user = userEvent.setup()
    renderChatPage()
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/type your thoughts here/i)).toBeInTheDocument()
    })
    const input = screen.getByPlaceholderText(/type your thoughts here/i)
    await user.type(input, 'Hello')
    const buttons = screen.getAllByRole('button')
    const sendBtn = buttons[buttons.length - 1]
    await user.click(sendBtn!)
    await waitFor(() => {
      expect(api.apiService.sendMessage).toHaveBeenCalled()
    })
  })
})
