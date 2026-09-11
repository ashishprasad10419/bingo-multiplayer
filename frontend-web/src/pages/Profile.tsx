import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../state/authStore';
import { authApi, publicApi } from '../lib/api';
import { Badge, GameHistory, UserBadge } from '../lib/types';
import { ArrowLeft, Trophy, Award, Clock } from 'lucide-react';
import { InstallProfileCard } from '../components/InstallPwaPrompt';

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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <button
        onClick={() => navigate('/')}
        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </button>

      {/* User Card */}
      <div className="bg-white/95 border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm backdrop-blur-md text-center">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 mx-auto flex items-center justify-center font-black text-2xl text-white shadow-lg shadow-blue-500/20 mb-3">
          {user.username.slice(0, 2).toUpperCase()}
        </div>
        <h2 className="text-2xl font-black text-slate-900 flex items-center justify-center space-x-2">
          <span>{user.username}</span>
          {user.isGuest && (
            <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2.5 py-0.5 rounded-full border border-slate-200">
              Guest
            </span>
          )}
        </h2>
        <p className="text-xs font-semibold text-slate-500 mt-1">
          Level {user.level} • {user.xp} XP
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-2.5 sm:gap-4 mt-6 pt-5 border-t border-slate-100">
          <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-200/70">
            <div className="text-[11px] font-semibold text-slate-400 uppercase">Played</div>
            <div className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
              {user.stats.gamesPlayed}
            </div>
          </div>
          <div className="bg-emerald-50/80 p-3 rounded-2xl border border-emerald-100">
            <div className="text-[11px] font-semibold text-emerald-600 uppercase">Wins</div>
            <div className="text-base sm:text-lg font-black text-emerald-700 mt-0.5">
              {user.stats.gamesWon}
            </div>
          </div>
          <div className="bg-blue-50/80 p-3 rounded-2xl border border-blue-100">
            <div className="text-[11px] font-semibold text-blue-600 uppercase">Win Rate</div>
            <div className="text-base sm:text-lg font-black text-blue-700 mt-0.5">
              {winRate}%
            </div>
          </div>
          <div className="bg-amber-50/80 p-3 rounded-2xl border border-amber-100">
            <div className="text-[11px] font-semibold text-amber-600 uppercase">Streak</div>
            <div className="text-base sm:text-lg font-black text-amber-700 mt-0.5">
              {user.stats.bestWinStreak}
            </div>
          </div>
        </div>
      </div>

      {/* PWA App Installation Option */}
      <InstallProfileCard />

      {/* Badges Section */}
      <div className="bg-white/95 border border-slate-200/90 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 text-sm font-black text-slate-900">
            <Award className="w-5 h-5 text-amber-500" />
            <span>Earned Badges ({myBadges.length}/{allBadges.length})</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {allBadges.map((badge) => {
            const isUnlocked = earnedBadgeIds.has(badge.id);
            return (
              <div
                key={badge.id}
                className={`p-3.5 rounded-2xl border text-center transition ${
                  isUnlocked
                    ? 'bg-amber-50/80 border-amber-200 text-amber-900 shadow-2xs'
                    : 'bg-slate-50 border-slate-200/70 opacity-40 grayscale'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-white border border-amber-200 flex items-center justify-center mx-auto mb-2 text-amber-500 shadow-2xs">
                  <Trophy className="w-5 h-5" />
                </div>
                <div className="text-xs font-black text-slate-900 truncate">
                  {badge.name}
                </div>
                <div className="text-[10px] text-slate-500 line-clamp-2 mt-0.5">
                  {badge.description}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Matches */}
      <div className="bg-white/95 border border-slate-200/90 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center space-x-2 text-sm font-black text-slate-900 mb-4">
          <Clock className="w-5 h-5 text-indigo-600" />
          <span>Match History</span>
        </div>

        <div className="space-y-2.5">
          {history.length === 0 ? (
            <div className="text-xs text-slate-400 py-4 text-center">
              No matches played yet.
            </div>
          ) : (
            history.map((game) => {
              const won = game.winnerId === user.id;
              return (
                <div
                  key={game.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200"
                >
                  <div>
                    <div className="text-xs font-black text-slate-900">
                      Room {game.roomCode}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {game.totalMoves} moves • {game.durationSeconds}s
                    </div>
                  </div>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-xl border ${
                      won
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-slate-100 border-slate-200 text-slate-500'
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
