import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../state/authStore';
import { useThemeStore } from '../state/themeStore';
import { Trophy, LogOut, Flame, Volume2, VolumeX, Gamepad2, Sun, Moon } from 'lucide-react';
import { soundService } from '../lib/sound';
import { useGameTheme } from '../lib/useGameTheme';
import { GameVisualIcon } from './games/GameVisualIcon';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const theme = useGameTheme();
  const { theme: currentTheme, toggleTheme } = useThemeStore();
  const [soundOn, setSoundOn] = useState(() => soundService.isEnabled());

  const handleToggleSound = () => {
    const newState = soundService.toggle();
    setSoundOn(newState);
  };

  if (!user) return null;

  return (
    <header className={`${theme.navbarBg} dark:bg-[#161926]/90 backdrop-blur-lg border-b ${theme.navbarBorder} dark:border-[#282d44] sticky top-0 z-40 px-4 sm:px-6 py-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand with Game-Specific Colors */}
        <div
          onClick={() => navigate('/')}
          className="flex items-center space-x-2.5 cursor-pointer group select-none"
        >
          <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${theme.navIconBg} flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform p-1`}>
            {theme.type === 'DEFAULT' ? (
              <Gamepad2 className="w-5 h-5 text-white" />
            ) : (
              <GameVisualIcon type={theme.type} size="sm" />
            )}
          </div>
          <div className="flex flex-col">
            <span className={`font-black text-lg tracking-tight bg-gradient-to-r ${theme.navbarBrandGrad} bg-clip-text text-transparent group-hover:opacity-90 transition-opacity leading-none`}>
              {theme.brandTitle}
            </span>
            <span className="text-[9px] font-bold text-[#7e749c] dark:text-[#949bb4] tracking-widest uppercase mt-0.5">
              {theme.type === 'DEFAULT' ? 'Multiplayer Hub' : theme.badge}
            </span>
          </div>
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

          {/* Theme Toggle (Light / Dark) */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-full border border-[#ede8f8] dark:border-[#282d44] bg-white dark:bg-[#1f2438] hover:bg-[#fcfaff] dark:hover:bg-[#272d47] flex items-center justify-center text-[#524872] dark:text-[#f3f4f6] shadow-[0_2px_8px_rgba(140,120,210,0.08)] hover:scale-105 transition-all cursor-pointer"
            title={currentTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {currentTheme === 'dark' ? (
              <Sun className="w-4 h-4 text-[#f59e0b]" />
            ) : (
              <Moon className="w-4 h-4 text-[#6d5ebd]" />
            )}
          </button>

          {/* Sound Toggle button */}
          <button
            onClick={handleToggleSound}
            className={`w-9 h-9 rounded-full border flex items-center justify-center shadow-[0_2px_8px_rgba(140,120,210,0.08)] hover:scale-105 transition-all ${
              soundOn
                ? 'bg-[#f0ecfc] border-[#d8ccf5] text-[#8b7fe8]'
                : 'bg-white dark:bg-[#1f2438] border-[#ede8f8] dark:border-[#282d44] text-[#a59dbd]'
            }`}
            title={soundOn ? 'Sound On' : 'Sound Muted'}
          >
            {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

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
