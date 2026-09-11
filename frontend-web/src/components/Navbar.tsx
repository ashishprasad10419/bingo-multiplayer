import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../state/authStore';
import { Trophy, LogOut, Flame } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <header className="bg-white/80 backdrop-blur-lg border-b border-[#ede8f8] sticky top-0 z-40 px-4 sm:px-6 py-2.5 shadow-[0_4px_20px_rgba(140,120,210,0.08)] transition-all">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div
          onClick={() => navigate('/')}
          className="flex items-center space-x-2.5 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#f8788a] via-[#e271a5] to-[#8b7fe8] flex items-center justify-center font-extrabold text-white text-xl shadow-[0_6px_16px_rgba(240,115,145,0.3)] group-hover:scale-105 transition-transform">
            B
          </div>
          <span className="font-extrabold text-xl tracking-tight text-[#2a2050] group-hover:text-[#8b7fe8] transition-colors">
            BINGO
          </span>
        </div>

        {/* Right Stats & Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Win Streak Pill - Image 1 Yellow Stat style */}
          {user.stats?.currentWinStreak > 0 && (
            <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 bg-[#fef5db] border border-[#fde7ad] rounded-full text-[#b45309] text-xs font-bold shadow-xs">
              <Flame className="w-3.5 h-3.5 text-[#f59e0b] fill-[#f59e0b]" />
              <span>{user.stats.currentWinStreak} Streak</span>
            </div>
          )}

          {/* Level / XP - Image 1 Lilac Stat style */}
          <div className="hidden sm:flex items-center space-x-1 px-3 py-1.5 bg-[#f0ecfc] border border-[#e2d7f8] rounded-full text-[#6d5ebd] text-xs font-bold shadow-xs">
            <span>Lvl {user.level}</span>
          </div>

          {/* Leaderboard button */}
          <button
            onClick={() => navigate('/leaderboard')}
            className="w-9 h-9 rounded-full bg-white hover:bg-[#fcfaff] border border-[#ede8f8] flex items-center justify-center text-[#524872] hover:text-[#8b7fe8] shadow-[0_2px_8px_rgba(140,120,210,0.08)] hover:scale-105 transition-all"
            title="Leaderboard"
          >
            <Trophy className="w-4 h-4 text-[#f59e0b]" />
          </button>

          {/* Profile */}
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center space-x-2 py-1 pl-1 pr-3 rounded-full bg-white hover:bg-[#fcfaff] border border-[#ede8f8] text-[#2a2050] shadow-[0_2px_8px_rgba(140,120,210,0.08)] hover:scale-105 transition-all"
            title="Profile"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#f8788a] to-[#8b7fe8] flex items-center justify-center font-bold text-xs text-white uppercase shadow-xs">
              {user.username.slice(0, 2)}
            </div>
            <span className="text-xs font-bold max-w-[90px] truncate hidden md:inline text-[#2a2050]">
              {user.username}
            </span>
          </button>

          {/* Logout */}
          <button
            onClick={async () => {
              await logout();
              navigate('/login');
            }}
            className="w-9 h-9 rounded-full bg-white hover:bg-[#fee8ea] border border-[#ede8f8] hover:border-[#fcd3d7] flex items-center justify-center text-[#7e749c] hover:text-[#f8788a] shadow-[0_2px_8px_rgba(140,120,210,0.08)] hover:scale-105 transition-all"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
