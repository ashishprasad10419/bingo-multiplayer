import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../state/authStore';
import { Trophy, LogOut, Flame } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-blue-500/20 group-hover:scale-105 transition">
            B
          </div>
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
            BINGO
          </span>
        </div>

        {/* Right Stats & Controls */}
        <div className="flex items-center space-x-3">
          {/* Win Streak Pill */}
          {user.stats?.currentWinStreak > 0 && (
            <div className="hidden sm:flex items-center space-x-1 px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-xs font-semibold">
              <Flame className="w-3.5 h-3.5" />
              <span>{user.stats.currentWinStreak} Streak</span>
            </div>
          )}

          {/* Level / XP */}
          <div className="hidden sm:flex items-center space-x-1 px-2.5 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full text-blue-400 text-xs font-semibold">
            <span>Lvl {user.level}</span>
          </div>

          {/* Leaderboard button */}
          <button
            onClick={() => navigate('/leaderboard')}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Leaderboard"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
          </button>

          {/* Profile */}
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center space-x-2 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
            title="Profile"
          >
            <div className="w-7 h-7 rounded-full bg-indigo-600/40 border border-indigo-400/30 flex items-center justify-center font-bold text-xs text-indigo-300 uppercase">
              {user.username.slice(0, 2)}
            </div>
            <span className="text-xs font-medium max-w-[80px] truncate hidden md:inline">
              {user.username}
            </span>
          </button>

          {/* Logout */}
          <button
            onClick={async () => {
              await logout();
              navigate('/login');
            }}
            className="p-2 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
