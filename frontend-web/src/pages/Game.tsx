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
import { TicTacToeArena } from '../components/games/TicTacToeArena';
import { DotsAndBoxesArena } from '../components/games/DotsAndBoxesArena';
import { ConnectionStatusPill } from '../components/ConnectionStatusPill';
import { getGameTheme } from '../lib/gameThemes';
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
    connectionStatus,
  } = useGameStore();

  const [calling, setCalling] = useState(false);
  const [pendingPick, setPendingPick] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const prevTurnUserIdRef = useRef<string | null>(null);
  const prevLineCountRef = useRef(lineCount);

  const isBingo = !game?.gameType || game.gameType === 'BINGO';
  const isTtt = game?.gameType === 'TIC_TAC_TOE';
  const isDots = game?.gameType === 'DOTS_AND_BOXES';

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
    if (isBingo && lineCount > prevLineCountRef.current) {
      soundService.playLineComplete();
    }
    prevLineCountRef.current = lineCount;
  }, [lineCount, isBingo]);

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
      const needsSync = !game || (isBingo && !board) || game.roomCode?.toUpperCase() !== code.toUpperCase();
      if (needsSync) {
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

  if (!user || !game || (isBingo && !board) || game.roomCode?.toUpperCase() !== code?.toUpperCase()) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4 px-4 text-center font-sans">
        {error ? (
          <div className="space-y-3">
            <p className="text-sm text-red-500 font-semibold">{error}</p>
            <button
              onClick={() => navigate(`/lobby/${code}`)}
              className="btn-gradient px-5 py-2.5 text-xs font-bold shadow-sm cursor-pointer"
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

  // --- BINGO Move Handler ---
  const handleCellClick = async (_row: number, _col: number, value: number) => {
    if (!isMyTurn || calling || pendingPick !== null) return;
    if (game.calledNumbers.includes(value)) return;

    const clientMoveId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;

    soundService.playTileTap();
    soundService.playPickSuccess();
    setPendingPick(value);
    setCalling(true);
    setError(null);

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(15); } catch (_) {}
    }

    let socketSent = false;
    try {
      socketSent = socketService.callNumber(game.id, value, clientMoveId);
    } catch (e) {
      socketSent = false;
    }

    if (!socketSent) {
      try {
        await gameApi.callNumber(game.id, value, clientMoveId);
      } catch (err: any) {
        if (!err.message?.includes('already')) {
          setError(err.response?.data?.message || 'Failed to call number');
          setPendingPick(null);
        }
      } finally {
        setCalling(false);
      }
    } else {
      setTimeout(async () => {
        const latestGame = useGameStore.getState().game;
        if (latestGame && !latestGame.calledNumbers.includes(value) && latestGame.currentTurnUserId === user?.id) {
          try {
            await gameApi.callNumber(game.id, value, clientMoveId);
          } catch (err: any) {}
        }
      }, 350);
      setTimeout(() => setCalling(false), 300);
    }
  };

  // --- TIC-TAC-TOE Move Handler ---
  const handleTttMove = async (row: number, col: number) => {
    if (!isMyTurn || calling) return;

    const clientMoveId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;

    soundService.playTileTap();
    setCalling(true);
    setError(null);

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(15); } catch (_) {}
    }

    let socketSent = false;
    try {
      socketSent = socketService.sendTttMove(game.id, row, col, clientMoveId);
    } catch (e) {
      socketSent = false;
    }

    if (!socketSent) {
      try {
        await gameApi.makeTttMove(game.id, row, col, clientMoveId);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to make move');
      } finally {
        setCalling(false);
      }
    } else {
      setTimeout(async () => {
        const latestGame = useGameStore.getState().game;
        const size = latestGame?.tttGridSize || 3;
        const index = row * size + col;
        if (latestGame && latestGame.tttBoard && !latestGame.tttBoard[index] && latestGame.currentTurnUserId === user?.id) {
          try {
            await gameApi.makeTttMove(game.id, row, col, clientMoveId);
          } catch (err: any) {}
        }
      }, 350);
      setTimeout(() => setCalling(false), 300);
    }
  };

  // --- DOTS & BOXES Move Handler ---
  const handleDotsLine = async (lineType: 'H' | 'V', row: number, col: number) => {
    if (!isMyTurn || calling) return;

    const clientMoveId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;

    soundService.playTileTap();
    setCalling(true);
    setError(null);

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(15); } catch (_) {}
    }

    let socketSent = false;
    try {
      socketSent = socketService.sendDotsLine(game.id, lineType, row, col, clientMoveId);
    } catch (e) {
      socketSent = false;
    }

    if (!socketSent) {
      try {
        await gameApi.drawDotsLine(game.id, lineType, row, col, clientMoveId);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to draw line');
      } finally {
        setCalling(false);
      }
    } else {
      setTimeout(async () => {
        const latestGame = useGameStore.getState().game;
        const lines = lineType === 'H' ? latestGame?.horizontalLines : latestGame?.verticalLines;
        if (latestGame && lines && !lines[row]?.[col] && latestGame.currentTurnUserId === user?.id) {
          try {
            await gameApi.drawDotsLine(game.id, lineType, row, col, clientMoveId);
          } catch (err: any) {}
        }
      }, 350);
      setTimeout(() => setCalling(false), 300);
    }
  };

  const theme = getGameTheme(game?.gameType);

  const getGameTitle = () => {
    if (isTtt) return 'Tic-Tac-Toe';
    if (isDots) return 'Dots & Boxes';
    return 'Bingo';
  };

  return (
    <div className="max-w-6xl lg:max-w-7xl mx-auto px-4 sm:px-6 py-5 space-y-4 font-sans">
      {/* Match Header Bar with Game-Themed Badges */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-[#7e749c]">Match Room:</span>
          <span className={`px-3 py-1 rounded-full ${theme.accentBadgeBg} border ${theme.accentBadgeBorder} font-mono font-black text-xs ${theme.accentBadgeText} tracking-wider shadow-2xs`}>
            {code}
          </span>
          <span className={`px-3 py-1 rounded-full bg-white border ${theme.accentBadgeBorder} text-xs font-black ${theme.accentBadgeText} shadow-2xs`}>
            {getGameTitle()}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {isBingo && (
            <span className={`text-xs px-3 py-1 rounded-full ${theme.accentBadgeBg} border ${theme.accentBadgeBorder} ${theme.accentBadgeText} font-black`}>
              Target: {game.winningLines || 5} Lines
            </span>
          )}
          {isTtt && (
            <span className={`text-xs px-3 py-1 rounded-full ${theme.accentBadgeBg} border ${theme.accentBadgeBorder} ${theme.accentBadgeText} font-black`}>
              Grid: {game.tttGridSize || 3}x{game.tttGridSize || 3}
            </span>
          )}
          {isDots && (
            <span className={`text-xs px-3 py-1 rounded-full ${theme.accentBadgeBg} border ${theme.accentBadgeBorder} ${theme.accentBadgeText} font-black`}>
              Grid: {game.dotsGridSize || 4}x{game.dotsGridSize || 4}
            </span>
          )}
          <span className="text-xs px-3 py-1 rounded-full bg-[#e6f7ef] border border-[#c3eed7] text-[#047857] font-black">
            {game.status}
          </span>
          <ConnectionStatusPill
            status={connectionStatus}
            onRefresh={() => (code && user ? syncGameByRoomCode(code, user.id) : undefined)}
          />
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
        {/* Left Column: Game Arena & Controls */}
        <div className="lg:col-span-7 space-y-3.5 flex flex-col items-center">
          {/* Bingo-Only: Progress Banner */}
          {isBingo && (
            <BingoAnimation lineCount={lineCount} targetLines={game.winningLines || 5} />
          )}

          {/* Turn Indicator Banner with Game-Themed Glow */}
          <div
            className={`w-full max-w-[560px] p-3.5 sm:p-4 rounded-[24px] border text-center transition-all duration-300 ${
              pendingPick !== null
                ? 'bg-[#ecfdf5] border-2 border-[#10b981] ring-4 ring-[#10b981]/20 shadow-[0_8px_24px_rgba(16,185,129,0.25)]'
                : isMyTurn
                ? theme.turnBannerMyTurn
                : theme.turnBannerWaiting
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
                <Sparkles className="w-5 h-5 animate-pulse text-amber-500" />
                <div className="text-sm font-black text-[#2a2050]">
                  {isBingo && "IT'S YOUR TURN! Tap a number on your board"}
                  {isTtt && "IT'S YOUR TURN! Place your mark on the grid"}
                  {isDots && "IT'S YOUR TURN! Click a line between two dots"}
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
                  to make a move...
                </span>
              </div>
            )}
          </div>

          {/* Dynamic Game Arena Component */}
          {isBingo && board && (
            <>
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

              {/* Called Numbers Ticker */}
              <div className="w-full max-w-[560px]">
                <CalledNumbersTicker
                  calledNumbers={game.calledNumbers}
                  lastNumber={lastCalledNumber}
                  totalNumbers={game.boardSize * game.boardSize}
                  calledByMap={calledByMap}
                  currentUserId={user.id}
                />
              </div>
            </>
          )}

          {isTtt && (
            <div className="w-full max-w-[560px] flex justify-center">
              <TicTacToeArena
                game={game}
                currentUserId={user.id}
                onMakeMove={handleTttMove}
                isMyTurn={isMyTurn}
                disabled={game.status !== 'PLAYING'}
              />
            </div>
          )}

          {isDots && (
            <div className="w-full max-w-[560px] flex justify-center">
              <DotsAndBoxesArena
                game={game}
                currentUserId={user.id}
                onDrawLine={handleDotsLine}
                isMyTurn={isMyTurn}
                disabled={game.status !== 'PLAYING'}
              />
            </div>
          )}

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
            {isBingo && (
              <p className="text-[11px] leading-relaxed text-[#7e749c] font-medium">
                Complete {game.winningLines || 5} horizontal rows, vertical columns, or diagonal lines before your opponents. Each number called marks that tile for every player in the room!
              </p>
            )}
            {isTtt && (
              <p className="text-[11px] leading-relaxed text-[#7e749c] font-medium">
                Align {game.tttGridSize || 3} of your marks in an uninterrupted row, column, or diagonal line. Block your opponent before they complete theirs!
              </p>
            )}
            {isDots && (
              <p className="text-[11px] leading-relaxed text-[#7e749c] font-medium">
                Take turns drawing horizontal or vertical lines between adjacent dots. Completing the 4th side of any 1x1 box claims it for your score and grants you an immediate bonus turn!
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Floating Animated Emotes Overlay */}
      <FloatingEmotesOverlay />
    </div>
  );
};

