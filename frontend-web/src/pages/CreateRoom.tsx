import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { roomApi } from '../lib/api';
import { useGameStore } from '../state/gameStore';
import { ArrowLeft, Users, Grid, Trophy, Sparkles } from 'lucide-react';

export const CreateRoom: React.FC = () => {
  const navigate = useNavigate();
  const { setRoom } = useGameStore();

  const [boardSize, setBoardSize] = useState(5);
  const [winningLines, setWinningLines] = useState(5);
  const [maxPlayers, setMaxPlayers] = useState(6);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSizeChange = (newSize: number) => {
    setBoardSize(newSize);
    // Keep winning lines valid for the chosen size
    if (winningLines > newSize) {
      setWinningLines(newSize);
    }
  };

  const handleCreate = async () => {
    setLoading(true);
    setError(null);
    try {
      const room = await roomApi.createRoom({
        boardSize,
        winningLines,
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

  const totalCells = boardSize * boardSize;

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
            Host a real-time {boardSize}x{boardSize} Bingo room
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
            {error}
          </div>
        )}

        <div className="space-y-4 mb-6">
          {/* Board Grid Size Selector */}
          <div className="bg-slate-800/50 p-3.5 rounded-2xl border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Grid className="w-5 h-5 text-indigo-400" />
                <div>
                  <div className="text-xs font-bold text-white">Board Grid Size</div>
                  <div className="text-[11px] text-slate-400">
                    {boardSize}x{boardSize} (Numbers 1–{totalCells})
                  </div>
                </div>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-lg">
                {boardSize}x{boardSize}
              </span>
            </div>

            {/* Quick Size Select Buttons 5x5 to 10x10 */}
            <div className="grid grid-cols-6 gap-1.5 pt-1">
              {[5, 6, 7, 8, 9, 10].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => handleSizeChange(size)}
                  className={`py-1.5 rounded-xl text-xs font-bold transition-all ${
                    boardSize === size
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30 scale-105 ring-1 ring-blue-400'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700/50'
                  }`}
                >
                  {size}x{size}
                </button>
              ))}
            </div>
          </div>

          {/* Winning Lines Rule */}
          <div className="bg-slate-800/50 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Trophy className="w-5 h-5 text-amber-400" />
              <div>
                <div className="text-xs font-bold text-white">Winning Rule</div>
                <div className="text-[11px] text-slate-400">Lines needed to win</div>
              </div>
            </div>
            <select
              value={winningLines}
              onChange={(e) => setWinningLines(parseInt(e.target.value))}
              className="bg-slate-800 border border-amber-500/30 text-amber-300 text-xs font-bold rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              {Array.from({ length: boardSize - 4 }, (_, i) => i + 5).map((lines) => (
                <option key={lines} value={lines} className="bg-slate-900 text-white">
                  {lines} Lines
                </option>
              ))}
            </select>
          </div>

          {/* Max Players Slider */}
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
