import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameStore } from '../state/gameStore';
import { useAuthStore } from '../state/authStore';
import { roomApi } from '../lib/api';
import { PlayerList } from '../components/PlayerList';
import { Copy, Check, Play, ArrowLeft, Grid, AlertCircle, Share2, MessageCircle } from 'lucide-react';

export const Lobby: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { room, fetchRoom, initSocketListeners, leaveCurrentRoom, game, resetGame } = useGameStore();

  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inviteUrl = `${window.location.origin}/join/${room?.roomCode || code}`;
  const shareText = `🎮 Hey! Join my Bingo game right now! Tap the link to join directly:\n${inviteUrl}\n(Room Code: ${room?.roomCode || code})`;

  const handleCopyCode = () => {
    if (!room) return;
    navigator.clipboard.writeText(room.roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Join my Bingo Game!',
          text: `Hey! Join my Bingo match (Room Code: ${room?.roomCode || code})`,
          url: inviteUrl,
        });
      } catch (err) {
        // User cancelled or ignored
      }
    } else {
      handleCopyLink();
    }
  };

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
  const isBingo = !room.gameType || room.gameType === 'BINGO';
  const allLocked = room.players.length >= 2 && (isBingo ? room.players.every((p) => p.boardLocked) : true);
  const isMyBoardLocked = !!myPlayer?.boardLocked;
  const isReadyToStart = room.players.length >= 2 && allLocked;


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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6 font-sans">
      {/* Header controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleLeave}
          className="btn-pill-outline text-xs px-4 py-2 space-x-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Leave Lobby</span>
        </button>

        <span className="text-xs font-extrabold px-3.5 py-1.5 rounded-full bg-[#f0ecfc] border border-[#e0d6f8] text-[#6d5ebd] uppercase tracking-wider">
          {room.status}
        </span>
      </div>

      {error && (
        <div className="flex items-center space-x-2 p-3.5 bg-[#fee8ea] border border-[#fcd3d7] rounded-2xl text-[#dc2626] text-xs font-semibold shadow-2xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-[#f8788a]" />
          <span>{error}</span>
        </div>
      )}

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column: Room Code, Board Setup & Match Settings */}
        <div className="lg:col-span-6 space-y-4">
          {/* Room Code & Invite Friends Card */}
          <div className="card-clay p-5 sm:p-6 text-center space-y-4">
            <div>
              <div className="text-xs text-[#7e749c] font-bold uppercase tracking-wider">Room Code</div>
              <div className="text-4xl sm:text-5xl font-mono font-black tracking-widest text-[#2a2050] mt-1 select-all">
                {room.roomCode}
              </div>
            </div>

            {/* Invite & Share Action Bar */}
            <div className="pt-3 border-t border-[#ede8f8] space-y-2.5">
              <div className="text-[11px] font-extrabold text-[#7e749c] uppercase tracking-wider">
                Invite Friends to Match
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2">
                {/* WhatsApp Share Button */}
                <button
                  onClick={handleShareWhatsApp}
                  className="px-4 py-2 rounded-full text-xs font-extrabold text-white bg-gradient-to-r from-[#25D366] to-[#128C7E] shadow-[0_4px_12px_rgba(37,211,102,0.3)] hover:brightness-105 active:scale-[0.98] transition flex items-center space-x-1.5 cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-white" />
                  <span>Share on WhatsApp</span>
                </button>

                {/* Native Social Share (WhatsApp, Telegram, Instagram, Messages, etc.) */}
                {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
                  <button
                    onClick={handleNativeShare}
                    className="btn-pill-outline px-3.5 py-2 text-xs font-bold space-x-1.5 cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5 text-[#8b7fe8]" />
                    <span>Share...</span>
                  </button>
                )}

                {/* Copy Direct Invite Link */}
                <button
                  onClick={handleCopyLink}
                  className="btn-pill-outline px-3.5 py-2 text-xs font-bold space-x-1.5 cursor-pointer"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#10b981]" />
                      <span className="text-[#10b981]">Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#7e749c]" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>

                {/* Copy Code Only */}
                <button
                  onClick={handleCopyCode}
                  className="btn-pill-outline px-3.5 py-2 text-xs font-bold space-x-1.5 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#10b981]" />
                      <span className="text-[#10b981]">Code Copied!</span>
                    </>
                  ) : (
                    <span>Copy Code</span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Board Setup CTA (Only for Bingo) */}
          {isBingo ? (
            <div className={`p-5 rounded-[28px] border transition-all ${
              isMyBoardLocked
                ? 'bg-[#e6f7ef] border-[#c3eed7] shadow-2xs'
                : 'bg-[#fef5db] border-2 border-[#f59e0b] shadow-md ring-4 ring-[#f59e0b]/20'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3.5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-xs ${
                    isMyBoardLocked ? 'bg-[#10b981] text-white' : 'bg-[#f59e0b] text-white'
                  }`}>
                    <Grid className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-sm font-extrabold text-[#2a2050]">
                      {isMyBoardLocked ? 'Board Locked & Ready' : 'Customize Your Board'}
                    </div>
                    <div className="text-xs text-[#7e749c] mt-0.5 font-medium">
                      {isMyBoardLocked
                        ? 'Waiting for host to start match'
                        : `Arrange and lock your ${room.boardSize || 5}x${room.boardSize || 5} numbers`}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/setup/${room.roomCode}`)}
                  className={`px-4 py-2 rounded-full text-xs font-extrabold transition shadow-xs cursor-pointer ${
                    isMyBoardLocked
                      ? 'btn-pill-outline'
                      : 'btn-gradient'
                  }`}
                >
                  {isMyBoardLocked ? 'View Board' : 'Set Up Now'}
                </button>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-[28px] bg-[#e6f7ef] border border-[#c3eed7] shadow-2xs flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#10b981] text-white flex items-center justify-center shadow-xs font-extrabold text-xl">
                {room.gameType === 'TIC_TAC_TOE' ? 'XO' : '📦'}
              </div>
              <div>
                <div className="text-sm font-extrabold text-[#2a2050]">
                  {room.gameType === 'TIC_TAC_TOE' ? 'Tic-Tac-Toe Ready' : 'Dots & Boxes Ready'}
                </div>
                <div className="text-xs text-[#7e749c] mt-0.5 font-medium">
                  Instant start enabled! Host can start as soon as 2 players are present.
                </div>
              </div>
            </div>
          )}

          {/* Room Settings Details */}
          <div className="card-clay p-5 grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-[#f0ecfc] rounded-2xl border border-[#e0d6f8]">
              <div className="text-[10px] text-[#7e749c] font-semibold uppercase">Game</div>
              <div className="text-xs font-extrabold text-[#2a2050] mt-0.5 truncate">
                {room.gameType === 'TIC_TAC_TOE' ? 'Tic-Tac-Toe' : (room.gameType === 'DOTS_AND_BOXES' ? 'Dots & Boxes' : 'Bingo')}
              </div>
            </div>
            <div className="p-3 bg-[#fef5db] rounded-2xl border border-[#fde7ad]">
              <div className="text-[10px] text-[#7e749c] font-semibold uppercase">Rule</div>
              <div className="text-xs font-extrabold text-[#b45309] mt-0.5">
                {room.gameType === 'TIC_TAC_TOE' ? `${room.boardSize} in a row` : (room.gameType === 'DOTS_AND_BOXES' ? `${(room.boardSize - 1) * (room.boardSize - 1)} Boxes` : `${room.winningLines} Lines`)}
              </div>
            </div>
            <div className="p-3 bg-[#e3f2fd] rounded-2xl border border-[#c7e5fc]">
              <div className="text-[10px] text-[#7e749c] font-semibold uppercase">Players</div>
              <div className="text-xs font-extrabold text-[#0284c7] mt-0.5">{room.players.length}/{room.maxPlayers || 6}</div>
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
              disabled={!isReadyToStart || starting}
              className="btn-gradient w-full py-4 text-base cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {starting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
              ) : (
                <span className="flex items-center justify-center space-x-2">
                  <Play className="w-5 h-5 fill-white" />
                  <span>
                    {room.players.length < 2
                      ? 'Need at least 2 players to start'
                      : !isReadyToStart
                      ? 'Waiting for all players to lock board'
                      : `Start ${room.gameType === 'TIC_TAC_TOE' ? 'Tic-Tac-Toe' : (room.gameType === 'DOTS_AND_BOXES' ? 'Dots & Boxes' : 'Bingo')} Game!`}
                  </span>
                </span>
              )}
            </button>
          ) : (
            <div className="card-clay p-4 text-center text-xs font-bold text-[#7e749c] flex items-center justify-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#8b7fe8] animate-ping" />
              <span>Waiting for host to start the game...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
