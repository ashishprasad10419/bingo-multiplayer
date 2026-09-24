import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { roomApi } from '../lib/api';
import { GameType } from '../lib/types';
import { GameVisualIcon } from '../components/games/GameVisualIcon';
import { Trophy, Shield, Plus, LogIn, Sparkles, Zap, Bot } from 'lucide-react';
import { BotDifficultyModal } from '../components/BotDifficultyModal';

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
  isPlayable?: boolean;
  sequenceNo?: number;
  statusBadge?: string;
}

export const GameHub: React.FC = () => {
  const navigate = useNavigate();
  const [quickCode, setQuickCode] = useState('');
  const [matchingType, setMatchingType] = useState<GameType | null>(null);
  const [botModalGame, setBotModalGame] = useState<GameType | null>(null);
  const [filterTab, setFilterTab] = useState<'ALL' | 'PLAYABLE' | 'ROADMAP'>('ALL');
  const [upcomingModalGame, setUpcomingModalGame] = useState<GameCardDef | null>(null);

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
      titleColor: 'text-[#4c1d95] dark:text-[#ede9fe]',
      btnQuick: 'bg-[#8b5cf6] hover:bg-[#7c3aed] text-white shadow-[0_4px_0_#5b21b6]',
      btnCustom: 'bg-white dark:bg-slate-800 text-[#6d28d9] dark:text-[#ede9fe] border-2 border-[#c4b5fd] hover:bg-[#ede9fe]',
    },
    {
      type: 'DOTS_AND_BOXES',
      title: 'Dots & Boxes',
      badge: '📐 Territory War',
      cardBg: 'bg-[#ecfdf5] dark:bg-[#062016]',
      cardBorder: 'border-[#10b981]',
      cardShadow: 'shadow-[0_8px_0_#047857]',
      bannerGrad: 'from-[#34d399] via-[#10b981] to-[#059669]',
      titleColor: 'text-[#064e3b] dark:text-[#d1fae5]',
      btnQuick: 'bg-[#10b981] hover:bg-[#059669] text-white shadow-[0_4px_0_#065f46]',
      btnCustom: 'bg-white dark:bg-slate-800 text-[#047857] dark:text-[#d1fae5] border-2 border-[#a7f3d0] hover:bg-[#d1fae5]',
    },
    {
      type: 'CONNECT_FOUR',
      title: 'Connect Four',
      badge: '🔴 4-in-a-Row',
      cardBg: 'bg-[#eff6ff] dark:bg-[#0b192c]',
      cardBorder: 'border-[#3b82f6]',
      cardShadow: 'shadow-[0_8px_0_#1d4ed8]',
      bannerGrad: 'from-[#60a5fa] via-[#3b82f6] to-[#1d4ed8]',
      titleColor: 'text-[#1e3a8a] dark:text-[#dbeafe]',
      btnQuick: 'bg-[#3b82f6] hover:bg-[#2563eb] text-white shadow-[0_4px_0_#1e40af]',
      btnCustom: 'bg-white dark:bg-slate-800 text-[#1d4ed8] dark:text-[#dbeafe] border-2 border-[#bfdbfe] hover:bg-[#dbeafe]',
    },
    {
      type: 'ROCK_PAPER_SCISSORS',
      title: 'RPS Arena',
      badge: '✊ Quick Clash',
      cardBg: 'bg-[#fffbeb] dark:bg-[#241a06]',
      cardBorder: 'border-[#f59e0b]',
      cardShadow: 'shadow-[0_8px_0_#b45309]',
      bannerGrad: 'from-[#fbbf24] via-[#f59e0b] to-[#d97706]',
      titleColor: 'text-[#78350f] dark:text-[#fef3c7]',
      btnQuick: 'bg-[#f59e0b] hover:bg-[#d97706] text-white shadow-[0_4px_0_#92400e]',
      btnCustom: 'bg-white dark:bg-slate-800 text-[#b45309] dark:text-[#fef3c7] border-2 border-[#fde68a] hover:bg-[#fef3c7]',
    },
    {
      type: 'MEMORY',
      title: 'Memory Cards',
      badge: '🃏 Brain Match',
      cardBg: 'bg-[#faf5ff] dark:bg-[#1a0a2a]',
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
      badge: '🔢 Speed Tap',
      cardBg: 'bg-[#f0fdf4] dark:bg-[#072110]',
      cardBorder: 'border-[#22c55e]',
      cardShadow: 'shadow-[0_8px_0_#15803d]',
      bannerGrad: 'from-[#4ade80] via-[#22c55e] to-[#16a34a]',
      titleColor: 'text-[#14532d] dark:text-[#dcfce7]',
      btnQuick: 'bg-[#22c55e] hover:bg-[#16a34a] text-white shadow-[0_4px_0_#166534]',
      btnCustom: 'bg-white dark:bg-slate-800 text-[#15803d] dark:text-[#dcfce7] border-2 border-[#bbf7d0] hover:bg-[#dcfce7]',
    },
    {
      type: 'WORD_SCRAMBLE',
      title: 'Word Scramble',
      badge: '📝 Anagram Race',
      cardBg: 'bg-[#fff7ed] dark:bg-[#281305]',
      cardBorder: 'border-[#f97316]',
      cardShadow: 'shadow-[0_8px_0_#c2410c]',
      bannerGrad: 'from-[#fb923c] via-[#f97316] to-[#ea580c]',
      titleColor: 'text-[#7c2d12] dark:text-[#ffedd5]',
      btnQuick: 'bg-[#f97316] hover:bg-[#ea580c] text-white shadow-[0_4px_0_#9a3412]',
      btnCustom: 'bg-white dark:bg-slate-800 text-[#c2410c] dark:text-[#ffedd5] border-2 border-[#fed7aa] hover:bg-[#ffedd5]',
    },
    {
      type: 'SHIP_BATTLE',
      title: 'Ship Battle',
      badge: '⚓ 1v1 Naval Duel',
      cardBg: 'bg-[#f0f9ff] dark:bg-[#081b2e]',
      cardBorder: 'border-[#0284c7]',
      cardShadow: 'shadow-[0_8px_0_#0369a1]',
      bannerGrad: 'from-[#38bdf8] via-[#0284c7] to-[#1e3a8a]',
      titleColor: 'text-[#0c4a6e] dark:text-[#bae6fd]',
      btnQuick: 'bg-[#0284c7] hover:bg-[#0369a1] text-white shadow-[0_4px_0_#075985]',
      btnCustom: 'bg-white dark:bg-slate-800 text-[#0369a1] dark:text-[#bae6fd] border-2 border-[#7dd3fc] hover:bg-[#e0f2fe]',
      isPlayable: true,
      sequenceNo: 10,
      statusBadge: '🟢 Live & Playable',
    },
    {
      type: 'MASTERMIND',
      title: 'Mastermind',
      badge: '🧩 Codebreaker',
      cardBg: 'bg-[#eef2ff] dark:bg-[#13112c]',
      cardBorder: 'border-[#6366f1]',
      cardShadow: 'shadow-[0_8px_0_#4338ca]',
      bannerGrad: 'from-[#818cf8] via-[#6366f1] to-[#4338ca]',
      titleColor: 'text-[#312e81] dark:text-[#c7d2fe]',
      btnQuick: 'bg-[#6366f1] hover:bg-[#4f46e5] text-white shadow-[0_4px_0_#3730a3]',
      btnCustom: 'bg-white dark:bg-slate-800 text-[#4f46e5] dark:text-[#c7d2fe] border-2 border-[#a5b4fc] hover:bg-[#e0e7ff]',
      isPlayable: true,
      sequenceNo: 11,
      statusBadge: '🟢 Live & Playable',
    },
    {
      type: 'LUDO',
      title: 'Ludo Party',
      badge: '🎲 Classic 4P',
      cardBg: 'bg-[#fefce8] dark:bg-[#251f05]',
      cardBorder: 'border-[#eab308]',
      cardShadow: 'shadow-[0_8px_0_#ca8a04]',
      bannerGrad: 'from-[#fde047] via-[#eab308] to-[#ca8a04]',
      titleColor: 'text-[#713f12] dark:text-[#fef08a]',
      btnQuick: 'bg-[#eab308] hover:bg-[#ca8a04] text-white shadow-[0_4px_0_#a16207]',
      btnCustom: 'bg-white dark:bg-slate-800 text-[#ca8a04] dark:text-[#fef08a] border-2 border-[#fef08a] hover:bg-[#fef9c3]',
      isPlayable: false,
      sequenceNo: 12,
      statusBadge: '🔨 Game 12: Next Up',
    },
    {
      type: 'DETECTIVE_MYSTERY',
      title: 'Detective Mystery',
      badge: '🔍 Clue Deduction',
      cardBg: 'bg-[#fffbeb] dark:bg-[#261b05]',
      cardBorder: 'border-[#d97706]',
      cardShadow: 'shadow-[0_8px_0_#b45309]',
      bannerGrad: 'from-[#fbbf24] via-[#d97706] to-[#92400e]',
      titleColor: 'text-[#78350f] dark:text-[#fef3c7]',
      btnQuick: 'bg-[#d97706] hover:bg-[#b45309] text-white shadow-[0_4px_0_#78350f]',
      btnCustom: 'bg-white dark:bg-slate-800 text-[#b45309] dark:text-[#fef3c7] border-2 border-[#fde68a] hover:bg-[#fef3c7]',
      isPlayable: false,
      sequenceNo: 13,
      statusBadge: '🕒 Game 13: In Queue',
    },
    {
      type: 'SUDOKU_BATTLE',
      title: 'Sudoku Battle',
      badge: '🔢 Number Duel',
      cardBg: 'bg-[#ecfeff] dark:bg-[#062329]',
      cardBorder: 'border-[#06b6d4]',
      cardShadow: 'shadow-[0_8px_0_#0891b2]',
      bannerGrad: 'from-[#22d3ee] via-[#06b6d4] to-[#0e7490]',
      titleColor: 'text-[#164e63] dark:text-[#cffafe]',
      btnQuick: 'bg-[#06b6d4] hover:bg-[#0891b2] text-white shadow-[0_4px_0_#155e75]',
      btnCustom: 'bg-white dark:bg-slate-800 text-[#0891b2] dark:text-[#cffafe] border-2 border-[#a5f3fc] hover:bg-[#cffafe]',
      isPlayable: false,
      sequenceNo: 14,
      statusBadge: '🕒 Game 14: In Queue',
    },
    {
      type: 'BATTLE_2048',
      title: '2048 Battle',
      badge: '⚡ Tile Clash',
      cardBg: 'bg-[#fff7ed] dark:bg-[#281507]',
      cardBorder: 'border-[#f97316]',
      cardShadow: 'shadow-[0_8px_0_#ea580c]',
      bannerGrad: 'from-[#fb923c] via-[#f97316] to-[#c2410c]',
      titleColor: 'text-[#7c2d12] dark:text-[#ffedd5]',
      btnQuick: 'bg-[#f97316] hover:bg-[#ea580c] text-white shadow-[0_4px_0_#9a3412]',
      btnCustom: 'bg-white dark:bg-slate-800 text-[#ea580c] dark:text-[#ffedd5] border-2 border-[#fed7aa] hover:bg-[#ffedd5]',
      isPlayable: false,
      sequenceNo: 15,
      statusBadge: '🕒 Game 15: In Queue',
    },
    {
      type: 'CHECKERS',
      title: 'Checkers Duel',
      badge: '👑 Board Jump',
      cardBg: 'bg-[#fefce8] dark:bg-[#241c05]',
      cardBorder: 'border-[#b45309]',
      cardShadow: 'shadow-[0_8px_0_#78350f]',
      bannerGrad: 'from-[#d97706] via-[#b45309] to-[#78350f]',
      titleColor: 'text-[#451a03] dark:text-[#fef3c7]',
      btnQuick: 'bg-[#b45309] hover:bg-[#92400e] text-white shadow-[0_4px_0_#78350f]',
      btnCustom: 'bg-white dark:bg-slate-800 text-[#92400e] dark:text-[#fef3c7] border-2 border-[#fde68a] hover:bg-[#fef3c7]',
      isPlayable: false,
      sequenceNo: 16,
      statusBadge: '🕒 Game 16: In Queue',
    },
    {
      type: 'CARD_BATTLE',
      title: 'Card Battle',
      badge: '🃏 Deck Strategy',
      cardBg: 'bg-[#fff1f2] dark:bg-[#260a12]',
      cardBorder: 'border-[#f43f5e]',
      cardShadow: 'shadow-[0_8px_0_#e11d48]',
      bannerGrad: 'from-[#fb7185] via-[#f43f5e] to-[#be123c]',
      titleColor: 'text-[#881337] dark:text-[#ffe4e6]',
      btnQuick: 'bg-[#f43f5e] hover:bg-[#e11d48] text-white shadow-[0_4px_0_#9f1239]',
      btnCustom: 'bg-white dark:bg-slate-800 text-[#e11d48] dark:text-[#ffe4e6] border-2 border-[#fecdd3] hover:bg-[#ffe4e6]',
      isPlayable: false,
      sequenceNo: 17,
      statusBadge: '🕒 Game 17: In Queue',
    },
    {
      type: 'CHESS',
      title: 'Chess Grandmaster',
      badge: '♟️ Tactical Duel',
      cardBg: 'bg-[#eef2ff] dark:bg-[#0e1026]',
      cardBorder: 'border-[#4338ca]',
      cardShadow: 'shadow-[0_8px_0_#312e81]',
      bannerGrad: 'from-[#6366f1] via-[#4338ca] to-[#312e81]',
      titleColor: 'text-[#1e1b4b] dark:text-[#e0e7ff]',
      btnQuick: 'bg-[#4338ca] hover:bg-[#3730a3] text-white shadow-[0_4px_0_#1e1b4b]',
      btnCustom: 'bg-white dark:bg-slate-800 text-[#3730a3] dark:text-[#e0e7ff] border-2 border-[#c7d2fe] hover:bg-[#e0e7ff]',
      isPlayable: false,
      sequenceNo: 18,
      statusBadge: '🕒 Game 18: In Queue',
    },
    {
      type: 'PIRATE_BATTLE',
      title: 'Pirate Battle',
      badge: '🏴‍☠️ High Seas',
      cardBg: 'bg-[#f8fafc] dark:bg-[#0b1120]',
      cardBorder: 'border-[#0f172a]',
      cardShadow: 'shadow-[0_8px_0_#020617]',
      bannerGrad: 'from-[#334155] via-[#1e293b] to-[#0f172a]',
      titleColor: 'text-[#020617] dark:text-[#f1f5f9]',
      btnQuick: 'bg-[#0f172a] hover:bg-[#1e293b] text-white shadow-[0_4px_0_#020617]',
      btnCustom: 'bg-white dark:bg-slate-800 text-[#1e293b] dark:text-[#f1f5f9] border-2 border-[#cbd5e1] hover:bg-[#e2e8f0]',
      isPlayable: false,
      sequenceNo: 19,
      statusBadge: '🕒 Game 19: In Queue',
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-6 font-sans">
      {/* ========================================================================= */}
      {/* SECTION HEADER & QUICK ACTIONS                                            */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div>
          <h2 className="text-2xl font-black text-[#2a2050] tracking-tight flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-[#f8788a]" />
            <span>Choose Your Game</span>
          </h2>
          <p className="text-xs text-[#7e749c] font-medium mt-0.5">
            Select a game mode to configure custom rules & invite your friends
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {/* Quick Room Code Join Form */}
          <form onSubmit={handleQuickJoin} className="flex items-center bg-white dark:bg-slate-800 border-2 border-[#e0d6f8] dark:border-slate-700 rounded-2xl p-1 shadow-xs">
            <input
              type="text"
              maxLength={6}
              value={quickCode}
              onChange={(e) => setQuickCode(e.target.value.toUpperCase())}
              placeholder="ROOM CODE"
              className="w-24 sm:w-28 px-2.5 py-1 text-xs font-mono font-black text-center text-[#2a2050] dark:text-white uppercase tracking-wider focus:outline-none bg-transparent"
            />
            <button
              type="submit"
              disabled={!quickCode.trim()}
              className="btn-gradient px-3 py-1 text-xs font-black rounded-xl shadow-xs disabled:opacity-50 cursor-pointer flex items-center space-x-1"
            >
              <LogIn className="w-3 h-3" />
              <span>Join</span>
            </button>
          </form>

          <button
            onClick={() => navigate('/leaderboard')}
            className="btn-pill-outline text-xs px-4 py-2 space-x-1.5 cursor-pointer flex items-center font-extrabold flex-shrink-0"
          >
            <Trophy className="w-3.5 h-3.5 text-[#f59e0b]" />
            <span>Hall of Fame</span>
          </button>
        </div>
      </div>

      {/* Category & Roadmap Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setFilterTab('ALL')}
          className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center space-x-1.5 whitespace-nowrap ${
            filterTab === 'ALL'
              ? 'bg-[#2a2050] text-white shadow-md'
              : 'bg-white/80 dark:bg-slate-800 text-[#7e749c] hover:text-[#2a2050] dark:text-slate-400 border border-[#ede8f8] dark:border-slate-700'
          }`}
        >
          <span>🎮 All Games</span>
          <span className="px-2 py-0.5 text-[10px] rounded-full bg-white/20 text-white font-bold">{games.length}</span>
        </button>

        <button
          onClick={() => setFilterTab('PLAYABLE')}
          className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center space-x-1.5 whitespace-nowrap ${
            filterTab === 'PLAYABLE'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-white/80 dark:bg-slate-800 text-[#7e749c] hover:text-[#2a2050] dark:text-slate-400 border border-[#ede8f8] dark:border-slate-700'
          }`}
        >
          <span>🟢 Playable Now</span>
          <span className="px-2 py-0.5 text-[10px] rounded-full bg-emerald-100 text-emerald-800 font-bold">9</span>
        </button>

        <button
          onClick={() => setFilterTab('ROADMAP')}
          className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center space-x-1.5 whitespace-nowrap ${
            filterTab === 'ROADMAP'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white/80 dark:bg-slate-800 text-[#7e749c] hover:text-[#2a2050] dark:text-slate-400 border border-[#ede8f8] dark:border-slate-700'
          }`}
        >
          <span>🚀 10 New Games</span>
          <span className="px-2 py-0.5 text-[10px] rounded-full bg-indigo-100 text-indigo-800 font-bold">10</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 3. VIBRANT CARTOONISH ARCADE SHOWCASE (Big visual art, colorful, clean)  */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {games
          .filter((g) => {
            if (filterTab === 'PLAYABLE') return g.isPlayable !== false;
            if (filterTab === 'ROADMAP') return (g.sequenceNo ?? 0) >= 10;
            return true;
          })
          .map((g) => (
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
                <div className="z-10 flex flex-col items-end space-y-1">
                  <span className="text-xs font-black uppercase px-3.5 py-1.5 rounded-full bg-white/95 dark:bg-slate-900/90 text-slate-800 dark:text-white shadow-md tracking-wider border border-white/40">
                    {g.badge}
                  </span>
                  {g.statusBadge && (
                    <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-black/50 text-white backdrop-blur-sm shadow-xs">
                      {g.statusBadge}
                    </span>
                  )}
                </div>
              </div>

              {/* Title (Big, bold, cartoonish, zero clutter) */}
              <h3 className={`text-2xl sm:text-[26px] font-black ${g.titleColor} text-center tracking-tight mb-2`}>
                {g.title}
              </h3>
            </div>

            {/* Action Buttons: Play vs Bot, Create Room, Quick Match (or Roadmap status) */}
            {g.isPlayable !== false ? (
              <div className="pt-4 space-y-2">
                <button
                  onClick={() => setBotModalGame(g.type)}
                  className="w-full py-3 rounded-2xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:brightness-110 text-white shadow-[0_4px_0_#4338ca] transition-all duration-150 flex items-center justify-center space-x-2 cursor-pointer active:translate-y-1 active:shadow-none"
                >
                  <Bot className="w-4 h-4" />
                  <span>🤖 Play vs Bot (Offline)</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleSelectGame(g.type)}
                    className={`py-2.5 px-2 rounded-2xl text-[11px] font-black uppercase tracking-tight ${g.btnCustom} transition-all flex items-center justify-center space-x-1 cursor-pointer active:scale-95`}
                    title="Create a private room with custom rules and invite friends"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Create Room</span>
                  </button>

                  <button
                    onClick={() => handleQuickPlay(g.type)}
                    disabled={matchingType !== null}
                    className={`py-2.5 px-2 rounded-2xl text-[11px] font-black uppercase tracking-tight ${g.btnQuick} transition-all duration-150 flex items-center justify-center space-x-1 cursor-pointer disabled:opacity-50 active:translate-y-0.5 active:shadow-none hover:brightness-105`}
                    title="Find an online player"
                  >
                    <Zap className={`w-3.5 h-3.5 ${matchingType === g.type ? 'animate-spin' : ''}`} />
                    <span>{matchingType === g.type ? 'Matching...' : '⚡ Quick Match'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="pt-4 space-y-2">
                <div className="w-full py-2.5 px-3 rounded-2xl bg-white/70 dark:bg-slate-800/80 border border-indigo-200 dark:border-indigo-900 text-center">
                  <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                    {g.statusBadge || 'Coming Soon'}
                  </span>
                </div>
                <button
                  onClick={() => setUpcomingModalGame(g)}
                  className="w-full py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>View Details & Rules</span>
                </button>
              </div>
            )}
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

      {/* Upcoming Game Roadmap Modal */}
      {upcomingModalGame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[32px] p-6 sm:p-7 shadow-2xl border-2 border-[#e0d6f8] dark:border-slate-800 relative space-y-4 animate-in zoom-in-95 text-center">
            <button
              onClick={() => setUpcomingModalGame(null)}
              className="absolute right-5 top-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white transition cursor-pointer"
            >
              ✕
            </button>
            <div className="w-18 h-18 rounded-[22px] bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center mx-auto shadow-md p-2">
              <GameVisualIcon type={upcomingModalGame.type} size="lg" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {upcomingModalGame.title}
            </h3>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-black bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              {upcomingModalGame.statusBadge}
            </span>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              We are building the 10 requested multiplayer games strictly <strong>one at a time</strong>.
              <br /><br />
              <strong>⚓ Game 10: Ship Battle (Battleship)</strong> is 100% finished, tested, and playable right now with online multiplayer & offline bots!
              <br /><br />
              <strong>🧩 Game 11: Mastermind</strong> is next in queue.
            </p>
            <div className="pt-2">
              <button
                onClick={() => {
                  const type = 'SHIP_BATTLE';
                  setUpcomingModalGame(null);
                  navigate(`/create-room?game=${type}`);
                }}
                className="w-full btn-gradient py-3 rounded-2xl text-xs font-black text-white shadow-lg cursor-pointer hover:brightness-105 active:scale-95 transition"
              >
                ⚓ Play Ship Battle Now →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bot Difficulty Selection Modal */}
      <BotDifficultyModal
        gameType={botModalGame}
        onClose={() => setBotModalGame(null)}
      />
    </div>
  );
};
