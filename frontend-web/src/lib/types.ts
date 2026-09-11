export interface UserStats {
  gamesPlayed: number;
  gamesWon: number;
  currentWinStreak: number;
  bestWinStreak: number;
}

export interface User {
  id: string;
  username: string;
  email?: string;
  authProvider?: string;
  isGuest: boolean;
  avatar: string;
  stats: UserStats;
  level: number;
  xp: number;
}

export interface RoomPlayer {
  userId: string;
  username: string;
  avatar?: string;
  isGuest: boolean;
  ready: boolean;
  board?: number[][];
  boardLocked: boolean;
}

export type RoomStatus = 'WAITING' | 'BOARD_SETUP' | 'READY' | 'PLAYING' | 'FINISHED' | 'CANCELLED';

export interface Room {
  id: string;
  roomCode: string;
  hostId: string;
  status: RoomStatus;
  boardSize: number;
  winningLines: number;
  maxPlayers: number;
  players: RoomPlayer[];
  createdAt: string;
}

export type ConnectionStatus = 'CONNECTED' | 'DISCONNECTED';

export interface GamePlayer {
  userId: string;
  username: string;
  avatar?: string;
  isGuest: boolean;
  board: number[][];
  locked: boolean;
  lineCount: number;
  connectionStatus: ConnectionStatus;
}

export interface CalledNumberRecord {
  number: number;
  calledByUserId: string;
  calledByUsername?: string;
}

export interface Game {
  id: string;
  roomCode: string;
  boardSize: number;
  winningLines: number;
  status: 'PLAYING' | 'FINISHED' | 'ABANDONED';
  players: GamePlayer[];
  calledNumbers: number[];
  moves?: CalledNumberRecord[];
  currentTurnUserId: string;
  currentPlayerIndex: number;
  moveNumber: number;
  winnerId?: string;
  startedAt?: string;
  finishedAt?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  conditionType: 'TOTAL_WINS' | 'WIN_STREAK' | 'GAMES_PLAYED';
  requiredValue: number;
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  earnedAt: string;
}

export interface GameHistory {
  id: string;
  gameId: string;
  roomCode: string;
  players: string[];
  winnerId: string;
  winnerUsername: string;
  boardSize: number;
  totalMoves: number;
  startedAt: string;
  finishedAt: string;
  durationSeconds: number;
}

export interface GameEventEnvelope<T = any> {
  type: string;
  roomCode: string;
  gameId?: string;
  timestamp: number;
  data: T;
}

export interface ActiveEmote {
  id: string;
  userId: string;
  username: string;
  emote: string;
  timestamp: number;
}
