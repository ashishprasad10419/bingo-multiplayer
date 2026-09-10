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
    <div className="max-w-md mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[85vh] text-center">
      {/* Trophy & Badge */}
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 shadow-2xl shadow-amber-500/40 animate-bounce-short">
          <Trophy className="w-12 h-12" />
        </div>
        <Star className="w-7 h-7 text-yellow-300 fill-yellow-300 absolute -top-2 -right-2 animate-spin" />
      </div>

      <div className="inline-block px-4 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-extrabold text-xs tracking-widest uppercase mb-2">
        Match Completed
      </div>

      <h1 className="text-3xl font-black text-white tracking-tight">
        {hasWon ? '🏆 BINGO! YOU WON!' : `${winnerInfo?.username || 'Opponent'} Won!`}
      </h1>

      <p className="text-xs text-slate-400 mt-1 max-w-xs">
        {hasWon
          ? 'Incredible game! You completed 5 lines and claimed the victory.'
          : 'Great match! Keep practicing to claim the next win.'}
      </p>

      {/* Rewards Card */}
      <div className="w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl mt-6 space-y-3">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Match Rewards
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
            <div className="flex items-center justify-center space-x-1 text-xs text-blue-400 font-medium">
              <Award className="w-3.5 h-3.5" />
              <span>XP Earned</span>
            </div>
            <div className="text-lg font-black text-white mt-1">
              +{hasWon ? '100' : '25'} XP
            </div>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
            <div className="flex items-center justify-center space-x-1 text-xs text-amber-400 font-medium">
              <Flame className="w-3.5 h-3.5" />
              <span>Win Streak</span>
            </div>
            <div className="text-lg font-black text-white mt-1">
              {user?.stats?.currentWinStreak || (hasWon ? 1 : 0)}
            </div>
          </div>
        </div>

        {game?.moveNumber && (
          <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-800">
            Total moves called: <span className="text-slate-300 font-semibold">{game.moveNumber}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="w-full space-y-2.5 mt-6">
        <button
          onClick={handleGoHome}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-2xl shadow-xl shadow-blue-500/20 flex items-center justify-center space-x-2 transition"
        >
          <Home className="w-5 h-5" />
          <span>Back to Main Menu</span>
        </button>
      </div>
    </div>
  );
};
