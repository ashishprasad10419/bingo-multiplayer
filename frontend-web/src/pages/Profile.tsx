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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6 font-sans">
      <button
        onClick={() => navigate('/')}
        className="btn-pill-outline text-xs px-4 py-2 space-x-1.5 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </button>

      {/* User Card (Image 3 Profile Header Style) */}
      <div className="card-clay p-6 sm:p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#f8788a] via-[#e271a5] to-[#8b7fe8] mx-auto flex items-center justify-center font-extrabold text-2xl text-white shadow-[0_8px_24px_rgba(240,115,145,0.35)] mb-3">
          {user.username.slice(0, 2).toUpperCase()}
        </div>
        <h2 className="text-2xl font-extrabold text-[#2a2050] flex items-center justify-center space-x-2">
          <span>{user.username}</span>
          {user.isGuest && (
            <span className="text-[10px] bg-[#f0ecfc] text-[#6d5ebd] font-bold px-2.5 py-0.5 rounded-full border border-[#e0d6f8]">
              Guest
            </span>
          )}
        </h2>
        <p className="text-xs sm:text-sm font-medium text-[#7e749c] mt-1">
          Level {user.level} • {user.xp} XP
        </p>

        {/* Stats Grid (Pastel Palette from Image 1 & 3) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-5 border-t border-[#ede8f8]">
          <div className="bg-[#f0ecfc] p-3.5 rounded-2xl border border-[#e0d6f8]">
            <div className="text-[11px] font-semibold text-[#7e749c]">Matches</div>
            <div className="text-xl sm:text-2xl font-extrabold text-[#2a2050] mt-0.5">
              {user.stats.gamesPlayed}
            </div>
          </div>
          <div className="bg-[#fee8ea] p-3.5 rounded-2xl border border-[#fcd3d7]">
            <div className="text-[11px] font-semibold text-[#dc2626]">Wins</div>
            <div className="text-xl sm:text-2xl font-extrabold text-[#dc2626] mt-0.5">
              {user.stats.gamesWon}
            </div>
          </div>
          <div className="bg-[#e3f2fd] p-3.5 rounded-2xl border border-[#c7e5fc]">
            <div className="text-[11px] font-semibold text-[#0284c7]">Win Rate</div>
            <div className="text-xl sm:text-2xl font-extrabold text-[#0284c7] mt-0.5">
              {winRate}%
            </div>
          </div>
          <div className="bg-[#fef5db] p-3.5 rounded-2xl border border-[#fde7ad]">
            <div className="text-[11px] font-semibold text-[#b45309]">Best Streak</div>
            <div className="text-xl sm:text-2xl font-extrabold text-[#b45309] mt-0.5">
              {user.stats.bestWinStreak}
            </div>
          </div>
        </div>
      </div>

      {/* PWA App Installation Option */}
      <InstallProfileCard />

      {/* Badges Section */}
      <div className="card-clay p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 text-sm font-extrabold text-[#2a2050]">
            <Award className="w-5 h-5 text-[#f59e0b]" />
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
                    ? 'bg-[#fef5db] border-[#fde7ad] text-[#b45309] shadow-2xs'
                    : 'bg-[#faf7fe] border-[#ede8f8] opacity-40 grayscale'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-white border border-[#fde7ad] flex items-center justify-center mx-auto mb-2 text-[#f59e0b] shadow-2xs">
                  <Trophy className="w-5 h-5" />
                </div>
                <div className="text-xs font-extrabold text-[#2a2050] truncate">
                  {badge.name}
                </div>
                <div className="text-[10px] text-[#7e749c] line-clamp-2 mt-0.5 font-medium">
                  {badge.description}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Matches */}
      <div className="card-clay p-6 shadow-sm">
        <div className="flex items-center space-x-2 text-sm font-extrabold text-[#2a2050] mb-4">
          <Clock className="w-5 h-5 text-[#8b7fe8]" />
          <span>Match History</span>
        </div>

        <div className="space-y-2.5">
          {history.length === 0 ? (
            <div className="text-xs text-[#7e749c] py-4 text-center font-medium">
              No matches played yet.
            </div>
          ) : (
            history.map((game) => {
              const won = game.winnerId === user.id;
              return (
                <div
                  key={game.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-[#faf7fe] border border-[#ede8f8]"
                >
                  <div>
                    <div className="text-xs font-extrabold text-[#2a2050]">
                      Room {game.roomCode}
                    </div>
                    <div className="text-[11px] text-[#7e749c] font-medium">
                      {game.totalMoves} moves • {game.durationSeconds}s
                    </div>
                  </div>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full border ${
                      won
                        ? 'bg-[#e6f7ef] border-[#c3eed7] text-[#047857]'
                        : 'bg-[#fee8ea] border-[#fcd3d7] text-[#dc2626]'
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
