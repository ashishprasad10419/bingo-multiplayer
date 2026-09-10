import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { GameEventEnvelope } from './types';

const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'http://localhost:8080/ws';

class SocketService {
  private client: Client | null = null;
  private currentRoomCode: string | null = null;
  private listeners: ((event: GameEventEnvelope) => void)[] = [];
  private isConnected = false;

  public connect(roomCode: string, onEvent: (event: GameEventEnvelope) => void) {
    this.currentRoomCode = roomCode;
    this.listeners.push(onEvent);

    if (this.client && this.isConnected) {
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
      reconnectDelay: 3000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        this.isConnected = true;
        if (this.currentRoomCode) {
          this.subscribe(this.currentRoomCode);
        }
      },
      onDisconnect: () => {
        this.isConnected = false;
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
      },
    });

    this.client.activate();
  }

  private subscribe(roomCode: string) {
    if (!this.client || !this.isConnected) return;

    const topic = `/topic/rooms/${roomCode}`;
    this.client.subscribe(topic, (message: IMessage) => {
      try {
        const envelope: GameEventEnvelope = JSON.parse(message.body);
        this.listeners.forEach((listener) => listener(envelope));
      } catch (e) {
        console.error('Failed to parse STOMP message', e);
      }
    });
  }

  public callNumber(gameId: string, number: number) {
    if (!this.client || !this.isConnected) {
      console.warn('STOMP not connected, cannot call number via WebSocket');
      return false;
    }

    this.client.publish({
      destination: '/app/game/call-number',
      body: JSON.stringify({ gameId, number }),
    });
    return true;
  }

  public removeListener(listener: (event: GameEventEnvelope) => void) {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  public disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
      this.isConnected = false;
      this.listeners = [];
      this.currentRoomCode = null;
    }
  }
}

export const socketService = new SocketService();
