import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../state/authStore';
import { roomApi } from '../lib/api';
import { GameType } from '../lib/types';
import { GameVisualIcon } from '../components/games/GameVisualIcon';
import { Trophy, Shield, Plus, LogIn, Sparkles, Flame, Zap, Award, CheckCircle2 } from 'lucide-react';

interface GameCardDef {
  type: GameType;
  title: string;
  badge: string;
  cardBg: string;
  cardBorder: string;
  cardShadow: string;
  bannerGrad: string;
  titleColor: string;
  btnQuick: string;
  btnCustom: string;
}

export const GameHub: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [quickCode, setQuickCode] = useState('');
  const [matchingType, setMatchingType] = useState<GameType | null>(null);

  const handleQuickPlay = async (type: GameType) => {
    setMatchingType(type);
    try {
      const room = await roomApi.quickPlay({ gameType: type });
      navigate(`/lobby/${room.roomCode}`);
    } catch (err) {
      navigate(`/create-room?game=${type}`);
    } finally {
      setMatchingType(null);
    }
  };

  const games: GameCardDef[] = [
    {
      type: 'BINGO',
      title: 'Bingo',
      badge: '🎱 Bingo Party',
      cardBg: 'bg-[#fff1f2] dark:bg-[#1a0c14]',
      cardBorder: 'border-[#ff4d6d]',
      cardShadow: 'shadow-[0_8px_0_#d90429]',
      bannerGrad: 'from-[#ff758f] via-[#ff4d6d] to-[#c9184a]',
      titleColor: 'text-[#800f2f] dark:text-[#ffb3c1]',
      btnQuick: 'bg-[#ff4d6d] hover:bg-[#d90429] text-white shadow-[0_4px_0_#a4161a]',
      btnCustom: 'bg-white dark:bg-slate-800 text-[#c9184a] dark:text-[#ffb3c1] border-2 border-[#ff758f] hover:bg-[#ffe5ec]',
    },
    {
      type: 'TIC_TAC_TOE',
      title: 'Tic-Tac-Toe',
      badge: '⚔️ 1v1 Duel',
      cardBg: 'bg-[#f5f3ff] dark:bg-[#140c24]',
      cardBorder: 'border-[#8b5cf6]',
      cardShadow: 'shadow-[0_8px_0_#6d28d9]',
      bannerGrad: 'from-[#a78bfa] via-[#8b5cf6] to-[#6d28d9]',
      titleColor: 'text-[#4c1d95] dark:text-[#ddd6fe]',
      btnQuick: 'bg-[#8b5cf6] hover:bg-[#7c3aed] text-white shadow-[0_4px_0_#5b21b6]',
      btnCustom: 'bg-white dark:bg-slate-800 text-[#6d28d9] dark:text-[#ddd6fe] border-2 border-[#c4b5fd] hover:bg-[#ede9fe]',
    },
    {
      type: 'DOTS_AND_BOXES',
      title: 'Dots & Boxes',
      badge: '📐 Box Strategy',
      cardBg: 'bg-[#f0fdf4] dark:bg-[#081a10]',
      cardBorder: 'border-[#22c55e]',
      cardShadow: 'shadow-[0_8px_0_#16a34a]',
      bannerGrad: 'from-[#4ade80] via-[#22c55e] to-[#15803d]',
      titleColor: 'text-[#14532d] dark:text-[#bbf7d0]',
      btnQuick: 'bg-[#22c55e] hover:bg-[#16a34a] text-white shadow-[0_4px_0_#15803d]',
      btnCustom: 'bg-white dark:bg-slate-800 text-[#15803d] dark:text-[#bbf7d0] border-2 border-[#86efac] hover:bg-[#dcfce7]',
    },
    {
      type: 'CONNECT_FOUR',
      title: 'Connect Four',
      badge: '🔴🟡 4-in-a-Row',
      cardBg: 'bg-[#eff6ff] dark:bg-[#0a1628]',
      cardBorder: 'border-[#3b82f6]',
      cardShadow: 'shadow-[0_8px_0_#1d4ed8]',
      bannerGrad: 'from-[#60a5fa] via-[#3b82f6] to-[#1d4ed8]',
      titleColor: 'text-[#1e3a8a] dark:text-[#bfdbfe]',
      btnQuick: 'bg-[#3b82f6] hover:bg-[#2563eb] text-white shadow-[0_4px_0_#1e40af]',
      btnCustom: 'bg-white dark:bg-slate-800 text-[#1d4ed8] dark:text-[#bfdbfe] border-2 border-[#93c5fd] hover:bg-[#dbeafe]',
    },
    {
      type: 'ROCK_PAPER_SCISSORS',
      title: 'Rock Paper Scissors',
      badge: '✊✌️ RPS Clash',
      cardBg: 'bg-[#fff7ed] dark:bg-[#210f05]',
      cardBorder: 'border-[#f97316]',
      cardShadow: 'shadow-[0_8px_0_#c2410c]',
      bannerGrad: 'from-[#fb923c] via-[#f97316] to-[#c2410c]',
      titleColor: 'text-[#7c2d12] dark:text-[#fed7aa]',
      btnQuick: 'bg-[#f97316] hover:bg-[#ea580c] text-white shadow-[0_4px_0_#9a3412]',
      btnCustom: 'bg-white dark:bg-slate-800 text-[#c2410c] dark:text-[#fed7aa] border-2 border-[#fdba74] hover:bg-[#ffedd5]',
    },
    {
      type: 'MEMORY',
      title: 'Memory Match',
      badge: '🃏 Card Match',
      cardBg: 'bg-[#faf5ff] dark:bg-[#180a26]',
      cardBorder: 'border-[#a855f7]',
      cardShadow: 'shadow-[0_8px_0_#7e22ce]',
      bannerGrad: 'from-[#c084fc] via-[#a855f7] to-[#7e22ce]',
      titleColor: 'text-[#581c87] dark:text-[#f3e8ff]',
      btnQuick: 'bg-[#a855f7] hover:bg-[#9333ea] text-white shadow-[0_4px_0_#6b21a8]',
      btnCustom: 'bg-white dark:bg-slate-800 text-[#7e22ce] dark:text-[#f3e8ff] border-2 border-[#e9d5ff] hover:bg-[#f3e8ff]',
    },
    {
      type: 'NUMBER_RUSH',
      title: 'Number Rush',
      badge: '⚡ Speed Tap',
      cardBg: 'bg-[#ecfeff] dark:bg-[#061c22]',
      cardBorder: 'border-[#06b6d4]',
      cardShadow: 'shadow-[0_8px_0_#0e7490]',
      bannerGrad: 'from-[#22d3ee] via-[#06b6d4] to-[#0e7490]',
      titleColor: 'text-[#164e63] dark:text-[#cffafe]',
      btnQuick: 'bg-[#06b6d4] hover:bg-[#0891b2] text-white shadow-[0_4px_0_#155e75]',
      btnCustom: 'bg-white dark:bg-slate-800 text-[#0e7490] dark:text-[#cffafe] border-2 border-[#a5f3fc] hover:bg-[#cffafe]',
    },
    {
      type: 'WORD_SCRAMBLE',
      title: 'Word Scramble',
      badge: '🔤 Anagram Race',
      cardBg: 'bg-[#fefce8] dark:bg-[#1c1a06]',
      cardBorder: 'border-[#eab308]',
      cardShadow: 'shadow-[0_8px_0_#a16207]',
      bannerGrad: 'from-[#fde047] via-[#eab308] to-[#a16207]',
      titleColor: 'text-[#713f12] dark:text-[#fef08a]',
      btnQuick: 'bg-[#eab308] hover:bg-[#ca8a04] text-white shadow-[0_4px_0_#854d0e]',
      btnCustom: 'bg-white dark:bg-slate-800 text-[#a16207] dark:text-[#fef08a] border-2 border-[#fef08a] hover:bg-[#fef9c3]',
    },
    {
      type: 'QUIZ_BATTLE',
      title: 'Quiz Battle',
      badge: '🧠 Trivia Duel',
      cardBg: 'bg-[#fdf2f8] dark:bg-[#200a18]',
      cardBorder: 'border-[#ec4899]',
      cardShadow: 'shadow-[0_8px_0_#be185d]',
      bannerGrad: 'from-[#f472b6] via-[#ec4899] to-[#be185d]',
      titleColor: 'text-[#831843] dark:text-[#fce7f3]',
      btnQuick: 'bg-[#ec4899] hover:bg-[#db2777] text-white shadow-[0_4px_0_#9d174d]',
      btnCustom: 'bg-white dark:bg-slate-800 text-[#be185d] dark:text-[#fce7f3] border-2 border-[#fbcfe8] hover:bg-[#fce7f3]',
    },
  ];

  const handleSelectGame = (gameType: GameType) => {
    navigate(`/create-room?game=${gameType}`);
  };

  const handleQuickJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = quickCode.trim().toUpperCase();
    if (clean) {
      navigate(`/join/${clean}`);
    }
  };

  const gamesPlayed = user?.stats?.gamesPlayed || 0;
  const gamesWon = user?.stats?.gamesWon || 0;
  const winRate = gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0;
  const level = user?.level || 1;
  const xp = user?.xp || 0;
  const xpInCurrentLevel = xp % 500;
  const xpProgressPercent = Math.min(100, Math.round((xpInCurrentLevel / 500) * 100));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-6 font-sans">
      {/* ========================================================================= */}
      {/* 1. COMPACT & RICH ARCADE PLAYER COMMAND DECK (Eliminates dead blank space) */}
      {/* ========================================================================= */}
      <div className="card-clay p-5 sm:p-6 shadow-sm border border-[#ede8f8] relative overflow-hidden">
        {/* Soft background ambient glow */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-gradient-to-br from-[#8b7fe8]/10 via-[#f8788a]/10 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          {/* Col 1: Player Identity, Level & XP Bar */}
          <div className="lg:col-span-4 flex items-center space-x-4">
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-[24px] bg-gradient-to-tr from-[#f8788a] via-[#e271a5] to-[#8b7fe8] flex items-center justify-center font-black text-2xl text-white shadow-[0_8px_20px_rgba(240,115,145,0.35)]">
                {user?.username.slice(0, 2).toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-[#2a2050] text-white text-[10px] font-black border-2 border-white shadow-xs">
                Lvl {level}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-black text-[#2a2050] truncate tracking-tight">
                  {user?.username}
                </h1>
                {user?.isGuest && (
                  <span className="text-[10px] bg-[#f0ecfc] text-[#6d5ebd] font-bold px-2 py-0.5 rounded-full border border-[#e0d6f8] flex-shrink-0">
                    Guest
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold text-[#7e749c]">
                Arcade Challenger • Ready to Play
              </p>

              {/* XP Progress Bar */}
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-[#7e749c]">
                  <span>XP: {xpInCurrentLevel} / 500</span>
                  <span>Level {level + 1}</span>
                </div>
                <div className="w-full h-2 bg-[#f0ecfc] rounded-full overflow-hidden border border-[#e0d6f8]">
                  <div
                    className="h-full bg-gradient-to-r from-[#f8788a] via-[#e271a5] to-[#8b7fe8] rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(8, xpProgressPercent)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Col 2: High-Density 4-Chip Stat Matrix */}
          <div className="lg:col-span-5 grid grid-cols-4 gap-2 sm:gap-3">
            <div className="bg-[#f0ecfc] border border-[#e0d6f8] rounded-2xl p-2.5 sm:p-3 text-center transition hover:scale-[1.02]">
              <div className="text-[10px] font-bold text-[#6d5ebd] flex items-center justify-center space-x-1">
                <Zap className="w-3 h-3 text-[#8b7fe8]" />
                <span className="hidden sm:inline">Matches</span>
              </div>
              <div className="text-lg sm:text-xl font-black text-[#2a2050] mt-0.5">{gamesPlayed}</div>
            </div>

            <div className="bg-[#fee8ea] border border-[#fcd3d7] rounded-2xl p-2.5 sm:p-3 text-center transition hover:scale-[1.02]">
              <div className="text-[10px] font-bold text-[#dc2626] flex items-center justify-center space-x-1">
                <Award className="w-3 h-3 text-[#f8788a]" />
                <span className="hidden sm:inline">Wins</span>
              </div>
              <div className="text-lg sm:text-xl font-black text-[#dc2626] mt-0.5">{gamesWon}</div>
            </div>

            <div className="bg-[#fef5db] border border-[#fde7ad] rounded-2xl p-2.5 sm:p-3 text-center transition hover:scale-[1.02]">
              <div className="text-[10px] font-bold text-[#b45309] flex items-center justify-center space-x-1">
                <Flame className="w-3 h-3 text-[#f59e0b] fill-[#f59e0b]" />
                <span className="hidden sm:inline">Streak</span>
              </div>
              <div className="text-lg sm:text-xl font-black text-[#b45309] mt-0.5">{user?.stats?.currentWinStreak || 0}</div>
            </div>

            <div className="bg-[#e6f7ef] border border-[#c3eed7] rounded-2xl p-2.5 sm:p-3 text-center transition hover:scale-[1.02]">
              <div className="text-[10px] font-bold text-[#047857] flex items-center justify-center space-x-1">
                <CheckCircle2 className="w-3 h-3 text-[#10b981]" />
                <span className="hidden sm:inline">Win %</span>
              </div>
              <div className="text-lg sm:text-xl font-black text-[#047857] mt-0.5">{winRate}%</div>
            </div>
          </div>

          {/* Col 3: Direct Quick-Join Room Input (High interactive utility, zero dead space) */}
          <div className="lg:col-span-3 bg-[#faf7fe] p-3 rounded-2xl border border-[#ede8f8] flex flex-col justify-center">
            <div className="text-[11px] font-extrabold text-[#2a2050] flex items-center space-x-1.5 mb-1.5">
              <LogIn className="w-3.5 h-3.5 text-[#8b7fe8]" />
              <span>Join with Room Code:</span>
            </div>
            <form onSubmit={handleQuickJoin} className="flex items-center space-x-1.5">
              <input
                type="text"
                maxLength={6}
                value={quickCode}
                onChange={(e) => setQuickCode(e.target.value.toUpperCase())}
                placeholder="6-DIGIT"
                className="flex-1 min-w-0 bg-white border border-[#ede8f8] rounded-xl px-2.5 py-1.5 text-xs font-mono font-black text-center text-[#2a2050] uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-[#8b7fe8]/30"
              />
              <button
                type="submit"
                disabled={!quickCode.trim()}
                className="btn-gradient px-3 py-1.5 text-xs font-black shadow-xs disabled:opacity-50 cursor-pointer flex-shrink-0"
              >
                Join
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SECTION HEADER                                                         */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h2 className="text-2xl font-black text-[#2a2050] tracking-tight flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-[#f8788a]" />
            <span>Choose Your Game</span>
          </h2>
          <p className="text-xs text-[#7e749c] font-medium mt-0.5">
            Select a game mode to configure custom rules & invite your friends
          </p>
        </div>

        <button
          onClick={() => navigate('/leaderboard')}
          className="btn-pill-outline text-xs px-4 py-2 space-x-1.5 cursor-pointer flex items-center font-extrabold"
        >
          <Trophy className="w-3.5 h-3.5 text-[#f59e0b]" />
          <span>Hall of Fame</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 3. VIBRANT CARTOONISH ARCADE SHOWCASE (Big visual art, colorful, clean)  */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {games.map((g) => (
          <div
            key={g.type}
            className={`${g.cardBg} ${g.cardBorder} ${g.cardShadow} border-[3.5px] rounded-[32px] p-5 sm:p-6 flex flex-col justify-between group transition-all duration-300 hover:-translate-y-2 relative overflow-hidden`}
          >
            <div>
              {/* Game Visual Header Banner with Dynamic Game Colors */}
              <div className={`w-full h-40 rounded-[24px] bg-gradient-to-tr ${g.bannerGrad} flex items-center justify-between p-5 mb-5 shadow-sm relative overflow-hidden`}>
                <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-white/20 rounded-full blur-xl pointer-events-none" />
                <div className="absolute -left-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-lg pointer-events-none" />

                {/* 3D Game Visual Icon in Glossy Bubble */}
                <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-[22px] bg-white/35 backdrop-blur-xs flex items-center justify-center shadow-inner border border-white/40 p-2 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <GameVisualIcon type={g.type} size="xl" />
                </div>

                {/* Cute Cartoon Pill Badge */}
                <div className="z-10 flex flex-col items-end">
                  <span className="text-xs font-black uppercase px-3.5 py-1.5 rounded-full bg-white/95 dark:bg-slate-900/90 text-slate-800 dark:text-white shadow-md tracking-wider border border-white/40">
                    {g.badge}
                  </span>
                </div>
              </div>

              {/* Title (Big, bold, cartoonish, zero clutter) */}
              <h3 className={`text-2xl sm:text-[26px] font-black ${g.titleColor} text-center tracking-tight mb-2`}>
                {g.title}
              </h3>
            </div>

            {/* Action Buttons: Quick Match (1-Click) & Custom Room */}
            <div className="pt-4 space-y-2.5">
              <button
                onClick={() => handleQuickPlay(g.type)}
                disabled={matchingType !== null}
                className={`w-full py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider ${g.btnQuick} transition-all duration-150 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 active:translate-y-1 active:shadow-none hover:brightness-105`}
              >
                <Zap className={`w-4 h-4 ${matchingType === g.type ? 'animate-spin' : ''}`} />
                <span>{matchingType === g.type ? 'Finding Match...' : '⚡ Quick Match (1-Click)'}</span>
              </button>

              <button
                onClick={() => handleSelectGame(g.type)}
                className={`w-full py-2.5 rounded-2xl text-xs font-black uppercase tracking-wide ${g.btnCustom} transition-all flex items-center justify-center space-x-1.5 cursor-pointer active:scale-95`}
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Create Room</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* 4. BOTTOM VALUE-ADD CARDS (Cross-Platform play & Leaderboard spotlight)   */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        {/* Hall of Fame Spotlight */}
        <div
          onClick={() => navigate('/leaderboard')}
          className="card-clay p-5 hover:border-[#8b7fe8] transition flex items-center space-x-4 cursor-pointer group shadow-2xs"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#fef3c7] to-[#fde047] border border-[#fde7ad] flex items-center justify-center text-[#b45309] shadow-xs group-hover:scale-105 transition-transform flex-shrink-0">
            <Trophy className="w-7 h-7 stroke-[2.2]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-black text-[#2a2050] group-hover:text-[#8b7fe8] transition-colors">
                Hall of Fame & Global Rankings
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-[#fef5db] text-[#b45309] rounded-full border border-[#fde7ad]">
                Live
              </span>
            </div>
            <p className="text-xs text-[#7e749c] font-medium mt-0.5">
              Climb the ranks across Bingo, Tic-Tac-Toe, and Dots & Boxes to earn exclusive medals!
            </p>
          </div>
        </div>

        {/* Instant Multi-Device Cross Play */}
        <div
          onClick={() => navigate('/profile')}
          className="card-clay p-5 hover:border-[#8b7fe8] transition flex items-center space-x-4 cursor-pointer group shadow-2xs"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#e0e7ff] to-[#ddd6fe] border border-[#c7d2fe] flex items-center justify-center text-[#6366f1] shadow-xs group-hover:scale-105 transition-transform flex-shrink-0">
            <Shield className="w-7 h-7 stroke-[2.2]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-black text-[#2a2050] group-hover:text-[#8b7fe8] transition-colors">
                Cross-Platform & Invite Friends
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-[#e0e7ff] text-[#4338ca] rounded-full border border-[#c7d2fe]">
                Web & APK
              </span>
            </div>
            <p className="text-xs text-[#7e749c] font-medium mt-0.5">
              Share 1-tap WhatsApp links to play instantly with friends on phone, tablet, or browser.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
