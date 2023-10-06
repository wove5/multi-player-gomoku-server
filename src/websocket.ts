import type { Server } from 'http';

import WebSocket, { WebSocketServer } from 'ws';
import logger from './util/logger';

export let wss: WebSocket.Server;

let numberOfClients = 0;

export const startWebSocketServer = (server: Server) => {
  wss = new WebSocketServer({ server });
  logger.info(`⚡️[websocket server]: websocket server started`);
  wss.on('connection', (ws) => {
    numberOfClients++;
    console.log(
      `A new client has joined, ${numberOfClients} client(s) connected`
    );
    ws.on('close', () => {
      numberOfClients--;
      console.log(`A client has left, ${numberOfClients} client(s) connected`);
    });
    // ws.send('Welcome'); // commenting out for now because it results in error on client console.
  });
};
