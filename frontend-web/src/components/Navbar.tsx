import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../state/authStore';
import { Trophy, LogOut, Flame } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <header className="bg-white/85 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 px-4 sm:px-6 py-2.5 shadow-xs transition-colors">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div
          onClick={() => navigate('/')}
          className="flex items-center space-x-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-black text-white text-lg shadow-md shadow-blue-500/20 group-hover:scale-105 transition">
            B
          </div>
          <span className="font-black text-lg tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            BINGO
          </span>
        </div>

        {/* Right Stats & Controls */}
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          {/* Win Streak Pill */}
          {user.stats?.currentWinStreak > 0 && (
            <div className="hidden sm:flex items-center space-x-1 px-2.5 py-1 bg-amber-50 border border-amber-200/80 rounded-full text-amber-700 text-xs font-bold shadow-2xs">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>{user.stats.currentWinStreak} Streak</span>
            </div>
          )}

          {/* Level / XP */}
          <div className="hidden sm:flex items-center space-x-1 px-2.5 py-1 bg-blue-50 border border-blue-200/80 rounded-full text-blue-700 text-xs font-bold shadow-2xs">
            <span>Lvl {user.level}</span>
          </div>

          {/* Leaderboard button */}
          <button
            onClick={() => navigate('/leaderboard')}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-600 hover:text-slate-900 transition shadow-2xs"
            title="Leaderboard"
          >
            <Trophy className="w-4 h-4 text-amber-500" />
          </button>

          {/* Profile */}
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center space-x-2 p-1.5 pr-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-700 transition shadow-2xs"
            title="Profile"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-blue-600 flex items-center justify-center font-bold text-xs text-white uppercase shadow-xs">
              {user.username.slice(0, 2)}
            </div>
            <span className="text-xs font-bold max-w-[90px] truncate hidden md:inline">
              {user.username}
            </span>
          </button>

          {/* Logout */}
          <button
            onClick={async () => {
              await logout();
              navigate('/login');
            }}
            className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 border border-slate-200 text-slate-500 hover:text-rose-600 transition shadow-2xs"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
