import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../state/authStore';
import { roomApi } from '../lib/api';
import { GameType } from '../lib/types';
import { GameVisualIcon } from '../components/games/GameVisualIcon';
import { GAME_THEMES } from '../lib/gameThemes';
import { Trophy, Shield, Plus, LogIn, Sparkles, Flame, Users, Zap, Award, CheckCircle2 } from 'lucide-react';

interface GameCardDef {
  type: GameType;
  title: string;
  badge: string;
  badgeStyle: string;
  description: string;
  playersText: string;
  gradient: string;
  cardBorder: string;
  glowColor: string;
  buttonGrad: string;
  tags: string[];
  specs: { label: string; value: string }[];
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
      title: 'Bingo Multiplayer',
      badge: 'Classic Match',
      badgeStyle: 'bg-[#fee8ea] text-[#e11d48] border-[#fcd3d7]',
      description: 'Match called numbers & race to shout BINGO before rivals!',
      playersText: '2–6 Players',
      gradient: GAME_THEMES.BINGO.navbarBrandGrad,
      cardBorder: 'hover:border-[#f43f5e]/50 hover:shadow-[0_12px_32px_rgba(244,63,94,0.18)]',
      glowColor: 'bg-[#f43f5e]/10',
      buttonGrad: GAME_THEMES.BINGO.buttonGrad,
      tags: ['5x5 to 10x10', 'In-Game Emotes', 'Voice Cues'],
      specs: [
        { label: 'Mode', value: 'Multiplayer' },
        { label: 'Grid', value: '5x5 - 10x10' },
        { label: 'Pace', value: 'Dynamic' },
      ],
    },
    {
      type: 'TIC_TAC_TOE',
      title: 'Tic-Tac-Toe Duel',
      badge: 'Rapid 1v1',
      badgeStyle: 'bg-[#f5f3ff] text-[#7c3aed] border-[#ddd6fe]',
      description: 'Fast-paced duel of X vs O on classic 3x3 to 5x5 grids!',
      playersText: '2 Players (1v1)',
      gradient: GAME_THEMES.TIC_TAC_TOE.navbarBrandGrad,
      cardBorder: 'hover:border-[#8b5cf6]/50 hover:shadow-[0_12px_32px_rgba(139,92,246,0.18)]',
      glowColor: 'bg-[#8b5cf6]/10',
      buttonGrad: GAME_THEMES.TIC_TAC_TOE.buttonGrad,
      tags: ['Instant Start', '3x3, 4x4, 5x5', 'Zero Setup'],
      specs: [
        { label: 'Mode', value: '1v1 Head-to-Head' },
        { label: 'Grid', value: '3x3, 4x4, 5x5' },
        { label: 'Pace', value: 'Rapid' },
      ],
    },
    {
      type: 'DOTS_AND_BOXES',
      title: 'Dots & Boxes',
      badge: 'Tactical Strategy',
      badgeStyle: 'bg-[#ecfdf5] text-[#047857] border-[#a7f3d0]',
      description: 'Connect dots, complete boxes & earn instant bonus turns!',
      playersText: '2–4 Players',
      gradient: GAME_THEMES.DOTS_AND_BOXES.navbarBrandGrad,
      cardBorder: 'hover:border-[#10b981]/50 hover:shadow-[0_12px_32px_rgba(16,185,129,0.18)]',
      glowColor: 'bg-[#10b981]/10',
      buttonGrad: GAME_THEMES.DOTS_AND_BOXES.buttonGrad,
      tags: ['Territory Capture', 'Bonus Turns', 'Live Scoring'],
      specs: [
        { label: 'Mode', value: '2-4 Turn Strategy' },
        { label: 'Grid', value: '2x2 to 4x4 Boxes' },
        { label: 'Pace', value: 'Strategic' },
      ],
    },
    {
      type: 'CONNECT_FOUR',
      title: 'Connect Four',
      badge: '1v1 Gravity Drop',
      badgeStyle: 'bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe]',
      description: 'Drop chips into 7 columns and connect four in a row!',
      playersText: '2 Players (1v1)',
      gradient: GAME_THEMES.CONNECT_FOUR.navbarBrandGrad,
      cardBorder: 'hover:border-[#3b82f6]/50 hover:shadow-[0_12px_32px_rgba(59,130,246,0.18)]',
      glowColor: 'bg-[#3b82f6]/10',
      buttonGrad: GAME_THEMES.CONNECT_FOUR.buttonGrad,
      tags: ['7x6 Grid', 'Horizontal/Diag', 'Gravity Physics'],
      specs: [
        { label: 'Mode', value: '1v1 Duel' },
        { label: 'Grid', value: '7x6 Vertical' },
        { label: 'Pace', value: 'Tactical' },
      ],
    },
    {
      type: 'ROCK_PAPER_SCISSORS',
      title: 'Rock Paper Scissors',
      badge: 'Best of 5 Duel',
      badgeStyle: 'bg-[#fff7ed] text-[#c2410c] border-[#fed7aa]',
      description: 'Fast-paced simultaneous pick clash with secret reveals!',
      playersText: '2 Players (1v1)',
      gradient: GAME_THEMES.ROCK_PAPER_SCISSORS.navbarBrandGrad,
      cardBorder: 'hover:border-[#f97316]/50 hover:shadow-[0_12px_32px_rgba(249,115,22,0.18)]',
      glowColor: 'bg-[#f97316]/10',
      buttonGrad: GAME_THEMES.ROCK_PAPER_SCISSORS.buttonGrad,
      tags: ['First to 3 Wins', 'Simultaneous Pick', 'Instant Clashes'],
      specs: [
        { label: 'Mode', value: '1v1 Rapid' },
        { label: 'Rounds', value: 'Best of 5' },
        { label: 'Pace', value: 'Lightning' },
      ],
    },
    {
      type: 'MEMORY',
      title: 'Memory Match',
      badge: 'Pair Search',
      badgeStyle: 'bg-[#f5f3ff] text-[#6d28d9] border-[#ddd6fe]',
      description: 'Test your visual memory! Flip pairs of cards to score points.',
      playersText: '2–4 Players',
      gradient: GAME_THEMES.MEMORY.navbarBrandGrad,
      cardBorder: 'hover:border-[#8b5cf6]/50 hover:shadow-[0_12px_32px_rgba(139,92,246,0.18)]',
      glowColor: 'bg-[#8b5cf6]/10',
      buttonGrad: GAME_THEMES.MEMORY.buttonGrad,
      tags: ['16 Cards', 'Bonus Turn on Match', 'Icon Pairs'],
      specs: [
        { label: 'Mode', value: 'Turn-Based' },
        { label: 'Grid', value: '4x4 (8 Pairs)' },
        { label: 'Pace', value: 'Mind Game' },
      ],
    },
    {
      type: 'NUMBER_RUSH',
      title: 'Number Rush',
      badge: 'Speed Tap Race',
      badgeStyle: 'bg-[#ecfeff] text-[#0e7490] border-[#a5f3fc]',
      description: 'Race opponents to tap 1 through 25 in order as fast as you can!',
      playersText: '2–6 Players',
      gradient: GAME_THEMES.NUMBER_RUSH.navbarBrandGrad,
      cardBorder: 'hover:border-[#06b6d4]/50 hover:shadow-[0_12px_32px_rgba(6,182,212,0.18)]',
      glowColor: 'bg-[#06b6d4]/10',
      buttonGrad: GAME_THEMES.NUMBER_RUSH.buttonGrad,
      tags: ['Real-Time Race', '1 to 25 Speed', 'Live Opponent Bars'],
      specs: [
        { label: 'Mode', value: 'Realtime Race' },
        { label: 'Grid', value: '5x5 (25 Numbers)' },
        { label: 'Pace', value: 'Adrenaline' },
      ],
    },
    {
      type: 'WORD_SCRAMBLE',
      title: 'Word Scramble',
      badge: 'Anagram Race',
      badgeStyle: 'bg-[#f0fdfa] text-[#0f766e] border-[#99f6e4]',
      description: 'Unscramble jumbled letters with hints across 5 quick rounds!',
      playersText: '2–6 Players',
      gradient: GAME_THEMES.WORD_SCRAMBLE.navbarBrandGrad,
      cardBorder: 'hover:border-[#14b8a6]/50 hover:shadow-[0_12px_32px_rgba(20,184,166,0.18)]',
      glowColor: 'bg-[#14b8a6]/10',
      buttonGrad: GAME_THEMES.WORD_SCRAMBLE.buttonGrad,
      tags: ['5 Rounds', 'Category Hints', 'Speed Points'],
      specs: [
        { label: 'Mode', value: 'Multiplayer Word' },
        { label: 'Rounds', value: '5 Words' },
        { label: 'Pace', value: 'Dynamic' },
      ],
    },
    {
      type: 'QUIZ_BATTLE',
      title: 'Quiz Battle',
      badge: 'Trivia Duel',
      badgeStyle: 'bg-[#faf5ff] text-[#7e22ce] border-[#e9d5ff]',
      description: 'Answer fast trivia questions across gaming, science & pop culture!',
      playersText: '2–6 Players',
      gradient: GAME_THEMES.QUIZ_BATTLE.navbarBrandGrad,
      cardBorder: 'hover:border-[#a855f7]/50 hover:shadow-[0_12px_32px_rgba(168,85,247,0.18)]',
      glowColor: 'bg-[#a855f7]/10',
      buttonGrad: GAME_THEMES.QUIZ_BATTLE.buttonGrad,
      tags: ['4 Options', 'Live Scoring', 'Pop & Gaming Trivia'],
      specs: [
        { label: 'Mode', value: 'Trivia Battle' },
        { label: 'Rounds', value: '5 Questions' },
        { label: 'Pace', value: '15s Timer' },
      ],
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
      {/* 3. VIBRANT 3-GAME ARCADE CABINET SHOWCASE (Rich, Beautiful, Themed)      */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {games.map((g) => (
          <div
            key={g.type}
            className={`card-clay p-6 flex flex-col justify-between group transition-all duration-300 transform hover:-translate-y-1.5 ${g.cardBorder}`}
          >
            <div>
              {/* Game Visual Header Banner with Dynamic Game Colors */}
              <div className={`w-full h-36 rounded-2xl bg-gradient-to-tr ${g.gradient} flex items-center justify-between p-5 mb-4 shadow-md relative overflow-hidden`}>
                <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/15 rounded-full blur-xl pointer-events-none" />
                
                {/* 3D Game Visual Icon */}
                <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shadow-inner border border-white/30 p-2 transition-transform duration-300 group-hover:scale-110">
                  <GameVisualIcon type={g.type} size="xl" />
                </div>

                <div className="flex flex-col items-end space-y-1.5 z-10">
                  <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full bg-white/95 text-[#2a2050] shadow-sm`}>
                    {g.badge}
                  </span>
                  <div className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-black/20 backdrop-blur-xs text-white text-[11px] font-bold">
                    <Users className="w-3 h-3 text-white/90" />
                    <span>{g.playersText}</span>
                  </div>
                </div>
              </div>

              {/* Title & 1-Line Description */}
              <h3 className="text-xl font-black text-[#2a2050] tracking-tight mb-1">{g.title}</h3>
              <p className="text-xs text-[#7e749c] font-medium leading-relaxed mb-4 min-h-[34px]">
                {g.description}
              </p>

              {/* Quick Specs Matrix */}
              <div className="grid grid-cols-3 gap-1.5 py-2.5 px-3 bg-[#faf7fe] rounded-2xl border border-[#ede8f8] mb-4 text-center">
                {g.specs.map((s, idx) => (
                  <div key={idx} className="border-r last:border-r-0 border-[#ede8f8]">
                    <div className="text-[9px] font-bold text-[#7e749c] uppercase">{s.label}</div>
                    <div className="text-[11px] font-black text-[#2a2050] mt-0.5 truncate">{s.value}</div>
                  </div>
                ))}
              </div>

              {/* Feature Tags */}
              <div className="flex flex-wrap gap-1.5 mb-5">
                {g.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#f4effc] text-[#6d5ebd] border border-[#ede8f8]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons: Quick Match (1-Click) & Custom Room */}
            <div className="pt-3 border-t border-[#ede8f8] space-y-2">
              <button
                onClick={() => handleQuickPlay(g.type)}
                disabled={matchingType !== null}
                className={`w-full py-3 rounded-full text-xs font-black text-white bg-gradient-to-r ${g.buttonGrad} shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50`}
              >
                <Zap className={`w-3.5 h-3.5 ${matchingType === g.type ? 'animate-spin' : ''}`} />
                <span>{matchingType === g.type ? 'Finding Match...' : '⚡ Quick Match (1-Click)'}</span>
              </button>

              <button
                onClick={() => handleSelectGame(g.type)}
                className="w-full py-2.5 rounded-full text-xs font-bold text-[#524872] bg-[#f0ecfc] hover:bg-[#e4ddf8] transition flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Custom Room</span>
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
