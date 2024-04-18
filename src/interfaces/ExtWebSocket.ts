import WebSocket from 'ws';

export interface ExtWebSocket extends WebSocket {
  wsId: string;
  gameId: string;
  userId: string;
}
