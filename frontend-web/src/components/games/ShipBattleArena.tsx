import React, { useState, useEffect } from 'react';
import { Game, ShipPlacement, ShipCoordinate, ShipType } from '../../lib/types';
import { soundService } from '../../lib/sound';
import {
  RotateCcw,
  Shuffle,
  Lock,
  Crosshair,
  Shield,
  Flame,
  Droplets,
  AlertCircle,
  Skull,
  Radio,
  Zap,
} from 'lucide-react';

interface ShipBattleArenaProps {
  game: Game;
  currentUserId: string;
  onLockFleet: (fleet: ShipPlacement[], clientMoveId: string) => void;
  onAttack: (row: number, col: number, clientMoveId: string) => void;
  isMyTurn: boolean;
  disabled?: boolean;
}

const SHIP_DEFS: { type: ShipType; size: number; label: string; icon: string }[] = [
  { type: 'CARRIER', size: 5, label: 'Carrier', icon: '✈️' },
  { type: 'BATTLESHIP', size: 4, label: 'Battleship', icon: '🚢' },
  { type: 'CRUISER', size: 3, label: 'Cruiser', icon: '🛳️' },
  { type: 'SUBMARINE', size: 3, label: 'Submarine', icon: '⚓' },
  { type: 'DESTROYER', size: 2, label: 'Destroyer', icon: '🚤' },
];

const ROW_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
const COL_LABELS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

export const ShipBattleArena: React.FC<ShipBattleArenaProps> = ({
  game,
  currentUserId,
  onLockFleet,
  onAttack,
  isMyTurn,
  disabled = false,
}) => {
  const isSetup = game.shipPhase === 'SETUP';
  const isBattle = game.shipPhase === 'BATTLE';
  const isLocked = !!game.shipFleetsLocked?.[currentUserId];

  const opponent = game.players.find((p) => p.userId !== currentUserId);
  const opponentUserId = opponent?.userId || '';
  const isOpponentLocked = !!game.shipFleetsLocked?.[opponentUserId];

  // --- Fleet Setup State ---
  const [placedShips, setPlacedShips] = useState<ShipPlacement[]>([]);
  const [selectedShipType, setSelectedShipType] = useState<ShipType>('CARRIER');
  const [orientation, setOrientation] = useState<'HORIZONTAL' | 'VERTICAL'>('HORIZONTAL');
  const [placementError, setPlacementError] = useState<string | null>(null);
  const [isLocking, setIsLocking] = useState(false);
  const [targetHover, setTargetHover] = useState<{ r: number; c: number } | null>(null);

  // If server already has our fleet saved (e.g. from refresh), load it
  useEffect(() => {
    if (game.shipFleets?.[currentUserId]) {
      setPlacedShips(game.shipFleets[currentUserId]);
    } else if (placedShips.length === 0 && !isLocked) {
      handleRandomize();
    }
  }, [game.shipFleets, currentUserId, isLocked]);

  // Compute occupied cells by our own placed ships
  const ownOccupiedMap = new Map<string, { shipType: string; isHit: boolean }>();
  const myFleet = game.shipFleets?.[currentUserId] || placedShips;
  const opponentAttacksOnMe = (opponentUserId && game.shipAttacks?.[opponentUserId]) || [];

  myFleet.forEach((ship) => {
    ship.cells.forEach((c) => {
      const key = `${c.row}-${c.col}`;
      const isHit = opponentAttacksOnMe.some((att) => att.row === c.row && att.col === c.col && (att.result === 'HIT' || att.result === 'SUNK'));
      ownOccupiedMap.set(key, { shipType: ship.shipType, isHit });
    });
  });

  // Compute enemy attacks made on me (misses)
  const opponentMissesMap = new Set<string>();
  opponentAttacksOnMe.forEach((att) => {
    if (att.result === 'MISS') {
      opponentMissesMap.add(`${att.row}-${att.col}`);
    }
  });

  // Compute my attacks made on opponent
  const myAttacksOnOpponent = game.shipAttacks?.[currentUserId] || [];
  const myAttackResultsMap = new Map<string, { result: 'MISS' | 'HIT' | 'SUNK'; sunkShipType?: string }>();
  myAttacksOnOpponent.forEach((att) => {
    myAttackResultsMap.set(`${att.row}-${att.col}`, {
      result: att.result,
      sunkShipType: att.sunkShipType,
    });
  });

  // Calculate sunk counts
  const opponentSunkShips = game.shipSunkTypes?.[opponentUserId] || [];
  const mySunkShips = game.shipSunkTypes?.[currentUserId] || [];

  // Helper: compute ship cells
  const computeCells = (type: ShipType, r: number, c: number, orient: 'HORIZONTAL' | 'VERTICAL'): ShipCoordinate[] => {
    const size = SHIP_DEFS.find((d) => d.type === type)?.size || 2;
    const cells: ShipCoordinate[] = [];
    for (let i = 0; i < size; i++) {
      cells.push({
        row: orient === 'HORIZONTAL' ? r : r + i,
        col: orient === 'HORIZONTAL' ? c + i : c,
      });
    }
    return cells;
  };

  // Helper: check placement validity
  const isValidPlacement = (newCells: ShipCoordinate[], currentList: ShipPlacement[], excludeType?: string) => {
    for (const cell of newCells) {
      if (cell.row < 0 || cell.row >= 10 || cell.col < 0 || cell.col >= 10) {
        return false;
      }
    }
    for (const ship of currentList) {
      if (ship.shipType === excludeType) continue;
      for (const sc of ship.cells) {
        if (newCells.some((nc) => nc.row === sc.row && nc.col === sc.col)) {
          return false;
        }
      }
    }
    return true;
  };

  // Setup: Place selected ship at cell
  const handleCellClickSetup = (r: number, c: number) => {
    if (isLocked) return;
    setPlacementError(null);

    const cells = computeCells(selectedShipType, r, c, orientation);
    if (!isValidPlacement(cells, placedShips, selectedShipType)) {
      setPlacementError(`Cannot place ${selectedShipType} here! Must fit inside board without overlapping.`);
      soundService.playTileTap();
      return;
    }

    const updated = placedShips.filter((s) => s.shipType !== selectedShipType);
    updated.push({
      shipType: selectedShipType,
      row: r,
      col: c,
      orientation,
      cells,
    });
    setPlacedShips(updated);
    soundService.playTileTap();

    // Auto-advance to next unplaced ship
    const remaining = SHIP_DEFS.find((d) => !updated.some((s) => s.shipType === d.type));
    if (remaining) {
      setSelectedShipType(remaining.type);
    }
  };

  // Setup: Randomize Fleet
  const handleRandomize = () => {
    if (isLocked) return;
    setPlacementError(null);
    const newFleet: ShipPlacement[] = [];

    for (const def of SHIP_DEFS) {
      let placed = false;
      let attempts = 0;
      while (!placed && attempts < 500) {
        attempts++;
        const orient = Math.random() > 0.5 ? 'HORIZONTAL' : 'VERTICAL';
        const startR = orient === 'HORIZONTAL' ? Math.floor(Math.random() * 10) : Math.floor(Math.random() * (10 - def.size + 1));
        const startC = orient === 'HORIZONTAL' ? Math.floor(Math.random() * (10 - def.size + 1)) : Math.floor(Math.random() * 10);
        const cells = computeCells(def.type, startR, startC, orient);

        if (isValidPlacement(cells, newFleet)) {
          newFleet.push({
            shipType: def.type,
            row: startR,
            col: startC,
            orientation: orient,
            cells,
          });
          placed = true;
        }
      }
    }
    setPlacedShips(newFleet);
    soundService.playTileTap();
  };

  // Setup: Reset Fleet
  const handleReset = () => {
    if (isLocked) return;
    setPlacedShips([]);
    setSelectedShipType('CARRIER');
    setPlacementError(null);
  };

  // Setup: Lock Fleet
  const handleLockFleet = () => {
    if (isLocked || isLocking) return;
    if (placedShips.length !== 5) {
      setPlacementError('You must deploy all 5 ships before locking!');
      return;
    }
    setIsLocking(true);
    setPlacementError(null);
    soundService.playCountdownGo();
    const clientMoveId = `lock-${currentUserId}-${Date.now()}`;
    onLockFleet(placedShips, clientMoveId);
  };

  // Battle: Fire attack at opponent cell
  const handleFireAttack = (r: number, c: number) => {
    if (!isBattle || !isMyTurn || disabled || game.status !== 'PLAYING') return;
    const key = `${r}-${c}`;
    if (myAttackResultsMap.has(key)) return; // already attacked

    soundService.playCountdownTick();
    const clientMoveId = `att-${currentUserId}-${r}-${c}-${Date.now()}`;
    onAttack(r, c, clientMoveId);
  };

  return (
    <div className="w-full flex flex-col items-center space-y-4">
      {/* ========================================================================= */}
      {/* PHASE 1: FLEET SETUP & DEPLOYMENT                                         */}
      {/* ========================================================================= */}
      {isSetup && (
        <div className="w-full max-w-[620px] bg-slate-900/95 border-2 border-cyan-500/40 rounded-3xl p-4 sm:p-6 shadow-[0_12px_36px_rgba(2,132,199,0.35)] backdrop-blur-md">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between pb-4 border-b border-cyan-800/40 gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-2xl shadow-lg border border-cyan-300/30 animate-pulse">
                ⚓
              </div>
              <div>
                <h2 className="text-xl font-black text-cyan-200 tracking-wide flex items-center gap-2">
                  Fleet Deployment
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-cyan-900/80 text-cyan-300 border border-cyan-700">
                    10×10 Grid
                  </span>
                </h2>
                <p className="text-xs text-slate-300 font-medium">
                  {isLocked
                    ? 'Fleet locked! Waiting for opponent to deploy...'
                    : 'Arrange your fleet before the naval duel begins.'}
                </p>
              </div>
            </div>

            {/* Lock Status Pill */}
            <div className="flex items-center space-x-2">
              <div
                className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center space-x-1.5 ${
                  isLocked
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}
              >
                {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                <span>{isLocked ? 'Locked & Ready' : 'Unfinished'}</span>
              </div>
            </div>
          </div>

          {/* Opponent Status Bar */}
          <div className="my-3 px-3 py-2 rounded-xl bg-slate-800/70 border border-slate-700 flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              Opponent: <strong className="text-white">{opponent?.username || 'Admiral'}</strong>
            </span>
            <span
              className={`font-black ${
                isOpponentLocked ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {isOpponentLocked ? '✓ Fleet Deployed' : '⏳ Strategizing...'}
            </span>
          </div>

          {/* Controls Bar (Disabled once locked) */}
          {!isLocked && (
            <div className="space-y-3 mb-4">
              {/* Ship Selector Dock */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {SHIP_DEFS.map((def) => {
                  const isPlaced = placedShips.some((s) => s.shipType === def.type);
                  const isSelected = selectedShipType === def.type;
                  return (
                    <button
                      key={def.type}
                      type="button"
                      onClick={() => {
                        setSelectedShipType(def.type);
                        setPlacementError(null);
                      }}
                      className={`relative p-2.5 rounded-2xl flex flex-col items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-gradient-to-b from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 scale-102 border-2 border-cyan-200'
                          : isPlaced
                          ? 'bg-slate-800/90 text-cyan-300 border border-cyan-600/40 hover:bg-slate-800'
                          : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:bg-slate-800'
                      }`}
                    >
                      <span className="text-lg">{def.icon}</span>
                      <span className="text-[11px] font-black mt-0.5">{def.label}</span>
                      <div className="flex gap-0.5 mt-1">
                        {Array.from({ length: def.size }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-1.5 h-2 rounded-xs ${
                              isSelected ? 'bg-white' : isPlaced ? 'bg-cyan-400' : 'bg-slate-600'
                            }`}
                          />
                        ))}
                      </div>
                      {isPlaced && (
                        <span className="absolute top-1 right-1.5 text-[10px] text-emerald-400 font-extrabold">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Action Buttons: Rotate, Randomize, Reset, Lock */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setOrientation(orientation === 'HORIZONTAL' ? 'VERTICAL' : 'HORIZONTAL')}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-black text-xs border border-cyan-700/50 flex items-center space-x-1.5 transition-all shadow-sm"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Rotate: {orientation === 'HORIZONTAL' ? '↔ Horizontal' : '↕ Vertical'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRandomize}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-black text-xs border border-cyan-700/50 flex items-center space-x-1.5 transition-all shadow-sm"
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                    <span>Randomize</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 font-black text-xs border border-rose-800/50 flex items-center space-x-1.5 transition-all"
                  >
                    <span>Reset</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleLockFleet}
                  disabled={placedShips.length !== 5 || isLocking}
                  className={`px-5 py-2.5 rounded-xl font-black text-sm flex items-center space-x-2 transition-all shadow-lg ${
                    placedShips.length === 5
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-emerald-500/30 hover:scale-103 cursor-pointer'
                      : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  <span>{isLocking ? 'Locking Fleet...' : 'Deploy & Lock Fleet'}</span>
                </button>
              </div>

              {placementError && (
                <div className="flex items-center space-x-2 text-rose-300 bg-rose-950/60 border border-rose-800/60 px-3 py-2 rounded-xl text-xs font-semibold animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{placementError}</span>
                </div>
              )}
            </div>
          )}

          {/* Locked Waiting Banner */}
          {isLocked && (
            <div className="my-4 p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-center flex flex-col items-center justify-center space-y-2">
              <div className="flex items-center space-x-2 text-cyan-300 font-black text-base">
                <Radio className="w-5 h-5 text-cyan-400 animate-spin" />
                <span>Naval Fleet Deployed & Fortified</span>
              </div>
              <p className="text-xs text-slate-300 font-medium max-w-sm">
                Coordinates secured. As soon as your opponent locks their fleet, radar combat will engage automatically!
              </p>
            </div>
          )}

          {/* 10x10 Placement Grid */}
          <div className="flex flex-col items-center select-none overflow-x-auto pb-2">
            {/* Column Header Numbers */}
            <div className="grid grid-cols-11 w-full max-w-[460px] text-center mb-1 text-[11px] font-black text-cyan-400">
              <div />
              {COL_LABELS.map((col) => (
                <div key={col}>{col}</div>
              ))}
            </div>

            {/* Grid Rows */}
            <div className="w-full max-w-[460px] bg-slate-950/90 rounded-2xl p-2 border border-cyan-800/40 shadow-inner">
              <div className="grid grid-cols-11 gap-1">
                {Array.from({ length: 10 }).map((_, r) => (
                  <React.Fragment key={r}>
                    {/* Row Letter */}
                    <div className="flex items-center justify-center text-[11px] font-black text-cyan-400">
                      {ROW_LABELS[r]}
                    </div>
                    {/* 10 Cells */}
                    {Array.from({ length: 10 }).map((_, c) => {
                      const key = `${r}-${c}`;
                      const shipInfo = ownOccupiedMap.get(key);

                      return (
                        <button
                          key={key}
                          type="button"
                          disabled={isLocked}
                          onClick={() => handleCellClickSetup(r, c)}
                          className={`aspect-square rounded-lg flex items-center justify-center text-xs font-black transition-all ${
                            shipInfo
                              ? 'bg-gradient-to-tr from-cyan-600 to-blue-500 text-white shadow-md border border-cyan-300/40'
                              : 'bg-slate-900/90 hover:bg-cyan-900/40 border border-slate-800 text-transparent'
                          } ${isLocked ? 'cursor-default' : 'cursor-pointer hover:border-cyan-500/50'}`}
                        >
                          {shipInfo && (
                            <span className="text-[10px]">
                              {SHIP_DEFS.find((d) => d.type === shipInfo.shipType)?.icon || '⚓'}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PHASE 2: NAVAL COMBAT ARENA                                               */}
      {/* ========================================================================= */}
      {isBattle && (
        <div className="w-full max-w-[700px] flex flex-col items-center space-y-4">
          {/* Turn Banner */}
          <div
            className={`w-full p-4 rounded-3xl flex items-center justify-between border-2 shadow-lg transition-all ${
              isMyTurn
                ? 'bg-gradient-to-r from-emerald-950/90 via-slate-900 to-emerald-950/90 border-emerald-500/60 shadow-emerald-500/20'
                : 'bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border-slate-700 shadow-slate-900/40'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shadow-md ${
                  isMyTurn
                    ? 'bg-emerald-500 text-white animate-bounce'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {isMyTurn ? <Crosshair className="w-6 h-6" /> : <Radio className="w-6 h-6 animate-pulse" />}
              </div>
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  {isMyTurn ? '🎯 YOUR TURN TO FIRE!' : `⏳ ${opponent?.username || 'Enemy'} Targeting...`}
                  {isMyTurn && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500 text-white font-black animate-pulse">
                      READY
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-300 font-medium">
                  {isMyTurn
                    ? 'Tap any ocean coordinate on the enemy radar grid.'
                    : 'Brace for enemy artillery attack.'}
                </p>
              </div>
            </div>

            {/* Target Coordinate Indicator */}
            {isMyTurn && targetHover && (
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Targeting</span>
                <span className="text-lg font-black text-cyan-400 tracking-wider">
                  {ROW_LABELS[targetHover.r]}
                  {COL_LABELS[targetHover.c]}
                </span>
              </div>
            )}
          </div>

          {/* Dual Fleet Status Badges */}
          <div className="w-full grid grid-cols-2 gap-3">
            {/* Enemy Fleet Health */}
            <div className="bg-slate-900/90 border border-rose-900/40 rounded-2xl p-3 flex flex-col space-y-1.5 shadow-md">
              <div className="flex items-center justify-between text-xs font-black text-rose-300">
                <span>Enemy Fleet Afloat</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-950 border border-rose-800 text-rose-400">
                  {5 - opponentSunkShips.length} / 5 Left
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {SHIP_DEFS.map((def) => {
                  const isSunk = opponentSunkShips.includes(def.type);
                  return (
                    <div
                      key={def.type}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center space-x-1 border ${
                        isSunk
                          ? 'bg-rose-950/70 border-rose-800/80 text-rose-400 line-through opacity-60'
                          : 'bg-slate-800 border-slate-700 text-slate-300'
                      }`}
                    >
                      <span>{def.icon}</span>
                      <span>{def.label}</span>
                      {isSunk && <Skull className="w-3 h-3 text-rose-400" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* My Fleet Health */}
            <div className="bg-slate-900/90 border border-cyan-900/40 rounded-2xl p-3 flex flex-col space-y-1.5 shadow-md">
              <div className="flex items-center justify-between text-xs font-black text-cyan-300">
                <span>My Fleet Defense</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400">
                  {5 - mySunkShips.length} / 5 Afloat
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {SHIP_DEFS.map((def) => {
                  const isSunk = mySunkShips.includes(def.type);
                  return (
                    <div
                      key={def.type}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center space-x-1 border ${
                        isSunk
                          ? 'bg-rose-950/70 border-rose-800/80 text-rose-400 line-through opacity-60'
                          : 'bg-cyan-950/60 border-cyan-700/60 text-cyan-300'
                      }`}
                    >
                      <span>{def.icon}</span>
                      <span>{def.label}</span>
                      {isSunk && <Skull className="w-3 h-3 text-rose-400" />}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Grids Container */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. ENEMY RADAR GRID (TARGETING) */}
            <div className="bg-slate-900/95 border-2 border-rose-500/40 rounded-3xl p-3 sm:p-4 shadow-xl flex flex-col items-center">
              <div className="w-full flex items-center justify-between mb-2">
                <span className="text-xs font-black text-rose-400 flex items-center gap-1.5">
                  <Crosshair className="w-4 h-4 text-rose-400" />
                  Enemy Radar (Targeting Grid)
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">
                  {myAttacksOnOpponent.length} Strikes Fired
                </span>
              </div>

              {/* Column Numbers */}
              <div className="grid grid-cols-11 w-full text-center mb-1 text-[10px] font-black text-rose-400 select-none">
                <div />
                {COL_LABELS.map((col) => (
                  <div key={col}>{col}</div>
                ))}
              </div>

              {/* 10x10 Radar Grid */}
              <div className="w-full bg-slate-950 rounded-2xl p-1.5 border border-rose-950 shadow-inner">
                <div className="grid grid-cols-11 gap-1">
                  {Array.from({ length: 10 }).map((_, r) => (
                    <React.Fragment key={r}>
                      <div className="flex items-center justify-center text-[10px] font-black text-rose-400 select-none">
                        {ROW_LABELS[r]}
                      </div>
                      {Array.from({ length: 10 }).map((_, c) => {
                        const key = `${r}-${c}`;
                        const attack = myAttackResultsMap.get(key);
                        const isHit = attack?.result === 'HIT' || attack?.result === 'SUNK';
                        const isMiss = attack?.result === 'MISS';
                        const isSunk = attack?.result === 'SUNK';

                        return (
                          <button
                            key={key}
                            type="button"
                            disabled={!isMyTurn || !!attack || disabled}
                            onMouseEnter={() => setTargetHover({ r, c })}
                            onMouseLeave={() => setTargetHover(null)}
                            onClick={() => handleFireAttack(r, c)}
                            className={`aspect-square rounded-md sm:rounded-lg flex items-center justify-center text-xs font-black transition-all ${
                              isHit
                                ? 'bg-gradient-to-tr from-rose-600 to-amber-500 text-white shadow-lg animate-pulse'
                                : isMiss
                                ? 'bg-slate-800/90 text-cyan-200 border border-cyan-800/50'
                                : isMyTurn
                                ? 'bg-slate-900 hover:bg-rose-950/80 hover:border-rose-500/80 border border-slate-800 cursor-crosshair active:scale-95'
                                : 'bg-slate-900/60 border border-slate-800/60 cursor-not-allowed'
                            }`}
                          >
                            {isHit && (isSunk ? <Skull className="w-3.5 h-3.5 text-white" /> : <Flame className="w-3.5 h-3.5 text-yellow-200" />)}
                            {isMiss && <Droplets className="w-3 h-3 text-cyan-400 opacity-75" />}
                          </button>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. MY FLEET GRID (DEFENSE) */}
            <div className="bg-slate-900/95 border-2 border-cyan-500/40 rounded-3xl p-3 sm:p-4 shadow-xl flex flex-col items-center">
              <div className="w-full flex items-center justify-between mb-2">
                <span className="text-xs font-black text-cyan-400 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-cyan-400" />
                  My Fleet (Defense Grid)
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">
                  {opponentAttacksOnMe.length} Incoming Strikes
                </span>
              </div>

              {/* Column Numbers */}
              <div className="grid grid-cols-11 w-full text-center mb-1 text-[10px] font-black text-cyan-400 select-none">
                <div />
                {COL_LABELS.map((col) => (
                  <div key={col}>{col}</div>
                ))}
              </div>

              {/* 10x10 Defense Grid */}
              <div className="w-full bg-slate-950 rounded-2xl p-1.5 border border-cyan-950 shadow-inner">
                <div className="grid grid-cols-11 gap-1">
                  {Array.from({ length: 10 }).map((_, r) => (
                    <React.Fragment key={r}>
                      <div className="flex items-center justify-center text-[10px] font-black text-cyan-400 select-none">
                        {ROW_LABELS[r]}
                      </div>
                      {Array.from({ length: 10 }).map((_, c) => {
                        const key = `${r}-${c}`;
                        const shipInfo = ownOccupiedMap.get(key);
                        const isOpponentMiss = opponentMissesMap.has(key);

                        return (
                          <div
                            key={key}
                            className={`aspect-square rounded-md sm:rounded-lg flex items-center justify-center text-xs font-black select-none ${
                              shipInfo?.isHit
                                ? 'bg-gradient-to-tr from-rose-600 to-amber-500 text-white shadow-lg animate-pulse'
                                : shipInfo
                                ? 'bg-gradient-to-tr from-cyan-600 to-blue-500 text-white border border-cyan-300/40'
                                : isOpponentMiss
                                ? 'bg-slate-800/90 text-cyan-200 border border-cyan-800/40'
                                : 'bg-slate-900 border border-slate-800'
                            }`}
                          >
                            {shipInfo?.isHit && <Flame className="w-3.5 h-3.5 text-yellow-200" />}
                            {!shipInfo?.isHit && shipInfo && (
                              <span className="text-[9px]">
                                {SHIP_DEFS.find((d) => d.type === shipInfo.shipType)?.icon || '⚓'}
                              </span>
                            )}
                            {isOpponentMiss && <Droplets className="w-3 h-3 text-cyan-400 opacity-75" />}
                          </div>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Last Strike Activity Log */}
          {game.shipLastAttackResult && (
            <div className="w-full px-4 py-2.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                Latest Strike:
                <strong className="text-white">
                  {game.shipLastAttackResult.attackerUserId === currentUserId
                    ? 'You attacked '
                    : `${opponent?.username || 'Enemy'} attacked `}
                  {ROW_LABELS[game.shipLastAttackResult.row]}
                  {COL_LABELS[game.shipLastAttackResult.col]}
                </strong>
              </span>
              <span
                className={`font-black px-2.5 py-0.5 rounded-full ${
                  game.shipLastAttackResult.result === 'SUNK'
                    ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-bounce'
                    : game.shipLastAttackResult.result === 'HIT'
                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                    : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                }`}
              >
                {game.shipLastAttackResult.result === 'SUNK'
                  ? `💥 SUNK ${game.shipLastAttackResult.sunkShipType || 'SHIP'}!`
                  : game.shipLastAttackResult.result === 'HIT'
                  ? '🔥 DIRECT HIT!'
                  : '💦 SPLASH / MISS'}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
