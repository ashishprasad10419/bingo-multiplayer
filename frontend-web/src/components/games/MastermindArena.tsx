import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Game, MastermindColor, MastermindGuess } from '../../lib/types';
import { MASTERMIND_COLORS } from '../../lib/bot/botEngine';
import { ArrowLeft, Check, RotateCcw, Shuffle, Sparkles } from 'lucide-react';
import { soundService } from '../../lib/sound';

interface MastermindArenaProps {
  game: Game;
  currentUserId: string;
  onLockSecret?: (secret: MastermindColor[]) => void;
  onGuess?: (guess: MastermindColor[]) => void;
  isMyTurn?: boolean;
  disabled?: boolean;
}

const COLOR_CONFIG: Record<
  MastermindColor,
  { name: string; bg: string; border: string; glow: string; text: string; hex: string }
> = {
  RED: {
    name: 'Red',
    bg: 'bg-rose-500',
    border: 'border-rose-700',
    glow: 'shadow-[0_0_12px_rgba(244,63,94,0.6)]',
    text: 'text-white',
    hex: '#f43f5e',
  },
  BLUE: {
    name: 'Blue',
    bg: 'bg-blue-500',
    border: 'border-blue-700',
    glow: 'shadow-[0_0_12px_rgba(59,130,246,0.6)]',
    text: 'text-white',
    hex: '#3b82f6',
  },
  GREEN: {
    name: 'Green',
    bg: 'bg-emerald-500',
    border: 'border-emerald-700',
    glow: 'shadow-[0_0_12px_rgba(16,185,129,0.6)]',
    text: 'text-white',
    hex: '#10b981',
  },
  YELLOW: {
    name: 'Yellow',
    bg: 'bg-amber-400',
    border: 'border-amber-600',
    glow: 'shadow-[0_0_12px_rgba(251,191,36,0.6)]',
    text: 'text-amber-950',
    hex: '#fbbf24',
  },
  PURPLE: {
    name: 'Purple',
    bg: 'bg-purple-500',
    border: 'border-purple-700',
    glow: 'shadow-[0_0_12px_rgba(168,85,247,0.6)]',
    text: 'text-white',
    hex: '#a855f7',
  },
  ORANGE: {
    name: 'Orange',
    bg: 'bg-orange-500',
    border: 'border-orange-700',
    glow: 'shadow-[0_0_12px_rgba(249,115,22,0.6)]',
    text: 'text-white',
    hex: '#f97316',
  },
};

// 3D Glossy Peg Component
const MastermindPeg: React.FC<{
  color?: MastermindColor | null;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
  selected?: boolean;
}> = ({ color, size = 'md', onClick, className = '', selected = false }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 sm:w-7 sm:h-7',
    md: 'w-8 h-8 sm:w-10 sm:h-10',
    lg: 'w-11 h-11 sm:w-13 sm:h-13',
  }[size];

  if (!color) {
    return (
      <div
        onClick={onClick}
        className={`${sizeClasses} rounded-full border-2 border-dashed border-slate-600/80 bg-slate-800/50 flex items-center justify-center transition-all ${
          onClick ? 'cursor-pointer hover:border-slate-400' : ''
        } ${className}`}
      >
        <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
      </div>
    );
  }

  const cfg = COLOR_CONFIG[color];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${sizeClasses} rounded-full ${cfg.bg} border-2 ${cfg.border} ${
        selected ? `ring-3 ring-white ${cfg.glow} scale-105` : 'shadow-md'
      } relative flex items-center justify-center cursor-pointer transition-transform active:scale-95 ${className}`}
    >
      {/* 3D sphere highlight glare */}
      <div className="absolute top-1 left-1.5 w-1/3 h-1/3 rounded-full bg-white/50 blur-[0.5px] pointer-events-none" />
    </button>
  );
};

// Clue Feedback Indicator (Exact & Color pegs)
const CluePegs: React.FC<{ exact: number; color: number }> = ({ exact, color }) => {
  const slots: ('EXACT' | 'COLOR' | 'EMPTY')[] = [];
  for (let i = 0; i < exact; i++) slots.push('EXACT');
  for (let i = 0; i < color; i++) slots.push('COLOR');
  while (slots.length < 4) slots.push('EMPTY');

  return (
    <div className="grid grid-cols-2 grid-rows-2 gap-1 p-1 bg-slate-900/90 rounded-lg border border-slate-700/80 w-8 h-8 sm:w-9 sm:h-9 items-center justify-center shadow-inner">
      {slots.map((s, idx) => (
        <div key={idx} className="flex items-center justify-center">
          {s === 'EXACT' && (
            <div
              className="w-2.5 h-2.5 rounded-full bg-rose-500 border border-rose-300 shadow-[0_0_6px_#f43f5e]"
              title="Exact Match"
            />
          )}
          {s === 'COLOR' && (
            <div
              className="w-2.5 h-2.5 rounded-full bg-white border border-slate-300 shadow-[0_0_4px_#ffffff]"
              title="Color Match"
            />
          )}
          {s === 'EMPTY' && <div className="w-2 h-2 rounded-full bg-slate-800" />}
        </div>
      ))}
    </div>
  );
};

export const MastermindArena: React.FC<MastermindArenaProps> = ({
  game,
  currentUserId,
  onLockSecret,
  onGuess,
  isMyTurn = false,
  disabled = false,
}) => {
  const navigate = useNavigate();
  const [showExitModal, setShowExitModal] = useState(false);

  // Setup state (Secret selection)
  const [setupCode, setSetupCode] = useState<(MastermindColor | null)[]>([null, null, null, null]);
  const [isLocking, setIsLocking] = useState(false);

  // Active guess state
  const [currentGuess, setCurrentGuess] = useState<(MastermindColor | null)[]>([
    null,
    null,
    null,
    null,
  ]);
  const [activeSlotIdx, setActiveSlotIdx] = useState<number>(0);

  const phase = game.mastermindPhase || 'SETUP';
  const isSetup = phase === 'SETUP';
  const isBattle = phase === 'BATTLE';

  const myLocked = Boolean(game.mastermindSecretsLocked?.[currentUserId]);
  const opponent = game.players.find((p) => p.userId !== currentUserId);

  const myGuesses: MastermindGuess[] = game.mastermindGuesses?.[currentUserId] || [];
  const opponentGuesses: MastermindGuess[] = opponent
    ? game.mastermindGuesses?.[opponent.userId] || []
    : [];

  const maxAttempts = game.mastermindMaxAttempts || 8;

  // --- Handlers for Setup ---
  const handleSelectSetupColor = (color: MastermindColor) => {
    soundService.playTileTap();
    const firstEmpty = setupCode.findIndex((c) => c === null);
    const targetIdx = firstEmpty !== -1 ? firstEmpty : 3;
    setSetupCode((prev) => {
      const next = [...prev];
      next[targetIdx] = color;
      return next;
    });
  };

  const handleRandomizeSetup = () => {
    soundService.playTileTap();
    const randomCode: MastermindColor[] = Array.from({ length: 4 }, () =>
      MASTERMIND_COLORS[Math.floor(Math.random() * MASTERMIND_COLORS.length)]
    );
    setSetupCode(randomCode);
  };

  const handleClearSetup = () => {
    soundService.playTileTap();
    setSetupCode([null, null, null, null]);
  };

  const handleLockSecret = () => {
    if (setupCode.some((c) => c === null) || !onLockSecret) return;
    soundService.playPickSuccess();
    setIsLocking(true);
    onLockSecret(setupCode as MastermindColor[]);
  };

  // --- Handlers for Guessing ---
  const handleSelectGuessColor = (color: MastermindColor) => {
    soundService.playTileTap();
    setCurrentGuess((prev) => {
      const next = [...prev];
      next[activeSlotIdx] = color;
      return next;
    });
    setActiveSlotIdx((prev) => (prev < 3 ? prev + 1 : 0));
  };

  const handleClearGuess = () => {
    soundService.playTileTap();
    setCurrentGuess([null, null, null, null]);
    setActiveSlotIdx(0);
  };

  const handleSubmitGuess = () => {
    if (currentGuess.some((c) => c === null) || !onGuess || !isMyTurn || disabled) return;
    soundService.playTurnChime();
    onGuess(currentGuess as MastermindColor[]);
    setCurrentGuess([null, null, null, null]);
    setActiveSlotIdx(0);
  };

  return (
    <div className="fixed inset-0 z-50 w-full h-[100dvh] bg-[#111827] flex flex-col items-center justify-between select-none font-sans overflow-hidden touch-none">
      {/* ===================================================================== */}
      {/* LEAVE CONFIRMATION MODAL                                              */}
      {/* ===================================================================== */}
      {showExitModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 select-none">
          <div className="w-full max-w-xs bg-[#1f2937] text-white rounded-[28px] p-6 border-2 border-slate-700 shadow-2xl text-center space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-14 h-14 mx-auto rounded-full bg-indigo-500/20 text-indigo-400 border-2 border-indigo-500/40 flex items-center justify-center text-2xl font-black">
              🧩
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black tracking-tight">Leave Game?</h3>
              <p className="text-xs text-slate-300">
                Are you sure you want to leave? Your match progress will be lost.
              </p>
            </div>
            <div className="flex flex-col space-y-2 pt-2">
              <button
                onClick={() => setShowExitModal(false)}
                className="w-full py-3 rounded-full bg-[#10b981] hover:bg-[#34d399] text-white font-black text-sm uppercase tracking-wider shadow-md active:scale-95 transition cursor-pointer"
              >
                Continue Playing
              </button>
              <button
                onClick={() => {
                  setShowExitModal(false);
                  navigate('/hub');
                }}
                className="w-full py-2.5 rounded-full bg-slate-800 hover:bg-rose-900/60 text-rose-300 font-bold text-xs uppercase tracking-wider border border-slate-700 hover:border-rose-700 active:scale-95 transition cursor-pointer"
              >
                Leave Match
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 1. SETUP PHASE (Secret Code Placement)                                */}
      {/* ===================================================================== */}
      {isSetup && (
        <div className="w-full max-w-md h-full flex flex-col justify-between overflow-hidden bg-gradient-to-b from-[#1e293b] via-[#0f172a] to-[#090d16] text-white p-4">
          {/* Top Bar with Back Button and Exit */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setShowExitModal(true)}
              className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-white cursor-pointer active:scale-95 transition border border-slate-700"
              title="Leave Game"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="text-xs font-black uppercase tracking-widest text-indigo-400">
              Mastermind Duel
            </span>
            <button
              onClick={() => setShowExitModal(true)}
              className="px-3 py-1 bg-white/10 hover:bg-white/20 text-slate-300 font-black text-xs uppercase tracking-wider rounded-full border border-slate-700 cursor-pointer active:scale-95 transition"
            >
              EXIT
            </button>
          </div>

          {/* Setup Main Body */}
          <div className="flex-1 flex flex-col items-center justify-center space-y-5 text-center px-2">
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center justify-center space-x-2">
                <span>Set Your Secret Code</span>
                <Sparkles className="w-6 h-6 text-amber-400" />
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xs">
                Pick 4 colored pegs to defend. Your opponent must crack this secret!
              </p>
            </div>

            {/* Secret Peg Slots */}
            <div className="p-3 bg-slate-900/90 rounded-3xl border-2 border-indigo-500/30 shadow-2xl flex items-center justify-center space-x-3">
              {setupCode.map((c, idx) => (
                <MastermindPeg
                  key={idx}
                  color={c}
                  size="lg"
                  onClick={() => {
                    soundService.playTileTap();
                    setSetupCode((prev) => {
                      const next = [...prev];
                      next[idx] = null;
                      return next;
                    });
                  }}
                />
              ))}
            </div>

            {/* Color Palette */}
            <div className="w-full max-w-xs space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Choose Colors (Duplicates Allowed)
              </span>
              <div className="grid grid-cols-6 gap-2 p-2 bg-slate-900/60 rounded-2xl border border-slate-800">
                {MASTERMIND_COLORS.map((col) => (
                  <MastermindPeg
                    key={col}
                    color={col}
                    size="md"
                    onClick={() => handleSelectSetupColor(col)}
                  />
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={handleRandomizeSetup}
                disabled={myLocked}
                className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-black uppercase tracking-wider flex items-center space-x-1.5 cursor-pointer active:scale-95 transition border border-slate-700 disabled:opacity-50"
              >
                <Shuffle className="w-4 h-4" />
                <span>Random</span>
              </button>
              <button
                type="button"
                onClick={handleClearSetup}
                disabled={myLocked || setupCode.every((c) => c === null)}
                className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-black uppercase tracking-wider flex items-center space-x-1.5 cursor-pointer active:scale-95 transition border border-slate-700 disabled:opacity-50"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Clear</span>
              </button>
            </div>
          </div>

          {/* Lock Action Button / Waiting State */}
          <div className="w-full pb-4 px-2">
            {!myLocked ? (
              <button
                type="button"
                onClick={handleLockSecret}
                disabled={setupCode.some((c) => c === null) || isLocking}
                className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-600 disabled:border-slate-800 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg active:scale-95 transition cursor-pointer flex items-center justify-center space-x-2 border-2 border-emerald-400"
              >
                <Check className="w-5 h-5 stroke-[3]" />
                <span>Lock Secret Code</span>
              </button>
            ) : (
              <div className="w-full py-3.5 rounded-2xl bg-indigo-950/80 border border-indigo-700/80 text-center space-y-1 animate-pulse">
                <span className="text-xs font-black text-indigo-300 uppercase tracking-wider flex items-center justify-center space-x-1.5">
                  <span>Waiting for {opponent?.username || 'opponent'} to lock secret...</span>
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2. BATTLE PHASE (Codebreaker Turn-by-Turn Duel)                       */}
      {/* ===================================================================== */}
      {isBattle && (
        <div className="w-full max-w-md h-full flex flex-col justify-between overflow-hidden bg-[#0d1117] text-white">
          {/* Top Status & Turn Bar */}
          <div className="w-full bg-[#161b22] px-3 py-2 border-b border-slate-800 flex items-center justify-between shrink-0 z-20">
            <button
              onClick={() => setShowExitModal(true)}
              className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-white cursor-pointer active:scale-95 transition border border-slate-700"
              title="Leave Game"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="flex flex-col items-center">
              <span
                className={`text-xs font-black uppercase tracking-wider transition-colors ${
                  isMyTurn
                    ? 'text-emerald-400 animate-pulse drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                    : 'text-slate-400'
                }`}
              >
                {isMyTurn ? '👉 Your Turn to Guess' : `⏳ ${opponent?.username || 'Opponent'}'s Turn`}
              </span>
              <span className="text-[10px] text-slate-500 font-bold">
                Attempt {myGuesses.length + 1} of {maxAttempts}
              </span>
            </div>

            <button
              onClick={() => setShowExitModal(true)}
              className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-slate-300 font-black text-[11px] uppercase tracking-wider rounded-full border border-slate-700 cursor-pointer active:scale-95 transition"
            >
              EXIT
            </button>
          </div>

          {/* Opponent Mini Tracker Bar */}
          <div className="w-full bg-[#1c2129] px-3 py-1.5 border-b border-slate-800/80 flex items-center justify-between text-[11px] font-bold text-slate-400 shrink-0">
            <span className="truncate max-w-[150px]">
              Enemy Codebreaker ({opponent?.username || 'Bot'}):
            </span>
            <span className="text-indigo-400 font-extrabold">
              {opponentGuesses.length} / {maxAttempts} Attempts
            </span>
          </div>

          {/* Center Guess History Board (Fills remaining vertical space with scroll if needed) */}
          <div className="flex-1 min-h-0 w-full overflow-y-auto px-3 py-2 space-y-1.5 flex flex-col justify-start">
            {/* Clue Legend Pill */}
            <div className="flex items-center justify-center space-x-3 text-[10px] font-bold text-slate-400 pb-1">
              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-rose-500 border border-rose-300" />
                <span>Exact Position</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-white border border-slate-300" />
                <span>Wrong Position</span>
              </div>
            </div>

            {/* History Rows */}
            {Array.from({ length: maxAttempts }).map((_, idx) => {
              const guessItem = myGuesses[idx];
              const isCurrentActiveRow = idx === myGuesses.length;

              return (
                <div
                  key={idx}
                  className={`w-full py-1.5 px-3 rounded-2xl flex items-center justify-between border transition-all ${
                    guessItem
                      ? 'bg-slate-900/80 border-slate-800'
                      : isCurrentActiveRow
                      ? 'bg-indigo-950/40 border-indigo-500/50 shadow-md ring-1 ring-indigo-500/30'
                      : 'bg-slate-950/40 border-slate-900 opacity-40'
                  }`}
                >
                  {/* Row Index Badge */}
                  <span className="w-5 text-[11px] font-mono font-black text-slate-500">
                    #{idx + 1}
                  </span>

                  {/* 4 Peg Slots */}
                  <div className="flex items-center space-x-2">
                    {Array.from({ length: 4 }).map((__, pIdx) => {
                      if (guessItem) {
                        return (
                          <MastermindPeg
                            key={pIdx}
                            color={guessItem.guess[pIdx]}
                            size="sm"
                          />
                        );
                      }
                      if (isCurrentActiveRow) {
                        return (
                          <MastermindPeg
                            key={pIdx}
                            color={currentGuess[pIdx]}
                            size="sm"
                            selected={activeSlotIdx === pIdx}
                            onClick={() => {
                              soundService.playTileTap();
                              setActiveSlotIdx(pIdx);
                            }}
                          />
                        );
                      }
                      return (
                        <div
                          key={pIdx}
                          className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-slate-900/60 border border-slate-800 flex items-center justify-center"
                        >
                          <div className="w-1 h-1 rounded-full bg-slate-800" />
                        </div>
                      );
                    })}
                  </div>

                  {/* Clue Feedback Pegs */}
                  {guessItem ? (
                    <CluePegs
                      exact={guessItem.exactMatches}
                      color={guessItem.colorMatches}
                    />
                  ) : (
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-slate-950 border border-slate-900 flex items-center justify-center opacity-30">
                      <div className="grid grid-cols-2 grid-rows-2 gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Active Input Controls & Palette at Bottom */}
          <div className="w-full bg-[#161b22] p-3 border-t border-slate-800 shrink-0 space-y-2.5">
            {/* Color Peg Palette */}
            <div className="flex items-center justify-between px-1">
              {MASTERMIND_COLORS.map((col) => (
                <MastermindPeg
                  key={col}
                  color={col}
                  size="md"
                  onClick={() => handleSelectGuessColor(col)}
                />
              ))}
            </div>

            {/* Bottom Actions: Clear & Submit Guess */}
            <div className="flex items-center space-x-2 pt-1">
              <button
                type="button"
                onClick={handleClearGuess}
                disabled={currentGuess.every((c) => c === null)}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-black text-xs uppercase tracking-wider active:scale-95 transition cursor-pointer border border-slate-700 disabled:opacity-40"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleSubmitGuess}
                disabled={
                  currentGuess.some((c) => c === null) ||
                  !isMyTurn ||
                  disabled ||
                  game.status !== 'PLAYING'
                }
                className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-600 disabled:border-slate-800 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md active:scale-95 transition cursor-pointer flex items-center justify-center space-x-1.5 border border-emerald-400"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Submit Guess</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MastermindArena;
