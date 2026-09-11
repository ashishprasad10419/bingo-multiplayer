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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6 font-sans">
      <button
        onClick={() => navigate('/')}
        className="btn-pill-outline text-xs px-4 py-2 space-x-1.5 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </button>

      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 rounded-[24px] bg-[#fef5db] border border-[#fde7ad] flex items-center justify-center mx-auto mb-3 text-[#b45309] shadow-xs">
          <Trophy className="w-8 h-8" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2a2050] tracking-tight">Global Leaderboard</h2>
        <p className="text-xs sm:text-sm font-medium text-[#7e749c] mt-1">
          Top Bingo Champions ranked by total match victories
        </p>
      </div>

      {/* Top 3 Podium (if >= 3 players) */}
      {players.length >= 3 && (
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4 items-end pt-4 pb-2 max-w-lg mx-auto">
          {/* Rank 2 (Lilac) */}
          <div className="bg-[#f0ecfc] border border-[#e0d6f8] rounded-[28px] p-3 sm:p-4 text-center order-1 h-36 flex flex-col justify-end shadow-2xs">
            <div className="w-9 h-9 rounded-full bg-white text-[#6d5ebd] font-extrabold text-xs flex items-center justify-center mx-auto mb-1.5 shadow-xs">
              2
            </div>
            <div className="text-xs font-extrabold text-[#2a2050] truncate">
              {players[1]?.username}
            </div>
            <div className="text-[11px] text-[#6d5ebd] font-bold mt-0.5">
              {players[1]?.stats?.gamesWon || 0} Wins
            </div>
          </div>

          {/* Rank 1 (Butter Yellow / Gold) */}
          <div className="bg-[#fef5db] border-2 border-[#f59e0b] rounded-[28px] p-4 text-center order-2 h-44 flex flex-col justify-end ring-4 ring-[#f59e0b]/20 shadow-md">
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#f8788a] to-[#f59e0b] text-white font-black text-lg flex items-center justify-center mx-auto mb-2 shadow-sm">
              👑
            </div>
            <div className="text-sm font-extrabold text-[#2a2050] truncate">
              {players[0]?.username}
            </div>
            <div className="text-xs text-[#b45309] font-extrabold mt-0.5">
              {players[0]?.stats?.gamesWon || 0} Wins
            </div>
          </div>

          {/* Rank 3 (Peach / Coral) */}
          <div className="bg-[#fee8ea] border border-[#fcd3d7] rounded-[28px] p-3 sm:p-4 text-center order-3 h-32 flex flex-col justify-end shadow-2xs">
            <div className="w-8 h-8 rounded-full bg-white text-[#dc2626] font-extrabold text-xs flex items-center justify-center mx-auto mb-1.5 shadow-xs">
              3
            </div>
            <div className="text-xs font-extrabold text-[#2a2050] truncate">
              {players[2]?.username}
            </div>
            <div className="text-[11px] text-[#dc2626] font-bold mt-0.5">
              {players[2]?.stats?.gamesWon || 0} Wins
            </div>
          </div>
        </div>
      )}

      {/* Full List */}
      <div className="card-clay p-5 sm:p-6 shadow-sm">
        {loading ? (
          <div className="text-xs text-[#7e749c] py-8 text-center font-medium">Loading rankings...</div>
        ) : players.length === 0 ? (
          <div className="text-xs text-[#7e749c] py-8 text-center font-medium">No ranked games yet. Be the first to win!</div>
        ) : (
          <div className="space-y-2.5">
            {players.map((p, idx) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-[#faf7fe] border border-[#ede8f8] hover:border-[#8b7fe8] transition-colors"
              >
                <div className="flex items-center space-x-3.5">
                  <span className="w-6 text-center font-mono font-extrabold text-xs text-[#7e749c]">
                    #{idx + 1}
                  </span>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#f8788a] via-[#e271a5] to-[#8b7fe8] flex items-center justify-center font-extrabold text-xs text-white shadow-xs">
                    {p.username.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-extrabold text-[#2a2050]">{p.username}</div>
                    <div className="text-[11px] text-[#7e749c] font-medium">Level {p.level}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-extrabold text-[#047857] bg-[#e6f7ef] border border-[#c3eed7] px-3 py-1 rounded-full shadow-2xs">
                    {p.stats?.gamesWon || 0} Wins
                  </div>
                  {p.stats?.currentWinStreak > 0 && (
                    <div className="text-[10px] text-[#b45309] font-bold flex items-center justify-end space-x-1 mt-1">
                      <Flame className="w-3 h-3 text-[#f59e0b] fill-[#f59e0b]" />
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
