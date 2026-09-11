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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(`/lobby/${code}`)}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Lobby</span>
        </button>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-500">Room Code:</span>
          <span className="px-2.5 py-1 rounded-xl bg-indigo-50 border border-indigo-200/80 font-mono font-black text-xs text-indigo-700 tracking-wider">
            {code}
          </span>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-semibold text-center shadow-2xs">
          {error}
        </div>
      )}

      {/* Main Responsive Layout: Stacks on mobile, 2 columns on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column: Interactive Board */}
        <div className="lg:col-span-7 flex flex-col items-center space-y-3">
          <div className="text-center w-full">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {isLocked ? 'Your Locked Board' : `Customize ${size}x${size} Board`}
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
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
            <div className="w-full max-w-[500px] aspect-square mx-auto flex items-center justify-center bg-white rounded-3xl border border-slate-200 shadow-lg">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          )}
        </div>

        {/* Right Column: Setup Studio & Control Actions */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white/90 border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xl backdrop-blur-md space-y-5">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-bold uppercase tracking-wider mb-2">
                <span>Setup Studio</span>
              </div>
              <h3 className="text-lg font-black text-slate-900">
                {isLocked ? 'Ready for Battle' : 'Board Arrangement'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isLocked
                  ? 'Your board configuration is locked. Head to the lobby when all players are ready.'
                  : 'Customize your layout for winning rows, columns, and diagonals.'}
              </p>
            </div>

            {/* Match Info Pills */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
                <div className="text-[11px] font-semibold text-slate-500">Board Size</div>
                <div className="text-sm font-black text-slate-900 mt-0.5">
                  {size}x{size} Grid
                </div>
                <div className="text-[10px] text-slate-400">Numbers 1 to {size * size}</div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
                <div className="text-[11px] font-semibold text-slate-500">Goal to Win</div>
                <div className="text-sm font-black text-amber-700 mt-0.5">
                  {room?.winningLines || 5} Lines
                </div>
                <div className="text-[10px] text-slate-400">Rows, cols, diags</div>
              </div>
            </div>

            {/* Quick Tips */}
            {!isLocked && (
              <div className="p-3.5 bg-indigo-50/60 border border-indigo-100 rounded-2xl space-y-2 text-xs text-indigo-900">
                <div className="font-bold flex items-center space-x-1.5 text-indigo-800">
                  <span>✨ How to Customize:</span>
                </div>
                <div className="space-y-1.5 text-[11px] text-slate-600">
                  <div className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                    <span><strong>Drag & Drop:</strong> Drag any number onto another to swap.</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
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
                    className="py-3 px-4 bg-slate-100 hover:bg-slate-200/80 text-slate-800 border border-slate-200 rounded-2xl text-xs font-bold flex items-center justify-center space-x-2 shadow-2xs transition disabled:opacity-50"
                  >
                    <Shuffle className="w-4 h-4 text-indigo-600" />
                    <span>Shuffle</span>
                  </button>

                  <button
                    onClick={handleGenerate}
                    disabled={loading || locking}
                    className="py-3 px-4 bg-slate-100 hover:bg-slate-200/80 text-slate-800 border border-slate-200 rounded-2xl text-xs font-bold flex items-center justify-center space-x-2 shadow-2xs transition disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 text-emerald-600 ${loading ? 'animate-spin' : ''}`} />
                    <span>Reset Random</span>
                  </button>
                </div>

                <button
                  onClick={handleLockBoard}
                  disabled={loading || locking}
                  className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black py-3.5 rounded-2xl shadow-lg shadow-emerald-500/25 flex items-center justify-center space-x-2 transition disabled:opacity-50 cursor-pointer"
                >
                  {locking ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Lock Board & Ready Up</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-3 pt-1">
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center justify-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Board locked! Ready for the match.</span>
                </div>

                <button
                  onClick={() => navigate(`/lobby/${code}`)}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-2xl shadow-md transition"
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
