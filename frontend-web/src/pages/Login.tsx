import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../lib/api';
import { useAuthStore } from '../state/authStore';
import { Lock, User as UserIcon, Mail, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { InstallPwaInline } from '../components/InstallPwaPrompt';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  const [mode, setMode] = useState<'login' | 'register' | 'guest'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
        msg = 'Game server is waking up on free tier (~30-50s). Please tap button again.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c8c0f7] via-[#e2d5f8] to-[#fed4e2] flex flex-col justify-center items-center px-4 py-10 font-sans">
      <div className="w-full max-w-[430px]">
        {/* Floating Clay Tablet (Image 2 style) */}
        <div className="card-clay p-7 sm:p-9 text-center relative shadow-[0_20px_60px_rgba(130,110,210,0.22)]">
          {/* Top Brand Pill Icon */}
          <div className="inline-flex w-16 h-16 rounded-[24px] bg-gradient-to-tr from-[#f8788a] via-[#e271a5] to-[#8b7fe8] items-center justify-center font-extrabold text-3xl text-white shadow-[0_10px_25px_rgba(240,115,145,0.38)] mb-4">
            B
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2a2050] tracking-tight">
            {mode === 'login' ? 'Welcome Back!' : mode === 'register' ? 'Create Account' : 'Play as Guest'}
          </h1>
          <p className="text-xs sm:text-sm font-medium text-[#7e749c] mt-1 mb-6">
            {mode === 'login'
              ? 'Login to continue your games'
              : mode === 'register'
              ? 'Join the multiplayer fun'
              : 'Jump straight into a match with no sign-in'}
          </p>

          {/* Pill Mode Switcher */}
          <div className="flex bg-[#f4effc] p-1 rounded-full mb-6 text-xs font-bold">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); }}
              className={`flex-1 py-2 rounded-full transition-all ${
                mode === 'login'
                  ? 'bg-white text-[#2a2050] shadow-sm'
                  : 'text-[#7e749c] hover:text-[#2a2050]'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(null); }}
              className={`flex-1 py-2 rounded-full transition-all ${
                mode === 'register'
                  ? 'bg-white text-[#2a2050] shadow-sm'
                  : 'text-[#7e749c] hover:text-[#2a2050]'
              }`}
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={() => { setMode('guest'); setError(null); }}
              className={`flex-1 py-2 rounded-full transition-all ${
                mode === 'guest'
                  ? 'bg-white text-[#2a2050] shadow-sm'
                  : 'text-[#7e749c] hover:text-[#2a2050]'
              }`}
            >
              Guest
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-[#fee8ea] border border-[#fcd3d7] rounded-2xl text-[#dc2626] text-xs font-semibold text-center animate-in fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
            {mode === 'guest' && (
              <div>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-[#8b7fe8] absolute left-4 top-4" />
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Guest Nickname (e.g. Alex)"
                    className="input-clay pl-11"
                  />
                </div>
              </div>
            )}

            {(mode === 'login' || mode === 'register') && (
              <div>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-[#8b7fe8] absolute left-4 top-4" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    className="input-clay pl-11"
                  />
                </div>
              </div>
            )}

            {mode === 'register' && (
              <div>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8b7fe8] absolute left-4 top-4" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address"
                    className="input-clay pl-11"
                  />
                </div>
              </div>
            )}

            {(mode === 'login' || mode === 'register') && (
              <div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8b7fe8] absolute left-4 top-4" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="input-clay pl-11 pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-4 text-[#7e749c] hover:text-[#2a2050] transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Signature Gradient Button from Image 2 */}
            <button
              type="submit"
              disabled={loading}
              className="btn-gradient w-full py-3.5 text-base mt-2 shadow-[0_10px_25px_rgba(240,115,145,0.38)] cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span className="flex items-center space-x-2">
                  <span>{mode === 'guest' ? 'Play Now' : mode === 'login' ? 'Login' : 'Sign Up'}</span>
                  <ArrowRight className="w-4 h-4 ml-1 stroke-[2.5]" />
                </span>
              )}
            </button>

            {slowNotice && (
              <div className="p-3 bg-[#f0ecfc] border border-[#e0d6f8] rounded-2xl text-[#6d5ebd] text-xs font-semibold flex items-center justify-center space-x-2 animate-in fade-in">
                <div className="w-2 h-2 rounded-full bg-[#8b7fe8] animate-ping" />
                <span>Waking up free-tier server (~30s)... hang tight!</span>
              </div>
            )}
          </form>

          {/* Alternate action prompt */}
          <div className="mt-6 pt-5 border-t border-[#ede8f8] text-center text-xs text-[#7e749c] font-medium">
            {mode === 'login' ? (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('register'); setError(null); }}
                  className="font-bold text-[#8b7fe8] hover:text-[#7b6edc] hover:underline ml-1"
                >
                  Sign Up
                </button>
              </p>
            ) : mode === 'register' ? (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(null); }}
                  className="font-bold text-[#8b7fe8] hover:text-[#7b6edc] hover:underline ml-1"
                >
                  Login
                </button>
              </p>
            ) : (
              <p>
                Want to save your stats?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('register'); setError(null); }}
                  className="font-bold text-[#8b7fe8] hover:text-[#7b6edc] hover:underline ml-1"
                >
                  Create Account
                </button>
              </p>
            )}
          </div>
        </div>

        {/* PWA Install Button */}
        <div className="mt-5 text-center">
          <InstallPwaInline />
        </div>
      </div>
    </div>
  );
};
