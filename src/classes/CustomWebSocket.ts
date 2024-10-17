import { WebSocket } from 'ws';

export class CustomWebSocket extends WebSocket {
  wsId!: string;
  gameId!: string;
  userId!: string;
  isAlive!: boolean;
  expTime!: number;
}
