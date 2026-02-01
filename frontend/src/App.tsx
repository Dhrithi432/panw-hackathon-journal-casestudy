import { ThemeToggle } from './components/ThemeToggle';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './components/ui/card';
import { Button } from './components/ui/button';

function App() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">
            MindSpace Journal
          </h1>
          <ThemeToggle />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome to MindSpace! 🎉</CardTitle>
            <CardDescription>
              Your personal AI journaling companion
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              This is a test to make sure our components and dark mode work properly!
            </p>
            <div className="flex gap-2">
              <Button variant="primary">Primary Button</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default App;