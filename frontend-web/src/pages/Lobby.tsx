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
  const { room, fetchRoom, initSocketListeners, leaveCurrentRoom, game } = useGameStore();

  const [copied, setCopied] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (code && user) {
      fetchRoom(code).catch((err) => {
        console.error(err);
      });
      initSocketListeners(code, user.id);
    }
  }, [code, user, fetchRoom, initSocketListeners]);

  // Navigate when game starts
  useEffect(() => {
    if (game && game.status === 'PLAYING') {
      navigate(`/game/${code}`);
    }
  }, [game, code, navigate]);

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
    <div className="max-w-md mx-auto px-4 py-5 space-y-5">
      {/* Header controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleLeave}
          className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-red-400 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Leave Lobby</span>
        </button>

        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">
          {room.status}
        </span>
      </div>

      {/* Room Code Card */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950/30 to-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl text-center">
        <div className="text-xs text-slate-400 font-medium">Room Code</div>
        <div className="text-4xl font-mono font-black tracking-widest text-white mt-1">
          {room.roomCode}
        </div>

        <div className="flex items-center justify-center space-x-2 mt-4">
          <button
            onClick={handleCopyCode}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 transition active:scale-95"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>
        </div>
      </div>

      {/* Board Setup CTA */}
      <div className={`p-4 rounded-2xl border transition ${
        isMyBoardLocked
          ? 'bg-emerald-950/20 border-emerald-500/30'
          : 'bg-amber-950/20 border-amber-500/30 ring-1 ring-amber-500/30 animate-pulse-fast'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isMyBoardLocked ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
            }`}>
              <Grid className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">
                {isMyBoardLocked ? 'Board Locked & Ready' : 'Customize Your Board'}
              </div>
              <div className="text-xs text-slate-400">
                {isMyBoardLocked
                  ? 'Waiting for host to start match'
                  : 'Arrange and lock your 5x5 numbers'}
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate(`/setup/${room.roomCode}`)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
              isMyBoardLocked
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/30'
            }`}
          >
            {isMyBoardLocked ? 'View Board' : 'Set Up Now'}
          </button>
        </div>
      </div>

      {/* Player List */}
      <PlayerList
        roomPlayers={room.players}
        hostId={room.hostId}
        currentUserId={user.id}
      />

      {error && (
        <div className="flex items-center space-x-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Host Action / Waiting indicator */}
      {isHost ? (
        <button
          onClick={handleStartGame}
          disabled={!allLocked || starting}
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3.5 rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center justify-center space-x-2 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {starting ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Play className="w-5 h-5 fill-white" />
              <span>
                {room.players.length < 2
                  ? 'Need at least 2 players'
                  : !allLocked
                  ? 'Waiting for all boards to be locked'
                  : 'Start Bingo Game!'}
              </span>
            </>
          )}
        </button>
      ) : (
        <div className="p-3.5 bg-slate-900/60 rounded-2xl border border-slate-800 text-center text-xs text-slate-400 flex items-center justify-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
          <span>Waiting for host to start the game...</span>
        </div>
      )}
    </div>
  );
};
