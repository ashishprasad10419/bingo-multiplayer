import React, { useState } from 'react';
import { Check, Flame } from 'lucide-react';

interface BoardGridProps {
  board: number[][];
  mode: 'setup' | 'game';
  calledNumbers?: number[];
  calledByMap?: Record<number, string>; // number -> userId
  currentUserId?: string;
  selectedPos?: { row: number; column: number } | null;
  onCellClick?: (row: number, col: number, value: number) => void;
  onCellSwap?: (from: { row: number; column: number }, to: { row: number; column: number }) => void;
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
  onCellSwap,
  isMyTurn = false,
  disabled = false,
}) => {
  const [draggedCell, setDraggedCell] = useState<{ row: number; column: number } | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{ row: number; column: number } | null>(null);

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
    if (s <= 5) return 'text-lg sm:text-xl md:text-2xl font-black rounded-xl sm:rounded-2xl p-1';
    if (s <= 6) return 'text-base sm:text-lg md:text-xl font-black rounded-lg sm:rounded-xl p-0.5';
    if (s <= 7) return 'text-xs sm:text-sm md:text-base font-extrabold rounded-lg p-0.5';
    if (s <= 8) return 'text-[11px] sm:text-xs md:text-sm font-bold rounded-md p-0.5';
    return 'text-[9px] sm:text-[11px] md:text-xs font-bold rounded p-0';
  };

  const getBadgeSize = (s: number) => {
    if (s <= 5) return 'w-6 h-6 sm:w-7 sm:h-7';
    if (s <= 7) return 'w-4 h-4 sm:w-5 sm:h-5';
    return 'w-3.5 h-3.5';
  };

  const getIconSize = (s: number) => {
    if (s <= 5) return 'w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]';
    if (s <= 7) return 'w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]';
    return 'w-2 h-2 stroke-[3]';
  };

  const currentGridClass = gridColsClass[size] || 'grid-cols-5';
  const cellTypeClass = getCellTypography(size);
  const badgeSizeClass = getBadgeSize(size);
  const iconClass = getIconSize(size);

  // Desktop Drag Handlers
  const handleDragStart = (e: React.DragEvent, r: number, c: number) => {
    if (mode !== 'setup' || disabled) return;
    setDraggedCell({ row: r, column: c });
    e.dataTransfer.setData('text/plain', `${r},${c}`);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, r: number, c: number) => {
    if (mode !== 'setup' || disabled || !draggedCell) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (hoveredCell?.row !== r || hoveredCell?.column !== c) {
      setHoveredCell({ row: r, column: c });
    }
  };

  const handleDragLeave = (_e: React.DragEvent, r: number, c: number) => {
    if (hoveredCell?.row === r && hoveredCell?.column === c) {
      setHoveredCell(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetR: number, targetC: number) => {
    if (mode !== 'setup' || disabled || !draggedCell) return;
    e.preventDefault();
    if (draggedCell.row !== targetR || draggedCell.column !== targetC) {
      onCellSwap?.(draggedCell, { row: targetR, column: targetC });
    }
    setDraggedCell(null);
    setHoveredCell(null);
  };

  const handleDragEnd = () => {
    setDraggedCell(null);
    setHoveredCell(null);
  };

  // Touch Drag Handlers (Mobile & Tablets)
  const handleTouchStart = (r: number, c: number) => {
    if (mode !== 'setup' || disabled) return;
    setDraggedCell({ row: r, column: c });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (mode !== 'setup' || disabled || !draggedCell) return;
    const touch = e.touches[0];
    if (!touch) return;
    const targetEl = document.elementFromPoint(touch.clientX, touch.clientY);
    const cellEl = targetEl?.closest('[data-cell-pos]');
    if (cellEl) {
      const r = parseInt(cellEl.getAttribute('data-row') || '-1', 10);
      const c = parseInt(cellEl.getAttribute('data-col') || '-1', 10);
      if (r >= 0 && c >= 0 && (hoveredCell?.row !== r || hoveredCell?.column !== c)) {
        setHoveredCell({ row: r, column: c });
      }
    } else {
      setHoveredCell(null);
    }
  };

  const handleTouchEnd = () => {
    if (mode !== 'setup' || disabled || !draggedCell) return;
    if (hoveredCell && (draggedCell.row !== hoveredCell.row || draggedCell.column !== hoveredCell.column)) {
      onCellSwap?.(draggedCell, hoveredCell);
    }
    setDraggedCell(null);
    setHoveredCell(null);
  };

  return (
    <div
      onTouchMove={mode === 'setup' ? handleTouchMove : undefined}
      onTouchEnd={mode === 'setup' ? handleTouchEnd : undefined}
      className="w-full max-w-[560px] aspect-square mx-auto p-2.5 sm:p-3.5 md:p-4 bg-white/95 rounded-3xl border border-slate-200/90 shadow-xl backdrop-blur-md flex flex-col justify-between transition-all"
    >
      <div className={`grid ${currentGridClass} gap-1.5 sm:gap-2 w-full h-full`}>
        {board.map((row, r) =>
          row.map((val, c) => {
            const isSelected = selectedPos?.row === r && selectedPos?.column === c;
            const isDragging = draggedCell?.row === r && draggedCell?.column === c;
            const isHoveredTarget = hoveredCell?.row === r && hoveredCell?.column === c && !isDragging;
            const isCalled = calledSet.has(val);

            // Check WHO called this number
            const callerId = calledByMap[val];
            const isMyPick = isCalled && currentUserId && callerId === currentUserId;
            const isOpponentPick = isCalled && currentUserId && callerId && callerId !== currentUserId;

            // Eye-friendly Light Mode Styling
            let bgStyle = 'bg-white hover:bg-indigo-50/70 text-slate-800 border-slate-200 shadow-2xs hover:border-indigo-300';
            let extraGlow = '';

            if (mode === 'setup') {
              if (isDragging) {
                bgStyle = 'bg-indigo-100/70 border-2 border-dashed border-indigo-500 text-indigo-800 opacity-50 scale-95';
              } else if (isHoveredTarget) {
                bgStyle = 'bg-emerald-50 border-2 border-emerald-500 text-emerald-900 scale-105 shadow-lg';
                extraGlow = 'ring-4 ring-emerald-300/60 z-20';
              } else if (isSelected) {
                bgStyle = 'bg-amber-50 border-2 border-amber-500 text-amber-900 scale-[1.03] shadow-md';
                extraGlow = 'ring-4 ring-amber-300/60 z-10';
              } else if (!disabled) {
                bgStyle = 'bg-white hover:bg-indigo-50/80 text-slate-800 border-slate-200 hover:border-indigo-400 hover:scale-[1.02] active:scale-95 shadow-2xs cursor-grab active:cursor-grabbing';
              }
            } else if (mode === 'game') {
              if (isCalled) {
                if (isOpponentPick) {
                  // Opponent pick: Vibrant soft Rose / Red
                  bgStyle = 'bg-gradient-to-br from-rose-500 to-red-600 border-rose-600 text-white scale-[0.98] shadow-sm';
                  extraGlow = 'ring-2 ring-rose-300/60';
                } else if (isMyPick) {
                  // Player's pick: Refreshing Emerald / Teal
                  bgStyle = 'bg-gradient-to-br from-emerald-500 to-teal-600 border-emerald-600 text-white scale-[0.98] shadow-sm';
                  extraGlow = 'ring-2 ring-emerald-300/60';
                } else {
                  // Fallback
                  bgStyle = 'bg-gradient-to-br from-indigo-500 to-blue-600 border-indigo-600 text-white scale-[0.98]';
                  extraGlow = 'ring-2 ring-indigo-300/40';
                }
              } else if (isMyTurn && !disabled) {
                bgStyle = 'bg-white hover:bg-blue-50/90 hover:border-blue-400 text-slate-800 hover:text-blue-700 cursor-pointer hover:scale-[1.03] active:scale-95 transition-all border-slate-200 shadow-2xs';
              } else {
                bgStyle = 'bg-slate-100/70 text-slate-400 border-slate-200/60 cursor-default';
              }
            }

            return (
              <button
                key={`${r}-${c}`}
                type="button"
                data-cell-pos="true"
                data-row={r}
                data-col={c}
                draggable={mode === 'setup' && !disabled}
                onDragStart={(e) => handleDragStart(e, r, c)}
                onDragOver={(e) => handleDragOver(e, r, c)}
                onDragLeave={(e) => handleDragLeave(e, r, c)}
                onDrop={(e) => handleDrop(e, r, c)}
                onDragEnd={handleDragEnd}
                onTouchStart={() => handleTouchStart(r, c)}
                disabled={disabled || (mode === 'game' && (isCalled || !isMyTurn))}
                onClick={() => onCellClick && onCellClick(r, c, val)}
                className={`relative flex flex-col items-center justify-center border transition-all duration-150 select-none ${cellTypeClass} ${bgStyle} ${extraGlow}`}
              >
                <span>{val}</span>

                {mode === 'game' && isCalled && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    {isOpponentPick ? (
                      <div className={`${badgeSizeClass} rounded-full bg-white/20 border border-white/60 flex items-center justify-center text-white animate-in fade-in zoom-in duration-150 shadow-xs`}>
                        <Flame className={iconClass} />
                      </div>
                    ) : (
                      <div className={`${badgeSizeClass} rounded-full bg-white/20 border border-white/60 flex items-center justify-center text-white animate-in fade-in zoom-in duration-150 shadow-xs`}>
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
        <div className="pt-2.5 mt-2 border-t border-slate-200 flex items-center justify-center space-x-6 text-xs font-bold text-slate-600">
          <div className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-300"></span>
            <span className="text-emerald-700">Your Pick</span>
          </div>
          <div className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-300"></span>
            <span className="text-rose-700">Opponent Pick</span>
          </div>
        </div>
      )}
    </div>
  );
};
