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
    <div className="max-w-md mx-auto px-4 py-6 space-y-6">
      <button
        onClick={() => navigate('/')}
        className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </button>

      {/* Header */}
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-3 text-amber-400 shadow-xl shadow-amber-500/10">
          <Trophy className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-black text-white">Global Leaderboard</h2>
        <p className="text-xs text-slate-400 mt-1">
          Top Bingo Champions ranked by total match victories
        </p>
      </div>

      {/* Top 3 Podium (if >= 3 players) */}
      {players.length >= 3 && (
        <div className="grid grid-cols-3 gap-2 items-end pt-4 pb-2">
          {/* Rank 2 */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 text-center order-1 h-32 flex flex-col justify-end">
            <div className="w-9 h-9 rounded-full bg-slate-400/20 border border-slate-400 text-slate-200 font-black text-xs flex items-center justify-center mx-auto mb-1">
              2
            </div>
            <div className="text-xs font-bold text-white truncate">
              {players[1]?.username}
            </div>
            <div className="text-[11px] text-emerald-400 font-semibold mt-0.5">
              {players[1]?.stats?.gamesWon || 0} Wins
            </div>
          </div>

          {/* Rank 1 */}
          <div className="bg-gradient-to-t from-amber-500/20 to-slate-900 border border-amber-500/40 rounded-2xl p-3 text-center order-2 h-40 flex flex-col justify-end ring-1 ring-amber-500/40">
            <div className="w-10 h-10 rounded-full bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center mx-auto mb-1 shadow-lg shadow-amber-500/40">
              👑
            </div>
            <div className="text-xs font-black text-white truncate">
              {players[0]?.username}
            </div>
            <div className="text-xs text-amber-400 font-extrabold mt-0.5">
              {players[0]?.stats?.gamesWon || 0} Wins
            </div>
          </div>

          {/* Rank 3 */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 text-center order-3 h-28 flex flex-col justify-end">
            <div className="w-8 h-8 rounded-full bg-amber-700/30 border border-amber-600 text-amber-300 font-black text-xs flex items-center justify-center mx-auto mb-1">
              3
            </div>
            <div className="text-xs font-bold text-white truncate">
              {players[2]?.username}
            </div>
            <div className="text-[11px] text-emerald-400 font-semibold mt-0.5">
              {players[2]?.stats?.gamesWon || 0} Wins
            </div>
          </div>
        </div>
      )}

      {/* Full List */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 shadow-xl">
        {loading ? (
          <div className="text-xs text-slate-500 py-6 text-center">Loading rankings...</div>
        ) : players.length === 0 ? (
          <div className="text-xs text-slate-500 py-6 text-center">No ranked games yet. Be the first to win!</div>
        ) : (
          <div className="space-y-2">
            {players.map((p, idx) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 border border-slate-800"
              >
                <div className="flex items-center space-x-3">
                  <span className="w-5 text-center font-mono font-bold text-xs text-slate-400">
                    {idx + 1}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs text-indigo-300">
                    {p.username.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{p.username}</div>
                    <div className="text-[10px] text-slate-400">Lvl {p.level}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-black text-emerald-400">
                    {p.stats?.gamesWon || 0} Wins
                  </div>
                  {p.stats?.currentWinStreak > 0 && (
                    <div className="text-[10px] text-amber-400 flex items-center justify-end space-x-0.5">
                      <Flame className="w-3 h-3" />
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
