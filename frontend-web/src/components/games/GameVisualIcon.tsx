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
