import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { roomApi } from '../lib/api';
import { useGameStore } from '../state/gameStore';
import { ArrowLeft, LogIn, Hash } from 'lucide-react';

export const JoinRoom: React.FC = () => {
  const navigate = useNavigate();
  const { setRoom } = useGameStore();

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
    <div className="max-w-md mx-auto px-4 py-6">
      <button
        onClick={() => navigate('/')}
        className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </button>

      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto mb-3 text-indigo-400">
            <LogIn className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-white">Join Room</h2>
          <p className="text-xs text-slate-400 mt-1">
            Enter the 6-character room code from your friend
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Room Code
            </label>
            <div className="relative">
              <Hash className="w-5 h-5 text-slate-500 absolute left-3 top-3.5" />
              <input
                type="text"
                required
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. B7K4P2"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-center text-xl font-mono font-black tracking-widest text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 uppercase"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || code.trim().length !== 6}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 rounded-2xl shadow-xl shadow-blue-500/25 flex items-center justify-center space-x-2 transition disabled:opacity-50"
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
