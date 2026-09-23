import { create } from 'zustand';
import { Room, Game, GameEventEnvelope, ActiveEmote, NetworkConnectionStatus } from '../lib/types';
import { roomApi, gameApi } from '../lib/api';
import { socketService } from '../lib/socket';

interface GameState {
  room: Room | null;
  game: Game | null;
  board: number[][] | null;
  selectedPos: { row: number; column: number } | null;
  lineCount: number;
  lastCalledNumber: number | null;
  calledByMap: Record<number, string>; // number -> calledByUserId
  winnerInfo: { username: string; avatar?: string; userId?: string } | null;
  hasWon: boolean;
  activeEmotes: ActiveEmote[];
  isLoading: boolean;
  error: string | null;
  connectionStatus: NetworkConnectionStatus;
  lastKnownVersion: number;

  setRoom: (room: Room | null) => void;
  setGame: (game: Game | null) => void;
  setBoard: (board: number[][] | null) => void;
  setSelectedPos: (pos: { row: number; column: number } | null) => void;
  setConnectionStatus: (status: NetworkConnectionStatus) => void;
  addEmote: (emote: ActiveEmote) => void;
  clearEmotes: () => void;
  fetchRoom: (code: string) => Promise<Room>;
  fetchGame: (gameId: string) => Promise<Game>;
  syncGameByRoomCode: (roomCode: string, currentUserId: string, silent?: boolean) => Promise<Game>;
  initSocketListeners: (roomCode: string, currentUserId: string) => void;
  leaveCurrentRoom: () => Promise<void>;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  room: null,
  game: null,
  board: null,
  selectedPos: null,
  lineCount: 0,
  lastCalledNumber: null,
  calledByMap: {},
  winnerInfo: null,
  hasWon: false,
  activeEmotes: [],
  isLoading: false,
  error: null,
  connectionStatus: socketService.connectionStatus,
  lastKnownVersion: 0,

  setRoom: (room) => set({ room }),
  setGame: (game) => set({ game }),
  setBoard: (board) => set({ board }),
  setSelectedPos: (selectedPos) => set({ selectedPos }),
  setConnectionStatus: (connectionStatus) => set({ connectionStatus }),
  addEmote: (emote) => set((state) => ({ activeEmotes: [...state.activeEmotes.slice(-15), emote] })),
  clearEmotes: () => set({ activeEmotes: [] }),

  fetchRoom: async (code: string) => {
    set({ isLoading: true, error: null });
    try {
      const room = await roomApi.getRoom(code);
      set({ room, isLoading: false });
      return room;
    } catch (err: any) {
      set({ isLoading: false, error: err.response?.data?.message || 'Failed to fetch room' });
      throw err;
    }
  },

  fetchGame: async (gameId: string) => {
    set({ isLoading: true, error: null });
    try {
      const game = await gameApi.getGame(gameId);
      const newMap: Record<number, string> = {};
      if (game.moves) {
        game.moves.forEach((m) => {
          newMap[m.number] = m.calledByUserId;
        });
      }
      set({ game, calledByMap: newMap, isLoading: false });
      return game;
    } catch (err: any) {
      set({ isLoading: false, error: err.response?.data?.message || 'Failed to fetch game' });
      throw err;
    }
  },

  syncGameByRoomCode: async (roomCode: string, currentUserId: string, silent = false) => {
    if (!silent) set({ isLoading: true, error: null });
    try {
      const game = await gameApi.getGameByRoom(roomCode);
      const myPlayer = game.players.find((p) => p.userId === currentUserId);
      const newMap: Record<number, string> = {};
      if (game.moves) {
        game.moves.forEach((m) => {
          newMap[m.number] = m.calledByUserId;
        });
      }

      const updates: any = {
        game,
        board: myPlayer?.board || null,
        lineCount: myPlayer?.lineCount || 0,
        lastCalledNumber: game.calledNumbers.length > 0 ? game.calledNumbers[game.calledNumbers.length - 1] : null,
        calledByMap: newMap,
      };

      if (game.version !== undefined) {
        updates.lastKnownVersion = game.version;
      }

      if (!silent) {
        updates.isLoading = false;
      }

      if (game.status === 'FINISHED') {
        const winningPlayer = game.players.find((p) => p.userId === game.winnerId);
        updates.winnerInfo = winningPlayer || (game.winnerId ? { username: 'Winner', userId: game.winnerId } : { username: 'Nobody (Draw)', userId: '' });
        updates.hasWon = !!(game.winnerId && currentUserId && game.winnerId === currentUserId);
      }

      set(updates);
      return game;
    } catch (err: any) {
      if (!silent) {
        set({ isLoading: false, error: err.response?.data?.message || 'Failed to sync game state' });
      }
      throw err;
    }
  },

  initSocketListeners: (roomCode: string, currentUserId: string) => {
    socketService.onStatusChange((status) => {
      set({ connectionStatus: status });
      if (status === 'CONNECTED') {
        const { game, room } = get();
        if (game?.roomCode) {
          get().syncGameByRoomCode(game.roomCode, currentUserId, true).catch(() => {});
        } else if (room?.roomCode) {
          get().fetchRoom(room.roomCode).catch(() => {});
        }
      }
    });

    socketService.connect(roomCode, (event: GameEventEnvelope) => {
      // Sequence Gap Detection: If event version jumps past lastKnownVersion + 1, trigger silent resync
      const evVer = event.gameVersion;
      const curVer = get().lastKnownVersion;
      if (evVer !== undefined && evVer > 0) {
        if (curVer > 0 && evVer > curVer + 1) {
          console.warn(`[Sync Gap] Local version ${curVer} behind event version ${evVer}. Resyncing.`);
          get().syncGameByRoomCode(roomCode, currentUserId, true).catch(() => {});
        }
        set({ lastKnownVersion: Math.max(curVer, evVer) });
      }

      const { room, game, calledByMap } = get();

      switch (event.type) {
        case 'PLAYER_JOINED':
          if (room) {
            const exists = room.players.some((p) => p.userId === event.data.userId);
            if (!exists) {
              set({
                room: {
                  ...room,
                  players: [
                    ...room.players,
                    {
                      userId: event.data.userId,
                      username: event.data.username,
                      avatar: event.data.avatar,
                      isGuest: event.data.isGuest,
                      ready: false,
                      boardLocked: false,
                    },
                  ],
                },
              });
            }
          }
          break;

        case 'PLAYER_LEFT':
          if (room) {
            set({
              room: {
                ...room,
                hostId: event.data.newHostId || room.hostId,
                players: room.players.filter((p) => p.userId !== event.data.userId),
              },
            });
          }
          break;

        case 'PLAYER_READY':
        case 'PLAYER_NOT_READY':
          if (room) {
            set({
              room: {
                ...room,
                players: room.players.map((p) =>
                  p.userId === event.data.userId ? { ...p, ready: event.data.ready } : p
                ),
              },
            });
          }
          break;

        case 'BOARD_LOCKED':
          if (room) {
            set({
              room: {
                ...room,
                players: room.players.map((p) =>
                  p.userId === event.data.userId ? { ...p, boardLocked: true, ready: true } : p
                ),
              },
            });
          }
          break;

        case 'GAME_STARTED':
          if (event.data.gameId) {
            gameApi.getGame(event.data.gameId).then((fullGame) => {
              const myPlayer = fullGame.players.find((p) => p.userId === currentUserId);
              const newMap: Record<number, string> = {};
              if (fullGame.moves) {
                fullGame.moves.forEach((m) => {
                  newMap[m.number] = m.calledByUserId;
                });
              }
              set({
                game: fullGame,
                board: myPlayer?.board || null,
                lineCount: myPlayer?.lineCount || 0,
                calledByMap: newMap,
              });
            });
          }
          break;

        case 'NUMBER_CALLED':
          if (game) {
            const updatedCalled = event.data.calledNumbers || [...game.calledNumbers, event.data.number];
            const callerUserId = event.data.calledBy?.userId;
            const updatedMap = { ...calledByMap };
            if (callerUserId && event.data.number) {
              updatedMap[event.data.number] = callerUserId;
            }
            if (event.data.moves && Array.isArray(event.data.moves)) {
              event.data.moves.forEach((m: any) => {
                updatedMap[m.number] = m.calledByUserId;
              });
            }
            set({
              lastCalledNumber: event.data.number,
              calledByMap: updatedMap,
              game: {
                ...game,
                calledNumbers: updatedCalled,
                currentTurnUserId: event.data.nextTurn,
              },
            });
          }
          break;

        case 'TURN_CHANGED':
          if (game) {
            const updatedCalled = event.data.calledNumbers || game.calledNumbers;
            const updatedMap = { ...calledByMap };
            if (event.data.moves && Array.isArray(event.data.moves)) {
              event.data.moves.forEach((m: any) => {
                updatedMap[m.number] = m.calledByUserId;
              });
            }
            set({
              calledByMap: updatedMap,
              game: {
                ...game,
                calledNumbers: updatedCalled,
                currentTurnUserId: event.data.currentTurnUserId,
              },
            });
          }
          break;

        case 'LINE_COMPLETED':
          if (event.data.userId === currentUserId) {
            set({ lineCount: event.data.lineCount });
          }
          if (game) {
            set({
              game: {
                ...game,
                players: game.players.map((p) =>
                  p.userId === event.data.userId ? { ...p, lineCount: event.data.lineCount } : p
                ),
              },
            });
          }
          break;

        case 'GAME_FINISHED':
          set({
            winnerInfo: event.data.winner,
            hasWon: event.data.winner?.userId === currentUserId,
            game: game ? { ...game, status: 'FINISHED', winnerId: event.data.winner?.userId } : null,
          });
          break;

        case 'GAME_DRAW':
          set({
            winnerInfo: { username: 'Nobody (Draw)', userId: '' },
            hasWon: false,
            game: game ? { ...game, status: 'FINISHED', winnerId: '' } : null,
          });
          break;

        case 'TTT_MOVE_MADE':
          if (game) {
            set({
              game: {
                ...game,
                tttBoard: event.data.tttBoard || game.tttBoard,
                currentTurnUserId: event.data.nextTurn,
                status: (event.data.status as any) || game.status,
              },
            });
          }
          break;

        case 'DOTS_AND_BOXES':
        case 'DOTS_LINE_DRAWN':
          if (game) {
            set({
              game: {
                ...game,
                horizontalLines: event.data.horizontalLines || game.horizontalLines,
                verticalLines: event.data.verticalLines || game.verticalLines,
                lineOwners: event.data.lineOwners || game.lineOwners || {},
                completedBoxes: event.data.completedBoxes || game.completedBoxes,
                playerScores: event.data.playerScores || game.playerScores,
                currentTurnUserId: event.data.nextTurn,
                status: (event.data.status as any) || game.status,
              },
            });
          }
          break;

        case 'C4_MOVE_MADE':
          if (game) {
            set({
              game: {
                ...game,
                c4Board: event.data.c4Board || game.c4Board,
                c4WinningCells: event.data.winningCells || game.c4WinningCells,
                currentTurnUserId: event.data.nextTurn,
                status: (event.data.status as any) || game.status,
              },
            });
          }
          break;

        case 'RPS_CHOICE_LOCKED':
          if (game) {
            const choices = { ...(game.rpsChoices || {}) };
            choices[event.data.userId] = 'LOCKED';
            set({
              game: {
                ...game,
                rpsChoices: choices,
              },
            });
          }
          break;

        case 'RPS_ROUND_RESOLVED':
          if (game) {
            set({
              game: {
                ...game,
                rpsRound: (event.data.round || 1) + 1,
                rpsRoundWins: event.data.roundScores || game.rpsRoundWins,
                rpsLastRoundResult: event.data,
                rpsChoices: {},
              },
            });
          }
          break;

        case 'MEMORY_FLIP_RESULT':
          if (game) {
            if (event.data.status === 'FIRST_CARD_FLIPPED') {
              set({
                game: {
                  ...game,
                  memoryFlippedIndices: [event.data.cardIndex],
                },
              });
            } else if (event.data.status === 'MATCH') {
              set({
                game: {
                  ...game,
                  memoryMatched: event.data.matched || game.memoryMatched,
                  playerScores: event.data.playerScores || game.playerScores,
                  currentTurnUserId: event.data.nextTurn || game.currentTurnUserId,
                  memoryFlippedIndices: [event.data.firstIndex, event.data.secondIndex],
                },
              });
              setTimeout(() => {
                const latest = get().game;
                if (latest) {
                  set({
                    game: {
                      ...latest,
                      memoryFlippedIndices: [],
                    },
                  });
                }
              }, 600);
            } else {
              // MISMATCH: Show both cards for 1.2s so players can memorize before hiding
              set({
                game: {
                  ...game,
                  playerScores: event.data.playerScores || game.playerScores,
                  currentTurnUserId: event.data.nextTurn || game.currentTurnUserId,
                  memoryFlippedIndices: [event.data.firstIndex, event.data.secondIndex],
                },
              });
              setTimeout(() => {
                const latest = get().game;
                if (latest) {
                  set({
                    game: {
                      ...latest,
                      memoryFlippedIndices: [],
                    },
                  });
                }
              }, 1200);
            }
          }
          break;

        case 'NUMBER_RUSH_TAP':
          if (game) {
            set({
              game: {
                ...game,
                numberRushProgress: event.data.progress || game.numberRushProgress,
              },
            });
          }
          break;

        case 'WORD_SCRAMBLE_SOLVED':
          if (game) {
            const updatedHistory = event.data.roundHistory || (
              event.data.solveRecord
                ? [...(game.scrambleRoundHistory || []), event.data.solveRecord]
                : game.scrambleRoundHistory
            );
            set({
              game: {
                ...game,
                scrambleCurrentRound: event.data.newRound ?? game.scrambleCurrentRound,
                playerScores: event.data.scores || game.playerScores,
                scrambleLastWinnerId: event.data.userId,
                scrambleLastSolveResult: event.data.solveRecord || game.scrambleLastSolveResult,
                scrambleRoundHistory: updatedHistory,
              },
            });
          }
          break;

        case 'WORD_SCRAMBLE_INCORRECT':
          if (game) {
            set({
              game: {
                ...game,
                scrambleLastIncorrectGuess: {
                  userId: event.data.userId,
                  guess: event.data.guess,
                  timestamp: Date.now(),
                },
              },
            });
          }
          break;

        case 'QUIZ_ROUND_COMPLETE':
          if (game) {
            set({
              game: {
                ...game,
                quizCurrentQuestion: event.data.nextQuestionIndex ?? game.quizCurrentQuestion,
                playerScores: event.data.scores || game.playerScores,
                quizAnswers: {},
                quizLastRoundResult: {
                  questionIndex: event.data.questionIndex,
                  correctIndex: event.data.correctIndex,
                },
              },
            });
          }
          break;

        case 'QUIZ_PLAYER_ANSWERED':
          if (game) {
            const answers = { ...(game.quizAnswers || {}) };
            answers[event.data.userId] = 1;
            set({
              game: {
                ...game,
                quizAnswers: answers,
              },
            });
          }
          break;

        case 'SHIP_FLEET_LOCKED':
          if (game) {
            const lockedMap = { ...(game.shipFleetsLocked || {}) };
            lockedMap[event.data.userId] = true;
            set({
              game: {
                ...game,
                shipFleetsLocked: lockedMap,
              },
            });
          }
          break;

        case 'SHIP_BATTLE_STARTED':
          if (game) {
            set({
              game: {
                ...game,
                shipPhase: 'BATTLE',
                currentTurnUserId: event.data.currentTurnUserId || game.currentTurnUserId,
              },
            });
          }
          break;

        case 'SHIP_ATTACK_RESULT':
          if (game) {
            const attacksMap = { ...(game.shipAttacks || {}) };
            const attackerList = [...(attacksMap[event.data.attackerUserId] || [])];
            attackerList.push({
              attackerUserId: event.data.attackerUserId,
              row: event.data.row,
              col: event.data.col,
              result: event.data.result,
              sunkShipType: event.data.sunkShipType,
              timestamp: Date.now(),
            });
            attacksMap[event.data.attackerUserId] = attackerList;

            const sunkMap = { ...(game.shipSunkTypes || {}) };
            if (event.data.sunkShipType) {
              const defSunk = [...(sunkMap[event.data.defenderUserId] || [])];
              if (!defSunk.includes(event.data.sunkShipType)) {
                defSunk.push(event.data.sunkShipType);
              }
              sunkMap[event.data.defenderUserId] = defSunk;
            }

            set({
              game: {
                ...game,
                shipAttacks: attacksMap,
                shipSunkTypes: sunkMap,
                currentTurnUserId: event.data.nextTurnUserId || game.currentTurnUserId,
                shipLastAttackResult: event.data,
              },
            });
          }
          break;

        case 'MASTERMIND_SECRET_LOCKED':
          if (game) {
            const lockedMap = { ...(game.mastermindSecretsLocked || {}) };
            lockedMap[event.data.userId] = true;
            set({
              game: {
                ...game,
                mastermindSecretsLocked: lockedMap,
              },
            });
          }
          break;

        case 'MASTERMIND_PHASE_CHANGED':
          if (game) {
            const lockedMap = { ...(game.mastermindSecretsLocked || {}) };
            game.players.forEach((p) => {
              lockedMap[p.userId] = true;
            });
            set({
              game: {
                ...game,
                mastermindPhase: 'BATTLE',
                mastermindSecretsLocked: lockedMap,
                currentTurnUserId: event.data.currentTurnUserId || game.currentTurnUserId,
              },
            });
          }
          break;

        case 'MASTERMIND_GUESS_RESULT':
          if (game) {
            const guessesMap = { ...(game.mastermindGuesses || {}) };
            const userList = [...(guessesMap[event.data.userId] || [])];
            userList.push({
              userId: event.data.userId,
              guess: event.data.guess,
              exactMatches: event.data.exactMatches,
              colorMatches: event.data.colorMatches,
              timestamp: Date.now(),
            });
            guessesMap[event.data.userId] = userList;

            set({
              game: {
                ...game,
                mastermindGuesses: guessesMap,
                currentTurnUserId: event.data.nextTurnUserId || game.currentTurnUserId,
                mastermindLastGuessResult: event.data,
              },
            });
          }
          break;

        case 'EMOTE_SENT':
          if (event.data?.emote) {
            const emoteItem: ActiveEmote = {
              id: `${event.data.userId}-${Date.now()}-${Math.random()}`,
              userId: event.data.userId,
              username: event.data.username || 'Player',
              emote: event.data.emote,
              timestamp: event.data.timestamp || Date.now(),
            };
            set((state) => ({
              activeEmotes: [...state.activeEmotes.slice(-15), emoteItem],
            }));
          }
          break;

        case 'REMATCH_STARTED': {
          const { room } = get();
          if (room) {
            set({
              room: {
                ...room,
                status: event.data.status || 'BOARD_SETUP',
              },
              winnerInfo: null,
              hasWon: false,
              lastCalledNumber: null,
              calledByMap: {},
              lastKnownVersion: 0,
            });
          }
          if (event.data.newGameId) {
            gameApi.getGame(event.data.newGameId).then((newGame) => {
              const myPlayer = newGame.players.find((p) => p.userId === currentUserId);
              set({
                game: newGame,
                board: myPlayer?.board || null,
                winnerInfo: null,
                hasWon: false,
                lastCalledNumber: null,
                calledByMap: {},
                lastKnownVersion: newGame.version || 0,
              });
            }).catch(() => {});
          } else {
            get().fetchRoom(roomCode).catch(() => {});
          }
          break;
        }
      }
    });
  },

  leaveCurrentRoom: async () => {
    const { room } = get();
    if (room) {
      try {
        await roomApi.leaveRoom(room.roomCode);
      } catch (e) {
        // ignore
      }
    }
    socketService.disconnect();
    get().resetGame();
  },

  resetGame: () => {
    set({
      room: null,
      game: null,
      board: null,
      selectedPos: null,
      lineCount: 0,
      lastCalledNumber: null,
      calledByMap: {},
      winnerInfo: null,
      hasWon: false,
      activeEmotes: [],
      error: null,
      lastKnownVersion: 0,
      connectionStatus: socketService.connectionStatus,
    });
  },
}));
