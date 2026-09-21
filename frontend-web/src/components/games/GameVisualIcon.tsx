import React from 'react';
import { GameType } from '../../lib/types';

interface GameVisualIconProps {
  type: GameType;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const GameVisualIcon: React.FC<GameVisualIconProps> = ({
  type,
  size = 'md',
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
  };

  const dim = sizeMap[size];

  if (type === 'TIC_TAC_TOE') {
    return (
      <div className={`relative flex items-center justify-center ${dim} ${className}`}>
        <svg viewBox="0 0 64 64" fill="none" className="w-full h-full drop-shadow-md">
          <defs>
            <linearGradient id="ttt-x-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff758c" />
              <stop offset="100%" stopColor="#ff4b6e" />
            </linearGradient>
            <linearGradient id="ttt-o-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
            <filter id="clay-soft" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#000" floodOpacity="0.18" />
            </filter>
          </defs>

          {/* O Ring - Behind / Overlapping */}
          <circle
            cx="40"
            cy="24"
            r="15"
            stroke="url(#ttt-o-grad)"
            strokeWidth="7.5"
            strokeLinecap="round"
            fill="none"
            filter="url(#clay-soft)"
          />
          {/* Inner shiny highlight on O */}
          <circle
            cx="37"
            cy="21"
            r="12"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="14 40"
            fill="none"
            opacity="0.6"
          />

          {/* X Cross - Front Pill Caps */}
          <path
            d="M14 50 L34 30 M34 50 L14 30"
            stroke="url(#ttt-x-grad)"
            strokeWidth="7.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#clay-soft)"
          />
          {/* X Highlights */}
          <path
            d="M16 48 L32 32"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.55"
          />

          {/* Sparkles */}
          <circle cx="16" cy="16" r="2.5" fill="#fde047" className="animate-pulse" />
        </svg>
      </div>
    );
  }

  if (type === 'DOTS_AND_BOXES') {
    return (
      <div className={`relative flex items-center justify-center ${dim} ${className}`}>
        <svg viewBox="0 0 64 64" fill="none" className="w-full h-full drop-shadow-md">
          <defs>
            <linearGradient id="dot-box-fill" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="line-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
            <filter id="dot-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#000" floodOpacity="0.2" />
            </filter>
          </defs>

          {/* Claimed Box Background */}
          <rect
            x="16"
            y="16"
            width="32"
            height="32"
            rx="8"
            fill="url(#dot-box-fill)"
            filter="url(#dot-shadow)"
          />

          {/* Shiny Box Gloss */}
          <path
            d="M 18 24 Q 32 18 46 22"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.45"
          />

          {/* Cheerful Centered Star in Captured Box */}
          <polygon
            points="32,24 34.5,29.5 40.5,30 36,34 37.5,40 32,36.5 26.5,40 28,34 23.5,30 29.5,29.5"
            fill="#ffffff"
            filter="url(#dot-shadow)"
          />

          {/* Connecting Active Lines */}
          <line x1="16" y1="16" x2="48" y2="16" stroke="url(#line-grad)" strokeWidth="4.5" strokeLinecap="round" />
          <line x1="16" y1="48" x2="48" y2="48" stroke="url(#line-grad)" strokeWidth="4.5" strokeLinecap="round" />
          <line x1="16" y1="16" x2="16" y2="48" stroke="url(#line-grad)" strokeWidth="4.5" strokeLinecap="round" />
          <line x1="48" y1="16" x2="48" y2="48" stroke="url(#line-grad)" strokeWidth="4.5" strokeLinecap="round" />

          {/* 4 Corner 3D Clay Spherical Dots */}
          <circle cx="16" cy="16" r="6" fill="#f8fafc" filter="url(#dot-shadow)" />
          <circle cx="15" cy="14.5" r="2" fill="#ffffff" />

          <circle cx="48" cy="16" r="6" fill="#f8fafc" filter="url(#dot-shadow)" />
          <circle cx="47" cy="14.5" r="2" fill="#ffffff" />

          <circle cx="16" cy="48" r="6" fill="#f8fafc" filter="url(#dot-shadow)" />
          <circle cx="15" cy="46.5" r="2" fill="#ffffff" />

          <circle cx="48" cy="48" r="6" fill="#f8fafc" filter="url(#dot-shadow)" />
          <circle cx="47" cy="46.5" r="2" fill="#ffffff" />
        </svg>
      </div>
    );
  }

  if (type === 'CONNECT_FOUR') {
    return (
      <div className={`relative flex items-center justify-center ${dim} ${className}`}>
        <svg viewBox="0 0 64 64" fill="none" className="w-full h-full drop-shadow-md">
          <defs>
            <linearGradient id="c4-blue" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>
            <radialGradient id="c4-red" cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#f87171" />
              <stop offset="100%" stopColor="#dc2626" />
            </radialGradient>
            <radialGradient id="c4-yellow" cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="100%" stopColor="#eab308" />
            </radialGradient>
          </defs>
          <rect x="8" y="10" width="48" height="46" rx="8" fill="url(#c4-blue)" />
          <circle cx="21" cy="23" r="7" fill="url(#c4-red)" />
          <circle cx="21" cy="41" r="7" fill="url(#c4-yellow)" />
          <circle cx="43" cy="23" r="7" fill="url(#c4-yellow)" />
          <circle cx="43" cy="41" r="7" fill="url(#c4-red)" />
          <circle cx="19" cy="20" r="2" fill="#ffffff" opacity="0.6" />
          <circle cx="41" cy="38" r="2" fill="#ffffff" opacity="0.6" />
        </svg>
      </div>
    );
  }

  if (type === 'ROCK_PAPER_SCISSORS') {
    return (
      <div className={`relative flex items-center justify-center ${dim} ${className}`}>
        <span className="text-3xl select-none filter drop-shadow-md">✊✌️</span>
      </div>
    );
  }

  if (type === 'MEMORY') {
    return (
      <div className={`relative flex items-center justify-center ${dim} ${className}`}>
        <span className="text-3xl select-none filter drop-shadow-md">🃏✨</span>
      </div>
    );
  }

  if (type === 'NUMBER_RUSH') {
    return (
      <div className={`relative flex items-center justify-center ${dim} ${className}`}>
        <span className="text-3xl select-none filter drop-shadow-md">🔢⚡</span>
      </div>
    );
  }

  if (type === 'WORD_SCRAMBLE') {
    return (
      <div className={`relative flex items-center justify-center ${dim} ${className}`}>
        <span className="text-3xl select-none filter drop-shadow-md">📝🔤</span>
      </div>
    );
  }

  if (type === 'SHIP_BATTLE') {
    return (
      <div className={`relative flex items-center justify-center ${dim} ${className}`}>
        <svg viewBox="0 0 64 64" fill="none" className="w-full h-full drop-shadow-md">
          <defs>
            <linearGradient id="ship-hull" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="ocean-wave" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="50%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0369a1" />
            </linearGradient>
            <linearGradient id="cannon-blast" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
          </defs>

          {/* Radar circle background */}
          <circle cx="32" cy="32" r="26" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.35" />
          <circle cx="32" cy="32" r="16" stroke="#38bdf8" strokeWidth="1" strokeDasharray="2 2" opacity="0.25" />
          <line x1="32" y1="6" x2="32" y2="58" stroke="#38bdf8" strokeWidth="1" opacity="0.2" />
          <line x1="6" y1="32" x2="58" y2="32" stroke="#38bdf8" strokeWidth="1" opacity="0.2" />

          {/* Ocean waves */}
          <path
            d="M 6 48 Q 16 44 26 48 T 46 48 T 60 48 L 60 56 L 6 56 Z"
            fill="url(#ocean-wave)"
            opacity="0.8"
          />

          {/* Warship Hull */}
          <path
            d="M 8 44 L 14 36 L 50 36 L 56 44 Z"
            fill="url(#ship-hull)"
            filter="drop-shadow(0 2px 3px rgba(0,0,0,0.3))"
          />
          {/* Hull Highlight */}
          <line x1="15" y1="38" x2="49" y2="38" stroke="#7dd3fc" strokeWidth="1" opacity="0.6" strokeLinecap="round" />

          {/* Bridge & Cabin */}
          <rect x="24" y="26" width="16" height="10" rx="2" fill="#0369a1" />
          <rect x="28" y="20" width="8" height="6" rx="1.5" fill="#0284c7" />
          {/* Radar mast */}
          <line x1="32" y1="20" x2="32" y2="13" stroke="#f8fafc" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="32" cy="13" r="2" fill="#fde047" />

          {/* Gun Turret & Cannon */}
          <rect x="42" y="32" width="7" height="4" rx="1" fill="#0f172a" />
          <line x1="47" y1="33" x2="57" y2="30" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
          {/* Cannon Muzzle Flash */}
          <circle cx="58" cy="29" r="3.5" fill="url(#cannon-blast)" className="animate-pulse" />
          <circle cx="58" cy="29" r="1.5" fill="#ffffff" />
        </svg>
      </div>
    );
  }

  if (type === 'MASTERMIND') {
    return (
      <div className={`relative flex items-center justify-center ${dim} ${className}`}>
        <svg viewBox="0 0 64 64" fill="none" className="w-full h-full drop-shadow-md">
          {/* Mastermind decoder board */}
          <rect x="8" y="10" width="48" height="44" rx="10" fill="#1e1b4b" stroke="#818cf8" strokeWidth="2.5" />
          {/* Peg slots & colored pegs */}
          <circle cx="20" cy="24" r="6" fill="#ef4444" stroke="#fca5a5" strokeWidth="1.5" />
          <circle cx="32" cy="24" r="6" fill="#3b82f6" stroke="#93c5fd" strokeWidth="1.5" />
          <circle cx="44" cy="24" r="6" fill="#10b981" stroke="#6ee7b7" strokeWidth="1.5" />
          {/* Key feedback pegs */}
          <circle cx="20" cy="40" r="3" fill="#f59e0b" />
          <circle cx="28" cy="40" r="3" fill="#ffffff" />
          <circle cx="36" cy="40" r="3" fill="#ef4444" />
          <circle cx="44" cy="40" r="3" fill="#6366f1" />
        </svg>
      </div>
    );
  }

  if (type === 'LUDO') {
    return (
      <div className={`relative flex items-center justify-center ${dim} ${className}`}>
        <svg viewBox="0 0 64 64" fill="none" className="w-full h-full drop-shadow-md">
          <rect x="8" y="8" width="48" height="48" rx="8" fill="#ffffff" stroke="#e2e8f0" strokeWidth="2" />
          {/* 4 Quadrants: Red, Green, Yellow, Blue */}
          <rect x="10" y="10" width="20" height="20" rx="4" fill="#ef4444" />
          <rect x="34" y="10" width="20" height="20" rx="4" fill="#22c55e" />
          <rect x="10" y="34" width="20" height="20" rx="4" fill="#3b82f6" />
          <rect x="34" y="34" width="20" height="20" rx="4" fill="#eab308" />
          {/* Center dice */}
          <rect x="25" y="25" width="14" height="14" rx="3" fill="#1e293b" />
          <circle cx="32" cy="32" r="2" fill="#ffffff" />
        </svg>
      </div>
    );
  }

  if (type === 'DETECTIVE_MYSTERY') {
    return (
      <div className={`relative flex items-center justify-center ${dim} ${className}`}>
        <svg viewBox="0 0 64 64" fill="none" className="w-full h-full drop-shadow-md">
          {/* Magnifying glass & fingerprint */}
          <circle cx="28" cy="28" r="16" stroke="#ca8a04" strokeWidth="4.5" fill="#fef08a" fillOpacity="0.3" />
          <line x1="39" y1="39" x2="54" y2="54" stroke="#854d0e" strokeWidth="6" strokeLinecap="round" />
          <circle cx="28" cy="28" r="8" stroke="#ca8a04" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
          <circle cx="28" cy="28" r="3" fill="#ca8a04" />
        </svg>
      </div>
    );
  }

  if (type === 'SUDOKU_BATTLE') {
    return (
      <div className={`relative flex items-center justify-center ${dim} ${className}`}>
        <svg viewBox="0 0 64 64" fill="none" className="w-full h-full drop-shadow-md">
          <rect x="8" y="8" width="48" height="48" rx="8" fill="#f8fafc" stroke="#6366f1" strokeWidth="2.5" />
          <line x1="24" y1="8" x2="24" y2="56" stroke="#6366f1" strokeWidth="2" />
          <line x1="40" y1="8" x2="40" y2="56" stroke="#6366f1" strokeWidth="2" />
          <line x1="8" y1="24" x2="56" y2="24" stroke="#6366f1" strokeWidth="2" />
          <line x1="8" y1="40" x2="56" y2="40" stroke="#6366f1" strokeWidth="2" />
          <text x="16" y="20" fontSize="10" fontWeight="900" fill="#4f46e5" textAnchor="middle">7</text>
          <text x="32" y="36" fontSize="11" fontWeight="900" fill="#ec4899" textAnchor="middle">5</text>
          <text x="48" y="52" fontSize="10" fontWeight="900" fill="#06b6d4" textAnchor="middle">9</text>
        </svg>
      </div>
    );
  }

  if (type === 'BATTLE_2048') {
    return (
      <div className={`relative flex items-center justify-center ${dim} ${className}`}>
        <svg viewBox="0 0 64 64" fill="none" className="w-full h-full drop-shadow-md">
          <rect x="8" y="8" width="48" height="48" rx="10" fill="#bbada0" />
          <rect x="12" y="12" width="18" height="18" rx="4" fill="#eee4da" />
          <rect x="34" y="12" width="18" height="18" rx="4" fill="#ede0c8" />
          <rect x="12" y="34" width="18" height="18" rx="4" fill="#f2b179" />
          <rect x="34" y="34" width="18" height="18" rx="4" fill="#edc22e" />
          <text x="43" y="47" fontSize="9" fontWeight="900" fill="#ffffff" textAnchor="middle">2048</text>
        </svg>
      </div>
    );
  }

  if (type === 'CHECKERS') {
    return (
      <div className={`relative flex items-center justify-center ${dim} ${className}`}>
        <svg viewBox="0 0 64 64" fill="none" className="w-full h-full drop-shadow-md">
          <rect x="8" y="8" width="48" height="48" rx="8" fill="#78350f" stroke="#b45309" strokeWidth="2" />
          {/* Checkered pattern */}
          <rect x="8" y="8" width="24" height="24" fill="#fef3c7" />
          <rect x="32" y="32" width="24" height="24" fill="#fef3c7" />
          {/* Crown piece */}
          <circle cx="20" cy="20" r="8" fill="#dc2626" stroke="#fecaca" strokeWidth="1.5" />
          <circle cx="44" cy="44" r="8" fill="#1e293b" stroke="#94a3b8" strokeWidth="1.5" />
          <path d="M 17 21 L 18 17 L 20 19 L 22 17 L 23 21 Z" fill="#fbbf24" />
        </svg>
      </div>
    );
  }

  if (type === 'CARD_BATTLE') {
    return (
      <div className={`relative flex items-center justify-center ${dim} ${className}`}>
        <svg viewBox="0 0 64 64" fill="none" className="w-full h-full drop-shadow-md">
          {/* Overlapping duel cards */}
          <rect x="12" y="14" width="24" height="36" rx="5" fill="#f43f5e" stroke="#ffe4e6" strokeWidth="2" transform="rotate(-10 24 32)" />
          <rect x="28" y="14" width="24" height="36" rx="5" fill="#0ea5e9" stroke="#e0f2fe" strokeWidth="2" transform="rotate(10 40 32)" />
          <circle cx="23" cy="30" r="5" fill="#ffffff" />
          <polygon points="40,25 43,32 37,32" fill="#ffffff" />
        </svg>
      </div>
    );
  }

  if (type === 'CHESS') {
    return (
      <div className={`relative flex items-center justify-center ${dim} ${className}`}>
        <svg viewBox="0 0 64 64" fill="none" className="w-full h-full drop-shadow-md">
          <circle cx="32" cy="32" r="26" fill="#312e81" stroke="#a5b4fc" strokeWidth="2" />
          {/* Chess Knight / Queen Crown */}
          <path
            d="M 32 14 L 35 22 L 43 18 L 40 28 L 48 30 L 42 38 L 44 46 L 32 42 L 20 46 L 22 38 L 16 30 L 24 28 L 21 18 L 29 22 Z"
            fill="#facc15"
            stroke="#eab308"
            strokeWidth="1.5"
          />
          <circle cx="32" cy="28" r="3" fill="#ffffff" />
        </svg>
      </div>
    );
  }

  if (type === 'PIRATE_BATTLE') {
    return (
      <div className={`relative flex items-center justify-center ${dim} ${className}`}>
        <svg viewBox="0 0 64 64" fill="none" className="w-full h-full drop-shadow-md">
          {/* Pirate skull & crossed cutlasses */}
          <circle cx="32" cy="30" r="24" fill="#0f172a" stroke="#f59e0b" strokeWidth="2" />
          {/* Crossed swords */}
          <line x1="16" y1="46" x2="48" y2="18" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
          <line x1="16" y1="18" x2="48" y2="46" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
          {/* Skull */}
          <circle cx="32" cy="28" r="10" fill="#f8fafc" />
          <circle cx="28" cy="27" r="2.5" fill="#0f172a" />
          <circle cx="36" cy="27" r="2.5" fill="#0f172a" />
          <rect x="29" y="34" width="6" height="5" rx="1" fill="#f8fafc" />
        </svg>
      </div>
    );
  }

  // Default: BINGO
  return (
    <div className={`relative flex items-center justify-center ${dim} ${className}`}>
      <svg viewBox="0 0 64 64" fill="none" className="w-full h-full drop-shadow-md">
        <defs>
          <radialGradient id="bingo-sphere" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#ff9a9e" />
            <stop offset="45%" stopColor="#f8788a" />
            <stop offset="100%" stopColor="#e11d48" />
          </radialGradient>
          <linearGradient id="mini-ball" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#6d5ebd" />
          </linearGradient>
          <filter id="ball-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="2" floodColor="#000" floodOpacity="0.22" />
          </filter>
        </defs>

        {/* Secondary floating ball in background */}
        <circle cx="48" cy="20" r="11" fill="url(#mini-ball)" filter="url(#ball-shadow)" />
        <circle cx="45" cy="17" r="3.5" fill="#ffffff" opacity="0.4" />
        <text x="48" y="24" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="900" fontFamily="sans-serif">
          7
        </text>

        {/* Main 3D Glossy Bingo Ball */}
        <circle cx="28" cy="36" r="22" fill="url(#bingo-sphere)" filter="url(#ball-shadow)" />

        {/* Gloss highlight arc on main ball */}
        <path
          d="M 15 28 A 16 16 0 0 1 38 20"
          stroke="#ffffff"
          strokeWidth="3.5"
          strokeLinecap="round"
          opacity="0.5"
        />

        {/* Inner White Badge with 'B' */}
        <circle cx="28" cy="36" r="11.5" fill="#ffffff" />
        <text
          x="28"
          y="42"
          textAnchor="middle"
          fill="#e11d48"
          fontSize="16"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          B
        </text>

        {/* Celebratory sparkles */}
        <circle cx="10" cy="16" r="2" fill="#fde047" className="animate-pulse" />
        <circle cx="56" cy="46" r="2.5" fill="#fde047" />
      </svg>
    </div>
  );
};
