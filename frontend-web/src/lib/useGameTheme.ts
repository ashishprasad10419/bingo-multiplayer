import { useLocation, useSearchParams } from 'react-router-dom';
import { useGameStore } from '../state/gameStore';
import { GameType } from './types';
import { getGameTheme, GameThemeConfig } from './gameThemes';

export const useGameTheme = (): GameThemeConfig => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { game, room } = useGameStore();

  // 1. Check query param if on create-room
  const queryGame = searchParams.get('game') as GameType | null;
  if (queryGame && ['BINGO', 'TIC_TAC_TOE', 'DOTS_AND_BOXES'].includes(queryGame)) {
    return getGameTheme(queryGame);
  }

  // 2. Check active game or room from store if in game / lobby / setup
  const isMatchRoute =
    location.pathname.startsWith('/game') ||
    location.pathname.startsWith('/lobby') ||
    location.pathname.startsWith('/setup');

  if (isMatchRoute) {
    if (game?.gameType) return getGameTheme(game.gameType);
    if (room?.gameType) return getGameTheme(room.gameType);
  }

  // 3. Fallback to default Arcade theme
  return getGameTheme('DEFAULT');
};
