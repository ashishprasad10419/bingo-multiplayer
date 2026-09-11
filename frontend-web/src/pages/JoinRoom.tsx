import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import { roomApi, authApi } from '../lib/api';
import { useGameStore } from '../state/gameStore';
import { useAuthStore } from '../state/authStore';
import { ArrowLeft, LogIn, Hash, Sparkles, User as UserIcon } from 'lucide-react';

export const JoinRoom: React.FC = () => {
  const navigate = useNavigate();
  const { code: urlParamCode } = useParams<{ code: string }>();
  const [searchParams] = useSearchParams();
  const queryCode = searchParams.get('code');

  const initialCode = (urlParamCode || queryCode || '').trim().toUpperCase();

  const { user, setUser } = useAuthStore();
  const { setRoom, resetGame } = useGameStore();

  const [code, setCode] = useState(initialCode);
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoJoining, setAutoJoining] = useState(false);

  // Auto-join if user is already logged in and code is provided in URL
  useEffect(() => {
    if (initialCode.length === 6 && user && !autoJoining) {
      setAutoJoining(true);
      joinWithCode(initialCode);
    }
  }, [initialCode, user]);

  const joinWithCode = async (targetCode: string) => {
    setLoading(true);
    setError(null);

    try {
      resetGame();
      const room = await roomApi.joinRoom(targetCode);
      setRoom(room);
      navigate(`/lobby/${targetCode}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to join room. Please check the code or room status.');
      setAutoJoining(false);
    } finally {
      setLoading(false);
    }
  };

  const handleManualJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode.length !== 6) {
      setError('Room code must be 6 characters');
      return;
    }

    // If user is not authenticated yet, register guest first
    if (!user) {
      if (!nickname.trim()) {
        setError('Please enter a display name to join');
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const authData = await authApi.guest(nickname.trim());
        setUser(authData.user);
        // After guest auth, join the room
        await joinWithCode(cleanCode);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to initialize player session');
        setLoading(false);
      }
      return;
    }

    await joinWithCode(cleanCode);
  };

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-6 font-sans">
      <button
        onClick={() => navigate('/')}
        className="btn-pill-outline text-xs px-4 py-2 space-x-1.5 cursor-pointer mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </button>

      <div className="card-clay p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-[24px] bg-[#f0ecfc] border border-[#e0d6f8] flex items-center justify-center mx-auto mb-3 text-[#8b7fe8] shadow-xs">
            {initialCode ? <Sparkles className="w-8 h-8 text-[#8b7fe8]" /> : <LogIn className="w-8 h-8" />}
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2a2050] tracking-tight">
            {initialCode ? "You're Invited to Play!" : 'Join Room'}
          </h2>
          <p className="text-xs sm:text-sm font-medium text-[#7e749c] mt-1">
            {initialCode
              ? `Your friend invited you to match #${initialCode}`
              : 'Enter the 6-character room code from your friend to jump in'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3.5 bg-[#fee8ea] border border-[#fcd3d7] rounded-2xl text-[#dc2626] text-xs font-semibold text-center shadow-2xs">
            {error}
          </div>
        )}

        {autoJoining && loading ? (
          <div className="py-8 flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 border-3 border-[#8b7fe8] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-bold text-[#2a2050]">Joining Room #{initialCode}...</p>
          </div>
        ) : (
          <form onSubmit={handleManualJoin} className="space-y-4">
            {/* Room Code field */}
            <div>
              <label className="block text-xs font-extrabold text-[#2a2050] mb-2 text-center uppercase tracking-wider">
                6-Character Room Code
              </label>
              <div className="relative">
                <Hash className="w-5 h-5 text-[#8b7fe8] absolute left-4 top-4" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="B7K4P2"
                  className="input-clay pl-12 text-center text-2xl font-mono font-extrabold tracking-widest text-[#2a2050] placeholder-[#b8aee0] uppercase"
                />
              </div>
            </div>

            {/* If friend is not logged in, ask for their Nickname */}
            {!user && (
              <div>
                <label className="block text-xs font-extrabold text-[#2a2050] mb-2 text-center uppercase tracking-wider">
                  Your Nickname
                </label>
                <div className="relative">
                  <UserIcon className="w-5 h-5 text-[#8b7fe8] absolute left-4 top-4" />
                  <input
                    type="text"
                    required
                    maxLength={20}
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="e.g. Alex"
                    className="input-clay pl-12 text-center text-base font-bold text-[#2a2050] placeholder-[#b8aee0]"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || code.trim().length !== 6 || (!user && !nickname.trim())}
              className="btn-gradient w-full py-4 text-base cursor-pointer disabled:opacity-50 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
              ) : (
                <span>{initialCode ? 'Join Match Now' : 'Enter Room'}</span>
              )}
            </button>

            {!user && (
              <div className="pt-2 text-center">
                <Link
                  to="/login"
                  state={{ from: initialCode ? `/join/${initialCode}` : '/join' }}
                  className="text-xs font-bold text-[#8b7fe8] hover:underline"
                >
                  Already have an account? Sign In
                </Link>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
};
