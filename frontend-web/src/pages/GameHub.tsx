import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../state/authStore';
import { GameType } from '../lib/types';
import { GameVisualIcon } from '../components/games/GameVisualIcon';
import { Trophy, Shield, Plus, LogIn, Sparkles } from 'lucide-react';

interface GameCardDef {
  type: GameType;
  title: string;
  badge: string;
  badgeColor: string;
  description: string;
  playersText: string;
  gradient: string;
  tags: string[];
}

export const GameHub: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const games: GameCardDef[] = [
    {
      type: 'BINGO',
      title: 'Bingo Multiplayer',
      badge: 'Classic',
      badgeColor: 'bg-[#f0ecfc] text-[#6d5ebd] border-[#e0d6f8]',
      description: 'Match numbers & race to complete 5 lines with friends!',
      playersText: '2–6 Players',
      gradient: 'from-[#f8788a] via-[#e271a5] to-[#8b7fe8]',
      tags: ['5x5 Grids', 'Emotes & Sounds'],
    },
    {
      type: 'TIC_TAC_TOE',
      title: 'Tic-Tac-Toe Duel',
      badge: 'Fast 1v1',
      badgeColor: 'bg-[#fee8ea] text-[#dc2626] border-[#fcd3d7]',
      description: 'Quick-turn duel of X vs O on 3x3 to 5x5 boards!',
      playersText: '2 Players (1v1)',
      gradient: 'from-[#8b7fe8] via-[#a78bfa] to-[#ec4899]',
      tags: ['Classic 3x3', 'Rapid Turns'],
    },
    {
      type: 'DOTS_AND_BOXES',
      title: 'Dots & Boxes',
      badge: 'Strategy',
      badgeColor: 'bg-[#fef5db] text-[#b45309] border-[#fde7ad]',
      description: 'Connect dots, capture boxes & claim your territory!',
      playersText: '2–4 Players',
      gradient: 'from-[#10b981] via-[#059669] to-[#0284c7]',
      tags: ['Box Capture', 'Bonus Turns'],
    },
  ];

  const handleSelectGame = (gameType: GameType) => {
    navigate(`/create-room?game=${gameType}`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-7 font-sans">
      {/* Greeting Header */}
      <div className="card-clay p-6 sm:p-7 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-[24px] bg-gradient-to-tr from-[#f8788a] via-[#e271a5] to-[#8b7fe8] flex items-center justify-center font-extrabold text-2xl text-white shadow-[0_8px_20px_rgba(240,115,145,0.32)]">
            {user?.username.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2a2050] tracking-tight flex items-center space-x-2">
              <span>Welcome, {user?.username}!</span>
              {user?.isGuest && (
                <span className="text-[10px] bg-[#f0ecfc] text-[#6d5ebd] font-bold px-2.5 py-0.5 rounded-full border border-[#e0d6f8]">
                  Guest
                </span>
              )}
            </h1>
            <p className="text-xs sm:text-sm font-medium text-[#7e749c] mt-0.5">
              Select a game below to host a room or challenge friends!
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/profile')}
          className="w-11 h-11 rounded-full bg-[#f4effc] hover:bg-[#ede6fa] border border-[#ede8f8] flex items-center justify-center text-[#8b7fe8] hover:scale-105 shadow-xs transition cursor-pointer"
          title="Profile"
        >
          <Shield className="w-5 h-5" />
        </button>
      </div>

      {/* Mini Stat Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="bg-[#f0ecfc] border border-[#e0d6f8] rounded-[22px] p-3.5 sm:p-4 text-center">
          <div className="text-[11px] font-semibold text-[#7e749c]">Matches</div>
          <div className="text-xl sm:text-2xl font-extrabold text-[#2a2050] mt-0.5">{user?.stats?.gamesPlayed || 0}</div>
        </div>
        <div className="bg-[#fee8ea] border border-[#fcd3d7] rounded-[22px] p-3.5 sm:p-4 text-center">
          <div className="text-[11px] font-semibold text-[#7e749c]">Total Wins</div>
          <div className="text-xl sm:text-2xl font-extrabold text-[#dc2626] mt-0.5">{user?.stats?.gamesWon || 0}</div>
        </div>
        <div className="bg-[#fef5db] border border-[#fde7ad] rounded-[22px] p-3.5 sm:p-4 text-center">
          <div className="text-[11px] font-semibold text-[#7e749c]">Win Streak</div>
          <div className="text-xl sm:text-2xl font-extrabold text-[#b45309] mt-0.5">{user?.stats?.currentWinStreak || 0}</div>
        </div>
        <div className="bg-[#e3f2fd] border border-[#c7e5fc] rounded-[22px] p-3.5 sm:p-4 text-center">
          <div className="text-[11px] font-semibold text-[#7e749c]">Player Level</div>
          <div className="text-xl sm:text-2xl font-extrabold text-[#0284c7] mt-0.5">Lvl {user?.level || 1}</div>
        </div>
      </div>

      {/* Section Title */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#2a2050] tracking-tight flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-[#f8788a]" />
            <span>Game Selection Hub</span>
          </h2>
          <p className="text-xs text-[#7e749c] font-medium mt-0.5">
            Pick your game to create a match or enter a friend's room code
          </p>
        </div>

        <button
          onClick={() => navigate('/join-room')}
          className="btn-pill-outline text-xs px-4 py-2 space-x-1.5 cursor-pointer flex items-center font-bold"
        >
          <LogIn className="w-3.5 h-3.5 text-[#8b7fe8]" />
          <span>Join Any Room</span>
        </button>
      </div>

      {/* 3 Games Interactive Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
        {games.map((g) => (
          <div
            key={g.type}
            className="card-clay p-6 flex flex-col justify-between group hover:border-[#8b7fe8] transition-all transform hover:-translate-y-1 shadow-[0_10px_25px_rgba(139,127,232,0.08)]"
          >
            <div>
              {/* Card Banner with Gradient & Friendly 3D Icon */}
              <div className={`w-full h-28 rounded-2xl bg-gradient-to-r ${g.gradient} flex items-center justify-between p-4 mb-4 shadow-md relative overflow-hidden`}>
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
                
                {/* Friendly 3D Game Icon */}
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shadow-inner border border-white/30 p-1.5 transition-transform group-hover:scale-105">
                  <GameVisualIcon type={g.type} size="lg" />
                </div>

                <div className="flex flex-col items-end space-y-1 z-10">
                  <span className="text-[10px] font-extrabold uppercase px-3 py-1 rounded-full bg-white/95 text-[#2a2050] shadow-2xs">
                    {g.badge}
                  </span>
                  <span className="text-[11px] font-bold text-white/95 drop-shadow-xs">
                    {g.playersText}
                  </span>
                </div>
              </div>

              {/* Title & Short Description */}
              <h3 className="text-lg font-black text-[#2a2050] tracking-tight mb-1">{g.title}</h3>
              <p className="text-xs text-[#7e749c] leading-relaxed font-medium mb-3 min-h-[32px]">
                {g.description}
              </p>

              {/* Feature Tags */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {g.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#f4effc] text-[#6d5ebd] border border-[#ede8f8]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2 border-t border-[#ede8f8]">
              <button
                onClick={() => handleSelectGame(g.type)}
                className={`w-full py-3 rounded-full text-xs font-extrabold text-white bg-gradient-to-r ${g.gradient} shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition flex items-center justify-center space-x-1.5 cursor-pointer`}
              >
                <Plus className="w-4 h-4" />
                <span>Create {g.title.split(' ')[0]} Room</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Navigation Footer */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <button
          onClick={() => navigate('/leaderboard')}
          className="card-clay p-4 text-left hover:border-[#8b7fe8] transition flex items-center space-x-4 cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#fef5db] border border-[#fde7ad] flex items-center justify-center text-[#b45309]">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-extrabold text-[#2a2050] group-hover:text-[#8b7fe8] transition-colors">
              Hall of Fame & Leaderboards
            </div>
            <div className="text-xs text-[#7e749c]">View top ranked champions across all games</div>
          </div>
        </button>

        <button
          onClick={() => navigate('/join-room')}
          className="card-clay p-4 text-left hover:border-[#8b7fe8] transition flex items-center space-x-4 cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#f0ecfc] border border-[#e0d6f8] flex items-center justify-center text-[#8b7fe8]">
            <LogIn className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-extrabold text-[#2a2050] group-hover:text-[#8b7fe8] transition-colors">
              Enter 6-Digit Room Code
            </div>
            <div className="text-xs text-[#7e749c]">Got an invite from a friend? Join here directly</div>
          </div>
        </button>
      </div>
    </div>
  );
};
