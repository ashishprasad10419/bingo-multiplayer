import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../lib/api';
import { useAuthStore } from '../state/authStore';
import { Lock, User as UserIcon, Mail, ArrowRight } from 'lucide-react';
import { InstallPwaInline } from '../components/InstallPwaPrompt';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  const [mode, setMode] = useState<'login' | 'register' | 'guest'>('guest');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [guestName, setGuestName] = useState('');
  const [loading, setLoading] = useState(false);
  const [slowNotice, setSlowNotice] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (!loading) {
      setSlowNotice(false);
      return;
    }
    const timer = setTimeout(() => setSlowNotice(true), 3000);
    return () => clearTimeout(timer);
  }, [loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'guest') {
        if (!guestName.trim()) {
          setError('Please enter a display name');
          setLoading(false);
          return;
        }
        const data = await authApi.guest(guestName.trim());
        setUser(data.user);
        navigate('/');
      } else if (mode === 'login') {
        const data = await authApi.login(username.trim(), password);
        setUser(data.user);
        navigate('/');
      } else if (mode === 'register') {
        const data = await authApi.register(username.trim(), email.trim(), password);
        setUser(data.user);
        navigate('/');
      }
    } catch (err: any) {
      let msg = err.response?.data?.message || err.message || 'Authentication failed';
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout') || err.message?.includes('Network Error')) {
        msg = 'Game server is waking up on free tier (~30-50s). Please tap Sign In again.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/50 to-indigo-50/40 flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 items-center justify-center font-black text-3xl text-white shadow-lg shadow-blue-500/25 mb-3">
            B
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Welcome to Bingo
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time multiplayer Bingo matches with friends
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/95 border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-sm backdrop-blur-md">
          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-3 gap-1 bg-slate-100/90 p-1 rounded-2xl mb-6 text-xs font-bold">
            <button
              type="button"
              onClick={() => { setMode('guest'); setError(null); }}
              className={`py-2 rounded-xl transition ${
                mode === 'guest'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Guest Play
            </button>
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); }}
              className={`py-2 rounded-xl transition ${
                mode === 'login'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(null); }}
              className={`py-2 rounded-xl transition ${
                mode === 'register'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Register
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-semibold text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'guest' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Guest Nickname
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="e.g. Alex"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  No account required! Jump straight into games.
                </p>
              </div>
            )}

            {(mode === 'login' || mode === 'register') && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>
              </div>
            )}

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>
              </div>
            )}

            {(mode === 'login' || mode === 'register') && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-black py-3 rounded-2xl shadow-md shadow-blue-500/20 flex items-center justify-center space-x-2 transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    {mode === 'guest' ? 'Play as Guest' : mode === 'login' ? 'Sign In' : 'Create Account'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {slowNotice && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-blue-800 text-xs font-semibold flex items-center justify-center space-x-2 animate-in fade-in">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                <span>Waking up free-tier server (~30s)... hang tight!</span>
              </div>
            )}
          </form>
        </div>

        {/* Subtle install link on login page */}
        <div className="mt-5 text-center">
          <InstallPwaInline />
        </div>
      </div>
    </div>
  );
};
