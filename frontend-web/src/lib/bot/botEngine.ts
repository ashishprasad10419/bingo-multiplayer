import { Game, GameType, GamePlayer } from '../types';

export type BotDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface BotProfile {
  id: string;
  username: string;
  avatar: string;
  difficulty: BotDifficulty;
  title: string;
  badge: string;
  accentColor: string;
}

export const BOT_PROFILES: Record<BotDifficulty, BotProfile> = {
  EASY: {
    id: 'bot_easy',
    username: 'RoboEasy 🤖',
    avatar: '🤖',
    difficulty: 'EASY',
    title: 'Casual Learner',
    badge: '🟢 Friendly',
    accentColor: 'from-emerald-400 to-teal-500',
  },
  MEDIUM: {
    id: 'bot_medium',
    username: 'CyberMind 🧠',
    avatar: '🧠',
    difficulty: 'MEDIUM',
    title: 'Sharp Tactician',
    badge: '🟡 Balanced',
    accentColor: 'from-amber-400 to-orange-500',
  },
  HARD: {
    id: 'bot_hard',
    username: 'OmniBot ⚡',
    avatar: '⚡',
    difficulty: 'HARD',
    title: 'Grandmaster AI',
    badge: '🔴 Expert',
    accentColor: 'from-rose-500 to-purple-600',
  },
};

// Word bank for offline Word Scramble
const OFFLINE_WORD_BANK = [
  { word: 'PLANET', hint: 'A celestial body orbiting a star' },
  { word: 'DRAGON', hint: 'A legendary fire-breathing creature' },
  { word: 'GALAXY', hint: 'A vast cosmic system of millions of stars' },
  { word: 'WIZARD', hint: 'A wise spellcaster with magical powers' },
  { word: 'CASTLE', hint: 'A fortified royal residence with towers' },
  { word: 'PENGUIN', hint: 'Flightless aquatic bird of polar regions' },
  { word: 'GUITAR', hint: 'A six-string musical instrument' },
  { word: 'DIAMOND', hint: 'The hardest known natural mineral' },
  { word: 'JUNGLE', hint: 'A dense, tropical wild forest' },
  { word: 'PIRATE', hint: 'A swashbuckling mariner of the high seas' },
  { word: 'VOLCANO', hint: 'A mountain erupting hot lava' },
  { word: 'TORNADO', hint: 'A violently rotating column of air' },
  { word: 'CHAMPION', hint: 'The titleholder who defeats all rivals' },
  { word: 'MYSTERY', hint: 'Something unexplained or secretive' },
  { word: 'THUNDER', hint: 'The loud acoustic boom following lightning' },
];

const MEMORY_SYMBOLS = ['GEM', 'ROCKET', 'FIRE', 'STAR', 'HEART', 'LIGHTNING', 'CROWN', 'SHIELD'];

// Helpers
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function scramble(word: string): string {
  const chars = word.split('');
  let scrambled = '';
  let attempts = 0;
  do {
    scrambled = shuffleArray(chars).join('');
    attempts++;
  } while (scrambled === word && attempts < 10);
  return scrambled;
}

// Generate an offline initial Game state
export function createOfflineGame(
  gameType: GameType,
  difficulty: BotDifficulty,
  playerName = 'You',
  playerAvatar = '🎮'
): { game: Game; bot: BotProfile } {
  const bot = BOT_PROFILES[difficulty];
  const playerId = 'offline_user';
  const botId = bot.id;

  const player1: GamePlayer = {
    userId: playerId,
    username: playerName,
    avatar: playerAvatar,
    isGuest: false,
    board: [],
    locked: true,
    lineCount: 0,
    connectionStatus: 'CONNECTED',
  };

  const player2: GamePlayer = {
    userId: botId,
    username: bot.username,
    avatar: bot.avatar,
    isGuest: false,
    board: [],
    locked: true,
    lineCount: 0,
    connectionStatus: 'CONNECTED',
  };

  const baseGame: Game = {
    id: `offline_${Date.now()}`,
    roomCode: 'SOLO-BOT',
    status: 'PLAYING',
    gameType,
    boardSize: 5,
    winningLines: 5,
    players: [player1, player2],
    currentTurnUserId: playerId,
    currentPlayerIndex: 0,
    calledNumbers: [],
    moves: [],
    winnerId: undefined,
    startedAt: new Date().toISOString(),
    version: 1,
    moveNumber: 0,
  };

  switch (gameType) {
    case 'TIC_TAC_TOE': {
      baseGame.tttGridSize = 3;
      baseGame.boardSize = 3;
      baseGame.tttBoard = Array(9).fill('');
      break;
    }

    case 'CONNECT_FOUR': {
      baseGame.c4Cols = 7;
      baseGame.c4Rows = 6;
      baseGame.c4Board = Array(42).fill('');
      baseGame.c4WinningCells = [];
      break;
    }

    case 'DOTS_AND_BOXES': {
      const size = 4;
      baseGame.dotsGridSize = size;
      baseGame.horizontalLines = [];
      baseGame.verticalLines = [];
      baseGame.completedBoxes = {};
      baseGame.lineOwners = {};
      baseGame.playerScores = { [playerId]: 0, [botId]: 0 };
      break;
    }

    case 'ROCK_PAPER_SCISSORS': {
      baseGame.rpsRound = 1;
      baseGame.rpsTargetWins = 3;
      baseGame.rpsChoices = {};
      baseGame.rpsRoundWins = { [playerId]: 0, [botId]: 0 };
      baseGame.rpsLastRoundResult = undefined;
      break;
    }

    case 'MEMORY': {
      const paired = shuffleArray([...MEMORY_SYMBOLS, ...MEMORY_SYMBOLS]);
      baseGame.memoryCards = paired;
      baseGame.memoryMatched = Array(16).fill(false);
      baseGame.memoryFlippedIndices = [];
      baseGame.playerScores = { [playerId]: 0, [botId]: 0 };
      break;
    }

    case 'NUMBER_RUSH': {
      const nums1 = shuffleArray(Array.from({ length: 25 }, (_, i) => i + 1));
      const nums2 = shuffleArray(Array.from({ length: 25 }, (_, i) => i + 1));
      baseGame.numberRushBoards = {
        [playerId]: nums1,
        [botId]: nums2,
      };
      baseGame.numberRushProgress = {
        [playerId]: 1,
        [botId]: 1,
      };
      break;
    }

    case 'WORD_SCRAMBLE': {
      const picked = shuffleArray(OFFLINE_WORD_BANK).slice(0, 5);
      baseGame.scrambleWords = picked.map((w) => w.word);
      baseGame.scrambleHints = picked.map((w) => w.hint);
      baseGame.scrambleJumbled = picked.map((w) => scramble(w.word));
      baseGame.scrambleCurrentRound = 0;
      baseGame.playerScores = { [playerId]: 0, [botId]: 0 };
      baseGame.scrambleRoundHistory = [];
      baseGame.scrambleLastSolveResult = undefined;
      break;
    }

    case 'BINGO': {
      const generateBoard = () => {
        const nums = shuffleArray(Array.from({ length: 25 }, (_, i) => i + 1));
        const grid: number[][] = [];
        for (let r = 0; r < 5; r++) {
          grid.push(nums.slice(r * 5, (r + 1) * 5));
        }
        return grid;
      };
      player1.board = generateBoard();
      player2.board = generateBoard();
      baseGame.bingoMode = 'CLASSIC';
      baseGame.boardSize = 5;
      baseGame.winningLines = 5;
      break;
    }

    case 'SHIP_BATTLE': {
      baseGame.boardSize = 8;
      baseGame.winningLines = 5;
      baseGame.shipPhase = 'SETUP';
      baseGame.shipFleets = {
        [botId]: generateOfflineBotFleet(),
      };
      baseGame.shipFleetsLocked = {
        [botId]: false,
        [playerId]: false,
      };
      baseGame.shipAttacks = {
        [playerId]: [],
        [botId]: [],
      };
      baseGame.shipSunkTypes = {
        [playerId]: [],
        [botId]: [],
      };
      break;
    }
  }

  return { game: baseGame, bot };
}

// =========================================================================
// AI BOT DECISION ALGORITHMS FOR EACH GAME
// =========================================================================

// --- 1. TIC-TAC-TOE BOT ---
export function getTicTacToeBotMove(
  board: string[],
  size: number,
  difficulty: BotDifficulty,
  botSymbol: string,
  playerSymbol: string
): { row: number; col: number } {
  const emptyIndices: number[] = [];
  board.forEach((val, idx) => {
    if (!val) emptyIndices.push(idx);
  });

  if (emptyIndices.length === 0) return { row: 0, col: 0 };

  const checkWinner = (bd: string[]): string | null => {
    for (let r = 0; r < size; r++) {
      const first = bd[r * size];
      if (first) {
        let win = true;
        for (let c = 1; c < size; c++) {
          if (bd[r * size + c] !== first) { win = false; break; }
        }
        if (win) return first;
      }
    }
    for (let c = 0; c < size; c++) {
      const first = bd[c];
      if (first) {
        let win = true;
        for (let r = 1; r < size; r++) {
          if (bd[r * size + c] !== first) { win = false; break; }
        }
        if (win) return first;
      }
    }
    const d1 = bd[0];
    if (d1) {
      let win = true;
      for (let i = 1; i < size; i++) {
        if (bd[i * size + i] !== d1) { win = false; break; }
      }
      if (win) return d1;
    }
    const d2 = bd[size - 1];
    if (d2) {
      let win = true;
      for (let i = 1; i < size; i++) {
        if (bd[i * size + (size - 1 - i)] !== d2) { win = false; break; }
      }
      if (win) return d2;
    }
    return null;
  };

  if (difficulty === 'EASY') {
    const idx = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    return { row: Math.floor(idx / size), col: idx % size };
  }

  // 1) Can Bot win in 1 move?
  for (const idx of emptyIndices) {
    const testBoard = [...board];
    testBoard[idx] = botSymbol;
    if (checkWinner(testBoard) === botSymbol) {
      return { row: Math.floor(idx / size), col: idx % size };
    }
  }

  // 2) Can Player win in 1 move? Block it!
  for (const idx of emptyIndices) {
    const testBoard = [...board];
    testBoard[idx] = playerSymbol;
    if (checkWinner(testBoard) === playerSymbol) {
      return { row: Math.floor(idx / size), col: idx % size };
    }
  }

  if (difficulty === 'MEDIUM') {
    const center = Math.floor((size * size) / 2);
    if (emptyIndices.includes(center) && Math.random() < 0.75) {
      return { row: Math.floor(center / size), col: center % size };
    }
    const idx = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    return { row: Math.floor(idx / size), col: idx % size };
  }

  // HARD: Minimax for 3x3
  if (size === 3) {
    const minimax = (bd: string[], depth: number, isMaximizing: boolean): number => {
      const winner = checkWinner(bd);
      if (winner === botSymbol) return 10 - depth;
      if (winner === playerSymbol) return depth - 10;
      if (!bd.includes('')) return 0;
      if (depth >= 6) return 0;

      if (isMaximizing) {
        let best = -Infinity;
        for (let i = 0; i < bd.length; i++) {
          if (!bd[i]) {
            bd[i] = botSymbol;
            best = Math.max(best, minimax(bd, depth + 1, false));
            bd[i] = '';
          }
        }
        return best;
      } else {
        let best = Infinity;
        for (let i = 0; i < bd.length; i++) {
          if (!bd[i]) {
            bd[i] = playerSymbol;
            best = Math.min(best, minimax(bd, depth + 1, true));
            bd[i] = '';
          }
        }
        return best;
      }
    };

    let bestVal = -Infinity;
    let bestIdx = emptyIndices[0];
    for (const idx of emptyIndices) {
      const testBoard = [...board];
      testBoard[idx] = botSymbol;
      const moveVal = minimax(testBoard, 0, false);
      if (moveVal > bestVal) {
        bestVal = moveVal;
        bestIdx = idx;
      }
    }
    return { row: Math.floor(bestIdx / size), col: bestIdx % size };
  }

  const center = Math.floor((size * size) / 2);
  if (emptyIndices.includes(center)) return { row: Math.floor(center / size), col: center % size };
  const idx = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
  return { row: Math.floor(idx / size), col: idx % size };
}

// --- 2. CONNECT FOUR BOT ---
export function getConnectFourBotMove(
  board: string[],
  cols = 7,
  rows = 6,
  difficulty: BotDifficulty,
  botId: string,
  playerId: string
): number {
  const getTopOpenRow = (col: number, bd = board): number => {
    for (let r = rows - 1; r >= 0; r--) {
      if (!bd[r * cols + col]) return r;
    }
    return -1;
  };

  const validCols: number[] = [];
  for (let c = 0; c < cols; c++) {
    if (getTopOpenRow(c) !== -1) validCols.push(c);
  }

  if (validCols.length === 0) return 0;

  const checkConnectFourWin = (bd: string[], targetId: string): boolean => {
    // Horizontal
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c <= cols - 4; c++) {
        if (
          bd[r * cols + c] === targetId &&
          bd[r * cols + c + 1] === targetId &&
          bd[r * cols + c + 2] === targetId &&
          bd[r * cols + c + 3] === targetId
        ) return true;
      }
    }
    // Vertical
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r <= rows - 4; r++) {
        if (
          bd[r * cols + c] === targetId &&
          bd[(r + 1) * cols + c] === targetId &&
          bd[(r + 2) * cols + c] === targetId &&
          bd[(r + 3) * cols + c] === targetId
        ) return true;
      }
    }
    // Diag \
    for (let r = 0; r <= rows - 4; r++) {
      for (let c = 0; c <= cols - 4; c++) {
        if (
          bd[r * cols + c] === targetId &&
          bd[(r + 1) * cols + c + 1] === targetId &&
          bd[(r + 2) * cols + c + 2] === targetId &&
          bd[(r + 3) * cols + c + 3] === targetId
        ) return true;
      }
    }
    // Diag /
    for (let r = 3; r < rows; r++) {
      for (let c = 0; c <= cols - 4; c++) {
        if (
          bd[r * cols + c] === targetId &&
          bd[(r - 1) * cols + c + 1] === targetId &&
          bd[(r - 2) * cols + c + 2] === targetId &&
          bd[(r - 3) * cols + c + 3] === targetId
        ) return true;
      }
    }
    return false;
  };

  if (difficulty === 'EASY') {
    return validCols[Math.floor(Math.random() * validCols.length)];
  }

  // Check 1: Can Bot win right now?
  for (const c of validCols) {
    const r = getTopOpenRow(c);
    const testBd = [...board];
    testBd[r * cols + c] = botId;
    if (checkConnectFourWin(testBd, botId)) return c;
  }

  // Check 2: Can Player win right now? Block!
  for (const c of validCols) {
    const r = getTopOpenRow(c);
    const testBd = [...board];
    testBd[r * cols + c] = playerId;
    if (checkConnectFourWin(testBd, playerId)) return c;
  }

  // Avoid giving opponent a win right on top of our drop!
  const safeCols = validCols.filter((c) => {
    const r = getTopOpenRow(c);
    if (r <= 0) return true;
    const testBd = [...board];
    testBd[r * cols + c] = botId;
    testBd[(r - 1) * cols + c] = playerId;
    return !checkConnectFourWin(testBd, playerId);
  });

  const candidates = safeCols.length > 0 ? safeCols : validCols;

  if (difficulty === 'MEDIUM') {
    if (candidates.includes(3) && Math.random() < 0.6) return 3;
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  // HARD: Column positional scoring
  let bestCol = candidates[0];
  let bestScore = -9999;
  const colWeights = [3, 4, 5, 7, 5, 4, 3];

  for (const c of candidates) {
    let score = colWeights[c] * 2;
    if (c === 3) score += 5;
    if (score > bestScore) {
      bestScore = score;
      bestCol = c;
    }
  }

  return bestCol;
}

// --- 3. DOTS & BOXES BOT ---
export function getDotsAndBoxesBotMove(
  hLines: Set<string>,
  vLines: Set<string>,
  gridSize = 4,
  difficulty: BotDifficulty
): { lineType: 'H' | 'V'; row: number; col: number } {
  const openLines: { lineType: 'H' | 'V'; row: number; col: number }[] = [];

  // Horizontal lines: r in 0..gridSize-1, c in 0..gridSize-2
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize - 1; c++) {
      if (!hLines.has(`${r}-${c}`)) {
        openLines.push({ lineType: 'H', row: r, col: c });
      }
    }
  }
  // Vertical lines: r in 0..gridSize-2, c in 0..gridSize-1
  for (let r = 0; r < gridSize - 1; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (!vLines.has(`${r}-${c}`)) {
        openLines.push({ lineType: 'V', row: r, col: c });
      }
    }
  }

  if (openLines.length === 0) return { lineType: 'H', row: 0, col: 0 };

  const countBoxEdges = (br: number, bc: number, h: Set<string>, v: Set<string>) => {
    let count = 0;
    if (h.has(`${br}-${bc}`)) count++;
    if (h.has(`${br + 1}-${bc}`)) count++;
    if (v.has(`${br}-${bc}`)) count++;
    if (v.has(`${br}-${bc + 1}`)) count++;
    return count;
  };

  if (difficulty === 'EASY') {
    return openLines[Math.floor(Math.random() * openLines.length)];
  }

  // 1) Can we complete any box?
  for (const line of openLines) {
    const testH = new Set(hLines);
    const testV = new Set(vLines);
    if (line.lineType === 'H') testH.add(`${line.row}-${line.col}`);
    else testV.add(`${line.row}-${line.col}`);

    let completedAny = false;
    for (let br = 0; br < gridSize - 1; br++) {
      for (let bc = 0; bc < gridSize - 1; bc++) {
        if (countBoxEdges(br, bc, hLines, vLines) === 3 && countBoxEdges(br, bc, testH, testV) === 4) {
          completedAny = true;
          break;
        }
      }
      if (completedAny) break;
    }
    if (completedAny) return line;
  }

  // 2) Avoid moves that give away a box (making a 3rd edge)
  const safeLines = openLines.filter((line) => {
    const testH = new Set(hLines);
    const testV = new Set(vLines);
    if (line.lineType === 'H') testH.add(`${line.row}-${line.col}`);
    else testV.add(`${line.row}-${line.col}`);

    for (let br = 0; br < gridSize - 1; br++) {
      for (let bc = 0; bc < gridSize - 1; bc++) {
        if (countBoxEdges(br, bc, testH, testV) === 3) return false;
      }
    }
    return true;
  });

  if (safeLines.length > 0) {
    return safeLines[Math.floor(Math.random() * safeLines.length)];
  }

  return openLines[Math.floor(Math.random() * openLines.length)];
}

// --- 4. ROCK PAPER SCISSORS BOT ---
export function getRockPaperScissorsBotChoice(
  difficulty: BotDifficulty,
  playerHistory: string[]
): 'ROCK' | 'PAPER' | 'SCISSORS' {
  const choices: ('ROCK' | 'PAPER' | 'SCISSORS')[] = ['ROCK', 'PAPER', 'SCISSORS'];

  if (difficulty === 'EASY' || playerHistory.length === 0) {
    return choices[Math.floor(Math.random() * choices.length)];
  }

  const counts: Record<string, number> = { ROCK: 0, PAPER: 0, SCISSORS: 0 };
  playerHistory.forEach((c) => {
    if (counts[c] !== undefined) counts[c]++;
  });

  let mostPlayed: 'ROCK' | 'PAPER' | 'SCISSORS' = 'ROCK';
  let maxCount = -1;
  (['ROCK', 'PAPER', 'SCISSORS'] as const).forEach((c) => {
    if (counts[c] > maxCount) {
      maxCount = counts[c];
      mostPlayed = c;
    }
  });

  const counter: Record<'ROCK' | 'PAPER' | 'SCISSORS', 'ROCK' | 'PAPER' | 'SCISSORS'> = {
    ROCK: 'PAPER',
    PAPER: 'SCISSORS',
    SCISSORS: 'ROCK',
  };

  if (difficulty === 'MEDIUM') {
    if (Math.random() < 0.7) return counter[mostPlayed];
    return choices[Math.floor(Math.random() * choices.length)];
  }

  const lastPlayerMove = playerHistory[playerHistory.length - 1] as 'ROCK' | 'PAPER' | 'SCISSORS';
  if (Math.random() < 0.85) {
    return counter[lastPlayerMove];
  }
  return counter[mostPlayed];
}

// --- 5. MEMORY MATCH BOT ---
export function getMemoryBotMove(
  cards: string[],
  matched: boolean[],
  knownMemory: Map<number, string>,
  difficulty: BotDifficulty,
  currentFlipped: number[]
): number {
  const unrevealedIndices: number[] = [];
  cards.forEach((_, idx) => {
    if (!matched[idx] && !currentFlipped.includes(idx)) {
      unrevealedIndices.push(idx);
    }
  });

  if (unrevealedIndices.length === 0) return 0;

  // If second card flip
  if (currentFlipped.length === 1) {
    const firstIndex = currentFlipped[0];
    const firstSymbol = cards[firstIndex];

    if (difficulty !== 'EASY') {
      for (const [idx, val] of knownMemory.entries()) {
        if (idx !== firstIndex && val === firstSymbol && !matched[idx]) {
          const recallRate = difficulty === 'HARD' ? 1.0 : 0.75;
          if (Math.random() < recallRate) return idx;
        }
      }
    }
  }

  // If first card flip
  if (currentFlipped.length === 0 && difficulty !== 'EASY') {
    const seenMap: Record<string, number[]> = {};
    for (const [idx, val] of knownMemory.entries()) {
      if (!matched[idx]) {
        if (!seenMap[val]) seenMap[val] = [];
        seenMap[val].push(idx);
      }
    }
    for (const val in seenMap) {
      if (seenMap[val].length >= 2) {
        const recallRate = difficulty === 'HARD' ? 1.0 : 0.75;
        if (Math.random() < recallRate) return seenMap[val][0];
      }
    }
  }

  return unrevealedIndices[Math.floor(Math.random() * unrevealedIndices.length)];
}

// --- 6. BINGO BOT ---
export function getBingoBotCall(
  botBoard: number[][],
  calledNumbers: number[],
  difficulty: BotDifficulty
): number {
  const calledSet = new Set(calledNumbers);
  const uncalledBoardNumbers: number[] = [];

  botBoard.forEach((row) => {
    row.forEach((num) => {
      if (!calledSet.has(num)) uncalledBoardNumbers.push(num);
    });
  });

  if (difficulty === 'EASY' || uncalledBoardNumbers.length === 0) {
    if (uncalledBoardNumbers.length > 0 && Math.random() < 0.5) {
      return uncalledBoardNumbers[Math.floor(Math.random() * uncalledBoardNumbers.length)];
    }
    const allNums = Array.from({ length: 25 }, (_, i) => i + 1).filter((n) => !calledSet.has(n));
    return allNums.length > 0 ? allNums[Math.floor(Math.random() * allNums.length)] : 1;
  }

  if (difficulty === 'MEDIUM') {
    return uncalledBoardNumbers[Math.floor(Math.random() * uncalledBoardNumbers.length)];
  }

  // HARD: Strategic row/col completion
  let bestNum = uncalledBoardNumbers[0];
  let maxScore = -1;

  for (const num of uncalledBoardNumbers) {
    let score = 0;
    let r = -1, c = -1;
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        if (botBoard[row][col] === num) {
          r = row; c = col; break;
        }
      }
      if (r !== -1) break;
    }

    if (r !== -1) {
      const rowFilled = botBoard[r].filter((n) => calledSet.has(n)).length;
      score += rowFilled * rowFilled;
      let colFilled = 0;
      for (let row = 0; row < 5; row++) {
        if (calledSet.has(botBoard[row][c])) colFilled++;
      }
      score += colFilled * colFilled;
    }

    if (score > maxScore) {
      maxScore = score;
      bestNum = num;
    }
  }

  return bestNum;
}

// --- 7. NUMBER RUSH BOT TIMINGS ---
export function getNumberRushBotDelay(difficulty: BotDifficulty): number {
  switch (difficulty) {
    case 'EASY':
      return Math.floor(1300 + Math.random() * 800);
    case 'MEDIUM':
      return Math.floor(750 + Math.random() * 450);
    case 'HARD':
      return Math.floor(400 + Math.random() * 260);
  }
}

// --- 8. WORD SCRAMBLE BOT TIMINGS & ACCURACY ---
export function getWordScrambleBotParams(difficulty: BotDifficulty): { delayMs: number; willSolve: boolean } {
  switch (difficulty) {
    case 'EASY':
      return {
        delayMs: Math.floor(12000 + Math.random() * 5000),
        willSolve: Math.random() < 0.5,
      };
    case 'MEDIUM':
      return {
        delayMs: Math.floor(6500 + Math.random() * 3500),
        willSolve: Math.random() < 0.8,
      };
    case 'HARD':
      return {
        delayMs: Math.floor(3200 + Math.random() * 1800),
        willSolve: Math.random() < 0.95,
      };
  }
}

// --- 9. SHIP BATTLE BOT AI ---
export function getShipBattleBotDelay(difficulty: BotDifficulty): number {
  switch (difficulty) {
    case 'EASY':
      return Math.floor(1200 + Math.random() * 800);
    case 'MEDIUM':
      return Math.floor(700 + Math.random() * 500);
    case 'HARD':
      return Math.floor(400 + Math.random() * 300);
  }
}

export function chooseShipBattleTarget(
  previousAttacks: { row: number; col: number; result: 'MISS' | 'HIT' | 'SUNK' }[],
  difficulty: BotDifficulty
): { row: number; col: number } {
  const BOARD_SIZE = 8;
  const attackedSet = new Set(previousAttacks.map((a) => `${a.row}-${a.col}`));

  // Check for unsunk hits
  const hitCells = previousAttacks.filter((a) => a.result === 'HIT');

  if (difficulty !== 'EASY' && hitCells.length > 0) {
    // Hunt mode: check adjacent orthogonal neighbors of unsunk hits
    const candidates: { row: number; col: number }[] = [];
    const deltas = [
      { r: -1, c: 0 },
      { r: 1, c: 0 },
      { r: 0, c: -1 },
      { r: 0, c: 1 },
    ];

    for (const h of hitCells) {
      for (const d of deltas) {
        const nr = h.row + d.r;
        const nc = h.col + d.c;
        if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && !attackedSet.has(`${nr}-${nc}`)) {
          candidates.push({ row: nr, col: nc });
        }
      }
    }

    if (candidates.length > 0) {
      return candidates[Math.floor(Math.random() * candidates.length)];
    }
  }

  if (difficulty === 'HARD') {
    // Parity search: only check even parity squares (checkerboard)
    const parityCandidates: { row: number; col: number }[] = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if ((r + c) % 2 === 0 && !attackedSet.has(`${r}-${c}`)) {
          parityCandidates.push({ row: r, col: c });
        }
      }
    }
    if (parityCandidates.length > 0) {
      return parityCandidates[Math.floor(Math.random() * parityCandidates.length)];
    }
  }

  // Fallback: any unattacked cell
  const unattacked: { row: number; col: number }[] = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (!attackedSet.has(`${r}-${c}`)) {
        unattacked.push({ row: r, col: c });
      }
    }
  }

  if (unattacked.length === 0) return { row: 0, col: 0 };
  return unattacked[Math.floor(Math.random() * unattacked.length)];
}

export function generateOfflineBotFleet(): any[] {
  const BOARD_SIZE = 8;
  const defs = [
    { type: 'CARRIER', size: 5 },
    { type: 'BATTLESHIP', size: 4 },
    { type: 'CRUISER', size: 3 },
    { type: 'SUBMARINE', size: 3 },
    { type: 'DESTROYER', size: 2 },
  ];
  const fleet: any[] = [];
  const occupied = new Set<string>();

  for (const def of defs) {
    let placed = false;
    let attempts = 0;
    while (!placed && attempts < 1000) {
      attempts++;
      const horizontal = Math.random() > 0.5;
      const orientation = horizontal ? 'HORIZONTAL' : 'VERTICAL';
      const startR = horizontal ? Math.floor(Math.random() * BOARD_SIZE) : Math.floor(Math.random() * (BOARD_SIZE - def.size + 1));
      const startC = horizontal ? Math.floor(Math.random() * (BOARD_SIZE - def.size + 1)) : Math.floor(Math.random() * BOARD_SIZE);

      const cells: { row: number; col: number }[] = [];
      let collision = false;
      for (let i = 0; i < def.size; i++) {
        const r = horizontal ? startR : startR + i;
        const c = horizontal ? startC + i : startC;
        if (occupied.has(`${r}-${c}`)) {
          collision = true;
          break;
        }
        cells.push({ row: r, col: c });
      }

      if (!collision) {
        cells.forEach((c) => occupied.add(`${c.row}-${c.col}`));
        fleet.push({
          shipType: def.type,
          row: startR,
          col: startC,
          orientation,
          cells,
        });
        placed = true;
      }
    }
  }

  return fleet;
}
