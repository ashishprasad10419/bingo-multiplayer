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

  return (
    <div className="max-w-md mx-auto px-4 py-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(`/lobby/${code}`)}
          className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Lobby</span>
        </button>

        <span className="text-xs font-mono text-slate-400">
          Room: <span className="font-bold text-white">{code}</span>
        </span>
      </div>

      <div className="text-center">
        <h2 className="text-xl font-black text-white">
          {isLocked ? 'Your Locked Board' : `Customize ${room?.boardSize || 5}x${room?.boardSize || 5} Board`}
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          {isLocked
            ? 'Your board is locked and ready for the match!'
            : 'Tap any two cells to swap their positions, or shuffle.'}
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs text-center">
          {error}
        </div>
      )}

      {/* Interactive Board Grid */}
      {board ? (
        <BoardGrid
          board={board}
          mode="setup"
          selectedPos={selectedPos}
          onCellClick={handleCellClick}
          disabled={isLocked || loading}
        />
      ) : (
        <div className="w-full max-w-[420px] aspect-square mx-auto flex items-center justify-center bg-slate-900 rounded-2xl border border-slate-800">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      )}

      {/* Control Actions */}
      {!isLocked ? (
        <div className="space-y-3 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleShuffle}
              disabled={loading || locking}
              className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition disabled:opacity-50"
            >
              <Shuffle className="w-4 h-4 text-indigo-400" />
              <span>Shuffle Board</span>
            </button>

            <button
              onClick={handleGenerate}
              disabled={loading || locking}
              className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 text-emerald-400 ${loading ? 'animate-spin' : ''}`} />
              <span>Reset Random</span>
            </button>
          </div>

          <button
            onClick={handleLockBoard}
            disabled={loading || locking}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3 rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center justify-center space-x-2 transition disabled:opacity-50"
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
        <div className="pt-2 text-center">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-xs font-semibold flex items-center justify-center space-x-2 mb-3">
            <CheckCircle2 className="w-4 h-4" />
            <span>Board locked! Head back to the lobby to begin.</span>
          </div>

          <button
            onClick={() => navigate(`/lobby/${code}`)}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-2xl border border-slate-700 transition"
          >
            Return to Lobby
          </button>
        </div>
      )}
    </div>
  );
};
