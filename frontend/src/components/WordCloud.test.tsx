import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WordCloud } from '@/components/WordCloud'
import { ThemeProvider } from '@/context/ThemeContext'

const defaultProps = {
  central_theme: 'Work Stress',
  central_emoji: '💼',
  description: 'Your central theme',
  related_words: [
    { word: 'work', size: 5 },
    { word: 'deadline', size: 4 },
    { word: 'relax', size: 3 },
  ],
  theme_color: '#9333ea',
}

const renderWordCloud = () =>
  render(
    <ThemeProvider>
      <WordCloud {...defaultProps} />
    </ThemeProvider>
  )

describe('WordCloud', () => {
  it('renders central theme and emoji', () => {
    renderWordCloud()
    expect(screen.getByText('Work Stress')).toBeInTheDocument()
    expect(screen.getByText('💼')).toBeInTheDocument()
  })

  it('renders description', () => {
    renderWordCloud()
    expect(screen.getByText('Your central theme')).toBeInTheDocument()
  })

  it('renders all related words', () => {
    renderWordCloud()
    expect(screen.getByText('work')).toBeInTheDocument()
    expect(screen.getByText('deadline')).toBeInTheDocument()
    expect(screen.getByText('relax')).toBeInTheDocument()
  })

  it('renders with empty related_words', () => {
    render(
      <ThemeProvider>
        <WordCloud {...defaultProps} related_words={[]} />
      </ThemeProvider>
    )
    expect(screen.getByText('Work Stress')).toBeInTheDocument()
  })
})
