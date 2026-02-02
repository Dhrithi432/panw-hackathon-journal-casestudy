import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { ChatPage } from './pages/ChatPage';
import { EntriesPage } from './pages/EntriesPage';
import { InsightsPage } from './pages/InsightsPage';
import { useTheme } from './context/ThemeContext';
import { ThemeToggle } from './components/ThemeToggle';
import { Button } from './components/ui/button';
import { MessageSquare, BookOpen, BarChart3, LogOut } from 'lucide-react';

type Page = 'chat' | 'entries' | 'insights';

function App() {
  const { isAuthenticated, user, logout } = useAuth();
  const { isDark } = useTheme();
  const [currentPage, setCurrentPage] = useState<Page>('chat');

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const navItems = [
    { id: 'chat' as Page, icon: <MessageSquare className="h-5 w-5" />, label: 'New Entry' },
    { id: 'entries' as Page, icon: <BookOpen className="h-5 w-5" />, label: 'My Entries' },
    { id: 'insights' as Page, icon: <BarChart3 className="h-5 w-5" />, label: 'Insights' },
  ];

  const renderPage = () => {
    switch (currentPage) {
      case 'chat':
        return <ChatPage />;
      case 'entries':
        return <EntriesPage />;
      case 'insights':
        return <InsightsPage />;
      default:
        return <ChatPage />;
    }
  };

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
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors w-full text-left"
              style={{
                backgroundColor: currentPage === item.id 
                  ? (isDark ? '#374151' : '#f3f4f6')
                  : 'transparent',
                color: currentPage === item.id 
                  ? '#9333ea'
                  : (isDark ? '#d1d5db' : '#6b7280'),
              }}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </button>
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
          {renderPage()}
        </div>
      </main>
    </div>
  );
}

export default App;