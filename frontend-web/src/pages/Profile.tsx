import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../state/authStore';
import { authApi, publicApi } from '../lib/api';
import { Badge, GameHistory, UserBadge } from '../lib/types';
import { ArrowLeft, Trophy, Award, Clock } from 'lucide-react';

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [myBadges, setMyBadges] = useState<UserBadge[]>([]);
  const [history, setHistory] = useState<GameHistory[]>([]);

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const [badgesRes, myBadgesRes, historyRes] = await Promise.all([
          publicApi.getBadges(),
          authApi.getMyBadges(),
          authApi.getMyGames(),
        ]);
        setAllBadges(badgesRes);
        setMyBadges(myBadgesRes);
        setHistory(historyRes);
      } catch (err) {
        console.error('Failed to load profile data', err);
      }
    };
    loadProfileData();
  }, []);

  if (!user) return null;

  const earnedBadgeIds = new Set(myBadges.map((b) => b.badgeId));
  const winRate =
    user.stats.gamesPlayed > 0
      ? Math.round((user.stats.gamesWon / user.stats.gamesPlayed) * 100)
      : 0;

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6">
      <button
        onClick={() => navigate('/')}
        className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </button>

      {/* User Card */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950/30 to-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl text-center">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 border-2 border-indigo-400/40 mx-auto flex items-center justify-center font-black text-2xl text-white shadow-xl shadow-blue-500/20 mb-3">
          {user.username.slice(0, 2).toUpperCase()}
        </div>
        <h2 className="text-xl font-bold text-white flex items-center justify-center space-x-1.5">
          <span>{user.username}</span>
          {user.isGuest && (
            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700">
              Guest
            </span>
          )}
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Level {user.level} • {user.xp} XP
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-2 mt-5 pt-4 border-t border-slate-800/80">
          <div className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-400">Played</div>
            <div className="text-sm font-black text-white mt-0.5">
              {user.stats.gamesPlayed}
            </div>
          </div>
          <div className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-400">Wins</div>
            <div className="text-sm font-black text-emerald-400 mt-0.5">
              {user.stats.gamesWon}
            </div>
          </div>
          <div className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-400">Win Rate</div>
            <div className="text-sm font-black text-blue-400 mt-0.5">
              {winRate}%
            </div>
          </div>
          <div className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-400">Best Streak</div>
            <div className="text-sm font-black text-amber-400 mt-0.5">
              {user.stats.bestWinStreak}
            </div>
          </div>
        </div>
      </div>

      {/* Badges Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 text-sm font-bold text-white">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Earned Badges ({myBadges.length}/{allBadges.length})</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {allBadges.map((badge) => {
            const isUnlocked = earnedBadgeIds.has(badge.id);
            return (
              <div
                key={badge.id}
                className={`p-3 rounded-2xl border text-center transition ${
                  isUnlocked
                    ? 'bg-amber-500/10 border-amber-500/30'
                    : 'bg-slate-800/30 border-slate-800/60 opacity-40 grayscale'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center mx-auto mb-2 text-amber-400">
                  <Trophy className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-white truncate">
                  {badge.name}
                </div>
                <div className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">
                  {badge.description}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Matches */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl">
        <div className="flex items-center space-x-2 text-sm font-bold text-white mb-3">
          <Clock className="w-4 h-4 text-indigo-400" />
          <span>Match History</span>
        </div>

        <div className="space-y-2">
          {history.length === 0 ? (
            <div className="text-xs text-slate-500 py-3 text-center">
              No matches played yet.
            </div>
          ) : (
            history.map((game) => {
              const won = game.winnerId === user.id;
              return (
                <div
                  key={game.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 border border-slate-800"
                >
                  <div>
                    <div className="text-xs font-bold text-white">
                      Room {game.roomCode}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {game.totalMoves} moves • {game.durationSeconds}s
                    </div>
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                      won
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    {won ? 'Victory' : 'Defeat'}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
