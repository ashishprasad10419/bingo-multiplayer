import React from 'react';
import { Check } from 'lucide-react';

interface BoardGridProps {
  board: number[][];
  mode: 'setup' | 'game';
  calledNumbers?: number[];
  selectedPos?: { row: number; column: number } | null;
  onCellClick?: (row: number, col: number, value: number) => void;
  isMyTurn?: boolean;
  disabled?: boolean;
}

export const BoardGrid: React.FC<BoardGridProps> = ({
  board,
  mode,
  calledNumbers = [],
  selectedPos = null,
  onCellClick,
  isMyTurn = false,
  disabled = false,
}) => {
  const calledSet = new Set(calledNumbers);

  return (
    <div className="w-full max-w-[420px] aspect-square mx-auto p-2 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-2xl backdrop-blur-sm">
      <div className="grid grid-cols-5 grid-rows-5 gap-2 w-full h-full">
        {board.map((row, r) =>
          row.map((val, c) => {
            const isSelected = selectedPos?.row === r && selectedPos?.column === c;
            const isCalled = calledSet.has(val);

            // Styling logic
            let bgStyle = 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-100 border-slate-700/60';
            let extraGlow = '';

            if (mode === 'setup') {
              if (isSelected) {
                bgStyle = 'bg-amber-500/20 border-amber-400 text-amber-200 ring-2 ring-amber-400/50 scale-[1.03] shadow-lg shadow-amber-500/20';
              }
            } else if (mode === 'game') {
              if (isCalled) {
                bgStyle = 'bg-gradient-to-br from-emerald-600/30 to-teal-800/40 border-emerald-500/60 text-emerald-300 scale-[0.98] shadow-inner';
                extraGlow = 'ring-1 ring-emerald-500/30';
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
                className={`relative flex flex-col items-center justify-center rounded-xl border font-black text-lg md:text-xl transition-all duration-150 select-none ${bgStyle} ${extraGlow}`}
              >
                <span>{val}</span>

                {mode === 'game' && isCalled && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-400/60 flex items-center justify-center text-emerald-400 animate-in fade-in zoom-in duration-200">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
