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
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-6 font-sans">
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
            <Sparkles className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2a2050] tracking-tight">Create Room</h2>
          <p className="text-xs sm:text-sm font-medium text-[#7e749c] mt-1">
            Host a real-time {boardSize}x{boardSize} Bingo match with friends
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3.5 bg-[#fee8ea] border border-[#fcd3d7] rounded-2xl text-[#dc2626] text-xs font-semibold text-center">
            {error}
          </div>
        )}

        <div className="space-y-4 mb-6">
          {/* Board Grid Size Selector */}
          <div className="bg-[#faf7fe] p-4 sm:p-5 rounded-2xl border border-[#ede8f8] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Grid className="w-5 h-5 text-[#8b7fe8]" />
                <div>
                  <div className="text-xs font-extrabold text-[#2a2050]">Board Grid Size</div>
                  <div className="text-[11px] text-[#7e749c] font-medium">
                    {boardSize}x{boardSize} (Numbers 1–{totalCells})
                  </div>
                </div>
              </div>
              <span className="text-xs font-extrabold px-3 py-1 bg-[#f0ecfc] text-[#6d5ebd] border border-[#e0d6f8] rounded-full">
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
                  className={`py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    boardSize === size
                      ? 'bg-gradient-to-r from-[#f8788a] to-[#8b7fe8] text-white shadow-md shadow-[#f8788a]/30 scale-105 ring-2 ring-[#fbcfe8]'
                      : 'bg-white hover:bg-[#f0ecfc] text-[#524872] border border-[#ede8f8] shadow-2xs'
                  }`}
                >
                  {size}x{size}
                </button>
              ))}
            </div>
          </div>

          {/* Winning Lines Rule */}
          <div className="bg-[#faf7fe] p-4 sm:p-5 rounded-2xl border border-[#ede8f8] flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Trophy className="w-5 h-5 text-[#f59e0b]" />
              <div>
                <div className="text-xs font-extrabold text-[#2a2050]">Winning Rule</div>
                <div className="text-[11px] text-[#7e749c] font-medium">Lines needed to win</div>
              </div>
            </div>
            <select
              value={winningLines}
              onChange={(e) => setWinningLines(parseInt(e.target.value))}
              className="bg-white border border-[#ede8f8] text-[#b45309] text-xs font-extrabold rounded-full px-4 py-2 shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#8b7fe8]/30 cursor-pointer"
            >
              {Array.from({ length: boardSize - 4 }, (_, i) => i + 5).map((lines) => (
                <option key={lines} value={lines} className="text-[#2a2050]">
                  {lines} Lines
                </option>
              ))}
            </select>
          </div>

          {/* Max Players Slider */}
          <div className="bg-[#faf7fe] p-4 sm:p-5 rounded-2xl border border-[#ede8f8]">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center space-x-2 text-xs font-extrabold text-[#2a2050]">
                <Users className="w-4 h-4 text-[#10b981]" />
                <span>Max Players ({maxPlayers})</span>
              </div>
            </div>
            <input
              type="range"
              min="2"
              max="6"
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
              className="w-full h-2 bg-[#ede8f8] rounded-lg appearance-none cursor-pointer accent-[#8b7fe8]"
            />
            <div className="flex justify-between text-[11px] text-[#7e749c] mt-1.5 font-medium">
              <span>2 Players</span>
              <span>4 Players</span>
              <span>6 Players</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleCreate}
          disabled={loading}
          className="btn-gradient w-full py-4 text-base cursor-pointer"
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
