import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../state/authStore';
import { PlusCircle, LogIn, Trophy, Flame, Shield, HelpCircle } from 'lucide-react';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column: Player Greeting & Stats */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white/90 border border-slate-200/90 rounded-3xl p-6 shadow-sm backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3.5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-black text-2xl text-white shadow-md shadow-blue-500/20">
                  {user?.username.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 flex items-center space-x-2">
                    <span>{user?.username}</span>
                    {user?.isGuest && (
                      <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2.5 py-0.5 rounded-full border border-slate-200">
                        Guest
                      </span>
                    )}
                  </h2>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">
                    Level {user?.level} • {user?.xp} XP
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate('/profile')}
                className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-700 shadow-2xs transition"
                title="View Profile"
              >
                <Shield className="w-5 h-5 text-indigo-600" />
              </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-2.5 mt-6 pt-5 border-t border-slate-100 text-center">
              <div className="bg-slate-50/80 rounded-2xl p-3 border border-slate-200/70">
                <div className="text-[11px] font-semibold text-slate-400 uppercase">Played</div>
                <div className="text-lg font-black text-slate-900 mt-0.5">
                  {user?.stats?.gamesPlayed || 0}
                </div>
              </div>
              <div className="bg-emerald-50/80 rounded-2xl p-3 border border-emerald-100">
                <div className="text-[11px] font-semibold text-emerald-600 uppercase">Wins</div>
                <div className="text-lg font-black text-emerald-700 mt-0.5">
                  {user?.stats?.gamesWon || 0}
                </div>
              </div>
              <div className="bg-amber-50/80 rounded-2xl p-3 border border-amber-100">
                <div className="text-[11px] font-semibold text-amber-600 uppercase flex items-center justify-center space-x-1">
                  <span>Streak</span>
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <div className="text-lg font-black text-amber-700 mt-0.5">
                  {user?.stats?.currentWinStreak || 0}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Info Banner */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/70 rounded-3xl flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-blue-950">Multiplayer Real-Time Bingo</div>
              <div className="text-[11px] text-blue-800/80">Support for 5x5 up to 10x10 boards with live number calling!</div>
            </div>
          </div>
        </div>

        {/* Right Column: Actions & Modes */}
        <div className="lg:col-span-6 space-y-3.5">
          <button
            onClick={() => navigate('/create-room')}
            className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white p-5 rounded-3xl shadow-lg shadow-blue-500/20 flex items-center justify-between group transition transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <div className="flex items-center space-x-4 text-left">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <PlusCircle className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="font-black text-lg">Create Room</div>
                <div className="text-xs text-blue-100">Host a match and share your room code</div>
              </div>
            </div>
            <div className="text-xs font-bold px-3 py-1.5 bg-white/25 rounded-full">
              Host Match
            </div>
          </button>

          <button
            onClick={() => navigate('/join-room')}
            className="w-full bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-900 p-5 rounded-3xl shadow-sm flex items-center justify-between group transition transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <div className="flex items-center space-x-4 text-left">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-indigo-600">
                <LogIn className="w-7 h-7" />
              </div>
              <div>
                <div className="font-black text-lg">Join Room</div>
                <div className="text-xs text-slate-500">Enter with a 6-character room code</div>
              </div>
            </div>
            <div className="text-xs font-bold px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full border border-slate-200">
              Join
            </div>
          </button>

          {/* Secondary Cards */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={() => navigate('/leaderboard')}
              className="p-4 bg-white hover:bg-amber-50/50 border border-slate-200 hover:border-amber-300 rounded-3xl text-left transition flex items-center space-x-3.5 shadow-2xs group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-black text-slate-900">Leaderboard</div>
                <div className="text-[11px] text-slate-500">Global rankings</div>
              </div>
            </button>

            <div className="p-4 bg-white border border-slate-200 rounded-3xl text-left flex items-center space-x-3.5 shadow-2xs">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-black text-slate-900">Any Board Size</div>
                <div className="text-[11px] text-slate-500">5x5 up to 10x10</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
