import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../state/gameStore';
import { useAuthStore } from '../state/authStore';
import { roomApi } from '../lib/api';
import confetti from 'canvas-confetti';
import { Trophy, Home, Award, Flame, Star, RotateCcw } from 'lucide-react';

export const Winner: React.FC = () => {
  const navigate = useNavigate();
  const { user, initAuth } = useAuthStore();
  const { winnerInfo, hasWon, resetGame, game, room } = useGameStore();

  const [requestingRematch, setRequestingRematch] = useState(false);
  const [rematchError, setRematchError] = useState<string | null>(null);

  useEffect(() => {
    // Fire festive fireworks confetti
    const end = Date.now() + 2 * 1000;
    const colors = ['#1a73e8', '#f59e0b', '#10b981', '#ffffff'];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();

    // Refresh profile stats in background
    initAuth();
  }, [initAuth]);

  // When rematch starts, transition seamlessly
  useEffect(() => {
    if (!game?.roomCode) return;
    const isBingo = !game.gameType || game.gameType === 'BINGO';
    if (isBingo) {
      if (room && (room.status === 'BOARD_SETUP' || room.status === 'WAITING' || room.status === 'READY')) {
        navigate(`/lobby/${game.roomCode}`);
      }
    } else {
      if (game.status === 'PLAYING') {
        navigate(`/game/${game.roomCode}`);
      }
    }
  }, [room?.status, game?.status, game?.roomCode, game?.gameType, navigate]);

  const handleRematch = async () => {
    if (!game?.roomCode) return;
    setRequestingRematch(true);
    setRematchError(null);
    try {
      await roomApi.rematch(game.roomCode);
    } catch (err: any) {
      setRematchError(err.response?.data?.message || 'Failed to start rematch');
      setRequestingRematch(false);
    }
  };

  const handleGoHome = () => {
    resetGame();
    navigate('/');
  };

  const isDraw = (!game?.winnerId || game.winnerId === '') && game?.status === 'FINISHED';

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-10 flex flex-col items-center justify-center min-h-[85vh] text-center font-sans">
      {/* Trophy & Badge */}
      <div className="relative mb-6">
        <div className={`w-24 h-24 rounded-[30px] flex items-center justify-center text-white shadow-[0_12px_32px_rgba(245,158,11,0.35)] animate-bounce-short ${
          isDraw
            ? 'bg-gradient-to-tr from-[#8b7fe8] via-[#a78bfa] to-[#c4b5fd]'
            : 'bg-gradient-to-tr from-[#f8788a] via-[#f59e0b] to-[#fde047]'
        }`}>
          <Trophy className="w-12 h-12 stroke-[2.5]" />
        </div>
        <Star className="w-8 h-8 text-[#f59e0b] fill-[#f59e0b] absolute -top-2 -right-2 animate-spin" />
      </div>

      <div className="inline-block px-4 py-1.5 rounded-full bg-[#fef5db] border border-[#fde7ad] text-[#b45309] font-extrabold text-xs tracking-widest uppercase mb-2.5 shadow-2xs">
        Match Completed
      </div>

      <h1 className="text-3xl sm:text-4xl font-extrabold text-[#2a2050] tracking-tight">
        {isDraw
          ? "🤝 IT'S A DRAW!"
          : hasWon
          ? '🏆 VICTORY! YOU WON!'
          : `${winnerInfo?.username || 'Opponent'} Won!`}
      </h1>

      <p className="text-xs sm:text-sm font-medium text-[#7e749c] mt-2 max-w-xs leading-relaxed">
        {isDraw
          ? 'Both players played exceptionally well! No victor this round.'
          : hasWon
          ? 'Incredible performance! You claimed the victory.'
          : 'Great match! Keep playing to claim the next win.'}
      </p>

      {/* Rewards Card */}
      <div className="w-full card-clay p-6 mt-6 space-y-4">
        <div className="text-xs font-extrabold text-[#7e749c] uppercase tracking-wider">
          Match Rewards
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#f0ecfc] p-4 rounded-2xl border border-[#e0d6f8]">
            <div className="flex items-center justify-center space-x-1 text-xs text-[#6d5ebd] font-bold">
              <Award className="w-4 h-4" />
              <span>XP Earned</span>
            </div>
            <div className="text-2xl font-extrabold text-[#2a2050] mt-1">
              +{hasWon ? '100' : '25'} XP
            </div>
          </div>

          <div className="bg-[#fef5db] p-4 rounded-2xl border border-[#fde7ad]">
            <div className="flex items-center justify-center space-x-1 text-xs text-[#b45309] font-bold">
              <Flame className="w-4 h-4 text-[#f59e0b]" />
              <span>Win Streak</span>
            </div>
            <div className="text-2xl font-extrabold text-[#b45309] mt-1">
              {user?.stats?.currentWinStreak || (hasWon ? 1 : 0)}
            </div>
          </div>
        </div>

        {game?.moveNumber && (
          <div className="text-[11px] text-[#7e749c] pt-2 border-t border-[#ede8f8] font-medium">
            Total moves called: <span className="text-[#2a2050] font-extrabold">{game.moveNumber}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="w-full space-y-3 mt-6">
        {game?.roomCode && (
          <button
            onClick={handleRematch}
            disabled={requestingRematch}
            className="w-full py-4 text-base font-black text-white bg-gradient-to-r from-[#8b7fe8] via-[#7c6ee6] to-[#6d5ebd] rounded-[22px] shadow-[0_8px_20px_rgba(139,127,232,0.35)] hover:brightness-105 active:scale-[0.98] transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60"
          >
            <RotateCcw className={`w-5 h-5 ${requestingRematch ? 'animate-spin' : ''}`} />
            <span>{requestingRematch ? 'Starting Rematch...' : 'Instant Rematch / Play Again'}</span>
          </button>
        )}

        <button
          onClick={handleGoHome}
          className="btn-pill-outline w-full py-3.5 text-sm font-extrabold cursor-pointer flex items-center justify-center space-x-2"
        >
          <Home className="w-4 h-4" />
          <span>Back to Main Menu</span>
        </button>

        {rematchError && (
          <p className="text-xs text-red-500 font-semibold">{rematchError}</p>
        )}
      </div>
    </div>
  );
};
