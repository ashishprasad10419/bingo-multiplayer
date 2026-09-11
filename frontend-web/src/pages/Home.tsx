import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../state/authStore';
import { PlusCircle, LogIn, Trophy, Flame, Shield, HelpCircle } from 'lucide-react';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6 font-sans">
      {/* Top Greeting Header (Image 1 Style) */}
      <div className="card-clay p-6 sm:p-7 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-[24px] bg-gradient-to-tr from-[#f8788a] via-[#e271a5] to-[#8b7fe8] flex items-center justify-center font-extrabold text-2xl text-white shadow-[0_8px_20px_rgba(240,115,145,0.32)]">
            {user?.username.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2a2050] tracking-tight flex items-center space-x-2">
              <span>Hi, {user?.username}!</span>
              {user?.isGuest && (
                <span className="text-[10px] bg-[#f0ecfc] text-[#6d5ebd] font-bold px-2.5 py-0.5 rounded-full border border-[#e0d6f8]">
                  Guest
                </span>
              )}
            </h1>
            <p className="text-xs sm:text-sm font-medium text-[#7e749c] mt-0.5">
              Let's play some Bingo today! Ready to challenge friends?
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/profile')}
          className="w-11 h-11 rounded-full bg-[#f4effc] hover:bg-[#ede6fa] border border-[#ede8f8] flex items-center justify-center text-[#8b7fe8] hover:scale-105 shadow-xs transition"
          title="Profile"
        >
          <Shield className="w-5 h-5" />
        </button>
      </div>

      {/* 4 Pastel Stat Cards (Exact Image 1 Pastel Palette) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Stat 1: Matches Played (Lilac) */}
        <div className="bg-[#f0ecfc] border border-[#e0d6f8] rounded-[24px] p-4 sm:p-5 shadow-2xs">
          <div className="w-8 h-8 rounded-xl bg-white/80 flex items-center justify-center text-[#6d5ebd] shadow-2xs mb-2.5">
            <Trophy className="w-4 h-4" />
          </div>
          <div className="text-xs font-semibold text-[#7e749c]">Matches Played</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#2a2050] mt-0.5">
            {user?.stats?.gamesPlayed || 0}
          </div>
          <div className="text-[11px] font-bold text-[#6d5ebd] mt-1">All Time</div>
        </div>

        {/* Stat 2: Total Wins (Pastel Coral/Peach) */}
        <div className="bg-[#fee8ea] border border-[#fcd3d7] rounded-[24px] p-4 sm:p-5 shadow-2xs">
          <div className="w-8 h-8 rounded-xl bg-white/80 flex items-center justify-center text-[#dc2626] shadow-2xs mb-2.5">
            <Trophy className="w-4 h-4" />
          </div>
          <div className="text-xs font-semibold text-[#7e749c]">Total Wins</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#2a2050] mt-0.5">
            {user?.stats?.gamesWon || 0}
          </div>
          <div className="text-[11px] font-bold text-[#dc2626] mt-1">
            {user?.stats?.gamesPlayed ? Math.round((user.stats.gamesWon / user.stats.gamesPlayed) * 100) : 0}% Win Rate
          </div>
        </div>

        {/* Stat 3: Current Streak (Pastel Butter Yellow) */}
        <div className="bg-[#fef5db] border border-[#fde7ad] rounded-[24px] p-4 sm:p-5 shadow-2xs">
          <div className="w-8 h-8 rounded-xl bg-white/80 flex items-center justify-center text-[#b45309] shadow-2xs mb-2.5">
            <Flame className="w-4 h-4 text-[#f59e0b] fill-[#f59e0b]" />
          </div>
          <div className="text-xs font-semibold text-[#7e749c]">Current Streak</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#2a2050] mt-0.5">
            {user?.stats?.currentWinStreak || 0}
          </div>
          <div className="text-[11px] font-bold text-[#b45309] mt-1">
            Best: {user?.stats?.bestWinStreak || 0} streak
          </div>
        </div>

        {/* Stat 4: Player Level (Pastel Sky Blue) */}
        <div className="bg-[#e3f2fd] border border-[#c7e5fc] rounded-[24px] p-4 sm:p-5 shadow-2xs">
          <div className="w-8 h-8 rounded-xl bg-white/80 flex items-center justify-center text-[#0284c7] shadow-2xs mb-2.5">
            <Shield className="w-4 h-4" />
          </div>
          <div className="text-xs font-semibold text-[#7e749c]">Player Level</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#2a2050] mt-0.5">
            Lvl {user?.level || 1}
          </div>
          <div className="text-[11px] font-bold text-[#0284c7] mt-1">{user?.xp || 0} XP</div>
        </div>
      </div>

      {/* Main Game Mode CTA Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Host Room: Signature Coral-Rose-Periwinkle Gradient */}
        <div className="lg:col-span-6">
          <button
            onClick={() => navigate('/create-room')}
            className="w-full bg-gradient-to-r from-[#f8788a] via-[#e271a5] to-[#8b7fe8] text-white p-6 rounded-[28px] shadow-[0_12px_32px_rgba(240,115,145,0.36)] flex items-center justify-between group transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer text-left"
          >
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                <PlusCircle className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="font-extrabold text-xl">Create Room</div>
                <div className="text-xs text-white/85 mt-0.5">Host match with custom board sizes (5x5 - 10x10)</div>
              </div>
            </div>
            <div className="text-xs font-extrabold px-3.5 py-1.5 bg-white/25 rounded-full">
              Host
            </div>
          </button>
        </div>

        {/* Join Room: Soft Purple Clay Card */}
        <div className="lg:col-span-6">
          <button
            onClick={() => navigate('/join-room')}
            className="w-full card-clay hover:border-[#8b7fe8] p-6 shadow-[0_10px_30px_rgba(135,115,215,0.12)] flex items-center justify-between group transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer text-left"
          >
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-[#f0ecfc] flex items-center justify-center text-[#8b7fe8]">
                <LogIn className="w-8 h-8" />
              </div>
              <div>
                <div className="font-extrabold text-xl text-[#2a2050]">Join Room</div>
                <div className="text-xs text-[#7e749c] mt-0.5">Enter a 6-character room code from your friends</div>
              </div>
            </div>
            <div className="text-xs font-extrabold px-3.5 py-1.5 bg-[#f0ecfc] text-[#6d5ebd] rounded-full border border-[#e2d7f8]">
              Join
            </div>
          </button>
        </div>
      </div>

      {/* Secondary Quick Access Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => navigate('/leaderboard')}
          className="card-clay p-4 text-left hover:border-[#8b7fe8] transition flex items-center space-x-4 cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#fef5db] border border-[#fde7ad] flex items-center justify-center text-[#b45309]">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-extrabold text-[#2a2050] group-hover:text-[#8b7fe8] transition-colors">Global Leaderboard</div>
            <div className="text-xs text-[#7e749c]">View top players and rank milestones</div>
          </div>
        </button>

        <div className="card-clay p-4 text-left flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-[#e6f7ef] border border-[#c3eed7] flex items-center justify-center text-[#047857]">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-extrabold text-[#2a2050]">Interactive Setup Studio</div>
            <div className="text-xs text-[#7e749c]">Drag and drop numbers to customize your grid</div>
          </div>
        </div>
      </div>
    </div>
  );
};
