import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from './card'
import { ThemeProvider } from '@/context/ThemeContext'

const renderCard = () =>
  render(
    <ThemeProvider>
      <Card>
        <CardHeader>
          <CardTitle>Test Title</CardTitle>
          <CardDescription>Test description</CardDescription>
        </CardHeader>
        <CardContent>Content here</CardContent>
        <CardFooter>Footer here</CardFooter>
      </Card>
    </ThemeProvider>
  )

describe('Card components', () => {
  it('renders Card with all subcomponents', () => {
    renderCard()
    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Test description')).toBeInTheDocument()
    expect(screen.getByText('Content here')).toBeInTheDocument()
    expect(screen.getByText('Footer here')).toBeInTheDocument()
  })
})
