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

  // Bulletproof Heartbeat Reconciliation:
  // Poll authoritative match state every 1.5s while playing
  // Guarantees all players stay in 100% lockstep even if WebSocket drops or lags
  useEffect(() => {
    if (!code || !user) return;
    if (game && game.status !== 'PLAYING') return;

    const timer = setInterval(() => {
      syncGameByRoomCode(code, user.id, true).catch(() => {});
    }, 1500);

    return () => clearInterval(timer);
  }, [code, user?.id, game?.status, syncGameByRoomCode]);

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
    <div className="max-w-5xl lg:max-w-6xl mx-auto px-4 sm:px-6 py-5 space-y-4 font-sans">
      {/* Match Header Bar */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-[#7e749c]">Match Room:</span>
          <span className="px-3 py-1 rounded-full bg-[#f0ecfc] border border-[#e0d6f8] font-mono font-extrabold text-xs text-[#6d5ebd] tracking-wider">
            {code}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs px-3 py-1 rounded-full bg-[#fef5db] border border-[#fde7ad] text-[#b45309] font-extrabold">
            Target: {game.winningLines || 5} Lines
          </span>
          <span className="text-xs px-3 py-1 rounded-full bg-[#e6f7ef] border border-[#c3eed7] text-[#047857] font-extrabold">
            {game.status}
          </span>
        </div>
      </div>

      {error && (
        <div className="flex items-center space-x-2 p-3.5 bg-[#fee8ea] border border-[#fcd3d7] rounded-2xl text-[#dc2626] text-xs font-semibold shadow-2xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-[#f8788a]" />
          <span>{error}</span>
        </div>
      )}

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column: BINGO Banner, Turn Callout & Board Grid */}
        <div className="lg:col-span-7 space-y-3.5 flex flex-col items-center">
          {/* B-I-N-G-O Progress Banner */}
          <BingoAnimation lineCount={lineCount} targetLines={game.winningLines || 5} />

          {/* Turn Indicator Banner */}
          <div
            className={`w-full max-w-[560px] p-3.5 sm:p-4 rounded-[24px] border text-center transition-all ${
              isMyTurn
                ? 'bg-[#f0ecfc] border-2 border-[#8b7fe8] ring-4 ring-[#8b7fe8]/20 shadow-[0_8px_24px_rgba(139,127,232,0.25)]'
                : 'card-clay shadow-2xs'
            }`}
          >
            {isMyTurn ? (
              <div className="flex items-center justify-center space-x-2">
                <Sparkles className="w-5 h-5 text-[#f59e0b] animate-pulse" />
                <div className="text-sm font-extrabold text-[#2a2050]">
                  IT'S YOUR TURN! Tap a number on your board
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2 text-xs font-bold text-[#7e749c]">
                <Clock className="w-4 h-4 text-[#8b7fe8] animate-spin" />
                <span>
                  Waiting for{' '}
                  <strong className="text-[#2a2050] font-extrabold">
                    {currentTurnPlayer?.username || 'player'}
                  </strong>{' '}
                  to pick a number...
                </span>
              </div>
            )}
          </div>

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
        </div>

        {/* Right Column: Player Roster, Ticker, and Match Info */}
        <div className="lg:col-span-5 space-y-4">
          {/* Match Players Status */}
          <PlayerList
            gamePlayers={game.players}
            currentTurnUserId={game.currentTurnUserId}
            currentUserId={user.id}
          />

          {/* Called Numbers Ticker */}
          <CalledNumbersTicker
            calledNumbers={game.calledNumbers}
            lastNumber={lastCalledNumber}
            totalNumbers={game.boardSize * game.boardSize}
            calledByMap={calledByMap}
            currentUserId={user.id}
          />

          {/* Match Quick Guide */}
          <div className="card-clay p-4 sm:p-5 text-xs text-[#524872] space-y-2">
            <div className="font-extrabold text-[#2a2050] flex items-center space-x-1.5">
              <span>🎯 How to Win:</span>
            </div>
            <p className="text-[11px] leading-relaxed text-[#7e749c] font-medium">
              Complete {game.winningLines || 5} horizontal rows, vertical columns, or diagonal lines before your opponents. Each number called marks that tile for every player in the room!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
