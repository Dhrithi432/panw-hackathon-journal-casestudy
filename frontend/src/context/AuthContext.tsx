import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (username: string, email: string) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  useSupabase: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function toAppUser(sbUser: { id: string; email?: string; user_metadata?: Record<string, unknown> }): User {
  return {
    id: sbUser.id,
    email: sbUser.email || '',
    username: (sbUser.user_metadata?.username as string) || sbUser.email?.split('@')[0] || 'User',
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(!!isSupabaseConfigured());

  useEffect(() => {
    if (!supabase) {
      const saved = localStorage.getItem('mindspace-user');
      setUser(saved ? JSON.parse(saved) : null);
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ? toAppUser(session.user) : null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? toAppUser(session.user) : null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user && !isSupabaseConfigured()) {
      localStorage.setItem('mindspace-user', JSON.stringify(user));
    } else if (!user && !isSupabaseConfigured()) {
      localStorage.removeItem('mindspace-user');
    }
  }, [user]);

  const login = (username: string, email: string) => {
    setUser({ id: `user-${Date.now()}`, username, email });
  };

  const signIn = async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase not configured');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, username: string) => {
    if (!supabase) throw new Error('Supabase not configured');
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    });
    if (error) throw error;
  };

  const logout = async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    if (!isSupabaseConfigured()) localStorage.removeItem('mindspace-user');
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    signIn,
    signUp,
    logout,
    useSupabase: isSupabaseConfigured(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
