import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { roomApi } from '../lib/api';
import { useGameStore } from '../state/gameStore';
import { ArrowLeft, Users, Grid, Trophy, Sparkles } from 'lucide-react';

export const CreateRoom: React.FC = () => {
  const navigate = useNavigate();
  const { setRoom, resetGame } = useGameStore();

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
      resetGame();
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
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-6">
      <button
        onClick={() => navigate('/')}
        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs transition mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </button>

      <div className="bg-white/95 border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm backdrop-blur-md">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto mb-3 text-blue-600 shadow-xs">
            <Sparkles className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Create Room</h2>
          <p className="text-xs text-slate-500 mt-1">
            Host a real-time {boardSize}x{boardSize} Bingo match with friends
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-semibold text-center">
            {error}
          </div>
        )}

        <div className="space-y-4 mb-6">
          {/* Board Grid Size Selector */}
          <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Grid className="w-5 h-5 text-indigo-600" />
                <div>
                  <div className="text-xs font-black text-slate-900">Board Grid Size</div>
                  <div className="text-[11px] text-slate-500">
                    {boardSize}x{boardSize} (Numbers 1–{totalCells})
                  </div>
                </div>
              </div>
              <span className="text-xs font-black px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl">
                {boardSize}x{boardSize}
              </span>
            </div>

            {/* Quick Size Select Buttons 5x5 to 10x10 */}
            <div className="grid grid-cols-6 gap-2 pt-1">
              {[5, 6, 7, 8, 9, 10].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => handleSizeChange(size)}
                  className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    boardSize === size
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 scale-105 ring-2 ring-blue-400'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs'
                  }`}
                >
                  {size}x{size}
                </button>
              ))}
            </div>
          </div>

          {/* Winning Lines Rule */}
          <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Trophy className="w-5 h-5 text-amber-500" />
              <div>
                <div className="text-xs font-black text-slate-900">Winning Rule</div>
                <div className="text-[11px] text-slate-500">Lines needed to win</div>
              </div>
            </div>
            <select
              value={winningLines}
              onChange={(e) => setWinningLines(parseInt(e.target.value))}
              className="bg-white border border-slate-200 text-amber-800 text-xs font-black rounded-xl px-3 py-2 shadow-2xs focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
            >
              {Array.from({ length: boardSize - 4 }, (_, i) => i + 5).map((lines) => (
                <option key={lines} value={lines} className="text-slate-800">
                  {lines} Lines
                </option>
              ))}
            </select>
          </div>

          {/* Max Players Slider */}
          <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center space-x-2 text-xs font-black text-slate-900">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>Max Players ({maxPlayers})</span>
              </div>
            </div>
            <input
              type="range"
              min="2"
              max="6"
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[11px] text-slate-500 mt-1.5 font-medium">
              <span>2 Players</span>
              <span>4 Players</span>
              <span>6 Players</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleCreate}
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-black py-3.5 rounded-2xl shadow-lg shadow-blue-500/20 flex items-center justify-center space-x-2 transition disabled:opacity-50 cursor-pointer"
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
