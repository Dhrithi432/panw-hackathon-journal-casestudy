import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  hasLocalSessionsToMigrate,
  isMigrationComplete,
  clearMigrationFlag,
  runMigration,
} from './migration'
import * as api from './api'
import * as storage from './storage'

vi.mock('@/services/api')
vi.mock('@/services/storage', () => ({
  storageService: {
    getSessionsFromStorage: vi.fn(),
  },
}))

describe('migration', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('hasLocalSessionsToMigrate', () => {
    it('returns false when no sessions', () => {
      expect(hasLocalSessionsToMigrate()).toBe(false)
    })
    it('returns true when sessions exist', () => {
      localStorage.setItem('mindspace-session-abc', JSON.stringify([{ role: 'user', content: 'Hi' }]))
      expect(hasLocalSessionsToMigrate()).toBe(true)
    })
  })

  describe('isMigrationComplete', () => {
    it('returns false by default', () => {
      expect(isMigrationComplete()).toBe(false)
    })
    it('returns true when flag set', () => {
      localStorage.setItem('mindspace-migrated', 'true')
      expect(isMigrationComplete()).toBe(true)
    })
  })

  describe('clearMigrationFlag', () => {
    it('removes the migrated flag', () => {
      localStorage.setItem('mindspace-migrated', 'true')
      clearMigrationFlag()
      expect(localStorage.getItem('mindspace-migrated')).toBeNull()
    })
  })

  describe('runMigration', () => {
    it('returns early when no sessions to migrate', async () => {
      vi.mocked(storage.storageService.getSessionsFromStorage).mockReturnValue([])
      const result = await runMigration('user-1')
      expect(result).toEqual({ imported: 0, skipped: 0, done: true })
      expect(api.apiService.migrateSessions).not.toHaveBeenCalled()
    })

    it('returns early when migration already complete', async () => {
      localStorage.setItem('mindspace-migrated', 'true')
      const result = await runMigration('user-1')
      expect(result).toEqual({ imported: 0, skipped: 0, done: true })
      expect(api.apiService.migrateSessions).not.toHaveBeenCalled()
    })

    it('imports sessions in batches and clears localStorage on success', async () => {
      localStorage.setItem('mindspace-session-s1', JSON.stringify([{ id: 'm1', role: 'user', content: 'Hi', timestamp: new Date() }]))
      localStorage.setItem('mindspace-session-s2', JSON.stringify([{ id: 'm2', role: 'user', content: 'Hello', timestamp: new Date() }]))

      const sessions = [
        {
          id: 's1',
          title: 'One',
          messages: [{ id: 'm1', role: 'user', content: 'Hi', timestamp: new Date() }],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 's2',
          title: 'Two',
          messages: [{ id: 'm2', role: 'user', content: 'Hello', timestamp: new Date() }],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]
      vi.mocked(storage.storageService.getSessionsFromStorage).mockReturnValue(sessions)
      vi.mocked(api.apiService.migrateSessions).mockResolvedValue({ imported: 2, skipped: 0 })

      const result = await runMigration('user-1')

      expect(result).toEqual({ imported: 2, skipped: 0, done: true })
      expect(api.apiService.migrateSessions).toHaveBeenCalledTimes(1)
      expect(api.apiService.migrateSessions).toHaveBeenCalledWith('user-1', expect.any(Array))
      expect(localStorage.getItem('mindspace-migrated')).toBe('true')
      expect(localStorage.getItem('mindspace-session-s1')).toBeNull()
      expect(localStorage.getItem('mindspace-session-s2')).toBeNull()
    })

    it('retries on failure then returns error', async () => {
      localStorage.setItem('mindspace-session-s1', JSON.stringify([{ id: 'm1', role: 'user', content: 'Hi', timestamp: new Date() }]))

      const sessions = [
        {
          id: 's1',
          title: 'One',
          messages: [{ id: 'm1', role: 'user', content: 'Hi', timestamp: new Date() }],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]
      vi.mocked(storage.storageService.getSessionsFromStorage).mockReturnValue(sessions)
      vi.mocked(api.apiService.migrateSessions).mockRejectedValue(new Error('Network error'))

      const result = await runMigration('user-1')

      expect(result.done).toBe(false)
      expect(result.error).toBe('Network error')
      expect(result.imported).toBe(0)
      expect(api.apiService.migrateSessions).toHaveBeenCalledTimes(3)
    })
  })
})
