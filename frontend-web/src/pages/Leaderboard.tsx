import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { publicApi } from '../lib/api';
import { User } from '../lib/types';
import { ArrowLeft, Trophy, Flame } from 'lucide-react';

export const Leaderboard: React.FC = () => {
  const navigate = useNavigate();
  const [players, setPlayers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicApi
      .getLeaderboard(50)
      .then((data) => setPlayers(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <button
        onClick={() => navigate('/')}
        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </button>

      {/* Header */}
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-3 text-amber-500 shadow-xs">
          <Trophy className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Global Leaderboard</h2>
        <p className="text-xs text-slate-500 mt-1">
          Top Bingo Champions ranked by total match victories
        </p>
      </div>

      {/* Top 3 Podium (if >= 3 players) */}
      {players.length >= 3 && (
        <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end pt-4 pb-2 max-w-lg mx-auto">
          {/* Rank 2 */}
          <div className="bg-slate-100/90 border border-slate-200 rounded-3xl p-3 sm:p-4 text-center order-1 h-36 flex flex-col justify-end shadow-2xs">
            <div className="w-9 h-9 rounded-full bg-slate-300 text-slate-800 font-black text-xs flex items-center justify-center mx-auto mb-1.5 shadow-xs">
              2
            </div>
            <div className="text-xs font-black text-slate-900 truncate">
              {players[1]?.username}
            </div>
            <div className="text-[11px] text-emerald-700 font-black mt-0.5">
              {players[1]?.stats?.gamesWon || 0} Wins
            </div>
          </div>

          {/* Rank 1 */}
          <div className="bg-gradient-to-t from-amber-100 via-amber-50 to-white border-2 border-amber-400 rounded-3xl p-4 text-center order-2 h-44 flex flex-col justify-end ring-4 ring-amber-200/50 shadow-md">
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 font-black text-base flex items-center justify-center mx-auto mb-2 shadow-md">
              👑
            </div>
            <div className="text-sm font-black text-slate-900 truncate">
              {players[0]?.username}
            </div>
            <div className="text-xs text-amber-700 font-black mt-0.5">
              {players[0]?.stats?.gamesWon || 0} Wins
            </div>
          </div>

          {/* Rank 3 */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-3xl p-3 sm:p-4 text-center order-3 h-32 flex flex-col justify-end shadow-2xs">
            <div className="w-8 h-8 rounded-full bg-amber-200 text-amber-800 font-black text-xs flex items-center justify-center mx-auto mb-1.5 shadow-xs">
              3
            </div>
            <div className="text-xs font-black text-slate-900 truncate">
              {players[2]?.username}
            </div>
            <div className="text-[11px] text-emerald-700 font-black mt-0.5">
              {players[2]?.stats?.gamesWon || 0} Wins
            </div>
          </div>
        </div>
      )}

      {/* Full List */}
      <div className="bg-white/95 border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-sm">
        {loading ? (
          <div className="text-xs text-slate-400 py-8 text-center">Loading rankings...</div>
        ) : players.length === 0 ? (
          <div className="text-xs text-slate-400 py-8 text-center">No ranked games yet. Be the first to win!</div>
        ) : (
          <div className="space-y-2.5">
            {players.map((p, idx) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200"
              >
                <div className="flex items-center space-x-3.5">
                  <span className="w-6 text-center font-mono font-black text-xs text-slate-400">
                    #{idx + 1}
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-black text-xs text-white shadow-xs">
                    {p.username.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900">{p.username}</div>
                    <div className="text-[11px] text-slate-500 font-semibold">Level {p.level}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-lg">
                    {p.stats?.gamesWon || 0} Wins
                  </div>
                  {p.stats?.currentWinStreak > 0 && (
                    <div className="text-[10px] text-amber-700 font-bold flex items-center justify-end space-x-0.5 mt-0.5">
                      <Flame className="w-3 h-3 text-amber-500" />
                      <span>{p.stats.currentWinStreak} Streak</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
