import React, { useState } from 'react';
import { Game } from '../../lib/types';
import { ChevronDown, Sparkles } from 'lucide-react';

interface ConnectFourArenaProps {
  game: Game;
  currentUserId: string;
  onMakeMove: (col: number) => void;
  isMyTurn: boolean;
  disabled?: boolean;
}

export const ConnectFourArena: React.FC<ConnectFourArenaProps> = ({
  game,
  currentUserId,
  onMakeMove,
  isMyTurn,
  disabled = false,
}) => {
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);

  const cols = game.c4Cols || 7;
  const rows = game.c4Rows || 6;
  const board = game.c4Board || [];
  const winningCells = game.c4WinningCells || [];

  const player1 = game.players[0];
  const player2 = game.players[1];

  const getChipColor = (userId: string | undefined | null) => {
    if (!userId) return null;
    if (player1 && userId === player1.userId) {
      return {
        bg: 'from-rose-500 to-red-600',
        ring: 'ring-rose-400',
        shadow: 'shadow-[0_4px_12px_rgba(225,29,72,0.4)]',
        isRed: true,
      };
    }
    return {
      bg: 'from-amber-400 to-yellow-500',
      ring: 'ring-amber-300',
      shadow: 'shadow-[0_4px_12px_rgba(234,179,8,0.4)]',
      isRed: false,
    };
  };

  const handleColClick = (col: number) => {
    if (!isMyTurn || disabled) return;
    // Check if column is full
    if (board[col] && board[col] !== '') return;
    onMakeMove(col);
  };

  const isColFull = (col: number) => {
    return !!board[col] && board[col] !== '';
  };

  return (
    <div className="flex flex-col items-center w-full max-w-[560px]">
      {/* Player identity pill banner */}
      <div className="flex items-center justify-between w-full px-3 py-2 mb-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
        <div className="flex items-center space-x-2">
          <div className="w-3.5 h-3.5 rounded-full bg-red-500 shadow-xs"></div>
          <span className={currentUserId === player1?.userId ? 'text-red-600 dark:text-red-400 font-extrabold' : 'text-slate-600 dark:text-slate-300'}>
            {player1?.username || 'Player 1'} {currentUserId === player1?.userId && '(You)'}
          </span>
        </div>
        <div className="text-slate-400 font-semibold">VS</div>
        <div className="flex items-center space-x-2">
          <span className={currentUserId === player2?.userId ? 'text-amber-600 dark:text-amber-400 font-extrabold' : 'text-slate-600 dark:text-slate-300'}>
            {player2?.username || 'Player 2'} {currentUserId === player2?.userId && '(You)'}
          </span>
          <div className="w-3.5 h-3.5 rounded-full bg-yellow-400 shadow-xs"></div>
        </div>
      </div>

      {/* Top Column Drop Indicators */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5 w-full px-3 mb-1">
        {Array.from({ length: cols }).map((_, c) => {
          const canDrop = isMyTurn && !disabled && !isColFull(c);
          return (
            <button
              key={`drop-btn-${c}`}
              onClick={() => handleColClick(c)}
              onMouseEnter={() => setHoveredCol(c)}
              onMouseLeave={() => setHoveredCol(null)}
              disabled={!canDrop}
              className={`h-7 flex items-center justify-center rounded-xl transition-all ${
                canDrop
                  ? 'hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-500 cursor-pointer active:scale-95'
                  : 'opacity-0 cursor-default'
              }`}
            >
              <ChevronDown className={`w-5 h-5 transition-transform ${hoveredCol === c ? 'translate-y-1 scale-125' : ''}`} />
            </button>
          );
        })}
      </div>

      {/* 3D Blue Slotted Board */}
      <div className="w-full bg-gradient-to-b from-blue-600 to-blue-800 p-3 sm:p-4 rounded-[28px] shadow-[0_16px_36px_rgba(29,78,216,0.35)] border-4 border-blue-500/80">
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5">
          {Array.from({ length: rows * cols }).map((_, idx) => {
            const c = idx % cols;
            const occupant = board[idx];
            const chip = getChipColor(occupant);
            const isWinning = winningCells.includes(idx);
            const isHoveredCol = isMyTurn && hoveredCol === c && !occupant && !disabled;

            return (
              <button
                key={`c4-cell-${idx}`}
                onClick={() => handleColClick(c)}
                onMouseEnter={() => setHoveredCol(c)}
                onMouseLeave={() => setHoveredCol(null)}
                disabled={!isMyTurn || disabled || isColFull(c)}
                className={`relative aspect-square rounded-full flex items-center justify-center transition-all duration-200 ${
                  !isColFull(c) && isMyTurn && !disabled ? 'cursor-pointer' : 'cursor-default'
                }`}
              >
                {/* Slotted hole backing */}
                <div className="absolute inset-0 rounded-full bg-blue-950/80 shadow-inner border border-blue-900/60"></div>

                {/* Dropped Chip */}
                {chip && (
                  <div
                    className={`relative w-[90%] h-[90%] rounded-full bg-gradient-to-br ${chip.bg} ${chip.shadow} flex items-center justify-center transition-transform animate-in zoom-in-50 duration-200 ${
                      isWinning ? 'ring-4 ring-white animate-bounce shadow-[0_0_20px_#fff]' : ''
                    }`}
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-white/40 absolute top-1.5 left-2"></div>
                    {isWinning && <Sparkles className="w-4 h-4 text-white animate-spin" />}
                  </div>
                )}

                {/* Ghost chip on hover */}
                {!chip && isHoveredCol && (
                  <div
                    className={`relative w-[85%] h-[85%] rounded-full border-2 border-dashed animate-pulse ${
                      getChipColor(currentUserId)?.isRed
                        ? 'border-rose-400/80 bg-rose-500/20'
                        : 'border-amber-300/80 bg-amber-400/20'
                    }`}
                  ></div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
