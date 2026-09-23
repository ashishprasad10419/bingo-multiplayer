import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { GameEventEnvelope, NetworkConnectionStatus } from './types';

const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || '/ws';

export type SocketConnectionStatus = NetworkConnectionStatus;

class SocketService {
  private client: Client | null = null;
  private currentRoomCode: string | null = null;
  private subscribedRoomCode: string | null = null;
  private currentSubscription: any = null;
  private listeners: ((event: GameEventEnvelope) => void)[] = [];
  private statusListeners: ((status: SocketConnectionStatus) => void)[] = [];
  private currentStatus: SocketConnectionStatus = 'DISCONNECTED';

  public get connected(): boolean {
    return !!(this.client && this.client.connected);
  }

  public get connectionStatus(): SocketConnectionStatus {
    return this.currentStatus;
  }

  public onStatusChange(callback: (status: SocketConnectionStatus) => void): () => void {
    this.statusListeners.push(callback);
    callback(this.currentStatus);
    return () => {
      this.statusListeners = this.statusListeners.filter((cb) => cb !== callback);
    };
  }

  private setStatus(status: SocketConnectionStatus) {
    if (this.currentStatus !== status) {
      this.currentStatus = status;
      this.statusListeners.forEach((cb) => {
        try { cb(status); } catch (_) {}
      });
    }
  }

  public connect(roomCode: string, onEvent: (event: GameEventEnvelope) => void) {
    this.currentRoomCode = roomCode;
    // Replace with single store listener to prevent duplicate event execution
    this.listeners = [onEvent];

    if (this.client && this.client.connected) {
      this.setStatus('CONNECTED');
      this.subscribe(roomCode);
      return;
    }

    const token = localStorage.getItem('bingo_token');
    this.setStatus('RECONNECTING');

    this.client = new Client({
      webSocketFactory: () => new SockJS(WS_BASE_URL),
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      debug: () => {
        // debug logging
      },
      reconnectDelay: 2000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      beforeConnect: () => {
        this.setStatus('RECONNECTING');
      },
      onConnect: () => {
        this.setStatus('CONNECTED');
        if (this.currentRoomCode && this.client && this.client.connected) {
          this.subscribe(this.currentRoomCode);
        }
      },
      onDisconnect: () => {
        this.setStatus('DISCONNECTED');
        this.currentSubscription = null;
        this.subscribedRoomCode = null;
      },
      onStompError: (frame) => {
        console.warn('Broker reported error: ' + frame.headers['message']);
        this.setStatus('RECONNECTING');
      },
      onWebSocketClose: () => {
        this.setStatus('RECONNECTING');
        this.currentSubscription = null;
      },
    });

    this.client.activate();
  }

  private subscribe(roomCode: string) {
    if (!this.client || !this.client.connected) return;
    if (this.subscribedRoomCode === roomCode && this.currentSubscription) {
      return;
    }

    if (this.currentSubscription) {
      try {
        this.currentSubscription.unsubscribe();
      } catch (e) {
        // ignore
      }
      this.currentSubscription = null;
    }

    const topic = `/topic/rooms/${roomCode}`;
    this.subscribedRoomCode = roomCode;

    try {
      this.currentSubscription = this.client.subscribe(topic, (message: IMessage) => {
        try {
          const envelope: GameEventEnvelope = JSON.parse(message.body);
          this.listeners.forEach((listener) => listener(envelope));
        } catch (e) {
          console.error('Failed to parse STOMP message', e);
        }
      });
    } catch (err) {
      console.warn('Subscription attempt failed, will retry on reconnect:', err);
      this.currentSubscription = null;
      this.subscribedRoomCode = null;
    }
  }

  public callNumber(gameId: string, number: number, clientMoveId?: string) {
    if (!this.client || !this.client.connected) {
      return false;
    }

    try {
      this.client.publish({
        destination: '/app/game/call-number',
        body: JSON.stringify({ gameId, number, clientMoveId }),
      });
      return true;
    } catch (e) {
      console.warn('STOMP publish failed, falling back to REST:', e);
      return false;
    }
  }

  public sendTttMove(gameId: string, row: number, col: number, clientMoveId?: string): boolean {
    if (!this.client || !this.client.connected) {
      return false;
    }
    try {
      this.client.publish({
        destination: '/app/game/tic-tac-toe/move',
        body: JSON.stringify({ gameId, row, col, clientMoveId }),
      });
      return true;
    } catch (e) {
      console.warn('STOMP sendTttMove failed:', e);
      return false;
    }
  }

  public sendDotsLine(gameId: string, lineType: 'H' | 'V', row: number, col: number, clientMoveId?: string): boolean {
    if (!this.client || !this.client.connected) {
      return false;
    }
    try {
      this.client.publish({
        destination: '/app/game/dots-and-boxes/line',
        body: JSON.stringify({ gameId, lineType, row, col, clientMoveId }),
      });
      return true;
    } catch (e) {
      console.warn('STOMP sendDotsLine failed:', e);
      return false;
    }
  }

  public sendC4Move(gameId: string, col: number, clientMoveId?: string): boolean {
    if (!this.client || !this.client.connected) return false;
    try {
      this.client.publish({
        destination: '/app/game/c4/move',
        body: JSON.stringify({ gameId, col, clientMoveId }),
      });
      return true;
    } catch (e) {
      console.warn('STOMP sendC4Move failed:', e);
      return false;
    }
  }

  public sendRpsChoice(gameId: string, choice: string, clientMoveId?: string): boolean {
    if (!this.client || !this.client.connected) return false;
    try {
      this.client.publish({
        destination: '/app/game/rps/choice',
        body: JSON.stringify({ gameId, choice, clientMoveId }),
      });
      return true;
    } catch (e) {
      console.warn('STOMP sendRpsChoice failed:', e);
      return false;
    }
  }

  public sendMemoryFlip(gameId: string, cardIndex: number, clientMoveId?: string): boolean {
    if (!this.client || !this.client.connected) return false;
    try {
      this.client.publish({
        destination: '/app/game/memory/flip',
        body: JSON.stringify({ gameId, cardIndex, clientMoveId }),
      });
      return true;
    } catch (e) {
      console.warn('STOMP sendMemoryFlip failed:', e);
      return false;
    }
  }

  public sendNumberRushTap(gameId: string, tappedNumber: number, clientMoveId?: string): boolean {
    if (!this.client || !this.client.connected) return false;
    try {
      this.client.publish({
        destination: '/app/game/number-rush/tap',
        body: JSON.stringify({ gameId, tappedNumber, clientMoveId }),
      });
      return true;
    } catch (e) {
      console.warn('STOMP sendNumberRushTap failed:', e);
      return false;
    }
  }

  public sendWordScrambleGuess(gameId: string, guess: string, clientMoveId?: string): boolean {
    if (!this.client || !this.client.connected) return false;
    try {
      this.client.publish({
        destination: '/app/game/word-scramble/guess',
        body: JSON.stringify({ gameId, guess, clientMoveId }),
      });
      return true;
    } catch (e) {
      console.warn('STOMP sendWordScrambleGuess failed:', e);
      return false;
    }
  }

  public sendQuizAnswer(gameId: string, answerIndex: number, clientMoveId?: string): boolean {
    if (!this.client || !this.client.connected) return false;
    try {
      this.client.publish({
        destination: '/app/game/quiz/answer',
        body: JSON.stringify({ gameId, answerIndex, clientMoveId }),
      });
      return true;
    } catch (e) {
      console.warn('STOMP sendQuizAnswer failed:', e);
      return false;
    }
  }

  public sendShipLockFleet(gameId: string, fleet: any[], clientMoveId?: string): boolean {
    if (!this.client || !this.client.connected) return false;
    try {
      this.client.publish({
        destination: '/app/game/ship/lock-fleet',
        body: JSON.stringify({ gameId, fleet, clientMoveId }),
      });
      return true;
    } catch (e) {
      console.warn('STOMP sendShipLockFleet failed:', e);
      return false;
    }
  }

  public sendShipAttack(gameId: string, row: number, col: number, clientMoveId?: string): boolean {
    if (!this.client || !this.client.connected) return false;
    try {
      this.client.publish({
        destination: '/app/game/ship/attack',
        body: JSON.stringify({ gameId, row, col, clientMoveId }),
      });
      return true;
    } catch (e) {
      console.warn('STOMP sendShipAttack failed:', e);
      return false;
    }
  }

  public sendMastermindLockSecret(gameId: string, colors: string[], clientMoveId?: string): boolean {
    if (!this.client || !this.client.connected) return false;
    try {
      this.client.publish({
        destination: '/app/game/mastermind/lock-secret',
        body: JSON.stringify({ gameId, colors, clientMoveId }),
      });
      return true;
    } catch (e) {
      console.warn('STOMP sendMastermindLockSecret failed:', e);
      return false;
    }
  }

  public sendMastermindGuess(gameId: string, colors: string[], clientMoveId?: string): boolean {
    if (!this.client || !this.client.connected) return false;
    try {
      this.client.publish({
        destination: '/app/game/mastermind/guess',
        body: JSON.stringify({ gameId, colors, clientMoveId }),
      });
      return true;
    } catch (e) {
      console.warn('STOMP sendMastermindGuess failed:', e);
      return false;
    }
  }

  public sendEmote(gameId: string, roomCode: string, emote: string): boolean {
    if (!this.client || !this.client.connected) {
      return false;
    }
    try {
      this.client.publish({
        destination: '/app/game/send-emote',
        body: JSON.stringify({ gameId, roomCode, emote }),
      });
      return true;
    } catch (e) {
      console.warn('STOMP sendEmote failed:', e);
      return false;
    }
  }

  public removeListener(listener: (event: GameEventEnvelope) => void) {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  public disconnect() {
    this.setStatus('DISCONNECTED');
    if (this.currentSubscription) {
      try {
        this.currentSubscription.unsubscribe();
      } catch (e) {
        // ignore
      }
      this.currentSubscription = null;
    }
    if (this.client) {
      this.client.deactivate();
      this.client = null;
      this.listeners = [];
      this.currentRoomCode = null;
      this.subscribedRoomCode = null;
    }
  }
}

export const socketService = new SocketService();
