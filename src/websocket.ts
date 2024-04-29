import type { IncomingMessage, Server } from 'http';
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
  // wss = new CustomWebSocketServer(server);
  wss = new CustomWebSocketServer({ noServer: true });
  logger.info(`⚡️[websocket server]: websocket server started`);

  server.on('upgrade', (req, socket, head) => {
    console.log(
      `request.headers['sec-websocket-protocol'] = ${req.headers['sec-websocket-protocol']}`
    );
    console.log(
      `Object.getOwnPropertyNames(req.headers) = ${Object.getOwnPropertyNames(
        req.headers
      )}`
    );
    console.log(`process.env.allowHost = ${process.env.allowHost}`);
    // Provide CORS & SOP behaviour to websocket requests
    // If testing with non-browser tool, craft an Origin Header as that of client or server URL, or just localhost.
    // If process.env.allowHost is not present, then must be running in local dev mode
    console.log(`req.headers.origin = ${req.headers.origin}`);
    console.log(`req.headers.host = ${req.headers.host}`);
    const hostIp = req.headers.host?.split(':')[0];
    console.log(`hostIp = ${hostIp}`);
    if (
      (process.env.allowHost !== undefined &&
        process.env.allowHost !== req.headers.origin) ||
      (req.headers.origin !== 'http://localhost:3000' &&
        req.headers.origin !== `http://${hostIp}:3000`)
    ) {
      logger.info(
        `⚡️[websocket server]: a websocket connection request was denied`
      );
      socket.write('HTTP/1.1 401 Unauthorised\r\n\r\n');
      socket.destroy();
      return;
    }

    const protocol: string | undefined = req.headers['sec-websocket-protocol'];

    const protocols = protocol
      ? protocol.split(',').map((s: string) => s.trim())
      : [];

    const protocolWithToken = protocols.find((s: string) => {
      const decoded = verifyJwt<TokenBody>(s);
      return decoded !== null && decoded !== undefined;
    });

    console.log(`protocolWithToken = ${protocolWithToken}`);
    if (!protocolWithToken) {
      logger.info(
        `⚡️[websocket server]: a websocket connection request was denied`
      );
      socket.write('HTTP/1.1 401 Unauthorised\r\n\r\n');
      socket.destroy();
    } else {
      const decoded = verifyJwt<TokenBody>(protocolWithToken);
      if (decoded && decoded._id) {
        wss.handleUpgrade(req, socket, head, (ws) => {
          wss.emit('connection', ws, req, decoded?._id);
        });
      } else {
        socket.write('HTTP/1.1 401 Unauthorised\r\n\r\n');
        socket.destroy();
      }
    }
  });

  wss.on(
    'connection',
    async (ws: ExtWebSocket, req: IncomingMessage, userId: string) => {
      numberOfClients++;
      console.log(
        `A new client has joined, ${numberOfClients} client(s) connected`
      );
      ws.wsId = nanoid();
      if (userId) ws.userId = userId;
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
        console.log(
          `A client has left, ${numberOfClients} client(s) connected`
        );
      });
      // ws.send('Welcome'); // commenting out for now because it results in error on client console.
    }
  );
};
