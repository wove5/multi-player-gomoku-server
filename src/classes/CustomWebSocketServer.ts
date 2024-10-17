import { WebSocketServer, ServerOptions } from 'ws';
import { CustomWebSocket } from './CustomWebSocket';

export class CustomWebSocketServer extends WebSocketServer<
  typeof CustomWebSocket
> {
  constructor(options: ServerOptions) {
    super({ ...options, WebSocket: CustomWebSocket });
  }
}
