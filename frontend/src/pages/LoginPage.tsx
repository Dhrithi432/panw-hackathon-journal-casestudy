import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';

export const LoginPage: React.FC = () => {
  const { login, signIn, signUp, useSupabase } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validateSupabaseForm = () => {
    const e: Record<string, string> = {};
    if (!email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Invalid email';
    if (!password) e.password = 'Password is required';
    else if (mode === 'signup' && password.length < 6) e.password = 'Password must be at least 6 characters';
    if (mode === 'signup' && !username.trim()) e.username = 'Username is required';
    else if (mode === 'signup' && username.length < 3) e.username = 'Username must be at least 3 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateDemoForm = () => {
    const e: Record<string, string> = {};
    if (!username.trim()) e.username = 'Username is required';
    else if (username.length < 3) e.username = 'Username must be at least 3 characters';
    if (!email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Invalid email';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSupabaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSupabaseForm()) return;
    setLoading(true);
    setErrors({});
    try {
      if (mode === 'signin') await signIn(email, password);
      else await signUp(email, password, username);
    } catch (err: unknown) {
      setErrors({ form: (err as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateDemoForm()) login(username, email);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">safespace💜🤗</h1>
          <p className="opacity-70">Your Personal AI Journal Companion</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{useSupabase ? (mode === 'signin' ? 'Sign In' : 'Create Account') : 'Welcome Back'}</CardTitle>
            <CardDescription>
              {useSupabase ? 'Sign in with your account' : 'Enter your details to continue journaling'}
            </CardDescription>
          </CardHeader>

          {useSupabase ? (
            <form onSubmit={handleSupabaseSubmit} noValidate>
              <CardContent className="space-y-4">
                <Input
                  label="Email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={errors.email}
                />
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={errors.password}
                />
                {mode === 'signup' && (
                  <Input
                    label="Username"
                    type="text"
                    placeholder="Display name"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    error={errors.username}
                  />
                )}
                {errors.form && <p className="text-sm text-red-500">{errors.form}</p>}
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <Button type="submit" variant="primary" className="w-full" disabled={loading}>
                  {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Sign Up'}
                </Button>
                <button
                  type="button"
                  onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                  className="text-sm text-purple-600 hover:underline"
                >
                  {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                </button>
              </CardFooter>
            </form>
          ) : (
            <form onSubmit={handleDemoSubmit} noValidate>
              <CardContent className="space-y-4">
                <Input
                  label="Username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  error={errors.username}
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={errors.email}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit" variant="primary" className="w-full">
                  Sign In
                </Button>
              </CardFooter>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};
