import { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { ChatPage } from './pages/ChatPage';
import { EntriesPage } from './pages/EntriesPage';
import { InsightsPage } from './pages/InsightsPage';
import { useTheme } from './context/ThemeContext';
import { ThemeToggle } from './components/ThemeToggle';
import { Button } from './components/ui/button';
import { MessageSquare, BookOpen, BarChart3, LogOut } from 'lucide-react';
import { runMigration, hasLocalSessionsToMigrate, isMigrationComplete } from './services/migration';

type Page = 'chat' | 'entries' | 'insights';

function App() {
  const { isAuthenticated, user, logout, loading } = useAuth();
  const { isDark } = useTheme();
  const [currentPage, setCurrentPage] = useState<Page>('chat');
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'running' | 'done' | 'error'>('idle');
  const [migrationResult, setMigrationResult] = useState<{ imported: number; skipped: number; error?: string } | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user?.id || migrationStatus !== 'idle') return;
    if (!hasLocalSessionsToMigrate() || isMigrationComplete()) return;

    setMigrationStatus('running');
    runMigration(user.id)
      .then((res) => {
        setMigrationResult(res);
        setMigrationStatus(res.error ? 'error' : 'done');
      })
      .catch(() => setMigrationStatus('error'));
  }, [isAuthenticated, user?.id, migrationStatus]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg opacity-70">Loading…</p>
      </div>
    );
  }
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
        {migrationStatus === 'running' && (
          <div
            className="mb-4 rounded-lg px-4 py-3 text-sm"
            style={{ backgroundColor: '#9333ea20', color: '#9333ea' }}
          >
            Migrating your entries to the database…
          </div>
        )}
        {migrationStatus === 'done' && migrationResult && migrationResult.imported > 0 && (
          <div
            className="mb-4 rounded-lg px-4 py-3 text-sm"
            style={{ backgroundColor: '#10b98120', color: '#059669' }}
          >
            Migrated {migrationResult.imported} entries. {migrationResult.skipped > 0 && `${migrationResult.skipped} already in database.`}
          </div>
        )}
        {migrationStatus === 'error' && (
          <div
            className="mb-4 rounded-lg px-4 py-3 text-sm"
            style={{ backgroundColor: '#ef444420', color: '#dc2626' }}
          >
            Migration failed. Entries remain in local storage. {migrationResult?.error}
          </div>
        )}
        <div className="max-w-4xl mx-auto h-full">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}

export default App;