import { create } from 'zustand';
import { Room, Game, GameEventEnvelope, ActiveEmote } from '../lib/types';
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
  winnerInfo: { username: string; avatar?: string } | null;
  hasWon: boolean;
  activeEmotes: ActiveEmote[];
  isLoading: boolean;
  error: string | null;

  setRoom: (room: Room | null) => void;
  setGame: (game: Game | null) => void;
  setBoard: (board: number[][] | null) => void;
  setSelectedPos: (pos: { row: number; column: number } | null) => void;
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

  setRoom: (room) => set({ room }),
  setGame: (game) => set({ game }),
  setBoard: (board) => set({ board }),
  setSelectedPos: (selectedPos) => set({ selectedPos }),
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

      if (!silent) {
        updates.isLoading = false;
      }

      if (game.status === 'FINISHED') {
        const winningPlayer = game.players.find((p) => p.userId === game.winnerId);
        updates.winnerInfo = winningPlayer || null;
        updates.hasWon = game.winnerId === currentUserId;
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
    socketService.connect(roomCode, (event: GameEventEnvelope) => {
      // console.log('Socket event received in store:', event);
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
            game: game ? { ...game, status: 'FINISHED' } : null,
          });
          break;

        case 'GAME_DRAW':
          set({
            winnerInfo: { username: 'Nobody (Draw)' },
            hasWon: false,
            game: game ? { ...game, status: 'FINISHED' } : null,
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

        case 'DOTS_LINE_DRAWN':
          if (game) {
            set({
              game: {
                ...game,
                horizontalLines: event.data.horizontalLines || game.horizontalLines,
                verticalLines: event.data.verticalLines || game.verticalLines,
                completedBoxes: event.data.completedBoxes || game.completedBoxes,
                playerScores: event.data.playerScores || game.playerScores,
                currentTurnUserId: event.data.nextTurn,
                status: (event.data.status as any) || game.status,
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
    });
  },
}));
