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
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-6">
      <button
        onClick={() => navigate('/')}
        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs transition mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </button>

      <div className="bg-white/95 border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm backdrop-blur-md">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center mx-auto mb-3 text-indigo-600 shadow-xs">
            <LogIn className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Join Room</h2>
          <p className="text-xs text-slate-500 mt-1">
            Enter the 6-character room code from your friend to jump in
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-semibold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleJoin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Room Code
            </label>
            <div className="relative">
              <Hash className="w-5 h-5 text-slate-400 absolute left-3.5 top-4" />
              <input
                type="text"
                required
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. B7K4P2"
                className="w-full bg-slate-50 border border-slate-300 rounded-2xl pl-11 pr-4 py-3.5 text-center text-2xl font-mono font-black tracking-widest text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 uppercase transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || code.trim().length !== 6}
            className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-black py-3.5 rounded-2xl shadow-lg shadow-blue-500/20 flex items-center justify-center space-x-2 transition disabled:opacity-50 cursor-pointer"
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
