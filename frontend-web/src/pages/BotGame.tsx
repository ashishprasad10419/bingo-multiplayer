import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Game, GameType } from '../lib/types';
import {
  BotDifficulty,
  BOT_PROFILES,
  createOfflineGame,
  getTicTacToeBotMove,
  getConnectFourBotMove,
  getDotsAndBoxesBotMove,
  getRockPaperScissorsBotChoice,
  getMemoryBotMove,
  getBingoBotCall,
  getNumberRushBotDelay,
  getWordScrambleBotParams,
} from '../lib/bot/botEngine';
import { useAuthStore } from '../state/authStore';
import { soundService } from '../lib/sound';
import { TicTacToeArena } from '../components/games/TicTacToeArena';
import { ConnectFourArena } from '../components/games/ConnectFourArena';
import { DotsAndBoxesArena } from '../components/games/DotsAndBoxesArena';
import { RockPaperScissorsArena } from '../components/games/RockPaperScissorsArena';
import { MemoryArena } from '../components/games/MemoryArena';
import { NumberRushArena } from '../components/games/NumberRushArena';
import { WordScrambleArena } from '../components/games/WordScrambleArena';
import { ShipBattleArena } from '../components/games/ShipBattleArena';
import { BoardGrid } from '../components/BoardGrid';
import { CalledNumbersTicker } from '../components/CalledNumbersTicker';
import { getShipBattleBotDelay, chooseShipBattleTarget } from '../lib/bot/botEngine';
import { ShipPlacement } from '../lib/types';
import { ArrowLeft, RotateCcw, WifiOff } from 'lucide-react';

export const BotGame: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const gameTypeParam = (searchParams.get('game') as GameType) || 'TIC_TAC_TOE';
  const difficultyParam = (searchParams.get('difficulty') as BotDifficulty) || 'MEDIUM';

  const [difficulty, setDifficulty] = useState<BotDifficulty>(difficultyParam);
  const [game, setGame] = useState<Game>(() =>
    createOfflineGame(gameTypeParam, difficultyParam, user?.username || 'You', user?.avatar || '🎮').game
  );

  const [isBotThinking, setIsBotThinking] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [rpsHistory, setRpsHistory] = useState<string[]>([]);
  const memoryKnownRef = useRef<Map<number, string>>(new Map());

  const playerId = 'offline_user';
  const botProfile = BOT_PROFILES[difficulty];
  const botId = botProfile.id;

  const isMyTurn = game.currentTurnUserId === playerId && game.status === 'PLAYING';

  // Helper to reinitialize a fresh match
  const startNewGame = (gType = gameTypeParam, diff = difficulty) => {
    const initialized = createOfflineGame(gType, diff, user?.username || 'You', user?.avatar || '🎮').game;
    setGame(initialized);
    setShowResultModal(false);
    setIsBotThinking(false);
    setRpsHistory([]);
    memoryKnownRef.current.clear();
  };

  // Change difficulty
  const handleDifficultyChange = (newDiff: BotDifficulty) => {
    setDifficulty(newDiff);
    setSearchParams({ game: gameTypeParam, difficulty: newDiff });
    startNewGame(gameTypeParam, newDiff);
  };

  // =========================================================================
  // 1. TIC-TAC-TOE LOGIC
  // =========================================================================
  const handleTttMove = (row: number, col: number) => {
    if (!isMyTurn || game.status !== 'PLAYING') return;
    const size = game.tttGridSize || 3;
    const index = row * size + col;
    if (game.tttBoard && game.tttBoard[index]) return;

    soundService.playTileTap();
    const newBoard = [...(game.tttBoard || Array(size * size).fill(''))];
    newBoard[index] = 'X';

    // Check winner or draw
    const winner = checkTttWinner(newBoard, size);
    const isFull = !newBoard.includes('');

    if (winner === 'X') {
      soundService.playWinFanfare();
      setGame((prev) => ({
        ...prev,
        tttBoard: newBoard,
        status: 'FINISHED',
        winnerId: playerId,
      }));
      setShowResultModal(true);
      return;
    } else if (isFull) {
      soundService.playLineComplete();
      setGame((prev) => ({
        ...prev,
        tttBoard: newBoard,
        status: 'FINISHED',
        winnerId: undefined,
      }));
      setShowResultModal(true);
      return;
    }

    // Switch turn to Bot
    setGame((prev) => ({
      ...prev,
      tttBoard: newBoard,
      currentTurnUserId: botId,
    }));
    setIsBotThinking(true);

    // Bot move after realistic delay
    setTimeout(() => {
      const botMove = getTicTacToeBotMove(newBoard, size, difficulty, 'O', 'X');
      const botIndex = botMove.row * size + botMove.col;
      newBoard[botIndex] = 'O';

      const botWinner = checkTttWinner(newBoard, size);
      const botIsFull = !newBoard.includes('');

      setIsBotThinking(false);

      if (botWinner === 'O') {
        soundService.playLineComplete();
        setGame((prev) => ({
          ...prev,
          tttBoard: newBoard,
          status: 'FINISHED',
          winnerId: botId,
        }));
        setShowResultModal(true);
      } else if (botIsFull) {
        soundService.playLineComplete();
        setGame((prev) => ({
          ...prev,
          tttBoard: newBoard,
          status: 'FINISHED',
          winnerId: undefined,
        }));
        setShowResultModal(true);
      } else {
        setGame((prev) => ({
          ...prev,
          tttBoard: newBoard,
          currentTurnUserId: playerId,
        }));
      }
    }, 450);
  };

  const checkTttWinner = (bd: string[], size: number): string | null => {
    for (let r = 0; r < size; r++) {
      const first = bd[r * size];
      if (first && Array.from({ length: size }, (_, c) => bd[r * size + c]).every((v) => v === first)) return first;
    }
    for (let c = 0; c < size; c++) {
      const first = bd[c];
      if (first && Array.from({ length: size }, (_, r) => bd[r * size + c]).every((v) => v === first)) return first;
    }
    const d1 = bd[0];
    if (d1 && Array.from({ length: size }, (_, i) => bd[i * size + i]).every((v) => v === d1)) return d1;
    const d2 = bd[size - 1];
    if (d2 && Array.from({ length: size }, (_, i) => bd[i * size + (size - 1 - i)]).every((v) => v === d2)) return d2;
    return null;
  };

  // =========================================================================
  // 2. CONNECT FOUR LOGIC
  // =========================================================================
  const handleC4Move = (col: number) => {
    if (!isMyTurn || game.status !== 'PLAYING') return;
    const cols = game.c4Cols || 7;
    const rows = game.c4Rows || 6;
    const newBoard = [...(game.c4Board || Array(cols * rows).fill(''))];

    // Find lowest open row
    let targetRow = -1;
    for (let r = rows - 1; r >= 0; r--) {
      if (!newBoard[r * cols + col]) {
        targetRow = r;
        break;
      }
    }
    if (targetRow === -1) return;

    soundService.playTileTap();
    newBoard[targetRow * cols + col] = playerId;

    if (checkC4Win(newBoard, cols, rows, playerId)) {
      soundService.playWinFanfare();
      setGame((prev) => ({ ...prev, c4Board: newBoard, status: 'FINISHED', winnerId: playerId }));
      setShowResultModal(true);
      return;
    } else if (!newBoard.includes('')) {
      soundService.playLineComplete();
      setGame((prev) => ({ ...prev, c4Board: newBoard, status: 'FINISHED', winnerId: undefined }));
      setShowResultModal(true);
      return;
    }

    // Bot's turn
    setGame((prev) => ({ ...prev, c4Board: newBoard, currentTurnUserId: botId }));
    setIsBotThinking(true);

    setTimeout(() => {
      const botCol = getConnectFourBotMove(newBoard, cols, rows, difficulty, botId, playerId);
      let botRow = -1;
      for (let r = rows - 1; r >= 0; r--) {
        if (!newBoard[r * cols + botCol]) {
          botRow = r;
          break;
        }
      }
      if (botRow !== -1) {
        newBoard[botRow * cols + botCol] = botId;
      }
      setIsBotThinking(false);

      if (checkC4Win(newBoard, cols, rows, botId)) {
        soundService.playLineComplete();
        setGame((prev) => ({ ...prev, c4Board: newBoard, status: 'FINISHED', winnerId: botId }));
        setShowResultModal(true);
      } else if (!newBoard.includes('')) {
        soundService.playLineComplete();
        setGame((prev) => ({ ...prev, c4Board: newBoard, status: 'FINISHED', winnerId: undefined }));
        setShowResultModal(true);
      } else {
        setGame((prev) => ({ ...prev, c4Board: newBoard, currentTurnUserId: playerId }));
      }
    }, 550);
  };

  const checkC4Win = (bd: string[], cols: number, rows: number, target: string): boolean => {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c <= cols - 4; c++) {
        if (bd[r * cols + c] === target && bd[r * cols + c + 1] === target && bd[r * cols + c + 2] === target && bd[r * cols + c + 3] === target) return true;
      }
    }
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r <= rows - 4; r++) {
        if (bd[r * cols + c] === target && bd[(r + 1) * cols + c] === target && bd[(r + 2) * cols + c] === target && bd[(r + 3) * cols + c] === target) return true;
      }
    }
    for (let r = 0; r <= rows - 4; r++) {
      for (let c = 0; c <= cols - 4; c++) {
        if (bd[r * cols + c] === target && bd[(r + 1) * cols + c + 1] === target && bd[(r + 2) * cols + c + 2] === target && bd[(r + 3) * cols + c + 3] === target) return true;
      }
    }
    for (let r = 3; r < rows; r++) {
      for (let c = 0; c <= cols - 4; c++) {
        if (bd[r * cols + c] === target && bd[(r - 1) * cols + c + 1] === target && bd[(r - 2) * cols + c + 2] === target && bd[(r - 3) * cols + c + 3] === target) return true;
      }
    }
    return false;
  };

  // =========================================================================
  // 3. DOTS & BOXES LOGIC
  // =========================================================================
  const handleDotsLine = (lineType: 'H' | 'V', row: number, col: number) => {
    if (!isMyTurn || game.status !== 'PLAYING') return;
    const hLines = [...(game.horizontalLines || [])];
    const vLines = [...(game.verticalLines || [])];
    const lineOwners = { ...(game.lineOwners || {}) };
    const boxes = { ...(game.completedBoxes || {}) };
    const scores = { ...(game.playerScores || { [playerId]: 0, [botId]: 0 }) };
    const key = `${row}-${col}`;
    const ownerKey = `${lineType}-${row}-${col}`;

    if (lineType === 'H' && hLines.includes(key)) return;
    if (lineType === 'V' && vLines.includes(key)) return;

    soundService.playTileTap();
    if (lineType === 'H') hLines.push(key);
    else vLines.push(key);
    lineOwners[ownerKey] = playerId;

    const size = game.dotsGridSize || 4;
    let completedBoxes = 0;
    const hSet = new Set(hLines);
    const vSet = new Set(vLines);

    // Check newly completed boxes
    for (let br = 0; br < size - 1; br++) {
      for (let bc = 0; bc < size - 1; bc++) {
        const bKey = `${br}-${bc}`;
        if (!boxes[bKey]) {
          const top = hSet.has(`${br}-${bc}`);
          const bottom = hSet.has(`${br + 1}-${bc}`);
          const left = vSet.has(`${br}-${bc}`);
          const right = vSet.has(`${br}-${bc + 1}`);
          if (top && bottom && left && right) {
            boxes[bKey] = playerId;
            completedBoxes++;
          }
        }
      }
    }

    scores[playerId] = (scores[playerId] || 0) + completedBoxes;
    const totalBoxes = (size - 1) * (size - 1);
    const totalClaimed = (scores[playerId] || 0) + (scores[botId] || 0);

    if (totalClaimed >= totalBoxes) {
      const pScore = scores[playerId] || 0;
      const bScore = scores[botId] || 0;
      const winId = pScore > bScore ? playerId : pScore < bScore ? botId : undefined;
      setGame((prev) => ({
        ...prev,
        horizontalLines: hLines,
        verticalLines: vLines,
        lineOwners,
        completedBoxes: boxes,
        playerScores: scores,
        status: 'FINISHED',
        winnerId: winId,
      }));
      if (winId === playerId) soundService.playWinFanfare();
      else soundService.playLineComplete();
      setShowResultModal(true);
      return;
    }

    if (completedBoxes > 0) {
      soundService.playLineComplete();
      setGame((prev) => ({
        ...prev,
        horizontalLines: hLines,
        verticalLines: vLines,
        lineOwners,
        completedBoxes: boxes,
        playerScores: scores,
      }));
      return;
    }

    setGame((prev) => ({
      ...prev,
      horizontalLines: hLines,
      verticalLines: vLines,
      lineOwners,
      completedBoxes: boxes,
      playerScores: scores,
      currentTurnUserId: botId,
    }));
    setIsBotThinking(true);

    runDotsBotTurn(hLines, vLines, lineOwners, boxes, scores, size);
  };

  const runDotsBotTurn = (
    hLines: string[],
    vLines: string[],
    lineOwners: Record<string, string>,
    boxes: Record<string, string>,
    scores: Record<string, number>,
    size: number
  ) => {
    setTimeout(() => {
      const hSet = new Set(hLines);
      const vSet = new Set(vLines);
      const botMove = getDotsAndBoxesBotMove(hSet, vSet, size, difficulty);
      const key = `${botMove.row}-${botMove.col}`;
      const ownerKey = `${botMove.lineType}-${botMove.row}-${botMove.col}`;

      if (botMove.lineType === 'H') {
        hLines.push(key);
        hSet.add(key);
      } else {
        vLines.push(key);
        vSet.add(key);
      }
      lineOwners[ownerKey] = botId;

      let botCompleted = 0;
      for (let br = 0; br < size - 1; br++) {
        for (let bc = 0; bc < size - 1; bc++) {
          const boxKey = `${br}-${bc}`;
          if (!boxes[boxKey]) {
            const top = hSet.has(`${br}-${bc}`);
            const bottom = hSet.has(`${br + 1}-${bc}`);
            const left = vSet.has(`${br}-${bc}`);
            const right = vSet.has(`${br}-${bc + 1}`);
            if (top && bottom && left && right) {
              boxes[boxKey] = botId;
              botCompleted++;
            }
          }
        }
      }

      scores[botId] = (scores[botId] || 0) + botCompleted;
      const totalBoxes = (size - 1) * (size - 1);
      const totalClaimed = (scores[playerId] || 0) + (scores[botId] || 0);

      if (totalClaimed >= totalBoxes) {
        setIsBotThinking(false);
        const pScore = scores[playerId] || 0;
        const bScore = scores[botId] || 0;
        const winId = pScore > bScore ? playerId : pScore < bScore ? botId : undefined;
        setGame((prev) => ({
          ...prev,
          horizontalLines: [...hLines],
          verticalLines: [...vLines],
          lineOwners: { ...lineOwners },
          completedBoxes: { ...boxes },
          playerScores: { ...scores },
          status: 'FINISHED',
          winnerId: winId,
        }));
        if (winId === playerId) soundService.playWinFanfare();
        else soundService.playLineComplete();
        setShowResultModal(true);
        return;
      }

      if (botCompleted > 0) {
        soundService.playLineComplete();
        setGame((prev) => ({
          ...prev,
          horizontalLines: [...hLines],
          verticalLines: [...vLines],
          lineOwners: { ...lineOwners },
          completedBoxes: { ...boxes },
          playerScores: { ...scores },
        }));
        runDotsBotTurn(hLines, vLines, lineOwners, boxes, scores, size);
      } else {
        setIsBotThinking(false);
        setGame((prev) => ({
          ...prev,
          horizontalLines: [...hLines],
          verticalLines: [...vLines],
          lineOwners: { ...lineOwners },
          completedBoxes: { ...boxes },
          playerScores: { ...scores },
          currentTurnUserId: playerId,
        }));
      }
    }, 500);
  };

  // =========================================================================
  // 4. ROCK PAPER SCISSORS LOGIC
  // =========================================================================
  const handleRpsChoice = (choice: string) => {
    if (game.status !== 'PLAYING') return;

    soundService.playTileTap();
    const newHistory = [...rpsHistory, choice];
    setRpsHistory(newHistory);

    const botChoice = getRockPaperScissorsBotChoice(difficulty, newHistory);
    const round = game.rpsRound || 1;
    const wins = { ...(game.rpsRoundWins || { [playerId]: 0, [botId]: 0 }) };

    let roundWinnerId: string | null = null;
    let isTie = false;

    if (choice === botChoice) {
      isTie = true;
    } else if (
      (choice === 'ROCK' && botChoice === 'SCISSORS') ||
      (choice === 'PAPER' && botChoice === 'ROCK') ||
      (choice === 'SCISSORS' && botChoice === 'PAPER')
    ) {
      roundWinnerId = playerId;
      wins[playerId] = (wins[playerId] || 0) + 1;
      soundService.playLineComplete();
    } else {
      roundWinnerId = botId;
      wins[botId] = (wins[botId] || 0) + 1;
    }

    const targetWins = game.rpsTargetWins || 3;
    const isGameFinished = wins[playerId] >= targetWins || wins[botId] >= targetWins;
    const matchWinnerId = isGameFinished ? (wins[playerId] >= targetWins ? playerId : botId) : undefined;

    const roundResult = {
      round,
      user1Choice: choice,
      user2Choice: botChoice,
      roundWinnerId,
      isTie,
      p1UserId: playerId,
      p2UserId: botId,
    };

    setGame((prev) => ({
      ...prev,
      rpsRound: isTie ? round : round + 1,
      rpsRoundWins: wins,
      rpsLastRoundResult: roundResult,
      status: isGameFinished ? 'FINISHED' : 'PLAYING',
      winnerId: matchWinnerId,
    }));

    if (isGameFinished) {
      if (matchWinnerId === playerId) soundService.playWinFanfare();
      else soundService.playLineComplete();
      setShowResultModal(true);
    }
  };

  // =========================================================================
  // 5. MEMORY MATCH LOGIC
  // =========================================================================
  const handleMemoryFlip = (index: number) => {
    if (!isMyTurn || game.status !== 'PLAYING') return;
    const matched = [...(game.memoryMatched || Array(16).fill(false))];
    const cards = game.memoryCards || [];
    const flipped = [...(game.memoryFlippedIndices || [])];
    const scores = { ...(game.playerScores || { [playerId]: 0, [botId]: 0 }) };

    if (matched[index] || flipped.includes(index) || flipped.length >= 2) return;

    soundService.playTileTap();
    memoryKnownRef.current.set(index, cards[index]);
    const nextFlipped = [...flipped, index];

    if (nextFlipped.length === 1) {
      setGame((prev) => ({
        ...prev,
        memoryFlippedIndices: nextFlipped,
      }));
      return;
    }

    // Two cards flipped by player
    const [i1, i2] = nextFlipped;
    if (cards[i1] === cards[i2]) {
      // Match!
      soundService.playLineComplete();
      matched[i1] = true;
      matched[i2] = true;
      scores[playerId] = (scores[playerId] || 0) + 1;

      const totalPairs = cards.length / 2;
      const isFinished = (scores[playerId] + scores[botId]) >= totalPairs;
      const winId = isFinished ? (scores[playerId] > scores[botId] ? playerId : scores[playerId] < scores[botId] ? botId : undefined) : undefined;

      setGame((prev) => ({
        ...prev,
        memoryMatched: matched,
        memoryFlippedIndices: [],
        playerScores: scores,
        status: isFinished ? 'FINISHED' : 'PLAYING',
        winnerId: winId,
      }));

      if (isFinished) {
        if (winId === playerId) soundService.playWinFanfare();
        else soundService.playLineComplete();
        setShowResultModal(true);
      }
    } else {
      setGame((prev) => ({
        ...prev,
        memoryFlippedIndices: nextFlipped,
      }));

      setTimeout(() => {
        setGame((prev) => ({
          ...prev,
          memoryFlippedIndices: [],
          currentTurnUserId: botId,
        }));
        setIsBotThinking(true);
        runMemoryBotTurn(cards, matched, scores);
      }, 900);
    }
  };

  const runMemoryBotTurn = (cards: string[], matched: boolean[], scores: Record<string, number>) => {
    setTimeout(() => {
      // Bot Card 1
      const c1 = getMemoryBotMove(cards, matched, memoryKnownRef.current, difficulty, []);
      memoryKnownRef.current.set(c1, cards[c1]);
      soundService.playTileTap();

      setGame((prev) => ({
        ...prev,
        memoryFlippedIndices: [c1],
      }));

      setTimeout(() => {
        // Bot Card 2
        const c2 = getMemoryBotMove(cards, matched, memoryKnownRef.current, difficulty, [c1]);
        memoryKnownRef.current.set(c2, cards[c2]);
        soundService.playTileTap();

        if (cards[c1] === cards[c2]) {
          // Match!
          soundService.playLineComplete();
          matched[c1] = true;
          matched[c2] = true;
          scores[botId] = (scores[botId] || 0) + 1;

          const totalPairs = cards.length / 2;
          const isFinished = (scores[playerId] + scores[botId]) >= totalPairs;
          const winId = isFinished ? (scores[playerId] > scores[botId] ? playerId : scores[playerId] < scores[botId] ? botId : undefined) : undefined;

          setGame((prev) => ({
            ...prev,
            memoryMatched: [...matched],
            memoryFlippedIndices: [],
            playerScores: { ...scores },
            status: isFinished ? 'FINISHED' : 'PLAYING',
            winnerId: winId,
          }));

          if (isFinished) {
            setIsBotThinking(false);
            if (winId === playerId) soundService.playWinFanfare();
            else soundService.playLineComplete();
            setShowResultModal(true);
          } else {
            runMemoryBotTurn(cards, matched, scores);
          }
        } else {
          setGame((prev) => ({
            ...prev,
            memoryFlippedIndices: [c1, c2],
          }));

          setTimeout(() => {
            setIsBotThinking(false);
            setGame((prev) => ({
              ...prev,
              memoryFlippedIndices: [],
              currentTurnUserId: playerId,
            }));
          }, 900);
        }
      }, 700);
    }, 600);
  };

  // =========================================================================
  // 6. NUMBER RUSH LOGIC
  // =========================================================================
  const handleNumberRushTap = (tappedNum: number) => {
    if (game.status !== 'PLAYING') return;
    const progress = { ...(game.numberRushProgress || { [playerId]: 1, [botId]: 1 }) };
    const myNext = progress[playerId] || 1;

    if (tappedNum !== myNext) return;

    soundService.playTileTap();
    progress[playerId] = myNext + 1;

    if (myNext >= 25) {
      soundService.playWinFanfare();
      setGame((prev) => ({
        ...prev,
        numberRushProgress: progress,
        status: 'FINISHED',
        winnerId: playerId,
      }));
      setShowResultModal(true);
      return;
    }

    setGame((prev) => ({
      ...prev,
      numberRushProgress: progress,
    }));
  };

  useEffect(() => {
    if (game.gameType !== 'NUMBER_RUSH' || game.status !== 'PLAYING') return;

    const delay = getNumberRushBotDelay(difficulty);
    const timer = setTimeout(() => {
      setGame((prev) => {
        if (prev.status !== 'PLAYING') return prev;
        const prog = { ...(prev.numberRushProgress || { [playerId]: 1, [botId]: 1 }) };
        const bNext = prog[botId] || 1;

        if (bNext >= 25) {
          soundService.playLineComplete();
          setShowResultModal(true);
          return {
            ...prev,
            numberRushProgress: { ...prog, [botId]: 26 },
            status: 'FINISHED',
            winnerId: botId,
          };
        }

        return {
          ...prev,
          numberRushProgress: { ...prog, [botId]: bNext + 1 },
        };
      });
    }, delay);

    return () => clearTimeout(timer);
  }, [game.gameType, game.status, game.numberRushProgress?.[botId], difficulty]);

  // =========================================================================
  // 7. WORD SCRAMBLE LOGIC
  // =========================================================================
  const handleWordScrambleGuess = (guess: string) => {
    if (game.status !== 'PLAYING') return;
    const round = game.scrambleCurrentRound || 0;
    const words = game.scrambleWords || [];
    const targetWord = words[round] || '';
    const scores = { ...(game.playerScores || { [playerId]: 0, [botId]: 0 }) };
    const history = [...(game.scrambleRoundHistory || [])];

    if (guess.trim().toUpperCase() === targetWord.toUpperCase()) {
      soundService.playLineComplete();
      scores[playerId] = (scores[playerId] || 0) + 100;

      const solveRecord = {
        round: round + 1,
        targetWord,
        solvedByUserId: playerId,
        solverUsername: 'You',
        pointsAwarded: 100,
        timestamp: Date.now(),
      };
      history.push(solveRecord);

      const isLast = round + 1 >= words.length;
      if (isLast) {
        const pScore = scores[playerId];
        const bScore = scores[botId];
        const winId = pScore > bScore ? playerId : pScore < bScore ? botId : undefined;
        if (winId === playerId) soundService.playWinFanfare();
        else soundService.playLineComplete();

        setGame((prev) => ({
          ...prev,
          playerScores: scores,
          scrambleLastSolveResult: solveRecord,
          scrambleRoundHistory: history,
          status: 'FINISHED',
          winnerId: winId,
        }));
        setShowResultModal(true);
      } else {
        setGame((prev) => ({
          ...prev,
          scrambleCurrentRound: round + 1,
          playerScores: scores,
          scrambleLastSolveResult: solveRecord,
          scrambleRoundHistory: history,
        }));
      }
    } else {
      soundService.playTileTap();
      setGame((prev) => ({
        ...prev,
        scrambleLastIncorrectGuess: { userId: playerId, guess, timestamp: Date.now() },
      }));
    }
  };

  useEffect(() => {
    if (game.gameType !== 'WORD_SCRAMBLE' || game.status !== 'PLAYING') return;

    const round = game.scrambleCurrentRound || 0;
    const { delayMs, willSolve } = getWordScrambleBotParams(difficulty);

    const timer = setTimeout(() => {
      setGame((prev) => {
        if (prev.status !== 'PLAYING' || prev.scrambleCurrentRound !== round) return prev;
        if (!willSolve) return prev;

        const words = prev.scrambleWords || [];
        const targetWord = words[round] || '';
        const scores = { ...(prev.playerScores || { [playerId]: 0, [botId]: 0 }) };
        const history = [...(prev.scrambleRoundHistory || [])];

        scores[botId] = (scores[botId] || 0) + 100;
        const solveRecord = {
          round: round + 1,
          targetWord,
          solvedByUserId: botId,
          solverUsername: botProfile.username,
          pointsAwarded: 100,
          timestamp: Date.now(),
        };
        history.push(solveRecord);

        const isLast = round + 1 >= words.length;
        if (isLast) {
          const pScore = scores[playerId];
          const bScore = scores[botId];
          const winId = pScore > bScore ? playerId : pScore < bScore ? botId : undefined;
          if (winId === playerId) soundService.playWinFanfare();
          else soundService.playLineComplete();
          setShowResultModal(true);

          return {
            ...prev,
            playerScores: scores,
            scrambleLastSolveResult: solveRecord,
            scrambleRoundHistory: history,
            status: 'FINISHED',
            winnerId: winId,
          };
        }

        return {
          ...prev,
          scrambleCurrentRound: round + 1,
          playerScores: scores,
          scrambleLastSolveResult: solveRecord,
          scrambleRoundHistory: history,
        };
      });
    }, delayMs);

    return () => clearTimeout(timer);
  }, [game.gameType, game.status, game.scrambleCurrentRound, difficulty]);

  // =========================================================================
  // 8. BINGO LOGIC
  // =========================================================================
  const handleBingoCellClick = (row: number, col: number) => {
    if (!isMyTurn || game.status !== 'PLAYING') return;
    const player = game.players.find((p) => p.userId === playerId);
    if (!player || !player.board) return;

    const num = player.board[row][col];
    if (game.calledNumbers.includes(num)) return;

    callBingoNumber(num, playerId);
  };

  const callBingoNumber = (num: number, callerId: string) => {
    soundService.playTileTap();
    const newCalled = [...game.calledNumbers, num];
    const newMoves = [...(game.moves || []), { number: num, calledByUserId: callerId }];

    const p1 = game.players[0];
    const p2 = game.players[1];

    const p1Lines = calculateBingoLines(p1.board || [], newCalled);
    const p2Lines = calculateBingoLines(p2.board || [], newCalled);

    p1.lineCount = p1Lines;
    p2.lineCount = p2Lines;

    const targetLines = game.winningLines || 5;
    let winnerId: string | undefined;

    if (p1Lines >= targetLines && p2Lines >= targetLines) {
      soundService.playLineComplete();
    } else if (p1Lines >= targetLines) {
      winnerId = playerId;
      soundService.playWinFanfare();
    } else if (p2Lines >= targetLines) {
      winnerId = botId;
      soundService.playLineComplete();
    }

    if (p1Lines >= targetLines || p2Lines >= targetLines) {
      setGame((prev) => ({
        ...prev,
        calledNumbers: newCalled,
        moves: newMoves,
        status: 'FINISHED',
        winnerId,
      }));
      setShowResultModal(true);
      return;
    }

    const nextTurn = callerId === playerId ? botId : playerId;
    setGame((prev) => ({
      ...prev,
      calledNumbers: newCalled,
      moves: newMoves,
      currentTurnUserId: nextTurn,
    }));

    if (nextTurn === botId) {
      setIsBotThinking(true);
      setTimeout(() => {
        setIsBotThinking(false);
        const botCall = getBingoBotCall(p2.board || [], newCalled, difficulty);
        callBingoNumber(botCall, botId);
      }, 700);
    }
  };

  const calculateBingoLines = (board: number[][], called: number[]): number => {
    if (!board || board.length < 5) return 0;
    const set = new Set(called);
    let lines = 0;
    for (let r = 0; r < 5; r++) {
      if (board[r].every((n) => set.has(n))) lines++;
    }
    for (let c = 0; c < 5; c++) {
      let full = true;
      for (let r = 0; r < 5; r++) {
        if (!set.has(board[r][c])) { full = false; break; }
      }
      if (full) lines++;
    }
    let d1 = true;
    for (let i = 0; i < 5; i++) {
      if (!set.has(board[i][i])) { d1 = false; break; }
    }
    if (d1) lines++;
    let d2 = true;
    for (let i = 0; i < 5; i++) {
      if (!set.has(board[i][4 - i])) { d2 = false; break; }
    }
    if (d2) lines++;

    return lines;
  };

  const myPlayer = game.players.find((p) => p.userId === playerId);
  const myBoard = myPlayer?.board || [];
  const calledByMap: Record<number, string> = {};
  (game.moves || []).forEach((m) => {
    calledByMap[m.number] = m.calledByUserId;
  });

  // --- SHIP BATTLE OFFLINE ---
  const handleShipLockFleet = (fleet: ShipPlacement[]) => {
    soundService.playCountdownGo();
    // 1. Lock player fleet while bot is "placing ships"
    setGame((prev) => ({
      ...prev,
      shipPhase: 'SETUP',
      shipFleets: {
        ...(prev.shipFleets || {}),
        [playerId]: fleet,
      },
      shipFleetsLocked: {
        ...(prev.shipFleetsLocked || {}),
        [playerId]: true,
        [botId]: false,
      },
    }));

    // 2. After 1.6s delay, bot finishes placing fleet and battle commences!
    setTimeout(() => {
      setGame((prev) => ({
        ...prev,
        shipPhase: 'BATTLE',
        shipFleetsLocked: {
          ...(prev.shipFleetsLocked || {}),
          [botId]: true,
        },
        currentTurnUserId: playerId,
      }));
      soundService.playTurnChime();
    }, 1600);
  };

  const handleShipAttack = (r: number, c: number) => {
    if (game.status !== 'PLAYING' || game.shipPhase !== 'BATTLE' || game.currentTurnUserId !== playerId) return;

    const botFleet = game.shipFleets?.[botId] || [];
    const myAttacks = [...(game.shipAttacks?.[playerId] || [])];

    // Check hit against bot fleet
    let hitShip: ShipPlacement | null = null;
    for (const ship of botFleet) {
      for (const cell of ship.cells) {
        if (cell.row === r && cell.col === c) {
          hitShip = ship;
          break;
        }
      }
      if (hitShip) break;
    }

    const isHit = !!hitShip;
    let isSunk = false;
    let sunkType: string | undefined;

    if (isHit && hitShip) {
      const allHits = new Set(myAttacks.filter((a) => a.result === 'HIT' || a.result === 'SUNK').map((a) => `${a.row}-${a.col}`));
      allHits.add(`${r}-${c}`);
      isSunk = hitShip.cells.every((sc) => allHits.has(`${sc.row}-${sc.col}`));
      if (isSunk) sunkType = hitShip.shipType;
    }

    const result = isSunk ? 'SUNK' : isHit ? 'HIT' : 'MISS';
    myAttacks.push({
      attackerUserId: playerId,
      row: r,
      col: c,
      result,
      sunkShipType: sunkType,
      timestamp: Date.now(),
    });

    const botSunkList = [...(game.shipSunkTypes?.[botId] || [])];
    if (isSunk && sunkType && !botSunkList.includes(sunkType)) {
      botSunkList.push(sunkType);
    }

    const allBotShipsSunk = botSunkList.length >= 5;

    if (allBotShipsSunk) {
      soundService.playWinFanfare();
      setGame((prev) => ({
        ...prev,
        status: 'FINISHED',
        winnerId: playerId,
        shipAttacks: { ...(prev.shipAttacks || {}), [playerId]: myAttacks },
        shipSunkTypes: { ...(prev.shipSunkTypes || {}), [botId]: botSunkList },
        shipLastAttackResult: { attackerUserId: playerId, defenderUserId: botId, row: r, col: c, result, sunkShipType: sunkType },
      }));
      setShowResultModal(true);
      return;
    }

    // Switch turn to bot
    setGame((prev) => ({
      ...prev,
      shipAttacks: { ...(prev.shipAttacks || {}), [playerId]: myAttacks },
      shipSunkTypes: { ...(prev.shipSunkTypes || {}), [botId]: botSunkList },
      shipLastAttackResult: { attackerUserId: playerId, defenderUserId: botId, row: r, col: c, result, sunkShipType: sunkType },
      currentTurnUserId: botId,
    }));
    setIsBotThinking(true);

    const delay = getShipBattleBotDelay(difficulty);
    setTimeout(() => {
      setGame((current) => {
        if (current.status !== 'PLAYING') return current;
        const botAttacks = [...(current.shipAttacks?.[botId] || [])];
        const target = chooseShipBattleTarget(botAttacks, difficulty);

        const playerFleet = current.shipFleets?.[playerId] || [];
        let botHitShip: ShipPlacement | null = null;
        for (const ship of playerFleet) {
          for (const cell of ship.cells) {
            if (cell.row === target.row && cell.col === target.col) {
              botHitShip = ship;
              break;
            }
          }
          if (botHitShip) break;
        }

        const botIsHit = !!botHitShip;
        let botIsSunk = false;
        let botSunkType: string | undefined;

        if (botIsHit && botHitShip) {
          const allHits = new Set(botAttacks.filter((a) => a.result === 'HIT' || a.result === 'SUNK').map((a) => `${a.row}-${a.col}`));
          allHits.add(`${target.row}-${target.col}`);
          botIsSunk = botHitShip.cells.every((sc) => allHits.has(`${sc.row}-${sc.col}`));
          if (botIsSunk) botSunkType = botHitShip.shipType;
        }

        const botResult = botIsSunk ? 'SUNK' : botIsHit ? 'HIT' : 'MISS';
        botAttacks.push({
          attackerUserId: botId,
          row: target.row,
          col: target.col,
          result: botResult,
          sunkShipType: botSunkType,
          timestamp: Date.now(),
        });

        const playerSunkList = [...(current.shipSunkTypes?.[playerId] || [])];
        if (botIsSunk && botSunkType && !playerSunkList.includes(botSunkType)) {
          playerSunkList.push(botSunkType);
        }

        const allPlayerShipsSunk = playerSunkList.length >= 5;
        setIsBotThinking(false);

        if (allPlayerShipsSunk) {
          soundService.playLineComplete();
          setShowResultModal(true);
          return {
            ...current,
            status: 'FINISHED',
            winnerId: botId,
            shipAttacks: { ...(current.shipAttacks || {}), [botId]: botAttacks },
            shipSunkTypes: { ...(current.shipSunkTypes || {}), [playerId]: playerSunkList },
            shipLastAttackResult: { attackerUserId: botId, defenderUserId: playerId, row: target.row, col: target.col, result: botResult, sunkShipType: botSunkType },
          };
        }

        return {
          ...current,
          currentTurnUserId: playerId,
          shipAttacks: { ...(current.shipAttacks || {}), [botId]: botAttacks },
          shipSunkTypes: { ...(current.shipSunkTypes || {}), [playerId]: playerSunkList },
          shipLastAttackResult: { attackerUserId: botId, defenderUserId: playerId, row: target.row, col: target.col, result: botResult, sunkShipType: botSunkType },
        };
      });
    }, delay);
  };

  const isPlayerWinner = game.winnerId === playerId;
  const isBotWinner = game.winnerId === botId;

  if (game.gameType === 'SHIP_BATTLE') {
    return (
      <>
        <ShipBattleArena
          game={game}
          currentUserId={playerId}
          onLockFleet={handleShipLockFleet}
          onAttack={handleShipAttack}
          isMyTurn={isMyTurn}
          disabled={game.status !== 'PLAYING'}
        />

        {/* Fullscreen Result Modal */}
        {showResultModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[32px] p-6 sm:p-7 shadow-2xl border-2 border-indigo-200 dark:border-slate-800 text-center space-y-4 animate-in zoom-in-95">
              <div className="w-20 h-20 rounded-3xl mx-auto flex items-center justify-center text-4xl shadow-md bg-gradient-to-tr from-amber-400 to-yellow-500">
                {isPlayerWinner ? '🏆' : isBotWinner ? '🤖' : '🤝'}
              </div>

              <div className="space-y-1">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  {isPlayerWinner ? 'Victory! 🎉' : isBotWinner ? 'Fleet Defeated! 💥' : "It's a Draw! 🤝"}
                </h3>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {isPlayerWinner
                    ? `You sank all enemy warships against ${botProfile.username}!`
                    : isBotWinner
                    ? `${botProfile.username} sank all your warships. Try again!`
                    : 'A hard-fought tie match! Rematch to break the tie.'}
                </p>
              </div>

              <div className="pt-2 flex flex-col space-y-2">
                <button
                  onClick={() => startNewGame()}
                  className="btn-gradient w-full py-3 rounded-2xl text-xs font-black text-white shadow-md cursor-pointer hover:brightness-105 active:scale-95 transition"
                >
                  Play Again (Rematch) 🔄
                </button>
                <button
                  onClick={() => navigate('/hub')}
                  className="w-full py-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-xs font-black text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition"
                >
                  Back to Game Hub
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 space-y-4 font-sans">
      {/* Top Navigation & Status Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/90 dark:bg-slate-900/90 p-4 rounded-3xl border border-indigo-100 dark:border-slate-800 shadow-xs">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 cursor-pointer transition"
            title="Back to Game Hub"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                Solo vs {botProfile.username}
              </h2>
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-black border border-emerald-200 dark:border-emerald-800">
                <WifiOff className="w-3 h-3" />
                <span>Offline</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              {isBotThinking ? (
                <span className="text-amber-500 font-bold animate-pulse">🤖 Bot is calculating move...</span>
              ) : isMyTurn ? (
                <span className="text-emerald-500 font-bold">👉 Your Turn!</span>
              ) : (
                <span>Playing in solo practice mode</span>
              )}
            </p>
          </div>
        </div>

        {/* Difficulty Picker */}
        <div className="flex items-center space-x-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
          {(['EASY', 'MEDIUM', 'HARD'] as BotDifficulty[]).map((d) => (
            <button
              key={d}
              onClick={() => handleDifficultyChange(d)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                difficulty === d
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
              }`}
            >
              {d === 'EASY' ? '🟢 Easy' : d === 'MEDIUM' ? '🟡 Medium' : '🔴 Hard'}
            </button>
          ))}
          <button
            onClick={() => startNewGame()}
            className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 cursor-pointer ml-1"
            title="Restart Match"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Arena View */}
      <div className="flex justify-center w-full">
        {game.gameType === 'TIC_TAC_TOE' && (
          <TicTacToeArena
            game={game}
            currentUserId={playerId}
            onMakeMove={handleTttMove}
            isMyTurn={isMyTurn}
            disabled={game.status !== 'PLAYING'}
          />
        )}

        {game.gameType === 'CONNECT_FOUR' && (
          <ConnectFourArena
            game={game}
            currentUserId={playerId}
            onMakeMove={handleC4Move}
            isMyTurn={isMyTurn}
            disabled={game.status !== 'PLAYING'}
          />
        )}

        {game.gameType === 'DOTS_AND_BOXES' && (
          <DotsAndBoxesArena
            game={game}
            currentUserId={playerId}
            onDrawLine={handleDotsLine}
            isMyTurn={isMyTurn}
            disabled={game.status !== 'PLAYING'}
          />
        )}

        {game.gameType === 'ROCK_PAPER_SCISSORS' && (
          <RockPaperScissorsArena
            game={game}
            currentUserId={playerId}
            onSubmitChoice={handleRpsChoice}
            disabled={game.status !== 'PLAYING'}
          />
        )}

        {game.gameType === 'MEMORY' && (
          <MemoryArena
            game={game}
            currentUserId={playerId}
            onFlipCard={handleMemoryFlip}
            isMyTurn={isMyTurn}
            disabled={game.status !== 'PLAYING'}
          />
        )}

        {game.gameType === 'NUMBER_RUSH' && (
          <NumberRushArena
            game={game}
            currentUserId={playerId}
            onTapNumber={handleNumberRushTap}
            disabled={game.status !== 'PLAYING'}
          />
        )}

        {game.gameType === 'WORD_SCRAMBLE' && (
          <WordScrambleArena
            game={game}
            currentUserId={playerId}
            onSubmitGuess={handleWordScrambleGuess}
            disabled={game.status !== 'PLAYING'}
          />
        )}


        {game.gameType === 'BINGO' && (
          <div className="flex flex-col items-center w-full max-w-[560px] space-y-4">
            <div className="flex items-center justify-between w-full px-4 py-2 bg-white/90 dark:bg-slate-800/90 rounded-2xl border border-indigo-100 dark:border-slate-700 text-xs font-bold">
              <span>Lines: <strong className="text-indigo-600">{myPlayer?.lineCount || 0} / 5</strong></span>
              <span>Bot Lines: <strong className="text-purple-600">{game.players[1]?.lineCount || 0} / 5</strong></span>
            </div>

            <BoardGrid
              board={myBoard}
              mode="game"
              calledNumbers={game.calledNumbers}
              calledByMap={calledByMap}
              currentUserId={playerId}
              onCellClick={(r, c) => handleBingoCellClick(r, c)}
              isMyTurn={isMyTurn}
              disabled={!isMyTurn}
            />

            <div className="w-full">
              <CalledNumbersTicker
                calledNumbers={game.calledNumbers}
                lastNumber={game.calledNumbers[game.calledNumbers.length - 1] || null}
                totalNumbers={25}
                calledByMap={calledByMap}
                currentUserId={playerId}
              />
            </div>
          </div>
        )}
      </div>

      {/* Result Modal */}
      {showResultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[32px] p-6 sm:p-7 shadow-2xl border-2 border-indigo-200 dark:border-slate-800 text-center space-y-4 animate-in zoom-in-95">
            <div className="w-20 h-20 rounded-3xl mx-auto flex items-center justify-center text-4xl shadow-md bg-gradient-to-tr from-amber-400 to-yellow-500">
              {isPlayerWinner ? '🏆' : isBotWinner ? '🤖' : '🤝'}
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                {isPlayerWinner ? 'Victory! 🎉' : isBotWinner ? 'Bot Won! 🤖' : 'It\'s a Draw! 🤝'}
              </h3>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {isPlayerWinner
                  ? `You outsmarted ${botProfile.username} on ${difficulty.toLowerCase()} difficulty!`
                  : isBotWinner
                  ? `${botProfile.username} claimed this victory. Practice makes perfect!`
                  : 'A hard-fought tie match! Rematch to break the tie.'}
              </p>
            </div>

            <div className="pt-2 flex flex-col space-y-2">
              <button
                onClick={() => startNewGame()}
                className="btn-gradient w-full py-3 rounded-2xl text-xs font-black text-white shadow-md cursor-pointer hover:brightness-105 active:scale-95 transition"
              >
                Play Again (Rematch) 🔄
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full py-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-xs font-black text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition"
              >
                Back to Game Hub
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
