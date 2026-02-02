import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { Button } from './ui/button';
import { useTheme } from '@/context/ThemeContext';
import { MessageSquare, BookOpen, BarChart3, LogOut } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const NavLink: React.FC<NavLinkProps> = ({ icon, label, isActive, onClick }) => {
  const { isDark } = useTheme();
  
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors w-full text-left"
      style={{
        backgroundColor: isActive 
          ? (isDark ? '#374151' : '#f3f4f6')
          : 'transparent',
        color: isActive 
          ? '#9333ea'
          : (isDark ? '#d1d5db' : '#6b7280'),
      }}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );
};

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/chat', icon: <MessageSquare className="h-5 w-5" />, label: 'New Entry' },
    { path: '/entries', icon: <BookOpen className="h-5 w-5" />, label: 'My Entries' },
    { path: '/insights', icon: <BarChart3 className="h-5 w-5" />, label: 'Insights' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside
        className="w-64 border-r p-6 flex flex-col"
        style={{
          backgroundColor: isDark ? '#1f2937' : '#ffffff',
          borderColor: isDark ? '#374151' : '#e5e7eb',
        }}
      >
        {/* Logo/Brand */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">safespace💜🤗</h1>
          <p className="text-sm opacity-70 mt-1">Welcome, {user?.username}</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              icon={item.icon}
              label={item.label}
              isActive={location.pathname === item.path}
              onClick={() => navigate(item.path)}
            />
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="space-y-2 pt-4 border-t"
          style={{ borderColor: isDark ? '#374151' : '#e5e7eb' }}
        >
          <ThemeToggle />
          <Button
            variant="ghost"
            onClick={logout}
            className="w-full justify-start"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto h-full">
          {children}
        </div>
      </main>
    </div>
  );
};