import { useState } from 'react'
import reactLogo from './assets/react.svg'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-svh bg-background text-foreground flex flex-col items-center justify-center p-6">
      <div className="mx-auto max-w-2xl w-full space-y-8 text-center">
        <div className="flex justify-center gap-4">
          <a
            href="https://vite.dev"
            target="_blank"
            rel="noreferrer"
            className="opacity-80 hover:opacity-100 transition-opacity"
          >
            <img src="/vite.svg" className="h-16 w-16" alt="Vite logo" />
          </a>
          <a
            href="https://react.dev"
            target="_blank"
            rel="noreferrer"
            className="opacity-80 hover:opacity-100 transition-opacity [&_img:hover]:drop-shadow-[0_0_2em_#61dafbaa]"
          >
            <img
              src={reactLogo}
              className="h-16 w-16 animate-[spin_20s_linear_infinite] motion-reduce:animate-none"
              alt="React logo"
            />
          </a>
        </div>

        <h1 className="text-4xl font-bold tracking-tight">
          Vite + React
        </h1>

        <Card>
          <CardHeader>
            <CardTitle>Counter</CardTitle>
            <CardDescription>
              Edit <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">src/App.tsx</code> and save to test HMR
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={() => setCount((c) => c + 1)} size="lg">
              count is {count}
            </Button>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">
              Click on the Vite and React logos to learn more
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default App
