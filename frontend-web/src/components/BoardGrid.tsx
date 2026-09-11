import React, { useState } from 'react';
import { Check, Flame } from 'lucide-react';

interface BoardGridProps {
  board: number[][];
  mode: 'setup' | 'game';
  calledNumbers?: number[];
  calledByMap?: Record<number, string>; // number -> userId
  currentUserId?: string;
  selectedPos?: { row: number; column: number } | null;
  pendingPick?: number | null;
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
  pendingPick = null,
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
      className="w-full max-w-[560px] aspect-square mx-auto p-3 sm:p-4 md:p-5 card-clay flex flex-col justify-between transition-all"
    >
      <div className={`grid ${currentGridClass} gap-2 sm:gap-2.5 w-full h-full`}>
        {board.map((row, r) =>
          row.map((val, c) => {
            const isSelected = selectedPos?.row === r && selectedPos?.column === c;
            const isDragging = draggedCell?.row === r && draggedCell?.column === c;
            const isHoveredTarget = hoveredCell?.row === r && hoveredCell?.column === c && !isDragging;
            const isCalled = calledSet.has(val);
            const isPendingThis = mode === 'game' && pendingPick === val;

            // Check WHO called this number
            const callerId = calledByMap[val];
            const isMyPick = (isCalled && currentUserId && callerId === currentUserId) || isPendingThis;
            const isOpponentPick = isCalled && currentUserId && callerId && callerId !== currentUserId;

            // 3D Pastel Clay Styling
            let bgStyle = 'bg-white hover:bg-[#faf7fe] text-[#2a2050] border border-[#ede8f8] shadow-[0_3px_10px_rgba(140,120,205,0.08)]';
            let extraGlow = '';

            if (mode === 'setup') {
              if (isDragging) {
                bgStyle = 'bg-[#ede8fc] border-2 border-dashed border-[#8b7fe8] text-[#8b7fe8] opacity-50 scale-95';
              } else if (isHoveredTarget) {
                bgStyle = 'bg-[#e6f7ef] border-2 border-[#10b981] text-[#047857] scale-105 shadow-md';
                extraGlow = 'ring-4 ring-[#10b981]/30 z-20';
              } else if (isSelected) {
                bgStyle = 'bg-[#fef5db] border-2 border-[#f59e0b] text-[#b45309] scale-[1.03] shadow-md';
                extraGlow = 'ring-4 ring-[#f59e0b]/30 z-10';
              } else if (!disabled) {
                bgStyle = 'bg-white hover:bg-[#fbf9fe] text-[#2a2050] border border-[#ede8f8] hover:border-[#8b7fe8] hover:scale-[1.03] active:scale-95 shadow-[0_3px_10px_rgba(140,120,205,0.08)] cursor-grab active:cursor-grabbing';
              }
            } else if (mode === 'game') {
              if (isPendingThis) {
                // Instant 0ms Optimistic Pick
                bgStyle = 'bg-gradient-to-br from-[#10b981] to-[#059669] border-transparent text-white scale-[0.98] shadow-[0_6px_18px_rgba(16,185,129,0.4)] animate-pulse';
                extraGlow = 'ring-4 ring-[#a7f3d0] z-10';
              } else if (isCalled) {
                if (isOpponentPick) {
                  // Opponent pick: Pastel Rose / Coral Gradient
                  bgStyle = 'bg-gradient-to-br from-[#f8788a] to-[#e11d48] border-transparent text-white scale-[0.98] shadow-[0_6px_16px_rgba(248,120,138,0.32)]';
                  extraGlow = 'ring-2 ring-[#fecdd3]';
                } else if (isMyPick) {
                  // Player's pick: Fresh Mint / Emerald Gradient
                  bgStyle = 'bg-gradient-to-br from-[#10b981] to-[#059669] border-transparent text-white scale-[0.98] shadow-[0_6px_16px_rgba(16,185,129,0.32)]';
                  extraGlow = 'ring-2 ring-[#a7f3d0]';
                } else {
                  // Neutral / Fallback
                  bgStyle = 'bg-gradient-to-br from-[#8b7fe8] to-[#6d5ebd] border-transparent text-white scale-[0.98] shadow-[0_6px_16px_rgba(139,127,232,0.32)]';
                  extraGlow = 'ring-2 ring-[#ddd6fe]';
                }
              } else if (isMyTurn && !disabled && !pendingPick) {
                bgStyle = 'bg-white hover:bg-[#f4effc] border-2 border-[#e2d8f8] hover:border-[#8b7fe8] text-[#2a2050] hover:text-[#8b7fe8] cursor-pointer hover:scale-[1.04] active:scale-95 transition-all shadow-[0_4px_14px_rgba(140,120,205,0.12)]';
              } else {
                bgStyle = 'bg-[#f5f1fc]/80 text-[#9f96ba] border border-[#ede8f8] cursor-default';
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
                onDragStart={mode === 'setup' ? (e) => handleDragStart(e, r, c) : undefined}
                onDragOver={mode === 'setup' ? (e) => handleDragOver(e, r, c) : undefined}
                onDragLeave={mode === 'setup' ? (e) => handleDragLeave(e, r, c) : undefined}
                onDrop={mode === 'setup' ? (e) => handleDrop(e, r, c) : undefined}
                onDragEnd={mode === 'setup' ? handleDragEnd : undefined}
                onTouchStart={mode === 'setup' ? () => handleTouchStart(r, c) : undefined}
                disabled={disabled || (mode === 'game' && (isCalled || isPendingThis || !isMyTurn))}
                onClick={() => onCellClick && onCellClick(r, c, val)}
                className={`relative flex flex-col items-center justify-center border transition-all duration-150 select-none touch-manipulation cursor-pointer ${cellTypeClass} ${bgStyle} ${extraGlow}`}
              >
                <span className="font-extrabold">{val}</span>

                {mode === 'game' && (isCalled || isPendingThis) && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    {isOpponentPick ? (
                      <div className={`${badgeSizeClass} rounded-full bg-white/25 border border-white/70 flex items-center justify-center text-white animate-in fade-in zoom-in duration-150 shadow-xs`}>
                        <Flame className={iconClass} />
                      </div>
                    ) : (
                      <div className={`${badgeSizeClass} rounded-full bg-white/25 border border-white/70 flex items-center justify-center text-white animate-in fade-in zoom-in duration-150 shadow-xs`}>
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
        <div className="pt-3 mt-2 border-t border-[#ede8f8] flex items-center justify-center space-x-4 sm:space-x-6 text-xs font-bold text-[#524872]">
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#e6f7ef] border border-[#c3eed7] shadow-2xs">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] ring-2 ring-[#a7f3d0]"></span>
            <span className="text-[#047857]">Your Pick</span>
          </div>
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#fee8ea] border border-[#fcd3d7] shadow-2xs">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f8788a] ring-2 ring-[#fecdd3]"></span>
            <span className="text-[#dc2626]">Opponent Pick</span>
          </div>
        </div>
      )}
    </div>
  );
};
