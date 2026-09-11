import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './state/authStore';
import { Navbar } from './components/Navbar';
import { Splash } from './pages/Splash';
import { Login } from './pages/Login';
import { Home } from './pages/Home';
import { CreateRoom } from './pages/CreateRoom';
import { JoinRoom } from './pages/JoinRoom';
import { Lobby } from './pages/Lobby';
import { BoardSetup } from './pages/BoardSetup';
import { Game } from './pages/Game';
import { Winner } from './pages/Winner';
import { Profile } from './pages/Profile';
import { Leaderboard } from './pages/Leaderboard';
import { GameHub } from './pages/GameHub';
import { useGameTheme } from './lib/useGameTheme';

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, logout } = useAuthStore();
  const [slowServerNotice, setSlowServerNotice] = React.useState(false);

  React.useEffect(() => {
    if (!isLoading) {
      setSlowServerNotice(false);
      return;
    }
    const timer = setTimeout(() => {
      setSlowServerNotice(true);
    }, 3500);
    return () => clearTimeout(timer);
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#d9d2fa] via-[#e8e2fc] to-[#fde2ea] p-4 text-center space-y-4 font-sans">
        <div className="w-16 h-16 rounded-[22px] bg-gradient-to-tr from-[#f8788a] via-[#e271a5] to-[#8b7fe8] flex items-center justify-center font-extrabold text-3xl text-white shadow-[0_10px_25px_rgba(240,115,145,0.35)] mb-2">
          B
        </div>
        <div className="w-8 h-8 border-3 border-[#8b7fe8] border-t-transparent rounded-full animate-spin"></div>
        <div className="space-y-1">
          <p className="text-base font-bold text-[#2a2050]">Connecting to Bingo...</p>
          {slowServerNotice && (
            <p className="text-xs text-[#7e749c] max-w-xs animate-in fade-in">
              Waking up free-tier server... Just a moment!
            </p>
          )}
        </div>
        {slowServerNotice && (
          <button
            onClick={() => logout()}
            className="btn-pill-outline text-xs px-5 py-2.5 mt-2"
          >
            Continue as Guest
          </button>
        )}
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const theme = useGameTheme();
  const hideNavbar = ['/splash', '/login', '/winner'].some((p) =>
    location.pathname.startsWith(p)
  );

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.bgGradient} text-[#2a2050] flex flex-col font-sans selection:bg-[#8b7fe8]/20 transition-colors duration-500`}>
      {!hideNavbar && <Navbar />}
      <main className="flex-1 pb-10">{children}</main>
    </div>
  );
};

export const App: React.FC = () => {
  const { initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
    // Proactively ping server in background to initiate cold-start wakeup immediately
    const apiBase = import.meta.env.VITE_API_BASE_URL || '/api';
    const healthUrl = apiBase.replace(/\/api\/?$/, '/actuator/health');
    fetch(healthUrl, { method: 'GET', mode: 'no-cors' }).catch(() => {});
  }, [initAuth]);

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/splash" element={<Splash />} />
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <GameHub />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hub"
            element={
              <ProtectedRoute>
                <GameHub />
              </ProtectedRoute>
            }
          />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-room"
            element={
              <ProtectedRoute>
                <CreateRoom />
              </ProtectedRoute>
            }
          />
          <Route
            path="/join-room"
            element={
              <ProtectedRoute>
                <JoinRoom />
              </ProtectedRoute>
            }
          />
          <Route path="/join" element={<JoinRoom />} />
          <Route path="/join/:code" element={<JoinRoom />} />
          <Route
            path="/lobby/:code"
            element={
              <ProtectedRoute>
                <Lobby />
              </ProtectedRoute>
            }
          />
          <Route
            path="/setup/:code"
            element={
              <ProtectedRoute>
                <BoardSetup />
              </ProtectedRoute>
            }
          />
          <Route
            path="/game/:code"
            element={
              <ProtectedRoute>
                <Game />
              </ProtectedRoute>
            }
          />
          <Route
            path="/winner/:gameId"
            element={
              <ProtectedRoute>
                <Winner />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute>
                <Leaderboard />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/splash" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};

export default App;
