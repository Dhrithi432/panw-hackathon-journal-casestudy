import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { ChatPage } from './pages/ChatPage';
import { EntriesPage } from './pages/EntriesPage';
import { InsightsPage } from './pages/InsightsPage';
import { Layout } from './components/Layouts';

function App() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/entries" element={<EntriesPage />} />
          <Route path="/insights" element={<InsightsPage />} />
          <Route path="/" element={<Navigate to="/chat" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;