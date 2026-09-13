import React from 'react';
import { Game } from '../../lib/types';
import { Check } from 'lucide-react';

interface MemoryArenaProps {
  game: Game;
  currentUserId: string;
  onFlipCard: (cardIndex: number) => void;
  isMyTurn: boolean;
  disabled?: boolean;
}

const SYMBOL_ICONS: Record<string, { emoji: string; label: string; bg: string }> = {
  GEM: { emoji: '💎', label: 'Gem', bg: 'bg-cyan-500/15 border-cyan-400 text-cyan-500' },
  ROCKET: { emoji: '🚀', label: 'Rocket', bg: 'bg-indigo-500/15 border-indigo-400 text-indigo-500' },
  FIRE: { emoji: '🔥', label: 'Fire', bg: 'bg-orange-500/15 border-orange-400 text-orange-500' },
  STAR: { emoji: '⭐', label: 'Star', bg: 'bg-amber-500/15 border-amber-400 text-amber-500' },
  HEART: { emoji: '❤️', label: 'Heart', bg: 'bg-rose-500/15 border-rose-400 text-rose-500' },
  LIGHTNING: { emoji: '⚡', label: 'Lightning', bg: 'bg-yellow-500/15 border-yellow-400 text-yellow-500' },
  CROWN: { emoji: '👑', label: 'Crown', bg: 'bg-purple-500/15 border-purple-400 text-purple-500' },
  SHIELD: { emoji: '🛡️', label: 'Shield', bg: 'bg-emerald-500/15 border-emerald-400 text-emerald-500' },
};

export const MemoryArena: React.FC<MemoryArenaProps> = ({
  game,
  currentUserId,
  onFlipCard,
  isMyTurn,
  disabled = false,
}) => {
  const cards = game.memoryCards || [];
  const matched = game.memoryMatched || [];
  const flippedIndices = game.memoryFlippedIndices || [];
  const scores = game.playerScores || {};

  const handleCardClick = (idx: number) => {
    if (!isMyTurn || disabled || flippedIndices.length >= 2) return;
    if (matched[idx] || flippedIndices.includes(idx)) return;
    onFlipCard(idx);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-[560px] space-y-4">
      {/* Player Scores Bar */}
      <div className="flex items-center justify-around w-full px-3 py-2 bg-white/90 dark:bg-slate-800/90 rounded-2xl border border-purple-200 dark:border-slate-700 shadow-xs">
        {game.players.map((p) => {
          const score = scores[p.userId] || 0;
          const isTurn = game.currentTurnUserId === p.userId;
          const isMe = currentUserId === p.userId;
          return (
            <div
              key={p.userId}
              className={`flex items-center space-x-2 px-3 py-1 rounded-xl transition-all ${
                isTurn
                  ? 'bg-purple-100 dark:bg-purple-950/60 ring-2 ring-purple-400'
                  : 'bg-transparent'
              }`}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-purple-500"></div>
              <span className={`text-xs font-bold ${isMe ? 'text-purple-600 dark:text-purple-400 font-extrabold' : 'text-slate-600 dark:text-slate-300'}`}>
                {p.username} {isMe && '(You)'}: <strong className="text-sm">{score}</strong> pts
              </span>
            </div>
          );
        })}
      </div>

      {/* 4x4 Grid of 16 Cards */}
      <div className="grid grid-cols-4 gap-2.5 sm:gap-3.5 w-full p-3 sm:p-4 rounded-[32px] bg-gradient-to-b from-purple-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800/80 border-2 border-purple-200 dark:border-purple-900/40 shadow-lg">
        {cards.map((sym, idx) => {
          const isMatched = !!matched[idx];
          const isFlipped = flippedIndices.includes(idx);
          const showFace = isMatched || isFlipped;
          const meta = SYMBOL_ICONS[sym] || { emoji: '❓', label: sym, bg: 'bg-purple-500/20' };

          return (
            <button
              key={`mem-card-${idx}`}
              onClick={() => handleCardClick(idx)}
              disabled={!isMyTurn || disabled || isMatched || isFlipped || flippedIndices.length >= 2}
              className={`relative aspect-square rounded-2xl border-2 transition-all duration-300 flex items-center justify-center select-none ${
                showFace
                  ? `${meta.bg} shadow-md scale-95 border-purple-300 dark:border-purple-600`
                  : isMyTurn && !disabled
                  ? 'bg-gradient-to-br from-indigo-500 to-purple-600 border-indigo-400/80 shadow-md hover:scale-105 hover:shadow-lg cursor-pointer active:scale-95'
                  : 'bg-gradient-to-br from-indigo-400 to-purple-500 border-indigo-300/40 opacity-80 cursor-default'
              }`}
            >
              {showFace ? (
                <div className="flex flex-col items-center animate-in zoom-in-75 duration-200">
                  <span className="text-3xl sm:text-4xl filter drop-shadow-sm">{meta.emoji}</span>
                  {isMatched && (
                    <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <span className="text-white/60 text-xl font-black">?</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-white/40 mt-1"></div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
