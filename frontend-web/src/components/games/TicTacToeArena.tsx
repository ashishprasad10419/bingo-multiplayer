import React from 'react';
import { Game } from '../../lib/types';
import { soundService } from '../../lib/sound';

interface TicTacToeArenaProps {
  game: Game;
  currentUserId: string;
  onMakeMove: (row: number, col: number) => void;
  isMyTurn: boolean;
  disabled?: boolean;
}

export const TicTacToeArena: React.FC<TicTacToeArenaProps> = ({
  game,
  currentUserId,
  onMakeMove,
  isMyTurn,
  disabled = false,
}) => {
  const size = game.tttGridSize || game.boardSize || 3;
  const board = game.tttBoard || Array(size * size).fill('');

  const playerX = game.players[0];
  const playerO = game.players[1];

  const mySymbol = playerX?.userId === currentUserId ? 'X' : 'O';

  const handleClick = (row: number, col: number) => {
    if (disabled || !isMyTurn) return;
    const index = row * size + col;
    if (board[index]) return; // already occupied

    soundService.playTileTap();
    onMakeMove(row, col);
  };

  return (
    <div className="w-full max-w-[480px] mx-auto space-y-4">
      {/* Player Symbols Legend */}
      <div className="flex items-center justify-center space-x-6">
        <div className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-full border shadow-2xs ${
          playerX?.userId === currentUserId ? 'bg-[#fee8ea] border-[#fcd3d7]' : 'bg-white/80 border-[#ede8f8]'
        }`}>
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#f8788a] to-[#e11d48] text-white flex items-center justify-center font-black text-xs shadow-xs">
            X
          </div>
          <span className="text-xs font-extrabold text-[#2a2050] truncate max-w-[100px]">
            {playerX?.username || 'Player 1'} {playerX?.userId === currentUserId ? '(You)' : ''}
          </span>
        </div>

        <div className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-full border shadow-2xs ${
          playerO?.userId === currentUserId ? 'bg-[#f0ecfc] border-[#e0d6f8]' : 'bg-white/80 border-[#ede8f8]'
        }`}>
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#8b7fe8] to-[#6d5ebd] text-white flex items-center justify-center font-black text-xs shadow-xs">
            O
          </div>
          <span className="text-xs font-extrabold text-[#2a2050] truncate max-w-[100px]">
            {playerO?.username || 'Player 2'} {playerO?.userId === currentUserId ? '(You)' : ''}
          </span>
        </div>
      </div>

      {/* 3D Clay Grid Container */}
      <div className="card-clay p-4 sm:p-5 shadow-[0_12px_36px_rgba(139,127,232,0.12)]">
        <div
          className="grid gap-2.5 sm:gap-3.5"
          style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: size }).map((_, r) =>
            Array.from({ length: size }).map((_, c) => {
              const index = r * size + c;
              const cellUserId = board[index];
              const isCellEmpty = !cellUserId;
              const isX = cellUserId === playerX?.userId;
              const isO = cellUserId === playerO?.userId;

              return (
                <button
                  key={`${r}-${c}`}
                  type="button"
                  disabled={disabled || !isMyTurn || !isCellEmpty}
                  onClick={() => handleClick(r, c)}
                  className={`aspect-square rounded-[22px] border flex items-center justify-center transition-all select-none relative group ${
                    isCellEmpty
                      ? isMyTurn && !disabled
                        ? 'bg-white hover:bg-[#faf7fe] hover:border-[#8b7fe8] border-[#ede8f8] shadow-2xs hover:shadow-md cursor-pointer transform hover:scale-[1.03] active:scale-[0.96]'
                        : 'bg-white/60 border-[#ede8f8] shadow-2xs cursor-not-allowed'
                      : isX
                      ? 'bg-gradient-to-br from-[#fee8ea] to-[#fcd3d7] border-[#f8788a]/40 shadow-sm'
                      : 'bg-gradient-to-br from-[#f0ecfc] to-[#e0d6f8] border-[#8b7fe8]/40 shadow-sm'
                  }`}
                >
                  {/* Render 'X' */}
                  {isX && (
                    <span className="font-black text-4xl sm:text-5xl bg-gradient-to-br from-[#f8788a] to-[#e11d48] bg-clip-text text-transparent drop-shadow-sm animate-in zoom-in-50 duration-200">
                      ✕
                    </span>
                  )}

                  {/* Render 'O' */}
                  {isO && (
                    <span className="font-black text-4xl sm:text-5xl bg-gradient-to-br from-[#8b7fe8] to-[#5b4cb8] bg-clip-text text-transparent drop-shadow-sm animate-in zoom-in-50 duration-200">
                      ◯
                    </span>
                  )}

                  {/* Hover Ghost Symbol */}
                  {isCellEmpty && isMyTurn && !disabled && (
                    <span className="font-black text-3xl sm:text-4xl text-[#8b7fe8]/20 opacity-0 group-hover:opacity-100 transition-opacity">
                      {mySymbol === 'X' ? '✕' : '◯'}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
