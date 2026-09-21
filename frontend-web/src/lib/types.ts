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

export type GameType =
  | 'BINGO'
  | 'TIC_TAC_TOE'
  | 'DOTS_AND_BOXES'
  | 'CONNECT_FOUR'
  | 'ROCK_PAPER_SCISSORS'
  | 'MEMORY'
  | 'NUMBER_RUSH'
  | 'WORD_SCRAMBLE'
  | 'SHIP_BATTLE'
  | 'MASTERMIND'
  | 'LUDO'
  | 'DETECTIVE_MYSTERY'
  | 'SUDOKU_BATTLE'
  | 'BATTLE_2048'
  | 'CHECKERS'
  | 'CARD_BATTLE'
  | 'CHESS'
  | 'PIRATE_BATTLE';

export type RoomStatus = 'WAITING' | 'BOARD_SETUP' | 'READY' | 'PLAYING' | 'FINISHED' | 'CANCELLED';

export interface Room {
  id: string;
  roomCode: string;
  hostId: string;
  status: RoomStatus;
  gameType?: GameType;
  bingoMode?: 'CLASSIC' | 'SPEED' | 'BLACKOUT';
  boardSize: number;
  winningLines: number;
  maxPlayers: number;
  players: RoomPlayer[];
  createdAt: string;
}

export type ConnectionStatus = 'CONNECTED' | 'DISCONNECTED';
export type NetworkConnectionStatus = 'CONNECTED' | 'RECONNECTING' | 'DISCONNECTED';

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
  gameType?: GameType;
  bingoMode?: 'CLASSIC' | 'SPEED' | 'BLACKOUT';
  boardSize: number;
  winningLines: number;
  status: 'PLAYING' | 'FINISHED' | 'ABANDONED';
  players: GamePlayer[];
  calledNumbers: number[];
  moves?: CalledNumberRecord[];
  currentTurnUserId: string;
  currentPlayerIndex: number;
  moveNumber: number;
  version?: number;
  winnerId?: string;
  startedAt?: string;
  finishedAt?: string;

  // Tic-Tac-Toe state
  tttGridSize?: number;
  tttBoard?: string[];

  // Dots & Boxes state
  dotsGridSize?: number;
  horizontalLines?: string[];
  verticalLines?: string[];
  completedBoxes?: Record<string, string>;
  playerScores?: Record<string, number>;
  lineOwners?: Record<string, string>;

  // Connect Four
  c4Cols?: number;
  c4Rows?: number;
  c4Board?: string[];
  c4WinningCells?: number[];

  // Rock Paper Scissors
  rpsRound?: number;
  rpsTargetWins?: number;
  rpsChoices?: Record<string, string>;
  rpsRoundWins?: Record<string, number>;
  rpsLastRoundResult?: any;

  // Memory
  memoryCards?: string[];
  memoryMatched?: boolean[];
  memoryFlippedIndices?: number[];

  // Number Rush
  numberRushBoards?: Record<string, number[]>;
  numberRushProgress?: Record<string, number>;

  // Word Scramble
  scrambleWords?: string[];
  scrambleHints?: string[];
  scrambleJumbled?: string[];
  scrambleCurrentRound?: number;
  scrambleLastWinnerId?: string;
  scrambleLastSolveResult?: ScrambleSolveRecord;
  scrambleRoundHistory?: ScrambleSolveRecord[];

  // Quiz Battle
  quizQuestions?: string[];
  quizOptions?: string[][];
  quizCorrectIndices?: number[];
  quizCurrentQuestion?: number;
  quizAnswers?: Record<string, number>;
  quizLastRoundResult?: { questionIndex: number; correctIndex: number };
  scrambleLastIncorrectGuess?: { userId: string; guess: string; timestamp: number };

  // Ship Battle State
  shipPhase?: 'SETUP' | 'BATTLE';
  shipFleets?: Record<string, ShipPlacement[]>;
  shipFleetsLocked?: Record<string, boolean>;
  shipAttacks?: Record<string, ShipAttack[]>;
  shipSunkTypes?: Record<string, string[]>;
  shipLastAttackResult?: any;
}

export type ShipType = 'CARRIER' | 'BATTLESHIP' | 'CRUISER' | 'SUBMARINE' | 'DESTROYER';

export interface ShipCoordinate {
  row: number;
  col: number;
}

export interface ShipPlacement {
  shipType: string;
  row: number;
  col: number;
  orientation: 'HORIZONTAL' | 'VERTICAL';
  cells: ShipCoordinate[];
}

export interface ShipAttack {
  attackerUserId: string;
  row: number;
  col: number;
  result: 'MISS' | 'HIT' | 'SUNK';
  sunkShipType?: string;
  timestamp?: number;
}

export interface ScrambleSolveRecord {
  round: number;
  targetWord: string;
  solvedByUserId: string;
  solverUsername: string;
  pointsAwarded: number;
  timestamp: number;
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
  gameVersion?: number;
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
