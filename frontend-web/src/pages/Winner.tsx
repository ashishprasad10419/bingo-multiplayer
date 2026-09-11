import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../state/gameStore';
import { useAuthStore } from '../state/authStore';
import confetti from 'canvas-confetti';
import { Trophy, Home, Award, Flame, Star } from 'lucide-react';

export const Winner: React.FC = () => {
  const navigate = useNavigate();
  const { user, initAuth } = useAuthStore();
  const { winnerInfo, hasWon, resetGame, game } = useGameStore();

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

  const handleGoHome = () => {
    resetGame();
    navigate('/');
  };

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-10 flex flex-col items-center justify-center min-h-[85vh] text-center">
      {/* Trophy & Badge */}
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-400 via-amber-300 to-yellow-400 flex items-center justify-center text-slate-950 shadow-xl shadow-amber-400/30 animate-bounce-short">
          <Trophy className="w-12 h-12" />
        </div>
        <Star className="w-8 h-8 text-amber-500 fill-amber-400 absolute -top-2 -right-2 animate-spin" />
      </div>

      <div className="inline-block px-4 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-black text-xs tracking-widest uppercase mb-2.5">
        Match Completed
      </div>

      <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
        {hasWon ? '🏆 BINGO! YOU WON!' : `${winnerInfo?.username || 'Opponent'} Won!`}
      </h1>

      <p className="text-xs text-slate-500 mt-2 max-w-xs leading-relaxed">
        {hasWon
          ? 'Incredible game! You completed your lines and claimed the victory.'
          : 'Great match! Keep practicing to claim the next win.'}
      </p>

      {/* Rewards Card */}
      <div className="w-full bg-white/95 border border-slate-200/90 rounded-3xl p-6 shadow-sm mt-6 space-y-4">
        <div className="text-xs font-black text-slate-400 uppercase tracking-wider">
          Match Rewards
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50/80 p-3.5 rounded-2xl border border-blue-100">
            <div className="flex items-center justify-center space-x-1 text-xs text-blue-700 font-bold">
              <Award className="w-4 h-4" />
              <span>XP Earned</span>
            </div>
            <div className="text-xl font-black text-blue-900 mt-1">
              +{hasWon ? '100' : '25'} XP
            </div>
          </div>

          <div className="bg-amber-50/80 p-3.5 rounded-2xl border border-amber-100">
            <div className="flex items-center justify-center space-x-1 text-xs text-amber-700 font-bold">
              <Flame className="w-4 h-4 text-amber-500" />
              <span>Win Streak</span>
            </div>
            <div className="text-xl font-black text-amber-900 mt-1">
              {user?.stats?.currentWinStreak || (hasWon ? 1 : 0)}
            </div>
          </div>
        </div>

        {game?.moveNumber && (
          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            Total moves called: <span className="text-slate-700 font-bold">{game.moveNumber}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="w-full space-y-3 mt-6">
        <button
          onClick={handleGoHome}
          className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-500/20 flex items-center justify-center space-x-2 transition cursor-pointer"
        >
          <Home className="w-5 h-5" />
          <span>Back to Main Menu</span>
        </button>
      </div>
    </div>
  );
};
