import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { roomApi } from '../lib/api';
import { useGameStore } from '../state/gameStore';
import { GameType } from '../lib/types';
import { GameVisualIcon } from '../components/games/GameVisualIcon';
import { ArrowLeft, Users, Grid, Trophy } from 'lucide-react';

export const CreateRoom: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialGameParam = searchParams.get('game') as GameType;

  const { setRoom, resetGame } = useGameStore();

  const [gameType, setGameType] = useState<GameType>(
    initialGameParam && ['BINGO', 'TIC_TAC_TOE', 'DOTS_AND_BOXES'].includes(initialGameParam)
      ? initialGameParam
      : 'BINGO'
  );

  // Bingo Config
  const [bingoBoardSize, setBingoBoardSize] = useState(5);
  const [bingoWinningLines, setBingoWinningLines] = useState(5);
  const [bingoMaxPlayers, setBingoMaxPlayers] = useState(6);

  // Tic-Tac-Toe Config
  const [tttGridSize, setTttGridSize] = useState(3);

  // Dots & Boxes Config
  const [dotsGridSize, setDotsGridSize] = useState(4); // 4x4 dots = 3x3 = 9 boxes
  const [dotsMaxPlayers, setDotsMaxPlayers] = useState(2);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialGameParam && ['BINGO', 'TIC_TAC_TOE', 'DOTS_AND_BOXES'].includes(initialGameParam)) {
      setGameType(initialGameParam);
    }
  }, [initialGameParam]);

  const handleBingoSizeChange = (newSize: number) => {
    setBingoBoardSize(newSize);
    if (bingoWinningLines > newSize) {
      setBingoWinningLines(newSize);
    }
  };

  const getGameMeta = (type: GameType) => {
    switch (type) {
      case 'TIC_TAC_TOE':
        return {
          title: 'Create Tic-Tac-Toe Room',
          subtitle: 'Choose your grid dimension & challenge a friend to a 1v1 duel',
          badge: '❌ 1v1 Turn Duel',
          badgeStyle: 'bg-[#fee8ea] border-[#fcd3d7] text-[#dc2626]',
          buttonLabel: 'Create Tic-Tac-Toe Room',
          iconGradient: 'from-[#8b7fe8] via-[#a78bfa] to-[#ec4899]',
        };
      case 'DOTS_AND_BOXES':
        return {
          title: 'Create Dots & Boxes Room',
          subtitle: 'Choose your dot matrix size & battle to capture territory',
          badge: '📦 Strategy Territory',
          badgeStyle: 'bg-[#e6f7ef] border-[#c3eed7] text-[#047857]',
          buttonLabel: 'Create Dots & Boxes Room',
          iconGradient: 'from-[#10b981] via-[#059669] to-[#0284c7]',
        };
      case 'BINGO':
      default:
        return {
          title: 'Create Bingo Room',
          subtitle: 'Configure board size, winning lines & invite players',
          badge: '🎯 Classic Multiplayer',
          badgeStyle: 'bg-[#f0ecfc] border-[#e0d6f8] text-[#6d5ebd]',
          buttonLabel: 'Create Bingo Room',
          iconGradient: 'from-[#f8788a] via-[#e271a5] to-[#8b7fe8]',
        };
    }
  };

  const meta = getGameMeta(gameType);

  const handleCreate = async () => {
    setLoading(true);
    setError(null);
    try {
      resetGame();

      let payload: any = { gameType };
      if (gameType === 'BINGO') {
        payload.boardSize = bingoBoardSize;
        payload.winningLines = bingoWinningLines;
        payload.maxPlayers = bingoMaxPlayers;
      } else if (gameType === 'TIC_TAC_TOE') {
        payload.gridSize = tttGridSize;
        payload.boardSize = tttGridSize;
        payload.maxPlayers = 2;
      } else if (gameType === 'DOTS_AND_BOXES') {
        payload.gridSize = dotsGridSize;
        payload.boardSize = dotsGridSize;
        payload.maxPlayers = dotsMaxPlayers;
      }

      const room = await roomApi.createRoom(payload);
      setRoom(room);
      navigate(`/lobby/${room.roomCode}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 font-sans">
      <button
        onClick={() => navigate('/')}
        className="btn-pill-outline text-xs px-4 py-2 space-x-1.5 cursor-pointer mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Games</span>
      </button>

      <div className="card-clay p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className={`w-20 h-20 rounded-[26px] bg-gradient-to-tr ${meta.iconGradient} flex items-center justify-center mx-auto mb-3 shadow-[0_8px_20px_rgba(139,127,232,0.25)] p-2`}>
            <GameVisualIcon type={gameType} size="xl" />
          </div>
          <div className={`inline-block px-3 py-1 rounded-full border text-xs font-extrabold mb-2 shadow-2xs ${meta.badgeStyle}`}>
            {meta.badge}
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2a2050] tracking-tight">{meta.title}</h2>
          <p className="text-xs sm:text-sm font-medium text-[#7e749c] mt-1">
            {meta.subtitle}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3.5 bg-[#fee8ea] border border-[#fcd3d7] rounded-2xl text-[#dc2626] text-xs font-semibold text-center shadow-2xs">
            {error}
          </div>
        )}

        {/* Game Specific Configurations */}
        <div className="space-y-4 mb-6">
          {/* ============ BINGO CONFIG ============ */}
          {gameType === 'BINGO' && (
            <>
              {/* Board Grid Size */}
              <div className="bg-[#faf7fe] p-4 sm:p-5 rounded-2xl border border-[#ede8f8] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Grid className="w-5 h-5 text-[#8b7fe8]" />
                    <div>
                      <div className="text-xs font-extrabold text-[#2a2050]">Board Grid Size</div>
                      <div className="text-[11px] text-[#7e749c] font-medium">
                        {bingoBoardSize}x{bingoBoardSize} (Numbers 1–{bingoBoardSize * bingoBoardSize})
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold px-3 py-1 bg-[#f0ecfc] text-[#6d5ebd] border border-[#e0d6f8] rounded-full">
                    {bingoBoardSize}x{bingoBoardSize}
                  </span>
                </div>

                <div className="grid grid-cols-6 gap-2 pt-1">
                  {[5, 6, 7, 8, 9, 10].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => handleBingoSizeChange(size)}
                      className={`py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                        bingoBoardSize === size
                          ? 'bg-gradient-to-r from-[#f8788a] to-[#8b7fe8] text-white shadow-md scale-105 ring-2 ring-[#fbcfe8]'
                          : 'bg-white hover:bg-[#f0ecfc] text-[#524872] border border-[#ede8f8] shadow-2xs'
                      }`}
                    >
                      {size}x{size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Winning Lines */}
              <div className="bg-[#faf7fe] p-4 sm:p-5 rounded-2xl border border-[#ede8f8] flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Trophy className="w-5 h-5 text-[#f59e0b]" />
                  <div>
                    <div className="text-xs font-extrabold text-[#2a2050]">Winning Rule</div>
                    <div className="text-[11px] text-[#7e749c] font-medium">Lines needed to win</div>
                  </div>
                </div>
                <select
                  value={bingoWinningLines}
                  onChange={(e) => setBingoWinningLines(parseInt(e.target.value))}
                  className="bg-white border border-[#ede8f8] text-[#b45309] text-xs font-extrabold rounded-full px-4 py-2 shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#8b7fe8]/30 cursor-pointer"
                >
                  {Array.from({ length: bingoBoardSize - 4 }, (_, i) => i + 5).map((lines) => (
                    <option key={lines} value={lines} className="text-[#2a2050]">
                      {lines} Lines
                    </option>
                  ))}
                </select>
              </div>

              {/* Max Players */}
              <div className="bg-[#faf7fe] p-4 sm:p-5 rounded-2xl border border-[#ede8f8]">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center space-x-2 text-xs font-extrabold text-[#2a2050]">
                    <Users className="w-4 h-4 text-[#10b981]" />
                    <span>Max Players ({bingoMaxPlayers})</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="2"
                  max="6"
                  value={bingoMaxPlayers}
                  onChange={(e) => setBingoMaxPlayers(parseInt(e.target.value))}
                  className="w-full h-2 bg-[#ede8f8] rounded-lg appearance-none cursor-pointer accent-[#8b7fe8]"
                />
                <div className="flex justify-between text-[11px] text-[#7e749c] mt-1.5 font-medium">
                  <span>2 Players</span>
                  <span>4 Players</span>
                  <span>6 Players</span>
                </div>
              </div>
            </>
          )}

          {/* ============ TIC-TAC-TOE CONFIG ============ */}
          {gameType === 'TIC_TAC_TOE' && (
            <>
              <div className="bg-[#faf7fe] p-4 sm:p-5 rounded-2xl border border-[#ede8f8] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Grid className="w-5 h-5 text-[#8b7fe8]" />
                    <div>
                      <div className="text-xs font-extrabold text-[#2a2050]">Grid Dimension</div>
                      <div className="text-[11px] text-[#7e749c] font-medium">
                        {tttGridSize}x{tttGridSize} ({tttGridSize} in a row to win)
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold px-3 py-1 bg-[#fee8ea] text-[#dc2626] border border-[#fcd3d7] rounded-full">
                    {tttGridSize}x{tttGridSize}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  {[3, 4, 5].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setTttGridSize(size)}
                      className={`py-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                        tttGridSize === size
                          ? 'bg-gradient-to-r from-[#8b7fe8] to-[#ec4899] text-white shadow-md scale-105'
                          : 'bg-white hover:bg-[#f0ecfc] text-[#524872] border border-[#ede8f8] shadow-2xs'
                      }`}
                    >
                      {size}x{size} {size === 3 ? '(Classic)' : ''}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-[#faf7fe] p-4 sm:p-5 rounded-2xl border border-[#ede8f8] flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-[#10b981]" />
                  <div>
                    <div className="text-xs font-extrabold text-[#2a2050]">Players</div>
                    <div className="text-[11px] text-[#7e749c] font-medium">1v1 Turn-based Duel</div>
                  </div>
                </div>
                <span className="text-xs font-extrabold px-3 py-1 bg-[#e3f2fd] text-[#0284c7] border border-[#c7e5fc] rounded-full">
                  2 Players (Fixed)
                </span>
              </div>
            </>
          )}

          {/* ============ DOTS & BOXES CONFIG ============ */}
          {gameType === 'DOTS_AND_BOXES' && (
            <>
              <div className="bg-[#faf7fe] p-4 sm:p-5 rounded-2xl border border-[#ede8f8] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Grid className="w-5 h-5 text-[#10b981]" />
                    <div>
                      <div className="text-xs font-extrabold text-[#2a2050]">Dot Matrix Size</div>
                      <div className="text-[11px] text-[#7e749c] font-medium">
                        {dotsGridSize}x{dotsGridSize} Dots ({(dotsGridSize - 1) * (dotsGridSize - 1)} Total Boxes)
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold px-3 py-1 bg-[#fef5db] text-[#b45309] border border-[#fde7ad] rounded-full">
                    {(dotsGridSize - 1) * (dotsGridSize - 1)} Boxes
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  {[
                    { dots: 3, label: 'Small (2x2 Boxes)' },
                    { dots: 4, label: 'Standard (3x3 Boxes)' },
                    { dots: 5, label: 'Large (4x4 Boxes)' },
                  ].map((opt) => (
                    <button
                      key={opt.dots}
                      type="button"
                      onClick={() => setDotsGridSize(opt.dots)}
                      className={`py-3 px-2 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer text-center ${
                        dotsGridSize === opt.dots
                          ? 'bg-gradient-to-r from-[#10b981] to-[#0284c7] text-white shadow-md scale-105'
                          : 'bg-white hover:bg-[#f0ecfc] text-[#524872] border border-[#ede8f8] shadow-2xs'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-[#faf7fe] p-4 sm:p-5 rounded-2xl border border-[#ede8f8]">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center space-x-2 text-xs font-extrabold text-[#2a2050]">
                    <Users className="w-4 h-4 text-[#10b981]" />
                    <span>Max Players ({dotsMaxPlayers})</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="2"
                  max="4"
                  value={dotsMaxPlayers}
                  onChange={(e) => setDotsMaxPlayers(parseInt(e.target.value))}
                  className="w-full h-2 bg-[#ede8f8] rounded-lg appearance-none cursor-pointer accent-[#10b981]"
                />
                <div className="flex justify-between text-[11px] text-[#7e749c] mt-1.5 font-medium">
                  <span>2 Players</span>
                  <span>3 Players</span>
                  <span>4 Players</span>
                </div>
              </div>
            </>
          )}
        </div>

        <button
          onClick={handleCreate}
          disabled={loading}
          className={`w-full py-4 rounded-full text-base font-black text-white bg-gradient-to-r ${meta.iconGradient} shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50`}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
          ) : (
            <span>{meta.buttonLabel} & Enter Lobby</span>
          )}
        </button>
      </div>
    </div>
  );
};
