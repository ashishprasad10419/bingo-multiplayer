import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../state/authStore';
import { PlusCircle, LogIn, Trophy, Flame, Shield, HelpCircle } from 'lucide-react';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6">
      {/* Player Greeting & Stats Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-blue-500/30">
              {user?.username.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-1.5">
                <span>{user?.username}</span>
                {user?.isGuest && (
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700">
                    Guest
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">Level {user?.level} • {user?.xp} XP</p>
            </div>
          </div>

          <button
            onClick={() => navigate('/profile')}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-slate-300 transition"
          >
            <Shield className="w-5 h-5 text-indigo-400" />
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-slate-800/80 text-center">
          <div className="bg-slate-800/40 rounded-xl p-2.5 border border-slate-800">
            <div className="text-xs text-slate-400">Played</div>
            <div className="text-base font-extrabold text-white mt-0.5">
              {user?.stats?.gamesPlayed || 0}
            </div>
          </div>
          <div className="bg-slate-800/40 rounded-xl p-2.5 border border-slate-800">
            <div className="text-xs text-slate-400">Wins</div>
            <div className="text-base font-extrabold text-emerald-400 mt-0.5">
              {user?.stats?.gamesWon || 0}
            </div>
          </div>
          <div className="bg-slate-800/40 rounded-xl p-2.5 border border-slate-800">
            <div className="text-xs text-slate-400 flex items-center justify-center space-x-1">
              <span>Streak</span>
              <Flame className="w-3 h-3 text-amber-400" />
            </div>
            <div className="text-base font-extrabold text-amber-400 mt-0.5">
              {user?.stats?.currentWinStreak || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Primary Actions */}
      <div className="space-y-3">
        <button
          onClick={() => navigate('/create-room')}
          className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white p-4 rounded-2xl shadow-xl shadow-blue-500/20 flex items-center justify-between group transition transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <div className="flex items-center space-x-3.5 text-left">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <PlusCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-bold text-base">Create Room</div>
              <div className="text-xs text-blue-200/80">Host a game and invite friends</div>
            </div>
          </div>
          <div className="text-xs font-semibold px-2.5 py-1 bg-white/20 rounded-full">
            Host
          </div>
        </button>

        <button
          onClick={() => navigate('/join-room')}
          className="w-full bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-white p-4 rounded-2xl shadow-xl flex items-center justify-between group transition transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <div className="flex items-center space-x-3.5 text-left">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-indigo-400">
              <LogIn className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-base">Join Room</div>
              <div className="text-xs text-slate-400">Enter with a 6-digit room code</div>
            </div>
          </div>
          <div className="text-xs font-semibold px-2.5 py-1 bg-slate-800 text-slate-300 rounded-full border border-slate-700">
            Join
          </div>
        </button>
      </div>

      {/* Secondary Quick Links */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => navigate('/leaderboard')}
          className="p-3.5 bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 rounded-2xl text-left transition flex items-center space-x-3"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Leaderboard</div>
            <div className="text-[11px] text-slate-400">Global rankings</div>
          </div>
        </button>

        <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-2xl text-left flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">5-Line Bingo</div>
            <div className="text-[11px] text-slate-400">Rows, Cols, Diags</div>
          </div>
        </div>
      </div>
    </div>
  );
};
