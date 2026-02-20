import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider, useAuth } from '@/context/AuthContext'

const TestConsumer = () => {
  const { user, isAuthenticated, login, logout } = useAuth()
  return (
    <div>
      <span data-testid="authenticated">{String(isAuthenticated)}</span>
      <span data-testid="username">{user?.username ?? 'none'}</span>
      <button onClick={() => login('jane', 'jane@test.com')}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('provides unauthenticated state initially', () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    )
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
    expect(screen.getByTestId('username')).toHaveTextContent('none')
  })

  it('login updates user and isAuthenticated', async () => {
    const user = userEvent.setup()
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    )
    await user.click(screen.getByText('Login'))
    expect(screen.getByTestId('authenticated')).toHaveTextContent('true')
    expect(screen.getByTestId('username')).toHaveTextContent('jane')
  })

  it('persists user to localStorage', async () => {
    const user = userEvent.setup()
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    )
    await user.click(screen.getByText('Login'))
    const saved = localStorage.getItem('mindspace-user')
    expect(saved).toBeTruthy()
    const parsed = JSON.parse(saved!)
    expect(parsed.username).toBe('jane')
    expect(parsed.email).toBe('jane@test.com')
  })

  it('logout clears user', async () => {
    const user = userEvent.setup()
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    )
    await user.click(screen.getByText('Login'))
    expect(screen.getByTestId('authenticated')).toHaveTextContent('true')
    await user.click(screen.getByText('Logout'))
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
    expect(screen.getByTestId('username')).toHaveTextContent('none')
  })

  it('useAuth throws when used outside provider', () => {
    expect(() => render(<TestConsumer />)).toThrow('useAuth must be used within AuthProvider')
  })
})
