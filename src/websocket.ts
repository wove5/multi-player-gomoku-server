import type { Server } from 'http';
import { GameConnections } from './types';
import { ExtWebSocket } from './interfaces';

import WebSocket, { WebSocketServer } from 'ws';
import { URL } from 'node:url';
import logger from './util/logger';
import type NanoidLib from 'nanoid'; // this makes it possible to have a require statement; see next line
const { nanoid } = require('./esm/bundle') as typeof NanoidLib;

export let wss: WebSocket.Server;

let numberOfClients = 0;

export const startWebSocketServer = (
  server: Server,
  gameConnections: GameConnections
) => {
  wss = new WebSocketServer({ server });
  logger.info(`⚡️[websocket server]: websocket server started`);
  wss.on('connection', async (ws: ExtWebSocket, req) => {
    numberOfClients++;
    console.log(
      `A new client has joined, ${numberOfClients} client(s) connected`
    );
    ws.wsId = nanoid();
    // for (const item of wss.clients) {
    //   console.log(item);
    // }
    let theURL = req.url ? new URL(`wss://localhost:8080${req.url}`) : null;
    let gameId: string | null;
    if (theURL) {
      let params = theURL.searchParams;
      gameId = params.get('gameId');
      if (gameId) {
        if (gameId in gameConnections) {
          gameConnections = {
            ...gameConnections,
            gameId: gameConnections[gameId].add(ws.wsId),
          };
        } else {
          gameConnections[gameId] = new Set([ws.wsId]);
        }
        console.log(
          `websocket connections in game ${gameId}: ${[
            ...gameConnections[gameId],
          ]}`
        );
      }
    }
    ws.on('close', () => {
      numberOfClients--;
      console.log(`wss.clients = ${wss.clients}`);
      if (gameId) {
        gameConnections[gameId].delete(ws.wsId);
        console.log(
          `websocket connections in game ${gameId}: ${[
            ...gameConnections[gameId],
          ]}`
        );
        if (gameConnections[gameId].size === 0) {
          console.log(`Deleting gameId: ${gameId} from gameConnections`);
          delete gameConnections[gameId];
        }
        console.log(
          `Is gameId ${gameId} in gameConnections? ${
            gameId in gameConnections ? 'Yes' : 'No'
          }`
        );
      }
      console.log(`A client has left, ${numberOfClients} client(s) connected`);
    });
    // ws.send('Welcome'); // commenting out for now because it results in error on client console.
  });
};
