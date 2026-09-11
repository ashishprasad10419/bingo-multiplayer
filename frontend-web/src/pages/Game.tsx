import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameStore } from '../state/gameStore';
import { useAuthStore } from '../state/authStore';
import { gameApi } from '../lib/api';
import { socketService } from '../lib/socket';
import { soundService } from '../lib/sound';
import { BoardGrid } from '../components/BoardGrid';
import { CalledNumbersTicker } from '../components/CalledNumbersTicker';
import { PlayerList } from '../components/PlayerList';
import { BingoAnimation } from '../components/BingoAnimation';
import { EmoteBar } from '../components/EmoteBar';
import { FloatingEmotesOverlay } from '../components/FloatingEmotesOverlay';
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
  const [pendingPick, setPendingPick] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const prevTurnUserIdRef = useRef<string | null>(null);
  const prevLineCountRef = useRef(lineCount);

  // Audio Cue: Alert player when it becomes their turn
  useEffect(() => {
    if (game?.currentTurnUserId && user?.id) {
      if (
        prevTurnUserIdRef.current &&
        prevTurnUserIdRef.current !== user.id &&
        game.currentTurnUserId === user.id
      ) {
        soundService.playTurnChime();
      }
      prevTurnUserIdRef.current = game.currentTurnUserId;
    }
  }, [game?.currentTurnUserId, user?.id]);

  // Audio Cue: Ascending triumphant chime when a BINGO line completes
  useEffect(() => {
    if (lineCount > prevLineCountRef.current) {
      soundService.playLineComplete();
    }
    prevLineCountRef.current = lineCount;
  }, [lineCount]);

  // Audio Cue: Victory celebration fanfare when winner is crowned
  useEffect(() => {
    if (winnerInfo) {
      soundService.playWinFanfare();
    }
  }, [winnerInfo]);

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

  // Reconcile pending pick once authoritative state or turn change arrives
  useEffect(() => {
    if (pendingPick !== null && game) {
      if (game.calledNumbers.includes(pendingPick) || game.currentTurnUserId !== user?.id) {
        setPendingPick(null);
        setCalling(false);
      }
    }
  }, [game?.calledNumbers, game?.currentTurnUserId, user?.id, pendingPick]);

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
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4 px-4 text-center font-sans">
        {error ? (
          <div className="space-y-3">
            <p className="text-sm text-red-500 font-semibold">{error}</p>
            <button
              onClick={() => navigate(`/lobby/${code}`)}
              className="btn-gradient px-5 py-2.5 text-xs font-bold shadow-sm"
            >
              Return to Lobby
            </button>
          </div>
        ) : (
          <>
            <div className="w-8 h-8 border-3 border-[#8b7fe8] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-[#7e749c] font-medium">Syncing live match state...</p>
          </>
        )}
      </div>
    );
  }

  const isMyTurn = game.currentTurnUserId === user.id;
  const currentTurnPlayer = game.players.find((p) => p.userId === game.currentTurnUserId);

  const handleCellClick = async (_row: number, _col: number, value: number) => {
    if (!isMyTurn || calling || pendingPick !== null) return;
    if (game.calledNumbers.includes(value)) return;

    // 1. INSTANT 0ms OPTIMISTIC FEEDBACK:
    // Mark cell as picked immediately in UI so player NEVER has to wonder or click twice!
    soundService.playTileTap();
    soundService.playPickSuccess();
    setPendingPick(value);
    setCalling(true);
    setError(null);

    // Subtle tactile feedback on mobile devices
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(15); } catch (_) {}
    }

    let socketSent = false;
    try {
      // 2. Dispatch over real-time WebSocket STOMP
      socketSent = socketService.callNumber(game.id, value);
    } catch (e) {
      socketSent = false;
    }

    // 3. Fast Dual-Channel Guarantee:
    // If socket wasn't connected, fire REST immediately.
    // If socket was sent, schedule a 350ms safety fallback timer to guarantee execution
    // even if mobile network jitter caused a dropped STOMP packet.
    if (!socketSent) {
      try {
        await gameApi.callNumber(game.id, value);
      } catch (err: any) {
        if (!err.message?.includes('already')) {
          setError(err.response?.data?.message || 'Failed to call number');
          setPendingPick(null);
        }
      } finally {
        setCalling(false);
      }
    } else {
      // Socket sent: fallback safety check in 350ms
      setTimeout(async () => {
        const latestGame = useGameStore.getState().game;
        if (latestGame && !latestGame.calledNumbers.includes(value) && latestGame.currentTurnUserId === user?.id) {
          try {
            await gameApi.callNumber(game.id, value);
          } catch (err: any) {
            // ignore duplicate or turn advance
          }
        }
      }, 350);

      // Re-enable calling check after short delay
      setTimeout(() => setCalling(false), 300);
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
              pendingPick !== null
                ? 'bg-[#ecfdf5] border-2 border-[#10b981] ring-4 ring-[#10b981]/20 shadow-[0_8px_24px_rgba(16,185,129,0.25)]'
                : isMyTurn
                ? 'bg-[#f0ecfc] border-2 border-[#8b7fe8] ring-4 ring-[#8b7fe8]/20 shadow-[0_8px_24px_rgba(139,127,232,0.25)]'
                : 'card-clay shadow-2xs'
            }`}
          >
            {pendingPick !== null ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-[#10b981] border-t-transparent rounded-full animate-spin"></div>
                <div className="text-sm font-extrabold text-[#047857]">
                  Picked #{pendingPick}! Confirming move...
                </div>
              </div>
            ) : isMyTurn ? (
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
            pendingPick={pendingPick}
            disabled={game.status !== 'PLAYING'}
          />

          {/* Called Numbers Ticker - Positioned directly below the Bingo Board */}
          <div className="w-full max-w-[560px]">
            <CalledNumbersTicker
              calledNumbers={game.calledNumbers}
              lastNumber={lastCalledNumber}
              totalNumbers={game.boardSize * game.boardSize}
              calledByMap={calledByMap}
              currentUserId={user.id}
            />
          </div>

          {/* In-Game Emote Reactions Bar */}
          <div className="w-full pt-1 flex justify-center">
            <EmoteBar gameId={game.id} roomCode={game.roomCode} />
          </div>
        </div>

        {/* Right Column: Player Roster and Match Info */}
        <div className="lg:col-span-5 space-y-4">
          {/* Match Players Status */}
          <PlayerList
            gamePlayers={game.players}
            currentTurnUserId={game.currentTurnUserId}
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

      {/* Floating Animated Emotes Overlay */}
      <FloatingEmotesOverlay />
    </div>
  );
};
