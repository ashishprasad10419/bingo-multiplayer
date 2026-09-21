import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Game, ShipPlacement, ShipCoordinate, ShipType } from '../../lib/types';
import { soundService } from '../../lib/sound';
import { Zap, AlertTriangle } from 'lucide-react';

interface ShipBattleArenaProps {
  game: Game;
  currentUserId: string;
  onLockFleet: (fleet: ShipPlacement[], clientMoveId: string) => void;
  onAttack: (row: number, col: number, clientMoveId: string) => void;
  isMyTurn: boolean;
  disabled?: boolean;
}

interface ShipDefinition {
  type: ShipType;
  size: number;
  label: string;
}

const SHIP_DEFS: ShipDefinition[] = [
  { type: 'CARRIER', size: 5, label: 'Aircraft Carrier' },
  { type: 'BATTLESHIP', size: 4, label: 'Battleship' },
  { type: 'CRUISER', size: 3, label: 'Cruiser' },
  { type: 'SUBMARINE', size: 3, label: 'Submarine' },
  { type: 'DESTROYER', size: 2, label: 'Patrol Boat' },
];

// --- Cartoon SVG Ships (Exact aesthetic from 2 Player Games: Sea Battle) ---
const CartoonShipGraphic: React.FC<{
  type: ShipType;
  orientation: 'HORIZONTAL' | 'VERTICAL';
  color?: string;
  outlineColor?: string;
  isSelected?: boolean;
}> = ({
  type,
  orientation,
  color = '#ea5b48',
  outlineColor = '#1e272e',
  isSelected = false,
}) => {
  const isHoriz = orientation === 'HORIZONTAL';

  // Rotation container: if vertical, we rotate 90deg from horizontal master artwork
  return (
    <div
      className={`w-full h-full flex items-center justify-center pointer-events-none transition-transform duration-200 ${
        isSelected ? 'scale-[1.03]' : ''
      }`}
    >
      <div
        className="w-full h-full flex items-center justify-center"
        style={{
          transform: isHoriz ? 'none' : 'rotate(90deg)',
          transformOrigin: 'center center',
        }}
      >
        {type === 'CARRIER' && (
          // 5-cell Aircraft Carrier: angled flight deck, catapult deck lines, 3 black fighter jet silhouettes
          <svg viewBox="0 0 200 40" className="w-full h-full drop-shadow-md overflow-visible">
            {/* Hull */}
            <path
              d="M 6 22 L 20 6 L 180 6 L 194 14 L 194 28 L 182 34 L 16 34 Z"
              fill={color}
              stroke={outlineColor}
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            {/* Flight Deck Runway Line */}
            <line x1="28" y1="20" x2="165" y2="20" stroke="#ffffff" strokeWidth="2" strokeDasharray="8 6" opacity="0.8" />
            {/* Catapult Stripe */}
            <line x1="170" y1="12" x2="188" y2="12" stroke="#ffffff" strokeWidth="2.5" opacity="0.8" />
            {/* 3 Fighter Jet Silhouettes on Deck */}
            <g fill="#1e272e" opacity="0.9">
              {/* Jet 1 */}
              <path d="M 46 20 L 52 14 L 56 16 L 54 20 L 56 24 L 52 26 Z" />
              {/* Jet 2 */}
              <path d="M 64 20 L 70 14 L 74 16 L 72 20 L 74 24 L 70 26 Z" />
              {/* Jet 3 */}
              <path d="M 82 20 L 88 14 L 92 16 L 90 20 L 92 24 L 88 26 Z" />
            </g>
            {/* Island Bridge Tower */}
            <rect x="110" y="7" width="26" height="7" rx="2" fill="#1e272e" opacity="0.85" />
            <rect x="122" y="3" width="10" height="5" rx="1.5" fill="#f5f6fa" />
            {/* Vents */}
            <line x1="145" y1="12" x2="145" y2="28" stroke="#1e272e" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="151" y1="12" x2="151" y2="28" stroke="#1e272e" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="157" y1="12" x2="157" y2="28" stroke="#1e272e" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        )}

        {type === 'BATTLESHIP' && (
          // 4-cell Battleship: pointed naval bow, bridge citadel, forward and aft gun turrets
          <svg viewBox="0 0 160 40" className="w-full h-full drop-shadow-md overflow-visible">
            {/* Hull with pointed bow */}
            <path
              d="M 8 20 Q 20 8 50 8 L 135 8 Q 155 14 155 20 Q 155 26 135 32 L 50 32 Q 20 32 8 20 Z"
              fill={color}
              stroke={outlineColor}
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            {/* Forward Gun Turret */}
            <circle cx="44" cy="20" r="8" fill="#1e272e" />
            <line x1="44" y1="20" x2="22" y2="20" stroke="#1e272e" strokeWidth="4" strokeLinecap="round" />
            <circle cx="44" cy="20" r="3" fill="#f5f6fa" />

            {/* Armored Bridge Tower */}
            <rect x="70" y="12" width="28" height="16" rx="4" fill="#ffffff" opacity="0.9" />
            <rect x="76" y="15" width="16" height="10" rx="2" fill="#1e272e" />

            {/* Deck Grate / Vents */}
            <line x1="108" y1="14" x2="108" y2="26" stroke="#1e272e" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="114" y1="14" x2="114" y2="26" stroke="#1e272e" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="120" y1="14" x2="120" y2="26" stroke="#1e272e" strokeWidth="2.5" strokeLinecap="round" />

            {/* Aft Gun Turret */}
            <circle cx="138" cy="20" r="7" fill="#1e272e" />
            <line x1="138" y1="20" x2="152" y2="20" stroke="#1e272e" strokeWidth="3.5" strokeLinecap="round" />
          </svg>
        )}

        {type === 'CRUISER' && (
          // 3-cell Cruiser: sleek fast boat with side fins and missile hatch
          <svg viewBox="0 0 120 40" className="w-full h-full drop-shadow-md overflow-visible">
            {/* Hull */}
            <path
              d="M 6 20 Q 24 7 60 7 L 95 7 Q 115 13 115 20 Q 115 27 95 33 L 60 33 Q 24 33 6 20 Z"
              fill={color}
              stroke={outlineColor}
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            {/* Bridge & Cabin */}
            <ellipse cx="48" cy="20" rx="14" ry="7" fill="#ffffff" opacity="0.95" stroke="#1e272e" strokeWidth="2" />
            <circle cx="48" cy="20" r="3.5" fill="#1e272e" />
            {/* Deck Vents */}
            <line x1="72" y1="14" x2="72" y2="26" stroke="#1e272e" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="78" y1="14" x2="78" y2="26" stroke="#1e272e" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="84" y1="14" x2="84" y2="26" stroke="#1e272e" strokeWidth="2.5" strokeLinecap="round" />
            {/* Rear Hatch */}
            <circle cx="98" cy="20" r="4.5" fill="#1e272e" />
          </svg>
        )}

        {type === 'SUBMARINE' && (
          // 3-cell Submarine: rounded bulbous nose, conning tower, side fins & rear propeller
          <svg viewBox="0 0 120 40" className="w-full h-full drop-shadow-md overflow-visible">
            {/* Side Stabilizer Fins */}
            <rect x="52" y="3" width="16" height="34" rx="4" fill={color} stroke={outlineColor} strokeWidth="3" />
            {/* Main Torpedo Body */}
            <rect x="14" y="9" width="92" height="22" rx="11" fill={color} stroke={outlineColor} strokeWidth="3.5" />
            {/* Conning Tower */}
            <rect x="50" y="14" width="20" height="12" rx="4" fill="#ffffff" stroke="#1e272e" strokeWidth="2" />
            <circle cx="60" cy="20" r="3" fill="#1e272e" />
            {/* Stern Rudder */}
            <path d="M 12 12 L 6 8 L 6 32 L 12 28 Z" fill="#1e272e" />
            {/* Front Sonar Eye */}
            <circle cx="98" cy="20" r="4" fill="#1e272e" />
          </svg>
        )}

        {type === 'DESTROYER' && (
          // 2-cell Patrol Boat: compact rounded boat with twin gun barrels and vents
          <svg viewBox="0 0 80 40" className="w-full h-full drop-shadow-md overflow-visible">
            {/* Compact Hull */}
            <rect x="6" y="8" width="68" height="24" rx="9" fill={color} stroke={outlineColor} strokeWidth="3.5" />
            {/* Twin Gun Barrels on Bow */}
            <circle cx="20" cy="15" r="4.5" fill="#1e272e" />
            <circle cx="20" cy="25" r="4.5" fill="#1e272e" />
            <line x1="20" y1="15" x2="6" y2="15" stroke="#1e272e" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="20" y1="25" x2="6" y2="25" stroke="#1e272e" strokeWidth="3.5" strokeLinecap="round" />
            {/* Bridge Vents */}
            <line x1="38" y1="14" x2="38" y2="26" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
            <line x1="44" y1="14" x2="44" y2="26" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
            <line x1="50" y1="14" x2="50" y2="26" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
            {/* Rear Hatch */}
            <rect x="60" y="14" width="8" height="12" rx="3" fill="#1e272e" />
          </svg>
        )}
      </div>
    </div>
  );
};

// --- Cartoon Cannon Component (Matches Image 1 & 2 bottom cannon) ---
const CartoonCannon: React.FC<{
  aimAngle?: number;
  isFiring?: boolean;
  isEnemy?: boolean;
}> = ({ aimAngle = 0, isFiring = false, isEnemy = false }) => {
  return (
    <div
      className={`relative flex items-center justify-center select-none pointer-events-none transition-transform duration-300 ${
        isEnemy ? 'rotate-180' : ''
      }`}
    >
      {/* Muzzle Flash & Smoke Puffs when firing */}
      {isFiring && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-white/90 animate-ping absolute" />
          <div className="w-10 h-10 rounded-full bg-white/70 absolute -top-2 -left-3" />
          <div className="w-8 h-8 rounded-full bg-white/60 absolute -top-3 right-0" />
          <div className="w-6 h-6 rounded-full bg-amber-300 animate-pulse absolute" />
        </div>
      )}

      {/* 3D Round Base Ring */}
      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#c0392b] border-[6px] border-[#1e272e] shadow-[0_8px_16px_rgba(0,0,0,0.4)] flex items-center justify-center relative">
        {/* Inner Swivel Socket */}
        <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-[#1e272e] flex items-center justify-center shadow-inner">
          {/* Swiveling Cannon Barrel Tube */}
          <div
            className={`w-10 sm:w-12 h-16 sm:h-20 bg-gradient-to-r from-[#2d3436] via-[#485460] to-[#1e272e] rounded-t-full rounded-b-xl border-[3.5px] border-[#1e272e] shadow-xl relative transition-transform duration-200 ${
              isFiring ? '-translate-y-2 scale-95' : ''
            }`}
            style={{
              transform: `rotate(${aimAngle}deg)`,
              transformOrigin: 'center 75%',
            }}
          >
            {/* White Specular Highlight on Barrel */}
            <div className="w-1.5 h-10 bg-white/40 rounded-full absolute left-2 top-3 blur-[0.5px]" />
            {/* Cannon Muzzle Opening */}
            <div className="w-7 sm:w-8 h-4 bg-[#0a0c0e] rounded-full border border-black/80 absolute top-1 left-1/2 -translate-x-1/2 shadow-inner" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const ShipBattleArena: React.FC<ShipBattleArenaProps> = ({
  game,
  currentUserId,
  onLockFleet,
  onAttack,
  isMyTurn,
  disabled = false,
}) => {
  const navigate = useNavigate();
  const isSetup = game.shipPhase === 'SETUP';
  const isBattle = game.shipPhase === 'BATTLE';
  const isLocked = !!game.shipFleetsLocked?.[currentUserId];

  const opponent = game.players.find((p) => p.userId !== currentUserId);
  const opponentUserId = opponent?.userId || '';
  const isOpponentLocked = !!game.shipFleetsLocked?.[opponentUserId];

  // --- Fleet Setup State ---
  const [placedShips, setPlacedShips] = useState<ShipPlacement[]>([]);
  const [selectedShipIndex, setSelectedShipIndex] = useState<number | null>(null);
  const [placementError, setPlacementError] = useState<string | null>(null);
  const [isLocking, setIsLocking] = useState(false);

  // --- Battle Animations State ---
  const [aimTarget, setAimTarget] = useState<{ row: number; col: number } | null>(null);
  const [isPlayerFiring, setIsPlayerFiring] = useState(false);
  const [isEnemyFiring, setIsEnemyFiring] = useState(false);

  // Container refs
  const topBoardRef = useRef<HTMLDivElement>(null);
  const bottomBoardRef = useRef<HTMLDivElement>(null);
  const playerCannonRef = useRef<HTMLDivElement>(null);
  const enemyCannonRef = useRef<HTMLDivElement>(null);

  // Load initial fleet
  useEffect(() => {
    if (game.shipFleets?.[currentUserId]) {
      setPlacedShips(game.shipFleets[currentUserId]);
    } else if (placedShips.length === 0 && !isLocked) {
      handleRandomize();
    }
  }, [game.shipFleets, currentUserId, isLocked]);

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

  // Setup: Randomize Fleet
  const handleRandomize = () => {
    if (isLocked) return;
    setPlacementError(null);
    const newFleet: ShipPlacement[] = [];

    for (const def of SHIP_DEFS) {
      let placed = false;
      let attempts = 0;
      while (!placed && attempts < 1000) {
        attempts++;
        const orient: 'HORIZONTAL' | 'VERTICAL' = Math.random() > 0.5 ? 'HORIZONTAL' : 'VERTICAL';
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
    setSelectedShipIndex(null);
    soundService.playTileTap();
  };

  // Setup: Rotate selected ship
  const handleRotateShip = (index: number) => {
    if (isLocked) return;
    const targetShip = placedShips[index];
    if (!targetShip) return;

    const newOrient = targetShip.orientation === 'HORIZONTAL' ? 'VERTICAL' : 'HORIZONTAL';
    const newCells = computeCells(targetShip.shipType, targetShip.row, targetShip.col, newOrient);

    if (!isValidPlacement(newCells, placedShips, targetShip.shipType)) {
      // Try shifting if it goes out of bounds
      let shiftedR = targetShip.row;
      let shiftedC = targetShip.col;
      const size = SHIP_DEFS.find((d) => d.type === targetShip.shipType)?.size || 2;

      if (newOrient === 'HORIZONTAL' && shiftedC + size > 10) {
        shiftedC = 10 - size;
      } else if (newOrient === 'VERTICAL' && shiftedR + size > 10) {
        shiftedR = 10 - size;
      }

      const shiftedCells = computeCells(targetShip.shipType, shiftedR, shiftedC, newOrient);
      if (!isValidPlacement(shiftedCells, placedShips, targetShip.shipType)) {
        setPlacementError('Cannot rotate ship here — blocked by boundary or another ship!');
        soundService.playTileTap();
        return;
      }

      const updated = [...placedShips];
      updated[index] = {
        ...targetShip,
        row: shiftedR,
        col: shiftedC,
        orientation: newOrient,
        cells: shiftedCells,
      };
      setPlacedShips(updated);
      setPlacementError(null);
      soundService.playTileTap();
      return;
    }

    const updated = [...placedShips];
    updated[index] = {
      ...targetShip,
      orientation: newOrient,
      cells: newCells,
    };
    setPlacedShips(updated);
    setPlacementError(null);
    soundService.playTileTap();
  };

  // Setup: Move ship to tapped cell
  const handleCellClickSetup = (r: number, c: number) => {
    if (isLocked) return;

    // Check if user tapped an existing ship directly -> select it
    const tappedIndex = placedShips.findIndex((s) =>
      s.cells.some((cell) => cell.row === r && cell.col === c)
    );

    if (tappedIndex !== -1) {
      if (selectedShipIndex === tappedIndex) {
        // Tapping already selected ship rotates it!
        handleRotateShip(tappedIndex);
      } else {
        setSelectedShipIndex(tappedIndex);
        soundService.playTileTap();
      }
      return;
    }

    // If a ship is currently selected, try moving its origin to (r, c)
    if (selectedShipIndex !== null) {
      const activeShip = placedShips[selectedShipIndex];
      const newCells = computeCells(activeShip.shipType, r, c, activeShip.orientation);

      if (isValidPlacement(newCells, placedShips, activeShip.shipType)) {
        const updated = [...placedShips];
        updated[selectedShipIndex] = {
          ...activeShip,
          row: r,
          col: c,
          cells: newCells,
        };
        setPlacedShips(updated);
        setPlacementError(null);
        soundService.playTileTap();
      } else {
        setPlacementError('Cannot move ship here — overlapping or out of bounds!');
      }
    }
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

  // --- Battle Maps ---
  const myFleet = game.shipFleets?.[currentUserId] || placedShips;
  const opponentAttacksOnMe = (opponentUserId && game.shipAttacks?.[opponentUserId]) || [];
  const myAttacksOnOpponent = game.shipAttacks?.[currentUserId] || [];

  // Attacks on Opponent Map (Top Grid)
  const myAttackResultsMap = new Map<string, { result: 'MISS' | 'HIT' | 'SUNK'; sunkShipType?: string }>();
  myAttacksOnOpponent.forEach((att) => {
    myAttackResultsMap.set(`${att.row}-${att.col}`, {
      result: att.result,
      sunkShipType: att.sunkShipType,
    });
  });

  // Attacks on Player Map (Bottom Grid)
  const opponentAttackResultsMap = new Map<string, { result: 'MISS' | 'HIT' | 'SUNK'; sunkShipType?: string }>();
  opponentAttacksOnMe.forEach((att) => {
    opponentAttackResultsMap.set(`${att.row}-${att.col}`, {
      result: att.result,
      sunkShipType: att.sunkShipType,
    });
  });

  // Calculate Sunk Ships
  const opponentSunkShips = game.shipSunkTypes?.[opponentUserId] || [];
  const mySunkShips = game.shipSunkTypes?.[currentUserId] || [];

  // Firing at enemy cell
  const handleFireAttack = (r: number, c: number) => {
    if (!isBattle || !isMyTurn || disabled || game.status !== 'PLAYING') return;
    const key = `${r}-${c}`;
    if (myAttackResultsMap.has(key)) return;

    setAimTarget({ row: r, col: c });
    setIsPlayerFiring(true);
    soundService.playCountdownTick();

    // Trigger cannon recoil & cannonball projectile animation
    setTimeout(() => {
      setIsPlayerFiring(false);
      const clientMoveId = `att-${currentUserId}-${r}-${c}-${Date.now()}`;
      onAttack(r, c, clientMoveId);
    }, 450);
  };

  // Monitor opponent attack for cannon animation
  const lastAttack = game.shipLastAttackResult;
  useEffect(() => {
    if (lastAttack && lastAttack.attackerUserId === opponentUserId) {
      setIsEnemyFiring(true);
      const timer = setTimeout(() => setIsEnemyFiring(false), 500);
      return () => clearTimeout(timer);
    }
  }, [lastAttack, opponentUserId]);

  return (
    <div className="w-full flex flex-col items-center justify-center select-none font-sans">
      {/* ========================================================================= */}
      {/* 1. DEPLOYMENT SCREEN (Exact recreation of Image 5 & 4)                   */}
      {/* ========================================================================= */}
      {isSetup && (
        <div className="w-full max-w-[460px] rounded-[32px] overflow-hidden shadow-2xl border-4 border-[#1e272e] flex flex-col">
          {/* Top Panel (Dark Navy Header) */}
          <div className="bg-[#242b3d] p-5 text-center flex flex-col items-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Deploy your ships
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-[#8fa0b5] max-w-xs leading-snug">
              Drag to move and tap to rotate or try random placement
            </p>

            {/* Arcade Action Buttons */}
            <div className="w-full flex items-center justify-center gap-3 pt-1">
              <button
                onClick={handleRandomize}
                disabled={isLocked}
                className="px-6 py-2.5 rounded-full bg-[#2980b9] hover:bg-[#3498db] text-white font-black text-xs uppercase tracking-wider shadow-[0_4px_0_#1a5276] active:translate-y-1 active:shadow-none transition-all cursor-pointer disabled:opacity-50"
              >
                RANDOM
              </button>

              <button
                onClick={handleLockFleet}
                disabled={isLocked || isLocking || placedShips.length !== 5}
                className="px-8 py-3 rounded-full bg-[#27ae60] hover:bg-[#2ecc71] text-white font-black text-sm uppercase tracking-wider shadow-[0_4px_0_#1e8449] active:translate-y-1 active:shadow-none transition-all cursor-pointer flex items-center space-x-1.5 disabled:opacity-50"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>SAVE</span>
              </button>
            </div>

            {placementError && (
              <div className="text-[11px] font-bold text-rose-300 bg-rose-950/60 px-3 py-1 rounded-full border border-rose-800 animate-in fade-in flex items-center space-x-1">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{placementError}</span>
              </div>
            )}
          </div>

          {/* Bottom Panel (Terracotta Coral Grid with Cartoon Ships) */}
          <div className="bg-[#e08b73] p-4 sm:p-5 flex flex-col items-center justify-center relative">
            {/* Exit button pill on top right */}
            <button
              onClick={() => navigate('/hub')}
              className="absolute right-3 top-3 px-3 py-1.5 rounded-full bg-white text-[#242b3d] font-black text-[11px] shadow-md border-2 border-slate-200 hover:scale-105 active:scale-95 transition cursor-pointer z-20"
            >
              EXIT
            </button>

            {/* Waiting for opponent banner (Image 4) */}
            {isLocked && !isOpponentLocked && (
              <div className="absolute inset-0 bg-[#2980b9]/90 backdrop-blur-xs z-30 flex flex-col items-center justify-center p-6 text-center text-white space-y-3">
                <div className="w-16 h-16 rounded-full border-4 border-white/30 border-t-white animate-spin mb-2" />
                <h3 className="text-2xl font-black tracking-tight">
                  {opponent?.username || 'Opponent'} is placing ships
                </h3>
                <p className="text-xs font-semibold text-white/80">
                  Get ready for naval combat! Match starts automatically once fleets are locked.
                </p>
              </div>
            )}

            {/* 10x10 Terracotta Grid Container */}
            <div
              className="w-full aspect-square max-w-[380px] bg-[#e08b73] p-1.5 rounded-2xl border-2 border-[#8d4d3d] grid grid-cols-10 grid-rows-10 gap-1 relative shadow-inner"
            >
              {/* Grid Cells */}
              {Array.from({ length: 100 }).map((_, idx) => {
                const r = Math.floor(idx / 10);
                const c = idx % 10;
                return (
                  <div
                    key={idx}
                    onClick={() => handleCellClickSetup(r, c)}
                    className="w-full h-full bg-[#9c5240] hover:bg-[#b05d49] rounded-[4px] cursor-pointer transition-colors relative"
                  />
                );
              })}

              {/* Continuous SVG Ships Rendered Over Grid */}
              {placedShips.map((ship, index) => {
                const isHoriz = ship.orientation === 'HORIZONTAL';
                const isSelected = selectedShipIndex === index;
                const def = SHIP_DEFS.find((d) => d.type === ship.shipType)!;

                // Exact coordinate layout in grid percent
                const leftPct = ship.col * 10;
                const topPct = ship.row * 10;
                const widthPct = isHoriz ? def.size * 10 : 10;
                const heightPct = isHoriz ? 10 : def.size * 10;

                return (
                  <div
                    key={ship.shipType}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (selectedShipIndex === index) {
                        handleRotateShip(index);
                      } else {
                        setSelectedShipIndex(index);
                        soundService.playTileTap();
                      }
                    }}
                    style={{
                      position: 'absolute',
                      left: `${leftPct}%`,
                      top: `${topPct}%`,
                      width: `${widthPct}%`,
                      height: `${heightPct}%`,
                      zIndex: isSelected ? 20 : 10,
                    }}
                    className="p-0.5 cursor-pointer select-none relative group"
                  >
                    <CartoonShipGraphic
                      type={ship.shipType}
                      orientation={ship.orientation}
                      color="#ea5b48"
                      outlineColor="#1e272e"
                      isSelected={isSelected}
                    />

                    {/* Rotation Arrows Indicator (Exact from Image 5) */}
                    {isSelected && (
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-between">
                        <div className="w-5 h-5 -left-3 rounded-full bg-white text-[#1e272e] border border-black shadow-md flex items-center justify-center text-xs font-black animate-bounce">
                          ↺
                        </div>
                        <div className="w-5 h-5 -right-3 rounded-full bg-white text-[#1e272e] border border-black shadow-md flex items-center justify-center text-xs font-black animate-bounce">
                          ↻
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="text-[11px] font-bold text-[#4a2820] mt-3 text-center">
              💡 Tap any ship to rotate 90° • Tap any cell to reposition
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. DUAL BATTLE ARENA (Exact recreation of Images 1, 2, 3)                */}
      {/* ========================================================================= */}
      {isBattle && (
        <div
          className={`w-full max-w-[460px] rounded-[36px] overflow-hidden shadow-2xl border-4 border-[#1e272e] flex flex-col relative transition-all duration-300 ${
            !isMyTurn
              ? 'ring-8 ring-cyan-400 shadow-[0_0_40px_rgba(34,211,238,0.6)]'
              : 'ring-4 ring-amber-400/40'
          }`}
        >
          {/* Turn Header Ambient Banner (Image 3) */}
          <div
            className={`w-full py-2 px-4 text-center font-black text-sm uppercase tracking-wider flex items-center justify-center space-x-2 transition-colors ${
              !isMyTurn
                ? 'bg-gradient-to-r from-cyan-600 via-sky-500 to-cyan-600 text-white shadow-md'
                : 'bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 text-white shadow-md'
            }`}
          >
            <span>{!isMyTurn ? `${opponent?.username || 'Bot'}'s Turn` : 'Your Turn — Aim & Fire!'}</span>
          </div>

          {/* ===================================================================== */}
          {/* TOP FIELD: OPPONENT WATERS (Blue Ocean Theme)                         */}
          {/* ===================================================================== */}
          <div
            ref={topBoardRef}
            className="bg-[#5dade2] p-3 sm:p-4 flex flex-col items-center justify-center relative border-b-2 border-[#1e272e]"
          >
            {/* Opponent Top-Down Cannon */}
            <div ref={enemyCannonRef} className="mb-2">
              <CartoonCannon isFiring={isEnemyFiring} isEnemy={true} />
            </div>

            {/* 10x10 Enemy Grid */}
            <div className="w-full aspect-square max-w-[360px] bg-[#4a90e2] p-1.5 rounded-2xl border-2 border-[#2c3e50] grid grid-cols-10 grid-rows-10 gap-1 relative shadow-inner">
              {Array.from({ length: 100 }).map((_, idx) => {
                const r = Math.floor(idx / 10);
                const c = idx % 10;
                const key = `${r}-${c}`;
                const att = myAttackResultsMap.get(key);
                const isHit = att && (att.result === 'HIT' || att.result === 'SUNK');
                const isMiss = att && att.result === 'MISS';
                const isTargetHover = aimTarget && aimTarget.row === r && aimTarget.col === c;

                return (
                  <div
                    key={idx}
                    onClick={() => handleFireAttack(r, c)}
                    className={`w-full h-full rounded-[4px] relative flex items-center justify-center cursor-pointer transition-all duration-150 select-none ${
                      isHit
                        ? 'bg-[#111827] shadow-inner' // Jet-black charred square for hit
                        : isMiss
                        ? 'bg-[#2c3e50]'
                        : 'bg-[#34495e] hover:bg-[#3d566e] active:scale-95'
                    }`}
                  >
                    {/* Miss Marker: Charcoal/slate cross ✖ */}
                    {isMiss && (
                      <span className="text-[#95a5a6] font-black text-sm sm:text-base leading-none">
                        ✖
                      </span>
                    )}

                    {/* Hit Marker: 2 Overlapping Glowing Fire Diamonds 🔶 (Image 1 & 3) */}
                    {isHit && (
                      <div className="relative flex items-center justify-center">
                        <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 bg-[#f39c12] rotate-45 rounded-[2px] shadow-[0_0_8px_#f1c40f] animate-pulse" />
                        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-[#e74c3c] rotate-45 rounded-[1px] absolute" />
                      </div>
                    )}

                    {/* White Crosshair Reticle ⌖ when aiming/firing */}
                    {(isTargetHover || isPlayerFiring) && isMyTurn && !att && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-white flex items-center justify-center animate-spin">
                          <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* If game is FINISHED, reveal opponent's hidden ships */}
              {game.status === 'FINISHED' &&
                game.shipFleets?.[opponentUserId]?.map((ship) => {
                  const isHoriz = ship.orientation === 'HORIZONTAL';
                  const def = SHIP_DEFS.find((d) => d.type === ship.shipType)!;
                  const leftPct = ship.col * 10;
                  const topPct = ship.row * 10;
                  const widthPct = isHoriz ? def.size * 10 : 10;
                  const heightPct = isHoriz ? 10 : def.size * 10;

                  return (
                    <div
                      key={ship.shipType}
                      style={{
                        position: 'absolute',
                        left: `${leftPct}%`,
                        top: `${topPct}%`,
                        width: `${widthPct}%`,
                        height: `${heightPct}%`,
                        zIndex: 15,
                        opacity: 0.75,
                      }}
                      className="p-0.5 pointer-events-none"
                    >
                      <CartoonShipGraphic
                        type={ship.shipType}
                        orientation={ship.orientation}
                        color="#3498db"
                        outlineColor="#1e272e"
                      />
                    </div>
                  );
                })}
            </div>
          </div>

          {/* ===================================================================== */}
          {/* CENTER DIVIDER BAR (Fleet Silhouettes & Score Indicator)              */}
          {/* ===================================================================== */}
          <div className="bg-[#ecf0f1] py-2 px-3 sm:px-4 flex items-center justify-between border-y-2 border-[#1e272e] shadow-xs relative z-20">
            {/* Score / Afloat Pill */}
            <div className="px-3 py-1 rounded-full bg-white border-2 border-slate-300 shadow-xs flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3498db]" />
              <span className="font-black text-xs text-slate-800">
                {opponentSunkShips.length} • {mySunkShips.length}
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#e74c3c]" />
            </div>

            {/* Central Two-Row Fleet Silhouette Matrix */}
            <div className="flex flex-col items-center space-y-1">
              {/* Row 1: Opponent 5 Ships (Blue) */}
              <div className="flex items-center space-x-1.5">
                {SHIP_DEFS.map((def) => {
                  const isSunk = opponentSunkShips.includes(def.type);
                  return (
                    <div
                      key={`opp-${def.type}`}
                      title={`${def.label}: ${isSunk ? 'SUNK' : 'AFLOAT'}`}
                      className={`h-3 rounded-sm transition-all flex items-center justify-center px-1 text-[8px] font-black ${
                        isSunk
                          ? 'bg-rose-500 text-white line-through opacity-40'
                          : 'bg-[#3498db] text-white'
                      }`}
                      style={{ width: `${def.size * 9}px` }}
                    >
                      {isSunk ? '✕' : ''}
                    </div>
                  );
                })}
              </div>

              {/* Row 2: Player 5 Ships (Red) */}
              <div className="flex items-center space-x-1.5">
                {SHIP_DEFS.map((def) => {
                  const isSunk = mySunkShips.includes(def.type);
                  return (
                    <div
                      key={`my-${def.type}`}
                      title={`${def.label}: ${isSunk ? 'SUNK' : 'AFLOAT'}`}
                      className={`h-3 rounded-sm transition-all flex items-center justify-center px-1 text-[8px] font-black ${
                        isSunk
                          ? 'bg-slate-400 text-white line-through opacity-40'
                          : 'bg-[#e74c3c] text-white'
                      }`}
                      style={{ width: `${def.size * 9}px` }}
                    >
                      {isSunk ? '✕' : ''}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* EXIT Button Capsule */}
            <button
              onClick={() => navigate('/hub')}
              className="px-3 py-1 rounded-full bg-white hover:bg-rose-50 text-[#c0392b] font-black text-xs tracking-wider border-2 border-slate-300 shadow-xs active:scale-95 transition cursor-pointer"
            >
              EXIT
            </button>
          </div>

          {/* ===================================================================== */}
          {/* BOTTOM FIELD: PLAYER WATERS (Coral / Terracotta Theme)                */}
          {/* ===================================================================== */}
          <div
            ref={bottomBoardRef}
            className="bg-[#e08b73] p-3 sm:p-4 flex flex-col items-center justify-center relative"
          >
            {/* 10x10 Player Grid */}
            <div className="w-full aspect-square max-w-[360px] bg-[#d37861] p-1.5 rounded-2xl border-2 border-[#8d4d3d] grid grid-cols-10 grid-rows-10 gap-1 relative shadow-inner">
              {Array.from({ length: 100 }).map((_, idx) => {
                const r = Math.floor(idx / 10);
                const c = idx % 10;
                const key = `${r}-${c}`;
                const att = opponentAttackResultsMap.get(key);
                const isHit = att && (att.result === 'HIT' || att.result === 'SUNK');
                const isMiss = att && att.result === 'MISS';

                return (
                  <div
                    key={idx}
                    className={`w-full h-full rounded-[4px] relative flex items-center justify-center select-none ${
                      isHit
                        ? 'bg-[#111827] z-20 shadow-inner' // Charred square on player ship
                        : isMiss
                        ? 'bg-[#7a3b2e]'
                        : 'bg-[#9c5240]'
                    }`}
                  >
                    {isMiss && (
                      <span className="text-[#d5b0a8] font-black text-sm sm:text-base leading-none">
                        ✖
                      </span>
                    )}

                    {isHit && (
                      <div className="relative flex items-center justify-center">
                        <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 bg-[#f39c12] rotate-45 rounded-[2px] shadow-[0_0_8px_#f1c40f] animate-pulse" />
                        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-[#e74c3c] rotate-45 rounded-[1px] absolute" />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Player Placed Ships (Drawn over grid) */}
              {myFleet.map((ship) => {
                const isHoriz = ship.orientation === 'HORIZONTAL';
                const def = SHIP_DEFS.find((d) => d.type === ship.shipType)!;
                const leftPct = ship.col * 10;
                const topPct = ship.row * 10;
                const widthPct = isHoriz ? def.size * 10 : 10;
                const heightPct = isHoriz ? 10 : def.size * 10;

                return (
                  <div
                    key={ship.shipType}
                    style={{
                      position: 'absolute',
                      left: `${leftPct}%`,
                      top: `${topPct}%`,
                      width: `${widthPct}%`,
                      height: `${heightPct}%`,
                      zIndex: 10,
                    }}
                    className="p-0.5 pointer-events-none"
                  >
                    <CartoonShipGraphic
                      type={ship.shipType}
                      orientation={ship.orientation}
                      color="#ea5b48"
                      outlineColor="#1e272e"
                    />
                  </div>
                );
              })}
            </div>

            {/* Giant 3D Cartoon Cannon at Bottom (Image 1 & 2) */}
            <div ref={playerCannonRef} className="mt-3">
              <CartoonCannon
                isFiring={isPlayerFiring}
                aimAngle={aimTarget ? (aimTarget.col - 4.5) * 5 : 0}
                isEnemy={false}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShipBattleArena;
