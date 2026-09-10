import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { roomApi } from '../lib/api';
import { useGameStore } from '../state/gameStore';
import { ArrowLeft, Users, Grid, Trophy, Sparkles } from 'lucide-react';

export const CreateRoom: React.FC = () => {
  const navigate = useNavigate();
  const { setRoom } = useGameStore();

  const [maxPlayers, setMaxPlayers] = useState(6);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    setLoading(true);
    setError(null);
    try {
      const room = await roomApi.createRoom({
        boardSize: 5,
        winningLines: 5,
        maxPlayers,
      });
      setRoom(room);
      navigate(`/lobby/${room.roomCode}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create room');
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
          <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mx-auto mb-3 text-blue-400">
            <Sparkles className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-white">Create Room</h2>
          <p className="text-xs text-slate-400 mt-1">
            Host a real-time 5x5 Bingo room
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
            {error}
          </div>
        )}

        <div className="space-y-4 mb-6">
          <div className="bg-slate-800/50 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Grid className="w-5 h-5 text-indigo-400" />
              <div>
                <div className="text-xs font-bold text-white">Board Grid</div>
                <div className="text-[11px] text-slate-400">5x5 (Numbers 1–25)</div>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg">
              Fixed
            </span>
          </div>

          <div className="bg-slate-800/50 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Trophy className="w-5 h-5 text-amber-400" />
              <div>
                <div className="text-xs font-bold text-white">Winning Rule</div>
                <div className="text-[11px] text-slate-400">Complete any 5 lines</div>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
              5 Lines
            </span>
          </div>

          <div className="bg-slate-800/50 p-3.5 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-white">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>Max Players ({maxPlayers})</span>
              </div>
            </div>
            <input
              type="range"
              min="2"
              max="6"
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
              <span>2 Players</span>
              <span>4 Players</span>
              <span>6 Players</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleCreate}
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 rounded-2xl shadow-xl shadow-blue-500/25 flex items-center justify-center space-x-2 transition disabled:opacity-50"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <span>Create & Enter Lobby</span>
          )}
        </button>
      </div>
    </div>
  );
};
