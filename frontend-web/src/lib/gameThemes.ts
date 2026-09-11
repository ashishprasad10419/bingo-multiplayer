import { GameType } from './types';

export interface GameThemeConfig {
  type: GameType | 'DEFAULT';
  title: string;
  brandTitle: string;
  badge: string;
  primaryColor: string;
  bgGradient: string;
  navbarBg: string;
  navbarBorder: string;
  navbarBrandGrad: string;
  navIconBg: string;
  cardBorder: string;
  accentBadgeBg: string;
  accentBadgeText: string;
  accentBadgeBorder: string;
  buttonGrad: string;
  turnBannerMyTurn: string;
  turnBannerWaiting: string;
  tickerGlow: string;
}

export const GAME_THEMES: Record<GameType | 'DEFAULT', GameThemeConfig> = {
  BINGO: {
    type: 'BINGO',
    title: 'Bingo Multiplayer',
    brandTitle: 'BINGO',
    badge: 'Classic 2-6 Players',
    primaryColor: '#f8788a',
    bgGradient: 'from-[#fed7e2] via-[#fce7f3] to-[#f3e8ff]',
    navbarBg: 'bg-white/85 border-[#fbcfe8]',
    navbarBorder: 'border-[#fbcfe8]',
    navbarBrandGrad: 'from-[#f8788a] via-[#e271a5] to-[#f43f5e]',
    navIconBg: 'from-[#f8788a] to-[#e11d48]',
    cardBorder: 'border-[#fbcfe8]',
    accentBadgeBg: 'bg-[#fee8ea]',
    accentBadgeText: 'text-[#e11d48]',
    accentBadgeBorder: 'border-[#fcd3d7]',
    buttonGrad: 'from-[#f8788a] via-[#e271a5] to-[#e11d48]',
    turnBannerMyTurn: 'bg-[#fff1f2] border-2 border-[#f43f5e] ring-4 ring-[#f43f5e]/20 shadow-[0_8px_24px_rgba(244,63,94,0.25)]',
    turnBannerWaiting: 'bg-white/90 border-[#fcd3d7]',
    tickerGlow: 'bg-[#fee8ea] border-[#fcd3d7] text-[#e11d48]',
  },
  TIC_TAC_TOE: {
    type: 'TIC_TAC_TOE',
    title: 'Tic-Tac-Toe Duel',
    brandTitle: 'TIC-TAC-TOE',
    badge: '1v1 Duel',
    primaryColor: '#8b5cf6',
    bgGradient: 'from-[#ede9fe] via-[#e0e7ff] to-[#f5d0fe]',
    navbarBg: 'bg-white/85 border-[#ddd6fe]',
    navbarBorder: 'border-[#ddd6fe]',
    navbarBrandGrad: 'from-[#8b5cf6] via-[#7c3aed] to-[#ec4899]',
    navIconBg: 'from-[#8b5cf6] to-[#ec4899]',
    cardBorder: 'border-[#ddd6fe]',
    accentBadgeBg: 'bg-[#f5f3ff]',
    accentBadgeText: 'text-[#7c3aed]',
    accentBadgeBorder: 'border-[#ddd6fe]',
    buttonGrad: 'from-[#8b5cf6] via-[#7c3aed] to-[#ec4899]',
    turnBannerMyTurn: 'bg-[#f5f3ff] border-2 border-[#8b5cf6] ring-4 ring-[#8b5cf6]/20 shadow-[0_8px_24px_rgba(139,92,246,0.25)]',
    turnBannerWaiting: 'bg-white/90 border-[#ddd6fe]',
    tickerGlow: 'bg-[#f5f3ff] border-[#ddd6fe] text-[#7c3aed]',
  },
  DOTS_AND_BOXES: {
    type: 'DOTS_AND_BOXES',
    title: 'Dots & Boxes',
    brandTitle: 'DOTS & BOXES',
    badge: 'Strategy 2-4 Players',
    primaryColor: '#10b981',
    bgGradient: 'from-[#ccfbf1] via-[#d1fae5] to-[#e0f2fe]',
    navbarBg: 'bg-white/85 border-[#a7f3d0]',
    navbarBorder: 'border-[#a7f3d0]',
    navbarBrandGrad: 'from-[#10b981] via-[#059669] to-[#0284c7]',
    navIconBg: 'from-[#10b981] to-[#0284c7]',
    cardBorder: 'border-[#a7f3d0]',
    accentBadgeBg: 'bg-[#ecfdf5]',
    accentBadgeText: 'text-[#047857]',
    accentBadgeBorder: 'border-[#a7f3d0]',
    buttonGrad: 'from-[#10b981] via-[#059669] to-[#0284c7]',
    turnBannerMyTurn: 'bg-[#ecfdf5] border-2 border-[#10b981] ring-4 ring-[#10b981]/20 shadow-[0_8px_24px_rgba(16,185,129,0.25)]',
    turnBannerWaiting: 'bg-white/90 border-[#a7f3d0]',
    tickerGlow: 'bg-[#ecfdf5] border-[#a7f3d0] text-[#047857]',
  },
  DEFAULT: {
    type: 'DEFAULT',
    title: 'Multi Arcade',
    brandTitle: 'ARCADE HUB',
    badge: 'Multiplayer Games',
    primaryColor: '#8b7fe8',
    bgGradient: 'from-[#d9d2fa] via-[#e8e2fc] to-[#fde2ea]',
    navbarBg: 'bg-white/80 border-[#ede8f8]',
    navbarBorder: 'border-[#ede8f8]',
    navbarBrandGrad: 'from-[#f8788a] via-[#e271a5] to-[#8b7fe8]',
    navIconBg: 'from-[#f8788a] via-[#e271a5] to-[#8b7fe8]',
    cardBorder: 'border-[#ede8f8]',
    accentBadgeBg: 'bg-[#f0ecfc]',
    accentBadgeText: 'text-[#6d5ebd]',
    accentBadgeBorder: 'border-[#e0d6f8]',
    buttonGrad: 'from-[#f8788a] via-[#e271a5] to-[#8b7fe8]',
    turnBannerMyTurn: 'bg-[#f0ecfc] border-2 border-[#8b7fe8] ring-4 ring-[#8b7fe8]/20 shadow-[0_8px_24px_rgba(139,127,232,0.25)]',
    turnBannerWaiting: 'bg-white/90 border-[#ede8f8]',
    tickerGlow: 'bg-[#f0ecfc] border-[#e0d6f8] text-[#6d5ebd]',
  },
};

export const getGameTheme = (gameType?: GameType | 'DEFAULT' | null): GameThemeConfig => {
  if (gameType && GAME_THEMES[gameType]) {
    return GAME_THEMES[gameType];
  }
  return GAME_THEMES.DEFAULT;
};
