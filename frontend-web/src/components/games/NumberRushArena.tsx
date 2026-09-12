import React, { useState } from 'react';
import { Game } from '../../lib/types';
import { Zap } from 'lucide-react';

interface NumberRushArenaProps {
  game: Game;
  currentUserId: string;
  onTapNumber: (num: number) => void;
  disabled?: boolean;
}

export const NumberRushArena: React.FC<NumberRushArenaProps> = ({
  game,
  currentUserId,
  onTapNumber,
  disabled = false,
}) => {
  const [shakeId, setShakeId] = useState<number | null>(null);

  const myBoard = (game.numberRushBoards && game.numberRushBoards[currentUserId]) || [];
  const progressMap = game.numberRushProgress || {};
  const myNextExpected = progressMap[currentUserId] || 1;

  const handleTap = (num: number) => {
    if (disabled || myNextExpected > 25) return;

    if (num !== myNextExpected) {
      setShakeId(num);
      setTimeout(() => setShakeId(null), 400);
      return;
    }

    onTapNumber(num);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-[560px] space-y-4">
      {/* Target & Speed Pill */}
      <div className="flex items-center justify-between w-full px-4 py-3 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white rounded-3xl shadow-lg">
        <div className="flex items-center space-x-2">
          <Zap className="w-5 h-5 text-yellow-300 animate-bounce" />
          <span className="text-xs font-black tracking-wider uppercase">Find & Tap:</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-3xl font-black bg-white/20 px-4 py-0.5 rounded-2xl border border-white/30 animate-pulse">
            {myNextExpected <= 25 ? myNextExpected : 'DONE! 🎉'}
          </span>
        </div>
        <div className="text-xs font-bold bg-black/20 px-2.5 py-1 rounded-xl">
          {myNextExpected - 1} / 25
        </div>
      </div>

      {/* Opponent Live Progress Bars */}
      <div className="w-full space-y-2 px-3 py-2.5 bg-white/90 dark:bg-slate-800/90 rounded-2xl border border-cyan-200 dark:border-slate-700 shadow-xs">
        <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
          Live Race Progress:
        </div>
        {game.players.map((p) => {
          const prog = (progressMap[p.userId] || 1) - 1;
          const pct = Math.min(100, Math.round((prog / 25) * 100));
          const isMe = p.userId === currentUserId;

          return (
            <div key={p.userId} className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className={isMe ? 'text-cyan-600 dark:text-cyan-400 font-black' : 'text-slate-600 dark:text-slate-300'}>
                  {p.username} {isMe && '(You)'}
                </span>
                <span className="text-slate-400">{prog} / 25 ({pct}%)</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    isMe
                      ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 shadow-xs'
                      : 'bg-gradient-to-r from-indigo-400 to-purple-400'
                  }`}
                  style={{ width: `${pct}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 5x5 Number Grid */}
      <div className="grid grid-cols-5 gap-2 sm:gap-2.5 w-full p-3 sm:p-4 rounded-[32px] bg-gradient-to-b from-cyan-50 to-emerald-50 dark:from-slate-900 dark:to-slate-800/80 border-2 border-cyan-200 dark:border-cyan-900/40 shadow-lg">
        {myBoard.map((num) => {
          const isCompleted = num < myNextExpected;
          const isTarget = num === myNextExpected;
          const isShaking = shakeId === num;

          return (
            <button
              key={`num-${num}`}
              onClick={() => handleTap(num)}
              disabled={disabled || isCompleted}
              className={`relative aspect-square rounded-2xl border-2 font-black text-lg sm:text-xl transition-all duration-150 flex items-center justify-center select-none ${
                isCompleted
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-600 dark:text-emerald-400 opacity-40 scale-95 cursor-default'
                  : isTarget
                  ? 'bg-white dark:bg-slate-800 border-cyan-400 text-cyan-600 dark:text-cyan-400 shadow-md ring-4 ring-cyan-400/30 scale-105 cursor-pointer active:scale-95'
                  : isShaking
                  ? 'bg-rose-500 text-white border-rose-600 animate-shake'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-cyan-400 hover:scale-102 cursor-pointer active:scale-95 shadow-xs'
              }`}
            >
              {num}
            </button>
          );
        })}
      </div>
    </div>
  );
};
