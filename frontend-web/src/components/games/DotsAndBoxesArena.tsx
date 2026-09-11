import React from 'react';
import { Game } from '../../lib/types';
import { soundService } from '../../lib/sound';

interface DotsAndBoxesArenaProps {
  game: Game;
  currentUserId: string;
  onDrawLine: (lineType: 'H' | 'V', row: number, col: number) => void;
  isMyTurn: boolean;
  disabled?: boolean;
}

const PLAYER_COLORS = [
  {
    name: 'Coral',
    gradient: 'from-[#f8788a] to-[#e11d48]',
    bgLight: 'bg-[#fee8ea]',
    border: 'border-[#fcd3d7]',
    text: 'text-[#dc2626]',
    lineColor: 'bg-[#f8788a]',
    boxBg: 'bg-gradient-to-br from-[#f8788a]/30 to-[#f8788a]/10',
  },
  {
    name: 'Purple',
    gradient: 'from-[#8b7fe8] to-[#6d5ebd]',
    bgLight: 'bg-[#f0ecfc]',
    border: 'border-[#e0d6f8]',
    text: 'text-[#6d5ebd]',
    lineColor: 'bg-[#8b7fe8]',
    boxBg: 'bg-gradient-to-br from-[#8b7fe8]/30 to-[#8b7fe8]/10',
  },
  {
    name: 'Emerald',
    gradient: 'from-[#10b981] to-[#059669]',
    bgLight: 'bg-[#e6f7ef]',
    border: 'border-[#c3eed7]',
    text: 'text-[#047857]',
    lineColor: 'bg-[#10b981]',
    boxBg: 'bg-gradient-to-br from-[#10b981]/30 to-[#10b981]/10',
  },
  {
    name: 'Amber',
    gradient: 'from-[#f59e0b] to-[#d97706]',
    bgLight: 'bg-[#fef5db]',
    border: 'border-[#fde7ad]',
    text: 'text-[#b45309]',
    lineColor: 'bg-[#f59e0b]',
    boxBg: 'bg-gradient-to-br from-[#f59e0b]/30 to-[#f59e0b]/10',
  },
];

export const DotsAndBoxesArena: React.FC<DotsAndBoxesArenaProps> = ({
  game,
  currentUserId,
  onDrawLine,
  isMyTurn,
  disabled = false,
}) => {
  const dots = game.dotsGridSize || game.boardSize || 4;
  const boxes = dots - 1;

  const hLines = new Set(game.horizontalLines || []);
  const vLines = new Set(game.verticalLines || []);
  const completedBoxes = game.completedBoxes || {};
  const scores = game.playerScores || {};

  const handleLineClick = (lineType: 'H' | 'V', r: number, c: number) => {
    if (disabled || !isMyTurn) return;
    const key = `${r}-${c}`;
    if (lineType === 'H' && hLines.has(key)) return;
    if (lineType === 'V' && vLines.has(key)) return;

    soundService.playTileTap();
    onDrawLine(lineType, r, c);
  };

  const getPlayerIndex = (userId: string) => {
    return game.players.findIndex((p) => p.userId === userId);
  };

  return (
    <div className="w-full max-w-[540px] mx-auto space-y-4">
      {/* Live Territory Scoreboard */}
      <div className="card-clay p-3 sm:p-4">
        <div className="text-[11px] font-extrabold text-[#7e749c] uppercase tracking-wider text-center mb-2.5">
          Boxes Captured ({Object.keys(completedBoxes).length} / {boxes * boxes})
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          {game.players.map((p, idx) => {
            const color = PLAYER_COLORS[idx % PLAYER_COLORS.length];
            const isTurn = game.currentTurnUserId === p.userId;
            const score = scores[p.userId] || 0;

            return (
              <div
                key={p.userId}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border shadow-2xs transition-all ${
                  isTurn ? `${color.bgLight} ${color.border} ring-2 ring-[#8b7fe8]/30 scale-105` : 'bg-white/80 border-[#ede8f8]'
                }`}
              >
                <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${color.gradient} text-white flex items-center justify-center font-black text-xs shadow-xs`}>
                  {p.username.slice(0, 1).toUpperCase()}
                </div>
                <span className="text-xs font-extrabold text-[#2a2050] truncate max-w-[90px]">
                  {p.username} {p.userId === currentUserId ? '(You)' : ''}
                </span>
                <span className={`text-xs font-black px-2 py-0.5 rounded-full ${color.bgLight} ${color.text} border ${color.border}`}>
                  {score}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3D Clay Dots & Lines Canvas */}
      <div className="card-clay p-5 sm:p-7 shadow-[0_12px_36px_rgba(139,127,232,0.12)] flex items-center justify-center overflow-x-auto">
        <div className="relative select-none py-2">
          {/* Render Row by Row of Dots and Lines */}
          {Array.from({ length: dots }).map((_, r) => (
            <div key={`row-${r}`}>
              {/* Row of Dots + Horizontal Lines */}
              <div className="flex items-center">
                {Array.from({ length: dots }).map((_, c) => {
                  const hasRightNeighbor = c < boxes;
                  const hKey = `${r}-${c}`;
                  const isHDrawn = hLines.has(hKey);

                  return (
                    <React.Fragment key={`dot-h-${r}-${c}`}>
                      {/* The Dot Node */}
                      <div className="w-4 h-4 rounded-full bg-[#8b7fe8] shadow-[0_2px_8px_rgba(139,127,232,0.5)] z-20 flex-shrink-0" />

                      {/* Horizontal Line Segment */}
                      {hasRightNeighbor && (
                        <button
                          type="button"
                          disabled={disabled || !isMyTurn || isHDrawn}
                          onClick={() => handleLineClick('H', r, c)}
                          className={`h-4 transition-all z-10 flex items-center justify-center group ${
                            isHDrawn
                              ? 'cursor-default'
                              : isMyTurn && !disabled
                              ? 'cursor-pointer'
                              : 'cursor-not-allowed'
                          }`}
                          style={{ width: dots > 4 ? '56px' : '72px' }}
                        >
                          <div
                            className={`w-full h-2 rounded-full transition-all ${
                              isHDrawn
                                ? 'bg-gradient-to-r from-[#8b7fe8] to-[#6d5ebd] shadow-sm'
                                : isMyTurn && !disabled
                                ? 'bg-[#ede8f8] group-hover:bg-[#8b7fe8]/50 group-hover:h-2.5'
                                : 'bg-[#ede8f8]'
                            }`}
                          />
                        </button>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Vertical Lines & Box Interiors Row (between dot rows) */}
              {r < boxes && (
                <div className="flex items-center">
                  {Array.from({ length: dots }).map((_, c) => {
                    const hasRightBox = c < boxes;
                    const vKey = `${r}-${c}`;
                    const isVDrawn = vLines.has(vKey);
                    const boxKey = `${r}-${c}`;
                    const boxWinnerId = completedBoxes[boxKey];
                    const boxWinnerIdx = boxWinnerId ? getPlayerIndex(boxWinnerId) : -1;
                    const boxColor = boxWinnerIdx >= 0 ? PLAYER_COLORS[boxWinnerIdx % PLAYER_COLORS.length] : null;

                    return (
                      <React.Fragment key={`v-box-${r}-${c}`}>
                        {/* Vertical Line Segment */}
                        <button
                          type="button"
                          disabled={disabled || !isMyTurn || isVDrawn}
                          onClick={() => handleLineClick('V', r, c)}
                          className={`w-4 transition-all z-10 flex items-center justify-center group flex-shrink-0 ${
                            isVDrawn
                              ? 'cursor-default'
                              : isMyTurn && !disabled
                              ? 'cursor-pointer'
                              : 'cursor-not-allowed'
                          }`}
                          style={{ height: dots > 4 ? '56px' : '72px' }}
                        >
                          <div
                            className={`h-full w-2 rounded-full transition-all ${
                              isVDrawn
                                ? 'bg-gradient-to-b from-[#8b7fe8] to-[#6d5ebd] shadow-sm'
                                : isMyTurn && !disabled
                                ? 'bg-[#ede8f8] group-hover:bg-[#8b7fe8]/50 group-hover:w-2.5'
                                : 'bg-[#ede8f8]'
                            }`}
                          />
                        </button>

                        {/* Box Interior Cell */}
                        {hasRightBox && (
                          <div
                            className={`transition-all rounded-xl flex items-center justify-center ${
                              boxColor ? `${boxColor.boxBg} border border-white/60 animate-in zoom-in-50 duration-300` : 'bg-transparent'
                            }`}
                            style={{
                              width: dots > 4 ? '56px' : '72px',
                              height: dots > 4 ? '56px' : '72px',
                            }}
                          >
                            {boxColor && boxWinnerId && (
                              <span className="font-black text-sm text-[#2a2050] drop-shadow-xs">
                                {game.players.find((p) => p.userId === boxWinnerId)?.username.slice(0, 1).toUpperCase()}
                              </span>
                            )}
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
