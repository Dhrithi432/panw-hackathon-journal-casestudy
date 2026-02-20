import { describe, it, expect } from 'vitest'
import { cn, formatDate, generateId, truncateMessages, splitForSummarization, MAX_CONTEXT_MESSAGES } from './utils'

describe('cn', () => {
  it('merges class names correctly', () => {
    expect(cn('foo', 'bar')).toContain('foo')
    expect(cn('foo', 'bar')).toContain('bar')
  })

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', true && 'visible')).toContain('visible')
  })
})

describe('formatDate', () => {
  it('formats a date with month, day, year, hour, minute', () => {
    const date = new Date('2024-01-15T14:30:00')
    const formatted = formatDate(date)
    expect(formatted).toMatch(/Jan/)
    expect(formatted).toMatch(/15/)
    expect(formatted).toMatch(/2024/)
    expect(formatted).toMatch(/\d{1,2}/) // hour
    expect(formatted).toMatch(/\d{1,2}/) // minute
  })
})

describe('generateId', () => {
  it('returns a string', () => {
    const id = generateId()
    expect(typeof id).toBe('string')
  })

  it('matches expected format (timestamp-random)', () => {
    const id = generateId()
    expect(id).toMatch(/^\d+-[a-z0-9]+$/)
  })

  it('generates unique ids', () => {
    const ids = new Set<string>()
    for (let i = 0; i < 100; i++) {
      ids.add(generateId())
    }
    expect(ids.size).toBe(100)
  })
})

describe('truncateMessages', () => {
  const msg = (i: number) => ({ role: i % 2 === 0 ? 'user' : 'assistant', content: `msg${i}` })

  it('returns all messages when under limit', () => {
    const messages = [msg(0), msg(1), msg(2)]
    expect(truncateMessages(messages)).toEqual(messages)
  })

  it('returns last N messages when over limit', () => {
    const messages = Array.from({ length: 50 }, (_, i) => msg(i))
    const result = truncateMessages(messages)
    expect(result).toHaveLength(MAX_CONTEXT_MESSAGES)
    expect(result[0]).toEqual(msg(20))
    expect(result[result.length - 1]).toEqual(msg(49))
  })

  it('returns empty array for empty input', () => {
    expect(truncateMessages([])).toEqual([])
  })

  it('uses custom max when provided', () => {
    const messages = Array.from({ length: 10 }, (_, i) => msg(i))
    expect(truncateMessages(messages, 5)).toHaveLength(5)
    expect(truncateMessages(messages, 5)[0]).toEqual(msg(5))
  })
})

describe('splitForSummarization', () => {
  const msg = (i: number) => ({ role: i % 2 === 0 ? 'user' : 'assistant', content: `m${i}` })

  it('returns empty old when under limit', () => {
    const messages = Array.from({ length: 10 }, (_, i) => msg(i))
    const { old, recent } = splitForSummarization(messages)
    expect(old).toHaveLength(0)
    expect(recent).toHaveLength(10)
  })

  it('splits old and recent when over limit', () => {
    const messages = Array.from({ length: 35 }, (_, i) => msg(i))
    const { old, recent } = splitForSummarization(messages)
    expect(old).toHaveLength(6)
    expect(recent).toHaveLength(29)
    expect(old[0]).toEqual(msg(0))
    expect(recent[0]).toEqual(msg(6))
    expect(recent[28]).toEqual(msg(34))
  })
})
