import { useState, useEffect } from 'react';

function App() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <div className="min-h-screen bg-primary text-primary p-8">
      <h1 className="text-4xl mb-4 font-bold">
        MindSpace Journal
      </h1>
      <button
        onClick={() => setIsDark(!isDark)}
        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
      >
        {isDark ? '🌙 Dark Mode' : '☀️ Light Mode'}
      </button>
      
      <div className="mt-4 p-4 rounded-lg bg-secondary border border-custom">
        <p className="text-primary">This card should also change color</p>
        <p className="text-secondary text-sm mt-2">This is secondary text</p>
      </div>
    </div>
  );
}

export default App;