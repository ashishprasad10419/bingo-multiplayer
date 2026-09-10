import React from 'react';
import { Check, Flame } from 'lucide-react';

interface BoardGridProps {
  board: number[][];
  mode: 'setup' | 'game';
  calledNumbers?: number[];
  calledByMap?: Record<number, string>; // number -> userId
  currentUserId?: string;
  selectedPos?: { row: number; column: number } | null;
  onCellClick?: (row: number, col: number, value: number) => void;
  isMyTurn?: boolean;
  disabled?: boolean;
}

export const BoardGrid: React.FC<BoardGridProps> = ({
  board,
  mode,
  calledNumbers = [],
  calledByMap = {},
  currentUserId,
  selectedPos = null,
  onCellClick,
  isMyTurn = false,
  disabled = false,
}) => {
  const calledSet = new Set(calledNumbers);
  const size = board.length || 5;

  // Dynamic grid configuration based on board dimension (5 to 10)
  const gridColsClass: Record<number, string> = {
    5: 'grid-cols-5',
    6: 'grid-cols-6',
    7: 'grid-cols-7',
    8: 'grid-cols-8',
    9: 'grid-cols-9',
    10: 'grid-cols-10',
  };

  // Dynamic font sizing and padding to ensure 8x8 - 10x10 grids fit cleanly on screen
  const getCellTypography = (s: number) => {
    if (s <= 5) return 'text-lg md:text-xl font-black rounded-xl p-1';
    if (s <= 6) return 'text-base md:text-lg font-extrabold rounded-lg p-0.5';
    if (s <= 7) return 'text-xs md:text-sm font-bold rounded-lg p-0.5';
    if (s <= 8) return 'text-[11px] md:text-xs font-bold rounded-md p-0.5';
    return 'text-[9px] md:text-[11px] font-bold rounded p-0';
  };

  const getBadgeSize = (s: number) => {
    if (s <= 5) return 'w-6 h-6';
    if (s <= 7) return 'w-4 h-4';
    return 'w-3.5 h-3.5';
  };

  const getIconSize = (s: number) => {
    if (s <= 5) return 'w-3.5 h-3.5 stroke-[3]';
    if (s <= 7) return 'w-2.5 h-2.5 stroke-[3]';
    return 'w-2 h-2 stroke-[3]';
  };

  const currentGridClass = gridColsClass[size] || 'grid-cols-5';
  const cellTypeClass = getCellTypography(size);
  const badgeSizeClass = getBadgeSize(size);
  const iconClass = getIconSize(size);

  return (
    <div className="w-full max-w-[440px] aspect-square mx-auto p-2 sm:p-2.5 bg-slate-900/95 rounded-2xl border border-slate-800 shadow-2xl backdrop-blur-sm flex flex-col justify-between">
      <div className={`grid ${currentGridClass} gap-1 sm:gap-1.5 w-full h-full`}>
        {board.map((row, r) =>
          row.map((val, c) => {
            const isSelected = selectedPos?.row === r && selectedPos?.column === c;
            const isCalled = calledSet.has(val);

            // Check WHO called this number
            const callerId = calledByMap[val];
            const isMyPick = isCalled && currentUserId && callerId === currentUserId;
            const isOpponentPick = isCalled && currentUserId && callerId && callerId !== currentUserId;

            // Styling logic
            let bgStyle = 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-100 border-slate-700/60';
            let extraGlow = '';

            if (mode === 'setup') {
              if (isSelected) {
                bgStyle = 'bg-amber-500/20 border-amber-400 text-amber-200 ring-2 ring-amber-400/50 scale-[1.03] shadow-lg shadow-amber-500/20';
              }
            } else if (mode === 'game') {
              if (isCalled) {
                if (isOpponentPick) {
                  // Opponent's pick: Marked clearly in vibrant RED / ROSE
                  bgStyle = 'bg-gradient-to-br from-rose-950/80 via-red-900/60 to-rose-950/80 border-red-500 text-red-200 scale-[0.98] shadow-inner';
                  extraGlow = 'ring-1 ring-red-500/50';
                } else if (isMyPick) {
                  // Player's own pick: Marked in vibrant EMERALD / GREEN
                  bgStyle = 'bg-gradient-to-br from-emerald-950/80 via-teal-900/60 to-emerald-950/80 border-emerald-500 text-emerald-200 scale-[0.98] shadow-inner';
                  extraGlow = 'ring-1 ring-emerald-500/50';
                } else {
                  // Fallback if caller information is syncing
                  bgStyle = 'bg-gradient-to-br from-indigo-950/80 to-slate-900 border-indigo-500/60 text-indigo-200 scale-[0.98]';
                  extraGlow = 'ring-1 ring-indigo-500/30';
                }
              } else if (isMyTurn && !disabled) {
                bgStyle = 'bg-slate-800 hover:bg-blue-600/30 hover:border-blue-400 text-slate-100 cursor-pointer hover:scale-[1.03] active:scale-95 transition-all border-slate-700';
              } else {
                bgStyle = 'bg-slate-800/60 text-slate-400 border-slate-800/60 cursor-default';
              }
            }

            return (
              <button
                key={`${r}-${c}`}
                type="button"
                disabled={disabled || (mode === 'game' && (isCalled || !isMyTurn))}
                onClick={() => onCellClick && onCellClick(r, c, val)}
                className={`relative flex flex-col items-center justify-center border transition-all duration-150 select-none ${cellTypeClass} ${bgStyle} ${extraGlow}`}
              >
                <span>{val}</span>

                {mode === 'game' && isCalled && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    {isOpponentPick ? (
                      <div className={`${badgeSizeClass} rounded-full bg-red-500/30 border border-red-400/80 flex items-center justify-center text-red-300 animate-in fade-in zoom-in duration-150`}>
                        <Flame className={iconClass} />
                      </div>
                    ) : (
                      <div className={`${badgeSizeClass} rounded-full bg-emerald-500/30 border border-emerald-400/80 flex items-center justify-center text-emerald-300 animate-in fade-in zoom-in duration-150`}>
                        <Check className={iconClass} />
                      </div>
                    )}
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Live Color Legend during Game Mode */}
      {mode === 'game' && (
        <div className="pt-2 mt-1 border-t border-slate-800/80 flex items-center justify-center space-x-5 text-[11px] font-semibold text-slate-400">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/30"></span>
            <span className="text-emerald-300">Your Pick</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-red-500/30"></span>
            <span className="text-red-300">Opponent Pick</span>
          </div>
        </div>
      )}
    </div>
  );
};
