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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-sky-50/40 to-indigo-50/30 p-4 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-black text-2xl text-white shadow-xl shadow-blue-500/20 mb-2">
          B
        </div>
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-slate-800">Connecting to Bingo...</p>
          {slowServerNotice && (
            <p className="text-xs text-slate-500 max-w-xs animate-in fade-in">
              Server is waking up from idle sleep. This takes a few seconds on free tier.
            </p>
          )}
        </div>
        {slowServerNotice && (
          <button
            onClick={() => logout()}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold shadow-sm transition mt-2"
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
  const hideNavbar = ['/splash', '/login', '/winner'].some((p) =>
    location.pathname.startsWith(p)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/30 to-indigo-50/20 text-slate-800 flex flex-col">
      {!hideNavbar && <Navbar />}
      <main className="flex-1 pb-10">{children}</main>
    </div>
  );
};

export const App: React.FC = () => {
  const { initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
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
