import { WebSocket, WebSocketServer } from 'ws';
import { CustomWebSocket } from './CustomWebSocket';
import { IncomingMessage, ServerResponse, Server } from 'http';

export class CustomWebSocketServer extends WebSocketServer<
  typeof CustomWebSocket
> {
  constructor(server: Server<typeof IncomingMessage, typeof ServerResponse>) {
    super({ WebSocket: CustomWebSocket, server });
  }
}
