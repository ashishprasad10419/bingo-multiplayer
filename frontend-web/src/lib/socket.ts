import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { GameEventEnvelope } from './types';

const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || '/ws';

class SocketService {
  private client: Client | null = null;
  private currentRoomCode: string | null = null;
  private subscribedRoomCode: string | null = null;
  private currentSubscription: any = null;
  private listeners: ((event: GameEventEnvelope) => void)[] = [];

  public get connected(): boolean {
    return !!(this.client && this.client.connected);
  }

  public connect(roomCode: string, onEvent: (event: GameEventEnvelope) => void) {
    this.currentRoomCode = roomCode;
    // Replace with single store listener to prevent duplicate event execution
    this.listeners = [onEvent];

    if (this.client && this.client.connected) {
      this.subscribe(roomCode);
      return;
    }

    const token = localStorage.getItem('bingo_token');

    this.client = new Client({
      webSocketFactory: () => new SockJS(WS_BASE_URL),
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      debug: () => {
        // debug logging
      },
      reconnectDelay: 2000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        if (this.currentRoomCode && this.client && this.client.connected) {
          this.subscribe(this.currentRoomCode);
        }
      },
      onDisconnect: () => {
        this.currentSubscription = null;
        this.subscribedRoomCode = null;
      },
      onStompError: (frame) => {
        console.warn('Broker reported error: ' + frame.headers['message']);
      },
      onWebSocketClose: () => {
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

  public callNumber(gameId: string, number: number) {
    if (!this.client || !this.client.connected) {
      return false;
    }

    try {
      this.client.publish({
        destination: '/app/game/call-number',
        body: JSON.stringify({ gameId, number }),
      });
      return true;
    } catch (e) {
      console.warn('STOMP publish failed, falling back to REST:', e);
      return false;
    }
  }

  public removeListener(listener: (event: GameEventEnvelope) => void) {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  public disconnect() {
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
