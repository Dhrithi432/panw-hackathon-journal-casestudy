import { useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { ThemeToggle } from './components/ThemeToggle';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './components/ui/card';
import { Button } from './components/ui/button';

function App() {
  const { isAuthenticated, user, logout } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">MindSpace Journal</h1>
            <p className="text-sm opacity-70 mt-1">Welcome back, {user?.username}!</p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="secondary" onClick={logout} size="sm">
              Logout
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>You're logged in! 🎉</CardTitle>
            <CardDescription>
              Soon you'll be able to start journaling here
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>User ID:</strong> {user?.id}</p>
              <p><strong>Username:</strong> {user?.username}</p>
              <p><strong>Email:</strong> {user?.email}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default App;