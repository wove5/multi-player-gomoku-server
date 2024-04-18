import type { Server } from 'http';
import { GameConnections } from './types';
import { ExtWebSocket } from './interfaces';

import WebSocket, { WebSocketServer } from 'ws';
import { URL } from 'node:url';
import logger from './util/logger';
import type NanoidLib from 'nanoid'; // this makes it possible to have a require statement; see next line
import { verifyJwt } from './util/jwt';
import { CustomWebSocketServer } from './classes';
const { nanoid } = require('./esm/bundle') as typeof NanoidLib;

interface TokenBody {
  username: string;
  _id: string;
  iat: number;
  exp: number;
}

// export let wss: WebSocket.Server;
export let wss: CustomWebSocketServer;

let numberOfClients = 0;

export const startWebSocketServer = (
  server: Server,
  gameConnections: GameConnections
) => {
  // wss = new WebSocketServer({ server });
  wss = new CustomWebSocketServer(server);
  logger.info(`⚡️[websocket server]: websocket server started`);
  wss.on('connection', async (ws: ExtWebSocket, req) => {
    numberOfClients++;
    console.log(
      `A new client has joined, ${numberOfClients} client(s) connected`
    );
    ws.wsId = nanoid();
    let decoded: TokenBody | null;
    const protocol: string | undefined = req.headers['sec-websocket-protocol'];

    const protocols = protocol
      ? protocol.split(',').map((s: string) => s.trim())
      : [];

    const protocolWithToken = protocols.find((s: string) => {
      decoded = verifyJwt<TokenBody>(s);
      return decoded !== null && decoded !== undefined;
    });

    console.log(`protocolWithToken = ${protocolWithToken}`);
    if (protocolWithToken) {
      decoded = verifyJwt<TokenBody>(protocolWithToken);
      console.log(`decoded = ${decoded}`);
      if (decoded) ws.userId = decoded._id;
    }

    let theURL = req.url ? new URL(`wss://localhost:8080${req.url}`) : null;
    let gameId: string | null;
    if (theURL) {
      let params = theURL.searchParams;
      gameId = params.get('gameId');
      if (gameId) {
        ws.gameId = gameId;

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

    wss.clients.forEach((client) => {
      const extClient = client as ExtWebSocket;
      console.log(`extClient.wsId = ${extClient.wsId}`);
      console.log(`extClient.userId = ${extClient.userId}`);
    });

    ws.on('message', (data) => {
      [...wss.clients]
        .filter(
          (client) =>
            client.gameId === ws.gameId &&
            client.userId !== ws.userId &&
            client.readyState === WebSocket.OPEN
        )
        .forEach((client) => {
          client.send(data.toString());
        });
    });

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
