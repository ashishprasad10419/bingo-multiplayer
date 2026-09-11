import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameStore } from '../state/gameStore';
import { useAuthStore } from '../state/authStore';
import { roomApi } from '../lib/api';
import { PlayerList } from '../components/PlayerList';
import { Copy, Check, Play, ArrowLeft, Grid, AlertCircle } from 'lucide-react';

export const Lobby: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { room, fetchRoom, initSocketListeners, leaveCurrentRoom, game, resetGame } = useGameStore();

  const [copied, setCopied] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (code && user) {
      // Purge any stale game from a different room
      if (game && game.roomCode?.toUpperCase() !== code.toUpperCase()) {
        resetGame();
      }

      fetchRoom(code).catch((err) => {
        console.error(err);
      });
      initSocketListeners(code, user.id);
    }
  }, [code, user?.id]);

  // Periodic poll in lobby to catch player joins and game start even if socket drops
  useEffect(() => {
    if (!code) return;
    const interval = setInterval(() => {
      fetchRoom(code).catch(() => {});
    }, 2000);
    return () => clearInterval(interval);
  }, [code, fetchRoom]);

  // Navigate when game starts for this exact room
  useEffect(() => {
    const isGamePlaying = game && game.status === 'PLAYING' && game.roomCode?.toUpperCase() === code?.toUpperCase();
    const isRoomPlaying = room && room.status === 'PLAYING' && room.roomCode?.toUpperCase() === code?.toUpperCase();
    if (isGamePlaying || isRoomPlaying) {
      navigate(`/game/${code}`);
    }
  }, [game?.status, game?.roomCode, room?.status, room?.roomCode, code, navigate]);

  if (!room || !user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400">Loading lobby...</p>
      </div>
    );
  }

  const isHost = room.hostId === user.id;
  const myPlayer = room.players.find((p) => p.userId === user.id);
  const allLocked = room.players.length >= 2 && room.players.every((p) => p.boardLocked);
  const isMyBoardLocked = !!myPlayer?.boardLocked;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(room.roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartGame = async () => {
    setStarting(true);
    setError(null);
    try {
      await roomApi.startGame(room.roomCode);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to start game');
      setStarting(false);
    }
  };

  const handleLeave = async () => {
    await leaveCurrentRoom();
    navigate('/');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleLeave}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 border border-slate-200 text-xs font-bold text-slate-600 hover:text-rose-600 shadow-2xs transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Leave Lobby</span>
        </button>

        <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 uppercase tracking-wider">
          {room.status}
        </span>
      </div>

      {error && (
        <div className="flex items-center space-x-2 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-semibold shadow-2xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column: Room Code, Board Setup & Match Settings */}
        <div className="lg:col-span-6 space-y-4">
          {/* Room Code Card */}
          <div className="bg-white/90 border border-slate-200/90 rounded-3xl p-6 shadow-sm backdrop-blur-md text-center">
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Room Code</div>
            <div className="text-4xl sm:text-5xl font-mono font-black tracking-widest text-slate-900 mt-2 select-all">
              {room.roomCode}
            </div>

            <div className="flex items-center justify-center space-x-2 mt-4">
              <button
                onClick={handleCopyCode}
                className="flex items-center space-x-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-2xs transition active:scale-95 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Code'}</span>
              </button>
            </div>
          </div>

          {/* Board Setup CTA */}
          <div className={`p-5 rounded-3xl border transition ${
            isMyBoardLocked
              ? 'bg-emerald-50/90 border-emerald-200 shadow-xs'
              : 'bg-amber-50/90 border-2 border-amber-400 shadow-sm ring-4 ring-amber-300/30 animate-pulse-fast'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3.5">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-xs ${
                  isMyBoardLocked ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                }`}>
                  <Grid className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm font-black text-slate-900">
                    {isMyBoardLocked ? 'Board Locked & Ready' : 'Customize Your Board'}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {isMyBoardLocked
                      ? 'Waiting for host to start match'
                      : `Arrange and lock your ${room.boardSize || 5}x${room.boardSize || 5} numbers`}
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate(`/setup/${room.roomCode}`)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition shadow-xs ${
                  isMyBoardLocked
                    ? 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/30'
                }`}
              >
                {isMyBoardLocked ? 'View Board' : 'Set Up Now'}
              </button>
            </div>
          </div>

          {/* Room Settings Details */}
          <div className="bg-white/80 border border-slate-200/90 rounded-3xl p-5 shadow-xs grid grid-cols-3 gap-3 text-center">
            <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200/70">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Size</div>
              <div className="text-sm font-black text-slate-800 mt-0.5">{room.boardSize || 5}x{room.boardSize || 5}</div>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200/70">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Goal</div>
              <div className="text-sm font-black text-amber-600 mt-0.5">{room.winningLines || 5} Lines</div>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200/70">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Players</div>
              <div className="text-sm font-black text-blue-600 mt-0.5">{room.players.length}/{room.maxPlayers || 6}</div>
            </div>
          </div>
        </div>

        {/* Right Column: Player Roster & Host Actions */}
        <div className="lg:col-span-6 space-y-4">
          <PlayerList
            roomPlayers={room.players}
            hostId={room.hostId}
            currentUserId={user.id}
          />

          {/* Host Action / Waiting indicator */}
          {isHost ? (
            <button
              onClick={handleStartGame}
              disabled={!allLocked || starting}
              className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black py-4 rounded-3xl shadow-xl shadow-emerald-500/25 flex items-center justify-center space-x-2.5 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {starting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Play className="w-5 h-5 fill-white" />
                  <span className="text-sm">
                    {room.players.length < 2
                      ? 'Need at least 2 players to start'
                      : !allLocked
                      ? 'Waiting for all players to lock board'
                      : 'Start Bingo Game!'}
                  </span>
                </>
              )}
            </button>
          ) : (
            <div className="p-4 bg-white/90 rounded-3xl border border-slate-200 text-center text-xs font-bold text-slate-600 shadow-xs flex items-center justify-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
              <span>Waiting for host to start the game...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
