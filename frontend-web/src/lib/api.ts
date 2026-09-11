import axios from 'axios';
import { Room, Game, User, Badge, UserBadge, GameHistory } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 65000,
  headers: {
    'Content-Type': 'application/json',
    'X-Client-Type': 'web',
  },
});

// Interceptor to attach Authorization header if token exists in storage
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('bingo_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: async (username: string, password: string) => {
    const res = await apiClient.post('/auth/login', { username, password });
    if (res.data.token) localStorage.setItem('bingo_token', res.data.token);
    return res.data;
  },
  register: async (username: string, email: string, password: string, avatar?: string) => {
    const res = await apiClient.post('/auth/register', { username, email, password, avatar });
    if (res.data.token) localStorage.setItem('bingo_token', res.data.token);
    return res.data;
  },
  guest: async (guestName: string, avatar?: string) => {
    const res = await apiClient.post('/auth/guest', { guestName, avatar });
    if (res.data.token) localStorage.setItem('bingo_token', res.data.token);
    return res.data;
  },
  logout: async () => {
    localStorage.removeItem('bingo_token');
    await apiClient.post('/auth/logout');
  },
  getMe: async (): Promise<User> => {
    const res = await apiClient.get<User>('/users/me');
    return res.data;
  },
  updateProfile: async (data: { username?: string; avatar?: string }): Promise<User> => {
    const res = await apiClient.patch<User>('/users/me', data);
    return res.data;
  },
  getMyGames: async (): Promise<GameHistory[]> => {
    const res = await apiClient.get<GameHistory[]>('/users/me/games');
    return res.data;
  },
  getMyBadges: async (): Promise<UserBadge[]> => {
    const res = await apiClient.get<UserBadge[]>('/users/me/badges');
    return res.data;
  },
};

export const roomApi = {
  createRoom: async (options?: { boardSize?: number; winningLines?: number; maxPlayers?: number }): Promise<Room> => {
    const res = await apiClient.post<Room>('/rooms', options);
    return res.data;
  },
  joinRoom: async (code: string): Promise<Room> => {
    const res = await apiClient.post<Room>(`/rooms/${code.toUpperCase()}/join`);
    return res.data;
  },
  getRoom: async (code: string): Promise<Room> => {
    const res = await apiClient.get<Room>(`/rooms/${code.toUpperCase()}`);
    return res.data;
  },
  leaveRoom: async (code: string) => {
    await apiClient.post(`/rooms/${code.toUpperCase()}/leave`);
  },
  generateBoard: async (code: string): Promise<number[][]> => {
    const res = await apiClient.post<number[][]>(`/rooms/${code.toUpperCase()}/board/generate`);
    return res.data;
  },
  shuffleBoard: async (code: string): Promise<number[][]> => {
    const res = await apiClient.post<number[][]>(`/rooms/${code.toUpperCase()}/board/shuffle`);
    return res.data;
  },
  swapCells: async (
    code: string,
    pos1: { row: number; column: number },
    pos2: { row: number; column: number }
  ): Promise<number[][]> => {
    const res = await apiClient.post<number[][]>(`/rooms/${code.toUpperCase()}/board/swap`, {
      position1: pos1,
      position2: pos2,
    });
    return res.data;
  },
  lockBoard: async (code: string, board?: number[][]): Promise<{ locked: boolean }> => {
    const res = await apiClient.post<{ locked: boolean }>(`/rooms/${code.toUpperCase()}/board/lock`, { board });
    return res.data;
  },
  toggleReady: async (code: string): Promise<Room> => {
    const res = await apiClient.post<Room>(`/rooms/${code.toUpperCase()}/ready`);
    return res.data;
  },
  startGame: async (code: string): Promise<Game> => {
    const res = await apiClient.post<Game>(`/rooms/${code.toUpperCase()}/start`);
    return res.data;
  },
};

export const gameApi = {
  getGame: async (gameId: string): Promise<Game> => {
    const res = await apiClient.get<Game>(`/games/${gameId}`);
    return res.data;
  },
  getGameByRoom: async (roomCode: string): Promise<Game> => {
    const res = await apiClient.get<Game>(`/games/room/${roomCode.toUpperCase()}`);
    return res.data;
  },
  callNumber: async (gameId: string, number: number): Promise<Game> => {
    const res = await apiClient.post<Game>(`/games/${gameId}/call?number=${number}`);
    return res.data;
  },
  sendEmote: async (gameId: string, emote: string): Promise<void> => {
    await apiClient.post(`/games/${gameId}/emote?emote=${encodeURIComponent(emote)}`);
  },
};

export const publicApi = {
  getBadges: async (): Promise<Badge[]> => {
    const res = await apiClient.get<Badge[]>('/badges');
    return res.data;
  },
  getLeaderboard: async (limit = 50): Promise<User[]> => {
    const res = await apiClient.get<User[]>(`/leaderboard?limit=${limit}`);
    return res.data;
  },
};
