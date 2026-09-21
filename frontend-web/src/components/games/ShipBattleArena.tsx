import React, { useState, useEffect, useRef, useCallback } from 'react';
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

// 8x8 Grid Configuration as requested by user
export const GRID_SIZE = 8;
export const CELL_PCT = 100 / GRID_SIZE; // 12.5%

const SHIP_DEFS: ShipDefinition[] = [
  { type: 'CARRIER', size: 5, label: 'Carrier' },
  { type: 'BATTLESHIP', size: 4, label: 'Battleship' },
  { type: 'CRUISER', size: 3, label: 'Cruiser' },
  { type: 'SUBMARINE', size: 3, label: 'Submarine' },
  { type: 'DESTROYER', size: 2, label: 'Patrol Boat' },
];

// --- Cartoon SVG Ships (Exact aesthetic, perfectly fitted horizontally & vertically) ---
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
  const def = SHIP_DEFS.find((d) => d.type === type)!;
  const size = def.size;

  // ViewBox dimensions:
  // When Horizontal: width = size * 40, height = 40
  // When Vertical: width = 40, height = size * 40
  // Rotating around center of first cell (20, 20) by 90deg maps:
  // (x, y) -> (40 - y, x), strictly bounded by [0, 40] x [0, size * 40]
  const vbW = isHoriz ? size * 40 : 40;
  const vbH = isHoriz ? 40 : size * 40;
  const transform = isHoriz ? undefined : 'rotate(90 20 20)';

  return (
    <div
      className={`w-full h-full flex items-center justify-center pointer-events-none select-none transition-transform duration-150 ${
        isSelected ? 'scale-[1.03]' : ''
      }`}
    >
      {type === 'CARRIER' && (
        <svg
          viewBox={`0 0 ${vbW} ${vbH}`}
          className="w-full h-full drop-shadow-md overflow-visible"
          preserveAspectRatio="none"
        >
          <g transform={transform}>
            {/* Carrier Hull */}
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
              <path d="M 46 20 L 52 14 L 56 16 L 54 20 L 56 24 L 52 26 Z" />
              <path d="M 64 20 L 70 14 L 74 16 L 72 20 L 74 24 L 70 26 Z" />
              <path d="M 82 20 L 88 14 L 92 16 L 90 20 L 92 24 L 88 26 Z" />
            </g>
            {/* Island Bridge Tower */}
            <rect x="110" y="7" width="26" height="7" rx="2" fill="#1e272e" opacity="0.85" />
            <rect x="122" y="3" width="10" height="5" rx="1.5" fill="#f5f6fa" />
            {/* Vents */}
            <line x1="145" y1="12" x2="145" y2="28" stroke="#1e272e" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="151" y1="12" x2="151" y2="28" stroke="#1e272e" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="157" y1="12" x2="157" y2="28" stroke="#1e272e" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        </svg>
      )}

      {type === 'BATTLESHIP' && (
        <svg
          viewBox={`0 0 ${vbW} ${vbH}`}
          className="w-full h-full drop-shadow-md overflow-visible"
          preserveAspectRatio="none"
        >
          <g transform={transform}>
            <path
              d="M 8 20 Q 20 8 50 8 L 135 8 Q 155 14 155 20 Q 155 26 135 32 L 50 32 Q 20 32 8 20 Z"
              fill={color}
              stroke={outlineColor}
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            <circle cx="44" cy="20" r="8" fill="#1e272e" />
            <line x1="44" y1="20" x2="22" y2="20" stroke="#1e272e" strokeWidth="4" strokeLinecap="round" />
            <circle cx="44" cy="20" r="3" fill="#f5f6fa" />

            <rect x="70" y="12" width="28" height="16" rx="4" fill="#ffffff" opacity="0.9" />
            <rect x="76" y="15" width="16" height="10" rx="2" fill="#1e272e" />

            <line x1="108" y1="14" x2="108" y2="26" stroke="#1e272e" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="114" y1="14" x2="114" y2="26" stroke="#1e272e" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="120" y1="14" x2="120" y2="26" stroke="#1e272e" strokeWidth="2.5" strokeLinecap="round" />

            <circle cx="138" cy="20" r="7" fill="#1e272e" />
            <line x1="138" y1="20" x2="152" y2="20" stroke="#1e272e" strokeWidth="3.5" strokeLinecap="round" />
          </g>
        </svg>
      )}

      {type === 'CRUISER' && (
        <svg
          viewBox={`0 0 ${vbW} ${vbH}`}
          className="w-full h-full drop-shadow-md overflow-visible"
          preserveAspectRatio="none"
        >
          <g transform={transform}>
            <path
              d="M 6 20 Q 24 7 60 7 L 95 7 Q 115 13 115 20 Q 115 27 95 33 L 60 33 Q 24 33 6 20 Z"
              fill={color}
              stroke={outlineColor}
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            <ellipse cx="48" cy="20" rx="14" ry="7" fill="#ffffff" opacity="0.95" stroke="#1e272e" strokeWidth="2" />
            <circle cx="48" cy="20" r="3.5" fill="#1e272e" />
            <line x1="72" y1="14" x2="72" y2="26" stroke="#1e272e" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="78" y1="14" x2="78" y2="26" stroke="#1e272e" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="84" y1="14" x2="84" y2="26" stroke="#1e272e" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="98" cy="20" r="4.5" fill="#1e272e" />
          </g>
        </svg>
      )}

      {type === 'SUBMARINE' && (
        <svg
          viewBox={`0 0 ${vbW} ${vbH}`}
          className="w-full h-full drop-shadow-md overflow-visible"
          preserveAspectRatio="none"
        >
          <g transform={transform}>
            <rect x="52" y="3" width="16" height="34" rx="4" fill={color} stroke={outlineColor} strokeWidth="3" />
            <rect x="14" y="9" width="92" height="22" rx="11" fill={color} stroke={outlineColor} strokeWidth="3.5" />
            <rect x="50" y="14" width="20" height="12" rx="4" fill="#ffffff" stroke="#1e272e" strokeWidth="2" />
            <circle cx="60" cy="20" r="3" fill="#1e272e" />
            <path d="M 12 12 L 6 8 L 6 32 L 12 28 Z" fill="#1e272e" />
            <circle cx="98" cy="20" r="4" fill="#1e272e" />
          </g>
        </svg>
      )}

      {type === 'DESTROYER' && (
        <svg
          viewBox={`0 0 ${vbW} ${vbH}`}
          className="w-full h-full drop-shadow-md overflow-visible"
          preserveAspectRatio="none"
        >
          <g transform={transform}>
            <rect x="6" y="8" width="68" height="24" rx="9" fill={color} stroke={outlineColor} strokeWidth="3.5" />
            <circle cx="20" cy="15" r="4.5" fill="#1e272e" />
            <circle cx="20" cy="25" r="4.5" fill="#1e272e" />
            <line x1="20" y1="15" x2="6" y2="15" stroke="#1e272e" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="20" y1="25" x2="6" y2="25" stroke="#1e272e" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="38" y1="14" x2="38" y2="26" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
            <line x1="44" y1="14" x2="44" y2="26" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
            <line x1="50" y1="14" x2="50" y2="26" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
            <rect x="60" y="14" width="8" height="12" rx="3" fill="#1e272e" />
          </g>
        </svg>
      )}
    </div>
  );
};

// --- Mini Ship Silhouette for Divider Bar ---
const MiniShipSilhouette: React.FC<{
  type: ShipType;
  color: string;
  isSunk?: boolean;
}> = ({ type, color, isSunk = false }) => {
  const def = SHIP_DEFS.find((d) => d.type === type)!;
  const widthPx = def.size * 10;

  return (
    <div
      style={{ width: `${widthPx}px` }}
      className={`h-3.5 rounded-full flex items-center justify-center transition-all duration-300 relative ${
        isSunk ? 'opacity-30 line-through grayscale' : 'opacity-100 shadow-xs'
      }`}
    >
      <div
        className="w-full h-2.5 rounded-full border border-black/40"
        style={{ backgroundColor: isSunk ? '#7f8c8d' : color }}
      />
      {isSunk && (
        <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-rose-600 select-none">
          ✕
        </span>
      )}
    </div>
  );
};

// --- Giant 3D Cartoon Cannon (Exact aesthetic from Screenshots 1, 2, 3) ---
const CartoonCannon: React.FC<{
  isFiring: boolean;
  aimAngle?: number;
  isEnemy?: boolean;
}> = ({ isFiring, aimAngle = 0, isEnemy = false }) => {
  const baseColor = isEnemy ? '#2980b9' : '#c0392b';

  return (
    <div
      className={`relative flex items-center justify-center select-none pointer-events-none transition-transform duration-200 ${
        isEnemy ? 'rotate-180' : ''
      }`}
    >
      {/* Muzzle Flash & Smoke Puffs when firing */}
      {isFiring && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-white/95 animate-ping absolute" />
          <div className="w-12 h-12 rounded-full bg-white/90 absolute -top-3 -left-3 shadow-md" />
          <div className="w-10 h-10 rounded-full bg-white/80 absolute -top-4 right-0 shadow-md" />
          <div className="w-8 h-8 rounded-full bg-amber-400 animate-pulse absolute" />
        </div>
      )}

      {/* 3D Round Base Ring */}
      <div
        className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-[6px] border-[#1e272e] shadow-[0_8px_16px_rgba(0,0,0,0.45)] flex items-center justify-center relative"
        style={{ backgroundColor: baseColor }}
      >
        {/* Inner Swivel Socket */}
        <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-[#1e272e] flex items-center justify-center shadow-inner">
          {/* Swiveling Cannon Barrel Tube */}
          <div
            className={`w-10 sm:w-12 h-16 sm:h-20 bg-gradient-to-r from-[#2d3436] via-[#485460] to-[#1e272e] rounded-t-full rounded-b-xl border-[3.5px] border-[#1e272e] shadow-2xl relative transition-transform duration-150 ${
              isFiring ? '-translate-y-3 scale-95' : ''
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
  const [placementError, setPlacementError] = useState<string | null>(null);
  const [isLocking, setIsLocking] = useState(false);

  // Setup Drag-and-Drop state
  const [draggingShipIndex, setDraggingShipIndex] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState<{ row: number; col: number }>({ row: 0, col: 0 });
  const [dragPointerStart, setDragPointerStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hasPointerMoved, setHasPointerMoved] = useState(false);
  const [dragPreview, setDragPreview] = useState<{ row: number; col: number; isValid: boolean } | null>(null);

  // --- Battle Animations State ---
  const [aimTarget, setAimTarget] = useState<{ row: number; col: number } | null>(null);
  const [isPlayerFiring, setIsPlayerFiring] = useState(false);
  const [isEnemyFiring, setIsEnemyFiring] = useState(false);
  const [flyingCannonball, setFlyingCannonball] = useState<{
    startX: number;
    startY: number;
    targetX: number;
    targetY: number;
    isEnemy: boolean;
  } | null>(null);

  // Container refs
  const arenaContainerRef = useRef<HTMLDivElement>(null);
  const setupBoardRef = useRef<HTMLDivElement>(null);
  const topBoardRef = useRef<HTMLDivElement>(null);
  const bottomBoardRef = useRef<HTMLDivElement>(null);
  const playerCannonRef = useRef<HTMLDivElement>(null);
  const enemyCannonRef = useRef<HTMLDivElement>(null);

  // Helper: compute ship cells on 8x8 grid
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

  // Helper: check placement validity on 8x8 grid
  const isValidPlacement = useCallback(
    (newCells: ShipCoordinate[], currentList: ShipPlacement[], excludeType?: string) => {
      for (const cell of newCells) {
        if (cell.row < 0 || cell.row >= GRID_SIZE || cell.col < 0 || cell.col >= GRID_SIZE) {
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
    },
    []
  );

  // Setup: Randomize Fleet on 8x8 grid
  const handleRandomize = useCallback(() => {
    if (isLocked) return;
    setPlacementError(null);
    const newFleet: ShipPlacement[] = [];

    for (const def of SHIP_DEFS) {
      let placed = false;
      let attempts = 0;
      while (!placed && attempts < 1000) {
        attempts++;
        const orient: 'HORIZONTAL' | 'VERTICAL' = Math.random() > 0.5 ? 'HORIZONTAL' : 'VERTICAL';
        const startR = orient === 'HORIZONTAL'
          ? Math.floor(Math.random() * GRID_SIZE)
          : Math.floor(Math.random() * (GRID_SIZE - def.size + 1));
        const startC = orient === 'HORIZONTAL'
          ? Math.floor(Math.random() * (GRID_SIZE - def.size + 1))
          : Math.floor(Math.random() * GRID_SIZE);
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
  }, [isLocked, isValidPlacement]);

  // Load initial fleet
  useEffect(() => {
    if (game.shipFleets?.[currentUserId]) {
      setPlacedShips(game.shipFleets[currentUserId]);
    } else if (placedShips.length === 0 && !isLocked) {
      handleRandomize();
    }
  }, [game.shipFleets, currentUserId, isLocked, handleRandomize]);

  // Setup: Rotate ship by index on 8x8 grid
  const handleRotateShip = (index: number) => {
    if (isLocked) return;
    const targetShip = placedShips[index];
    if (!targetShip) return;

    const newOrient = targetShip.orientation === 'HORIZONTAL' ? 'VERTICAL' : 'HORIZONTAL';
    let newCells = computeCells(targetShip.shipType, targetShip.row, targetShip.col, newOrient);

    if (!isValidPlacement(newCells, placedShips, targetShip.shipType)) {
      // Try shifting if it goes out of 8x8 bounds
      let shiftedR = targetShip.row;
      let shiftedC = targetShip.col;
      const size = SHIP_DEFS.find((d) => d.type === targetShip.shipType)?.size || 2;

      if (newOrient === 'HORIZONTAL' && shiftedC + size > GRID_SIZE) {
        shiftedC = GRID_SIZE - size;
      } else if (newOrient === 'VERTICAL' && shiftedR + size > GRID_SIZE) {
        shiftedR = GRID_SIZE - size;
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

  // Setup: Pointer down on ship (starts drag or detects tap)
  const handleShipPointerDown = (e: React.PointerEvent, index: number) => {
    if (isLocked) return;
    const boardEl = setupBoardRef.current;
    if (!boardEl) return;

    const boardRect = boardEl.getBoundingClientRect();
    const cellWidth = boardRect.width / GRID_SIZE;
    const cellHeight = boardRect.height / GRID_SIZE;

    const clickCol = Math.floor((e.clientX - boardRect.left) / cellWidth);
    const clickRow = Math.floor((e.clientY - boardRect.top) / cellHeight);

    const ship = placedShips[index];
    if (!ship) return;

    // Offset from ship origin
    setDragOffset({
      row: Math.max(0, clickRow - ship.row),
      col: Math.max(0, clickCol - ship.col),
    });
    setDragPointerStart({ x: e.clientX, y: e.clientY });
    setHasPointerMoved(false);
    setDraggingShipIndex(index);
    setDragPreview({ row: ship.row, col: ship.col, isValid: true });

    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  // Setup: Pointer move on ship (drags ship)
  const handleShipPointerMove = (e: React.PointerEvent) => {
    if (draggingShipIndex === null || isLocked) return;
    const boardEl = setupBoardRef.current;
    if (!boardEl) return;

    const dist = Math.hypot(e.clientX - dragPointerStart.x, e.clientY - dragPointerStart.y);
    if (dist > 6) {
      setHasPointerMoved(true);
    }

    const boardRect = boardEl.getBoundingClientRect();
    const cellWidth = boardRect.width / GRID_SIZE;
    const cellHeight = boardRect.height / GRID_SIZE;

    const ship = placedShips[draggingShipIndex];
    if (!ship) return;

    const def = SHIP_DEFS.find((d) => d.type === ship.shipType)!;
    const isHoriz = ship.orientation === 'HORIZONTAL';
    const shipW = isHoriz ? def.size : 1;
    const shipH = isHoriz ? 1 : def.size;

    const rawCol = Math.floor((e.clientX - boardRect.left) / cellWidth) - dragOffset.col;
    const rawRow = Math.floor((e.clientY - boardRect.top) / cellHeight) - dragOffset.row;

    const clampedCol = Math.max(0, Math.min(GRID_SIZE - shipW, rawCol));
    const clampedRow = Math.max(0, Math.min(GRID_SIZE - shipH, rawRow));

    const candidateCells = computeCells(ship.shipType, clampedRow, clampedCol, ship.orientation);
    const valid = isValidPlacement(candidateCells, placedShips, ship.shipType);

    setDragPreview({
      row: clampedRow,
      col: clampedCol,
      isValid: valid,
    });
  };

  // Setup: Pointer up on ship (drop or rotate on tap)
  const handleShipPointerUp = (e: React.PointerEvent, index: number) => {
    if (draggingShipIndex === null || isLocked) return;

    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (_) {}

    if (!hasPointerMoved) {
      // It was a tap! Rotate immediately!
      handleRotateShip(index);
    } else if (dragPreview && dragPreview.isValid) {
      // It was dragged to a valid new cell!
      const ship = placedShips[index];
      const newCells = computeCells(ship.shipType, dragPreview.row, dragPreview.col, ship.orientation);
      const updated = [...placedShips];
      updated[index] = {
        ...ship,
        row: dragPreview.row,
        col: dragPreview.col,
        cells: newCells,
      };
      setPlacedShips(updated);
      setPlacementError(null);
      soundService.playTileTap();
    } else {
      soundService.playTileTap();
    }

    setDraggingShipIndex(null);
    setDragPreview(null);
    setHasPointerMoved(false);
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

  // Attacks on Opponent Map (Top 8x8 Grid)
  const myAttackResultsMap = new Map<string, { result: 'MISS' | 'HIT' | 'SUNK'; sunkShipType?: string }>();
  myAttacksOnOpponent.forEach((att) => {
    myAttackResultsMap.set(`${att.row}-${att.col}`, {
      result: att.result,
      sunkShipType: att.sunkShipType,
    });
  });

  // Attacks on Player Map (Bottom 8x8 Grid)
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

  // Firing at enemy cell on 8x8 grid
  const handleFireAttack = (r: number, c: number) => {
    if (!isBattle || !isMyTurn || disabled || game.status !== 'PLAYING') return;
    const key = `${r}-${c}`;
    if (myAttackResultsMap.has(key)) return;

    setAimTarget({ row: r, col: c });
    setIsPlayerFiring(true);
    soundService.playCannonFire();

    // Compute start and target positions for flying projectile
    if (topBoardRef.current && playerCannonRef.current && arenaContainerRef.current) {
      const arenaRect = arenaContainerRef.current.getBoundingClientRect();
      const cannonRect = playerCannonRef.current.getBoundingClientRect();
      const topRect = topBoardRef.current.getBoundingClientRect();

      const cellW = topRect.width / GRID_SIZE;
      const cellH = topRect.height / GRID_SIZE;

      const targetX = topRect.left + c * cellW + cellW / 2 - arenaRect.left;
      const targetY = topRect.top + r * cellH + cellH / 2 - arenaRect.top;
      const startX = cannonRect.left + cannonRect.width / 2 - arenaRect.left;
      const startY = cannonRect.top + 20 - arenaRect.top;

      setFlyingCannonball({
        startX,
        startY,
        targetX,
        targetY,
        isEnemy: false,
      });
    }

    // Trigger cannon recoil & cannonball projectile animation
    setTimeout(() => {
      setIsPlayerFiring(false);
      setFlyingCannonball(null);
      const clientMoveId = `att-${currentUserId}-${r}-${c}-${Date.now()}`;
      onAttack(r, c, clientMoveId);
    }, 420);
  };

  // Monitor opponent attack for cannon animation
  const lastAttack = game.shipLastAttackResult;
  useEffect(() => {
    if (lastAttack && lastAttack.attackerUserId === opponentUserId) {
      setIsEnemyFiring(true);
      soundService.playCannonFire();

      if (bottomBoardRef.current && enemyCannonRef.current && arenaContainerRef.current) {
        const arenaRect = arenaContainerRef.current.getBoundingClientRect();
        const cannonRect = enemyCannonRef.current.getBoundingClientRect();
        const bottomRect = bottomBoardRef.current.getBoundingClientRect();

        const cellW = bottomRect.width / GRID_SIZE;
        const cellH = bottomRect.height / GRID_SIZE;

        const targetX = bottomRect.left + lastAttack.col * cellW + cellW / 2 - arenaRect.left;
        const targetY = bottomRect.top + lastAttack.row * cellH + cellH / 2 - arenaRect.top;
        const startX = cannonRect.left + cannonRect.width / 2 - arenaRect.left;
        const startY = cannonRect.bottom - 20 - arenaRect.top;

        setFlyingCannonball({
          startX,
          startY,
          targetX,
          targetY,
          isEnemy: true,
        });
      }

      const timer = setTimeout(() => {
        setIsEnemyFiring(false);
        setFlyingCannonball(null);
        if (lastAttack.result === 'HIT' || lastAttack.result === 'SUNK') {
          soundService.playExplosionHit();
        } else {
          soundService.playWaterSplash();
        }
      }, 450);
      return () => clearTimeout(timer);
    }
  }, [lastAttack, opponentUserId]);

  return (
    <div
      ref={arenaContainerRef}
      className="w-full flex flex-col items-center justify-center select-none font-sans relative"
    >
      {/* ========================================================================= */}
      {/* 1. DEPLOYMENT SCREEN (Exact recreation of Screenshot 5 on 8x8 Grid)      */}
      {/* ========================================================================= */}
      {isSetup && !isLocked && (
        <div className="w-full max-w-[420px] rounded-[32px] overflow-hidden shadow-2xl border-4 border-[#1e272e] flex flex-col relative bg-[#e08b73]">
          {/* Top Panel (Dark Navy Header) */}
          <div className="bg-[#242b3d] pt-6 pb-5 px-5 text-center flex flex-col items-center space-y-3 relative">
            {/* White EXIT Pill Button on Top-Right Edge */}
            <button
              onClick={() => navigate('/hub')}
              className="absolute right-0 top-6 px-3 py-1 bg-white text-[#242b3d] font-black text-xs uppercase tracking-wider rounded-l-full shadow-md border-l-2 border-y-2 border-slate-300 hover:bg-slate-100 active:scale-95 transition cursor-pointer z-30"
            >
              EXIT
            </button>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Deploy your ships
            </h2>
            <p className="text-xs font-semibold text-[#8fa0b5] max-w-xs leading-snug">
              Drag to move and tap to rotate or try random placement
            </p>

            {/* Arcade Action Buttons */}
            <div className="w-full flex items-center justify-center gap-4 pt-1">
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

          {/* Bottom Panel (Terracotta Coral 8x8 Grid with Large Comfortable Blocks) */}
          <div className="bg-[#e08b73] p-3 sm:p-4 flex flex-col items-center justify-center relative">
            {/* 8x8 Terracotta Grid Container */}
            <div
              ref={setupBoardRef}
              className="w-full aspect-square max-w-[370px] bg-[#e08b73] p-1.5 rounded-2xl border-2 border-[#8d4d3d] grid grid-cols-8 grid-rows-8 gap-1.5 relative shadow-inner touch-none"
            >
              {/* 64 Grid Cells */}
              {Array.from({ length: 64 }).map((_, idx) => (
                <div
                  key={idx}
                  className="w-full h-full bg-[#9c5240] rounded-[6px] relative shadow-inner"
                />
              ))}

              {/* Drag Preview Ghost */}
              {dragPreview && draggingShipIndex !== null && (
                <div
                  style={{
                    position: 'absolute',
                    left: `${dragPreview.col * CELL_PCT}%`,
                    top: `${dragPreview.row * CELL_PCT}%`,
                    width: `${
                      placedShips[draggingShipIndex].orientation === 'HORIZONTAL'
                        ? (SHIP_DEFS.find((d) => d.type === placedShips[draggingShipIndex].shipType)?.size || 2) * CELL_PCT
                        : CELL_PCT
                    }%`,
                    height: `${
                      placedShips[draggingShipIndex].orientation === 'VERTICAL'
                        ? (SHIP_DEFS.find((d) => d.type === placedShips[draggingShipIndex].shipType)?.size || 2) * CELL_PCT
                        : CELL_PCT
                    }%`,
                    zIndex: 25,
                  }}
                  className={`pointer-events-none rounded-lg border-2 border-dashed transition-all duration-75 ${
                    dragPreview.isValid ? 'bg-emerald-400/40 border-emerald-300' : 'bg-rose-500/40 border-rose-300'
                  }`}
                />
              )}

              {/* Placed Cartoon Ships with Rotation Arrows on each ship (Exact from Screenshot 5) */}
              {placedShips.map((ship, index) => {
                const isHoriz = ship.orientation === 'HORIZONTAL';
                const def = SHIP_DEFS.find((d) => d.type === ship.shipType)!;
                const isBeingDragged = draggingShipIndex === index;

                // Exact coordinate layout in 8x8 grid percent
                const leftPct = (isBeingDragged && dragPreview ? dragPreview.col : ship.col) * CELL_PCT;
                const topPct = (isBeingDragged && dragPreview ? dragPreview.row : ship.row) * CELL_PCT;
                const widthPct = isHoriz ? def.size * CELL_PCT : CELL_PCT;
                const heightPct = isHoriz ? CELL_PCT : def.size * CELL_PCT;

                return (
                  <div
                    key={ship.shipType}
                    onPointerDown={(e) => handleShipPointerDown(e, index)}
                    onPointerMove={handleShipPointerMove}
                    onPointerUp={(e) => handleShipPointerUp(e, index)}
                    style={{
                      position: 'absolute',
                      left: `${leftPct}%`,
                      top: `${topPct}%`,
                      width: `${widthPct}%`,
                      height: `${heightPct}%`,
                      zIndex: isBeingDragged ? 30 : 15,
                    }}
                    className="p-1 cursor-grab active:cursor-grabbing select-none relative group touch-none"
                  >
                    <CartoonShipGraphic
                      type={ship.shipType}
                      orientation={ship.orientation}
                      color="#ea5b48"
                      outlineColor="#1e272e"
                      isSelected={isBeingDragged}
                    />

                    {/* Rotation Arrows (Curved arrows above and below, matching Screenshot 5) */}
                    {!isBeingDragged && (
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        {/* Top Curved Arrow ↶ */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRotateShip(index);
                          }}
                          className="absolute -top-3 left-1/2 -translate-x-1/2 text-white font-black text-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] hover:scale-125 active:scale-90 transition pointer-events-auto cursor-pointer"
                        >
                          ↺
                        </button>
                        {/* Bottom Curved Arrow ↷ */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRotateShip(index);
                          }}
                          className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-white font-black text-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] hover:scale-125 active:scale-90 transition pointer-events-auto cursor-pointer"
                        >
                          ↻
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. WAITING FOR OPPONENT / BOT IS PLACING SHIPS (Screenshot 4)             */}
      {/* ========================================================================= */}
      {isSetup && isLocked && !isOpponentLocked && (
        <div className="w-full max-w-[420px] rounded-[32px] overflow-hidden shadow-2xl border-4 border-[#1e272e] flex flex-col bg-[#2e64b6]">
          {/* Top Half: Sea-blue 8x8 Grid & Silhouettes */}
          <div className="bg-[#5dade2] p-4 flex flex-col items-center justify-center relative border-b-4 border-[#1e272e]">
            {/* White EXIT Pill Button */}
            <button
              onClick={() => navigate('/hub')}
              className="absolute right-0 top-4 px-3 py-1 bg-white text-[#242b3d] font-black text-xs uppercase tracking-wider rounded-l-full shadow-md border-l-2 border-y-2 border-slate-300 hover:bg-slate-100 active:scale-95 transition cursor-pointer z-30"
            >
              EXIT
            </button>

            {/* 8x8 Enemy Grid */}
            <div className="w-full aspect-square max-w-[340px] bg-[#4a90e2] p-1.5 rounded-2xl border-2 border-[#2c3e50] grid grid-cols-8 grid-rows-8 gap-1.5 relative shadow-inner">
              {Array.from({ length: 64 }).map((_, idx) => (
                <div key={idx} className="w-full h-full bg-[#34495e] rounded-[5px]" />
              ))}
            </div>

            {/* Ship silhouettes row */}
            <div className="w-full max-w-[340px] mt-3 flex items-center justify-between px-2">
              {SHIP_DEFS.map((def) => (
                <MiniShipSilhouette key={def.type} type={def.type} color="#00bcd4" />
              ))}
            </div>
          </div>

          {/* Bottom Half: Solid Blue Banner with "Bot is placing ships" */}
          <div className="bg-[#2980b9] p-10 flex flex-col items-center justify-center min-h-[220px] space-y-4 text-center">
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {opponent?.username || 'Bot'} is placing ships
            </h3>
            <div className="flex space-x-2">
              <span className="w-3 h-3 bg-white rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-3 h-3 bg-white rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-3 h-3 bg-white rounded-full animate-bounce" />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. DUAL BATTLE ARENA (Exact recreation of Screenshots 1, 2, 3 on 8x8 Grid) */}
      {/* ========================================================================= */}
      {isBattle && (
        <div
          className={`w-full max-w-[420px] rounded-[32px] overflow-hidden shadow-2xl border-4 border-[#1e272e] flex flex-col relative transition-all duration-300 ${
            !isMyTurn
              ? 'ring-8 ring-cyan-400 shadow-[0_0_40px_rgba(34,211,238,0.7)]'
              : ''
          }`}
        >
          {/* Flying Cannonball Projectile Animation (Screenshots 1 & 3) */}
          {flyingCannonball && (
            <div
              style={{
                position: 'absolute',
                left: `${flyingCannonball.startX}px`,
                top: `${flyingCannonball.startY}px`,
                zIndex: 50,
                transform: 'translate(-50%, -50%)',
                animation: 'flyCannonball 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
                ['--target-x' as any]: `${flyingCannonball.targetX - flyingCannonball.startX}px`,
                ['--target-y' as any]: `${flyingCannonball.targetY - flyingCannonball.startY}px`,
              }}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#4a4a4a] via-[#1a1a1a] to-black border-2 border-black shadow-[0_10px_20px_rgba(0,0,0,0.6)] pointer-events-none flex items-center justify-center"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-white/40 -translate-x-1 -translate-y-1" />
            </div>
          )}

          <style>{`
            @keyframes flyCannonball {
              0% {
                transform: translate(-50%, -50%) scale(0.85);
              }
              50% {
                transform: translate(calc(-50% + var(--target-x) * 0.5), calc(-50% + var(--target-y) * 0.5)) scale(1.2);
              }
              100% {
                transform: translate(calc(-50% + var(--target-x)), calc(-50% + var(--target-y))) scale(1.0);
              }
            }
          `}</style>

          {/* ===================================================================== */}
          {/* TOP FIELD: OPPONENT WATERS (Blue Ocean Theme, Screenshots 1, 2, 3)    */}
          {/* ===================================================================== */}
          <div
            ref={topBoardRef}
            className="bg-[#5dade2] p-3 sm:p-4 flex flex-col items-center justify-center relative border-b-2 border-[#1e272e]"
          >
            {/* Opponent Turn Banner & Glow Header (Screenshot 3) */}
            {!isMyTurn ? (
              <div className="w-full pt-1 pb-2 text-center">
                <h3 className="text-2xl sm:text-3xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] tracking-tight">
                  {opponent?.username || 'Bot'}'s Turn
                </h3>
              </div>
            ) : (
              <div className="h-4" />
            )}

            {/* Opponent Top-Down Cannon (ONLY visible when opponent is firing or on opponent turn, Screenshot 3) */}
            <div
              ref={enemyCannonRef}
              className={`transition-all duration-300 ${
                !isMyTurn || isEnemyFiring
                  ? 'opacity-100 translate-y-0 h-16 sm:h-20 mb-1'
                  : 'opacity-0 -translate-y-6 h-0 overflow-hidden pointer-events-none'
              }`}
            >
              <CartoonCannon isFiring={isEnemyFiring} isEnemy={true} />
            </div>

            {/* 8x8 Enemy Grid with Large, Readable Blocks */}
            <div className="w-full aspect-square max-w-[350px] bg-[#4a90e2] p-1.5 rounded-2xl border-2 border-[#2c3e50] grid grid-cols-8 grid-rows-8 gap-1.5 relative shadow-inner">
              {Array.from({ length: 64 }).map((_, idx) => {
                const r = Math.floor(idx / GRID_SIZE);
                const c = idx % GRID_SIZE;
                const key = `${r}-${c}`;
                const att = myAttackResultsMap.get(key);
                const isHit = att && (att.result === 'HIT' || att.result === 'SUNK');
                const isMiss = att && att.result === 'MISS';
                const isTargetHover = aimTarget && aimTarget.row === r && aimTarget.col === c;

                return (
                  <div
                    key={idx}
                    onClick={() => handleFireAttack(r, c)}
                    className={`w-full h-full rounded-[5px] relative flex items-center justify-center transition-all ${
                      isHit
                        ? 'bg-[#1e272e] z-10 shadow-inner' // Charred hit square
                        : isMiss
                        ? 'bg-[#34495e]' // Miss cell
                        : isMyTurn && !disabled && game.status === 'PLAYING'
                        ? 'bg-[#34495e] hover:bg-[#415b76] cursor-crosshair active:scale-95'
                        : 'bg-[#34495e] cursor-default'
                    }`}
                  >
                    {/* Aiming Reticle Crosshair (Exact from Screenshot 1) */}
                    {isTargetHover && isPlayerFiring && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                        <div className="w-8 h-8 rounded-full border-2 border-white relative flex items-center justify-center animate-pulse">
                          <div className="w-10 h-0.5 bg-white absolute" />
                          <div className="h-10 w-0.5 bg-white absolute" />
                        </div>
                      </div>
                    )}

                    {/* Miss Marker: Subtle Grey ✖ (Screenshot 1) */}
                    {isMiss && (
                      <span className="text-[#95a5a6] font-black text-base sm:text-lg select-none leading-none">
                        ✖
                      </span>
                    )}

                    {/* Hit Marker: Two Overlapping 45-deg Orange & Yellow Diamonds (Screenshot 1 & 3) */}
                    {isHit && (
                      <div className="relative flex items-center justify-center select-none">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 bg-[#f39c12] rotate-45 rounded-[2px] shadow-[0_0_8px_#f1c40f] animate-pulse" />
                        <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 bg-[#e74c3c] rotate-45 rounded-[1px] absolute" />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* End-Game: Opponent Fleet Reveal on 8x8 Grid */}
              {game.status === 'FINISHED' &&
                game.shipFleets?.[opponentUserId]?.map((ship) => {
                  const isHoriz = ship.orientation === 'HORIZONTAL';
                  const def = SHIP_DEFS.find((d) => d.type === ship.shipType)!;
                  const leftPct = ship.col * CELL_PCT;
                  const topPct = ship.row * CELL_PCT;
                  const widthPct = isHoriz ? def.size * CELL_PCT : CELL_PCT;
                  const heightPct = isHoriz ? CELL_PCT : def.size * CELL_PCT;

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
                      className="p-1 pointer-events-none"
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
          {/* CENTER DIVIDER BAR (Fleet Silhouettes & Score Indicator, Image 1, 2)  */}
          {/* ===================================================================== */}
          <div className="bg-[#ecf0f1] py-1.5 px-0 flex items-center justify-between border-y-2 border-[#1e272e] shadow-xs relative z-20">
            {/* Left Semi-Circular Score Tab (Screenshot 1 & 2) */}
            <div className="px-3 py-1 bg-white rounded-r-full border-r-2 border-y-2 border-slate-300 shadow-md flex items-center space-x-1">
              <span className="font-black text-sm text-[#2980b9] leading-none">
                {opponentSunkShips.length}
              </span>
              <span className="text-slate-400 font-black text-xs leading-none">•</span>
              <span className="font-black text-sm text-[#c0392b] leading-none">
                {mySunkShips.length}
              </span>
            </div>

            {/* Central Two-Row Fleet Silhouette Matrix (Exact match of Screenshots 1, 2, 3) */}
            <div className="flex flex-col items-center space-y-1">
              {/* Row 1: Opponent 5 Ships (Blue) */}
              <div className="flex items-center space-x-1.5">
                {SHIP_DEFS.map((def) => {
                  const isSunk = opponentSunkShips.includes(def.type);
                  return (
                    <MiniShipSilhouette
                      key={`opp-${def.type}`}
                      type={def.type}
                      color="#00bcd4"
                      isSunk={isSunk}
                    />
                  );
                })}
              </div>

              {/* Row 2: Player 5 Ships (Red) */}
              <div className="flex items-center space-x-1.5">
                {SHIP_DEFS.slice().reverse().map((def) => {
                  const isSunk = mySunkShips.includes(def.type);
                  return (
                    <MiniShipSilhouette
                      key={`my-${def.type}`}
                      type={def.type}
                      color="#ea5b48"
                      isSunk={isSunk}
                    />
                  );
                })}
              </div>
            </div>

            {/* Right Semi-Circular EXIT Pill Tab (Screenshot 1 & 2) */}
            <button
              onClick={() => navigate('/hub')}
              className="px-3 py-1 bg-white hover:bg-slate-100 text-[#1e272e] font-black text-xs uppercase tracking-wider rounded-l-full border-l-2 border-y-2 border-slate-300 shadow-md active:scale-95 transition cursor-pointer"
            >
              EXIT
            </button>
          </div>

          {/* ===================================================================== */}
          {/* BOTTOM FIELD: PLAYER WATERS (Coral / Terracotta 8x8 Grid Theme)       */}
          {/* ===================================================================== */}
          <div
            ref={bottomBoardRef}
            className="bg-[#e08b73] p-3 sm:p-4 flex flex-col items-center justify-center relative pb-16 sm:pb-20"
          >
            {/* 8x8 Player Grid with Large Blocks */}
            <div className="w-full aspect-square max-w-[350px] bg-[#d37861] p-1.5 rounded-2xl border-2 border-[#8d4d3d] grid grid-cols-8 grid-rows-8 gap-1.5 relative shadow-inner">
              {Array.from({ length: 64 }).map((_, idx) => {
                const r = Math.floor(idx / GRID_SIZE);
                const c = idx % GRID_SIZE;
                const key = `${r}-${c}`;
                const att = opponentAttackResultsMap.get(key);
                const isHit = att && (att.result === 'HIT' || att.result === 'SUNK');
                const isMiss = att && att.result === 'MISS';

                return (
                  <div
                    key={idx}
                    className={`w-full h-full rounded-[5px] relative flex items-center justify-center select-none ${
                      isHit
                        ? 'bg-[#111827] z-20 shadow-inner' // Charred square on player ship
                        : isMiss
                        ? 'bg-[#7a3b2e]'
                        : 'bg-[#9c5240]'
                    }`}
                  >
                    {isMiss && (
                      <span className="text-[#d5b0a8] font-black text-base sm:text-lg leading-none">
                        ✖
                      </span>
                    )}

                    {isHit && (
                      <div className="relative flex items-center justify-center">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 bg-[#f39c12] rotate-45 rounded-[2px] shadow-[0_0_8px_#f1c40f] animate-pulse" />
                        <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 bg-[#e74c3c] rotate-45 rounded-[1px] absolute" />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Player Placed Ships (Drawn over 8x8 grid) */}
              {myFleet.map((ship) => {
                const isHoriz = ship.orientation === 'HORIZONTAL';
                const def = SHIP_DEFS.find((d) => d.type === ship.shipType)!;
                const leftPct = ship.col * CELL_PCT;
                const topPct = ship.row * CELL_PCT;
                const widthPct = isHoriz ? def.size * CELL_PCT : CELL_PCT;
                const heightPct = isHoriz ? CELL_PCT : def.size * CELL_PCT;

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
                    className="p-1 pointer-events-none"
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

            {/* Giant 3D Cartoon Cannon at Bottom (Overlapping bottom board, Screenshots 1 & 2) */}
            <div
              ref={playerCannonRef}
              className="absolute -bottom-4 left-1/2 -translate-x-1/2 z-25 pointer-events-none"
            >
              <CartoonCannon
                isFiring={isPlayerFiring}
                aimAngle={aimTarget ? (aimTarget.col - 3.5) * 8 : 0}
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
