import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameStore } from '../state/gameStore';
import { useAuthStore } from '../state/authStore';
import { roomApi } from '../lib/api';
import { BoardGrid } from '../components/BoardGrid';
import { Shuffle, Lock, ArrowLeft, CheckCircle2, RefreshCw } from 'lucide-react';

export const BoardSetup: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { room, fetchRoom, board, setBoard, selectedPos, setSelectedPos } = useGameStore();

  const [loading, setLoading] = useState(false);
  const [locking, setLocking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (code && user) {
      fetchRoom(code).then((r) => {
        const myPlayer = r.players.find((p) => p.userId === user.id);
        if (myPlayer?.board) {
          setBoard(myPlayer.board);
        } else {
          handleGenerate();
        }
      });
    }
  }, [code, user]);

  const myPlayer = room?.players.find((p) => p.userId === user?.id);
  const isLocked = !!myPlayer?.boardLocked;

  const handleGenerate = async () => {
    if (!code || isLocked) return;
    setLoading(true);
    setError(null);
    try {
      const newBoard = await roomApi.generateBoard(code);
      setBoard(newBoard);
      setSelectedPos(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate board');
    } finally {
      setLoading(false);
    }
  };

  const handleShuffle = async () => {
    if (!code || isLocked) return;
    setLoading(true);
    setError(null);
    try {
      const newBoard = await roomApi.shuffleBoard(code);
      setBoard(newBoard);
      setSelectedPos(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to shuffle board');
    } finally {
      setLoading(false);
    }
  };

  const handleCellClick = async (row: number, col: number) => {
    if (isLocked || !code) return;

    if (!selectedPos) {
      // First cell selected
      setSelectedPos({ row, column: col });
    } else {
      // If tapped the same cell, deselect
      if (selectedPos.row === row && selectedPos.column === col) {
        setSelectedPos(null);
        return;
      }

      // Swap the two cells
      setLoading(true);
      try {
        const updated = await roomApi.swapCells(code, selectedPos, { row, column: col });
        setBoard(updated);
        setSelectedPos(null);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to swap cells');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCellSwap = async (
    fromPos: { row: number; column: number },
    toPos: { row: number; column: number }
  ) => {
    if (isLocked || !code || !board) return;

    // Optimistic local board update for instantaneous 0ms feedback
    const prevBoard = board.map((r) => [...r]);
    const nextBoard = board.map((r) => [...r]);
    const temp = nextBoard[fromPos.row][fromPos.column];
    nextBoard[fromPos.row][fromPos.column] = nextBoard[toPos.row][toPos.column];
    nextBoard[toPos.row][toPos.column] = temp;
    setBoard(nextBoard);
    setSelectedPos(null);

    try {
      const updated = await roomApi.swapCells(code, fromPos, toPos);
      setBoard(updated);
    } catch (err: any) {
      setBoard(prevBoard);
      setError(err.response?.data?.message || 'Failed to swap cells');
    }
  };

  const handleLockBoard = async () => {
    if (!code || isLocked) return;
    setLocking(true);
    setError(null);
    try {
      await roomApi.lockBoard(code, board || undefined);
      await fetchRoom(code);
      navigate(`/lobby/${code}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to lock board');
      setLocking(false);
    }
  };

  const size = room?.boardSize || 5;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6 font-sans">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(`/lobby/${code}`)}
          className="btn-pill-outline text-xs px-4 py-2 space-x-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Lobby</span>
        </button>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-[#7e749c]">Room Code:</span>
          <span className="px-3 py-1 rounded-full bg-[#f0ecfc] border border-[#e0d6f8] font-mono font-extrabold text-xs text-[#6d5ebd] tracking-wider">
            {code}
          </span>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-[#fee8ea] border border-[#fcd3d7] rounded-2xl text-[#dc2626] text-xs font-semibold text-center shadow-2xs">
          {error}
        </div>
      )}

      {/* Main Responsive Layout: Stacks on mobile, 2 columns on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column: Interactive Board */}
        <div className="lg:col-span-7 flex flex-col items-center space-y-3.5">
          <div className="text-center w-full">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2a2050] tracking-tight">
              {isLocked ? 'Your Locked Board' : `Customize ${size}x${size} Board`}
            </h2>
            <p className="text-xs sm:text-sm font-medium text-[#7e749c] mt-1 max-w-md mx-auto">
              {isLocked
                ? 'Your board is locked and ready for the match!'
                : 'Drag and drop any number to swap positions, or tap two numbers.'}
            </p>
          </div>

          {board ? (
            <BoardGrid
              board={board}
              mode="setup"
              selectedPos={selectedPos}
              onCellClick={handleCellClick}
              onCellSwap={handleCellSwap}
              disabled={isLocked || loading}
            />
          ) : (
            <div className="w-full max-w-[500px] aspect-square mx-auto flex items-center justify-center card-clay">
              <RefreshCw className="w-8 h-8 text-[#8b7fe8] animate-spin" />
            </div>
          )}
        </div>

        {/* Right Column: Setup Studio & Control Actions */}
        <div className="lg:col-span-5 space-y-4">
          <div className="card-clay p-5 sm:p-6 space-y-5">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#f0ecfc] border border-[#e0d6f8] text-[#6d5ebd] text-[11px] font-extrabold uppercase tracking-wider mb-2">
                <span>Setup Studio</span>
              </div>
              <h3 className="text-lg font-extrabold text-[#2a2050]">
                {isLocked ? 'Ready for Battle' : 'Board Arrangement'}
              </h3>
              <p className="text-xs text-[#7e749c] mt-0.5 font-medium">
                {isLocked
                  ? 'Your board configuration is locked. Head to the lobby when all players are ready.'
                  : 'Customize your layout for winning rows, columns, and diagonals.'}
              </p>
            </div>

            {/* Match Info Pills */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3.5 bg-[#f0ecfc] border border-[#e0d6f8] rounded-2xl">
                <div className="text-[11px] font-semibold text-[#7e749c]">Board Size</div>
                <div className="text-base font-extrabold text-[#2a2050] mt-0.5">
                  {size}x{size} Grid
                </div>
                <div className="text-[10px] text-[#8b7fe8] font-medium">Numbers 1 to {size * size}</div>
              </div>

              <div className="p-3.5 bg-[#fef5db] border border-[#fde7ad] rounded-2xl">
                <div className="text-[11px] font-semibold text-[#7e749c]">Goal to Win</div>
                <div className="text-base font-extrabold text-[#b45309] mt-0.5">
                  {room?.winningLines || 5} Lines
                </div>
                <div className="text-[10px] text-[#b45309] font-medium">Rows, cols, diags</div>
              </div>
            </div>

            {/* Quick Tips */}
            {!isLocked && (
              <div className="p-4 bg-[#e3f2fd] border border-[#c7e5fc] rounded-2xl space-y-2 text-xs text-[#0284c7]">
                <div className="font-extrabold flex items-center space-x-1.5 text-[#0369a1]">
                  <span>✨ How to Customize:</span>
                </div>
                <div className="space-y-1.5 text-[11px] text-[#475569] font-medium">
                  <div className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8b7fe8]"></span>
                    <span><strong>Drag & Drop:</strong> Drag any number onto another to swap.</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8b7fe8]"></span>
                    <span><strong>Tap to Swap:</strong> Click tile 1, then click tile 2.</span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {!isLocked ? (
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={handleShuffle}
                    disabled={loading || locking}
                    className="btn-pill-outline py-2.5 px-4 text-xs font-bold space-x-2 disabled:opacity-50 cursor-pointer"
                  >
                    <Shuffle className="w-4 h-4 text-[#8b7fe8]" />
                    <span>Shuffle</span>
                  </button>

                  <button
                    onClick={handleGenerate}
                    disabled={loading || locking}
                    className="btn-pill-outline py-2.5 px-4 text-xs font-bold space-x-2 disabled:opacity-50 cursor-pointer"
                  >
                    <RefreshCw className={`w-4 h-4 text-[#10b981] ${loading ? 'animate-spin' : ''}`} />
                    <span>Reset Random</span>
                  </button>
                </div>

                <button
                  onClick={handleLockBoard}
                  disabled={loading || locking}
                  className="btn-gradient w-full py-3.5 text-sm cursor-pointer"
                >
                  {locking ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span className="flex items-center space-x-2">
                      <Lock className="w-4 h-4" />
                      <span>Lock Board & Ready Up</span>
                    </span>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-3 pt-1">
                <div className="p-3.5 bg-[#e6f7ef] border border-[#c3eed7] rounded-full text-[#047857] text-xs font-bold flex items-center justify-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                  <span>Board locked! Ready for the match.</span>
                </div>

                <button
                  onClick={() => navigate(`/lobby/${code}`)}
                  className="btn-purple w-full py-3.5 text-sm cursor-pointer"
                >
                  Return to Lobby
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
