import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { roomApi } from '../lib/api';
import { useGameStore } from '../state/gameStore';
import { ArrowLeft, LogIn, Hash } from 'lucide-react';

export const JoinRoom: React.FC = () => {
  const navigate = useNavigate();
  const { setRoom, resetGame } = useGameStore();

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode.length !== 6) {
      setError('Room code must be 6 characters');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      resetGame();
      const room = await roomApi.joinRoom(cleanCode);
      setRoom(room);
      navigate(`/lobby/${cleanCode}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to join room. Please check the code.');
    } finally {
      setLoading(false);
    }
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
            <LogIn className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2a2050] tracking-tight">Join Room</h2>
          <p className="text-xs sm:text-sm font-medium text-[#7e749c] mt-1">
            Enter the 6-character room code from your friend to jump in
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3.5 bg-[#fee8ea] border border-[#fcd3d7] rounded-2xl text-[#dc2626] text-xs font-semibold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleJoin} className="space-y-5">
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

          <button
            type="submit"
            disabled={loading || code.trim().length !== 6}
            className="btn-gradient w-full py-4 text-base cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span>Enter Room</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
