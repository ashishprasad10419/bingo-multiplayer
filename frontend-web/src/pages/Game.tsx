import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameStore } from '../state/gameStore';
import { useAuthStore } from '../state/authStore';
import { gameApi } from '../lib/api';
import { socketService } from '../lib/socket';
import { BoardGrid } from '../components/BoardGrid';
import { CalledNumbersTicker } from '../components/CalledNumbersTicker';
import { PlayerList } from '../components/PlayerList';
import { BingoAnimation } from '../components/BingoAnimation';
import { AlertCircle, Clock, Sparkles } from 'lucide-react';

export const Game: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    game,
    board,
    lineCount,
    lastCalledNumber,
    calledByMap,
    initSocketListeners,
    syncGameByRoomCode,
    winnerInfo,
  } = useGameStore();

  const [calling, setCalling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (code && user) {
      initSocketListeners(code, user.id);

      // Restore full game and board state if refreshing, missing, or room code mismatch
      if (!game || !board || game.roomCode?.toUpperCase() !== code.toUpperCase()) {
        syncGameByRoomCode(code, user.id).catch((err) => {
          console.error('Failed to sync game state on refresh:', err);
          setError(err.response?.data?.message || 'Could not load match state. Please return to lobby.');
          if (err.response?.status === 404 || err.response?.data?.message?.includes('No game found')) {
            navigate(`/lobby/${code}`);
          }
        });
      }
    }
  }, [code, user?.id]);

  // Navigate to winner screen when game is finished
  useEffect(() => {
    if (winnerInfo && game?.id) {
      const timer = setTimeout(() => {
        navigate(`/winner/${game.id}`);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [winnerInfo, game?.id, navigate]);

  if (!user || !game || !board || game.roomCode?.toUpperCase() !== code?.toUpperCase()) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4 px-4 text-center">
        {error ? (
          <div className="space-y-3">
            <p className="text-sm text-red-400 font-semibold">{error}</p>
            <button
              onClick={() => navigate(`/lobby/${code}`)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-lg shadow-blue-500/20"
            >
              Return to Lobby
            </button>
          </div>
        ) : (
          <>
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-400">Syncing live match state...</p>
          </>
        )}
      </div>
    );
  }

  const isMyTurn = game.currentTurnUserId === user.id;
  const currentTurnPlayer = game.players.find((p) => p.userId === game.currentTurnUserId);

  const handleCellClick = async (_row: number, _col: number, value: number) => {
    if (!isMyTurn || calling) return;
    if (game.calledNumbers.includes(value)) return;

    setCalling(true);
    setError(null);

    try {
      // 1. Attempt real-time WebSocket STOMP action first
      const sentViaSocket = socketService.callNumber(game.id, value);

      // 2. If socket not active, fallback to authoritative REST endpoint
      if (!sentViaSocket) {
        await gameApi.callNumber(game.id, value);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to call number');
      // If turn collision or race condition occurred, resync match immediately
      if (code && user?.id) {
        syncGameByRoomCode(code, user.id).catch(() => {});
      }
    } finally {
      setTimeout(() => setCalling(false), 200);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-4 space-y-3.5">
      {/* B-I-N-G-O Progress Banner */}
      <BingoAnimation lineCount={lineCount} targetLines={game.winningLines || 5} />

      {/* Turn Indicator Banner */}
      <div
        className={`p-3.5 rounded-2xl border text-center transition-all ${
          isMyTurn
            ? 'bg-gradient-to-r from-blue-600/20 via-indigo-600/25 to-blue-600/20 border-blue-500/60 ring-2 ring-blue-500/30 shadow-lg shadow-blue-500/20'
            : 'bg-slate-900/80 border-slate-800'
        }`}
      >
        {isMyTurn ? (
          <div className="flex items-center justify-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
            <div className="text-sm font-extrabold text-white">
              IT'S YOUR TURN! Pick a number on your board
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2 text-xs font-semibold text-slate-400">
            <Clock className="w-4 h-4 text-slate-500 animate-spin" />
            <span>
              Waiting for{' '}
              <strong className="text-white">
                {currentTurnPlayer?.username || 'player'}
              </strong>{' '}
              to pick a number...
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center space-x-2 p-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Live Board Grid */}
      <BoardGrid
        board={board}
        mode="game"
        calledNumbers={game.calledNumbers}
        calledByMap={calledByMap}
        currentUserId={user.id}
        onCellClick={handleCellClick}
        isMyTurn={isMyTurn}
        disabled={calling || game.status !== 'PLAYING'}
      />

      {/* Called Numbers Ticker */}
      <CalledNumbersTicker
        calledNumbers={game.calledNumbers}
        lastNumber={lastCalledNumber}
        totalNumbers={game.boardSize * game.boardSize}
        calledByMap={calledByMap}
        currentUserId={user.id}
      />

      {/* Match Players Status */}
      <PlayerList
        gamePlayers={game.players}
        currentTurnUserId={game.currentTurnUserId}
        currentUserId={user.id}
      />
    </div>
  );
};
