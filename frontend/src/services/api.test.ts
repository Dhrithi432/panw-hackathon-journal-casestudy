import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { apiService } from './api'

describe('apiService', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.stubGlobal('fetch', originalFetch)
  })

  describe('sendMessage', () => {
    it('sends POST request and returns message', async () => {
      const mockResponse = { message: 'Hi there!', timestamp: new Date().toISOString() }
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response)

      const result = await apiService.sendMessage(
        [{ role: 'user', content: 'Hello' }],
        'user-123'
      )

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/chat'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: 'Hello' }],
            user_id: 'user-123',
          }),
        })
      )
      expect(result).toBe('Hi there!')
    })

    it('throws when response is not ok', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({ ok: false } as Response)

      await expect(
        apiService.sendMessage([{ role: 'user', content: 'Hi' }], 'user-1')
      ).rejects.toThrow('Failed to send message')
    })
  })

  describe('getOpeningPrompt', () => {
    it('fetches and returns opening prompt', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: 'Welcome to Mira!' }),
      } as Response)

      const result = await apiService.getOpeningPrompt()

      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/opening-prompt'))
      expect(result).toBe('Welcome to Mira!')
    })

    it('throws when response is not ok', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({ ok: false } as Response)

      await expect(apiService.getOpeningPrompt()).rejects.toThrow(
        'Failed to get opening prompt'
      )
    })
  })

  describe('generateUnifiedInsights', () => {
    it('sends request and returns unified insights', async () => {
      const mockInsights = {
        central_theme: 'Stress',
        central_emoji: '😌',
        theme_description: 'desc',
        theme_color: '#9333ea',
        related_words: [{ word: 'work', size: 5 }],
        core_themes: [],
        connections: [],
        narrative: 'n',
        hidden_pattern: 'p',
        future_prompt: 'q',
      }
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockInsights),
      } as Response)

      const result = await apiService.generateUnifiedInsights({
        entries: [{ date: '2024-01-15', message_count: 1, sample_messages: ['Hi'] }],
        total_days_active: 1,
        total_messages: 1,
      })

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/insights/unified'),
        expect.objectContaining({ method: 'POST' })
      )
      expect(result).toEqual(mockInsights)
    })

    it('throws when response is not ok', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({ ok: false } as Response)

      await expect(
        apiService.generateUnifiedInsights({
          entries: [],
          total_days_active: 0,
          total_messages: 0,
        })
      ).rejects.toThrow('Failed to generate insights')
    })
  })
})
