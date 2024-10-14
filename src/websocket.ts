import type { IncomingMessage, Server } from 'http';
import { GameConnections } from './types';
import {
  ExtWebSocket,
  JoinGameDBReply,
  NoDBReply,
  ReEnterGameDBReply,
} from './interfaces';

import WebSocket, { WebSocketServer } from 'ws';
import { URL } from 'node:url';
import logger from './util/logger';
import type NanoidLib from 'nanoid'; // this makes it possible to have a require statement; see next line
import { verifyJwt } from './util/jwt';
import { CustomWebSocket, CustomWebSocketServer } from './classes';
import { ACTION } from './constants';
import { getIncompleteGame } from './service/game.service';
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

  server.on('upgrade', async (req, socket, head) => {
    console.log(
      `request.headers['sec-websocket-protocol'] = ${req.headers['sec-websocket-protocol']}`
    );
    console.log(
      `Object.getOwnPropertyNames(req.headers) = ${Object.getOwnPropertyNames(
        req.headers
      )}`
    );
    console.log(`process.env.allowHost = ${process.env.allowHost}`);
    console.log(`req.headers.origin = ${req.headers.origin}`);
    console.log(`req.headers.host = ${req.headers.host}`);

    // Provide CORS & SOP behaviour to websocket requests
    // When testing with non-browser tool, craft an Origin Header as that of client or server URL, or just http://localhost:3000
    // If process.env.allowHost is not present, then must be running in local dev mode
    const hostIp = req.headers.host?.split(':')[0];
    console.log(`hostIp = ${hostIp}`);
    if (
      (process.env.allowHost !== undefined &&
        process.env.allowHost !== req.headers.origin) ||
      (process.env.allowHost === undefined &&
        req.headers.origin !== 'http://localhost:3000' &&
        req.headers.origin !== `http://${hostIp}:3000`)
    ) {
      logger.info(
        `⚡️[websocket server]: an unauthorised websocket connection request was denied`
      );
      socket.write('HTTP/1.1 401 Unauthorised\r\n\r\n');
      socket.destroy();
      return;
    }

    // Screen ws connection request to only allow an authenticated client
    const protocol: string | undefined = req.headers['sec-websocket-protocol'];
    const protocols = protocol
      ? protocol.split(',').map((s: string) => s.trim())
      : [];
    const protocolWithToken = protocols.find((s: string) => {
      const decoded = verifyJwt<TokenBody>(s);
      return decoded !== null && decoded !== undefined;
    });
    console.log(`protocolWithToken = ${protocolWithToken}`);
    const decoded = protocolWithToken
      ? verifyJwt<TokenBody>(protocolWithToken)
      : null;
    if (!decoded || !decoded._id) {
      logger.info(
        `⚡️[websocket server]: websocket connection request denied to unauthenticated client`
      );
      socket.write('HTTP/1.1 401 Unauthenticated - invalid token\r\n\r\n');
      socket.destroy();
      return;
    }
    // screen the ws connection request to only allow client if they belong in game with gameId
    const theURL = req.url ? new URL(`wss://localhost:8080${req.url}`) : null;
    if (theURL) {
      const params = theURL.searchParams;
      const gameId = params.get('gameId');
      if (gameId !== undefined && gameId !== null && gameId !== '') {
        // isReEnterGameDBReply may sound misleading here, but its matching response will confirm this client belongs to this game.
        function isReEnterGameDBReply(res: any): res is ReEnterGameDBReply {
          return res.action === ACTION.REENTER && res.game;
        }
        function isNoDBReply(res: any): res is NoDBReply {
          return res.action === ACTION.REENTER && res.result === null;
        }

        const result: JoinGameDBReply | NoDBReply = await getIncompleteGame(
          gameId,
          decoded._id
        );
        // Confirm that client with valid token decoded._id belongs in game with gameId
        if (isReEnterGameDBReply(result)) {
          console.log('Client successfully entered game.');
          wss.handleUpgrade(req, socket, head, (ws) => {
            wss.emit('connection', ws, req, decoded._id, gameId, decoded.exp);
          });
        } else if (isNoDBReply(result)) {
          logger.info(
            `⚡️[websocket server]: websocket connection request denied to unauthorised client`
          );
          socket.write(
            'HTTP/1.1 404 Not Found - game with user not found.\r\n\r\n'
          );
          socket.destroy();
        } else {
          logger.info(
            `⚡️[websocket server]: problem with server during websocket connection request`
          );
          socket.write('HTTP/1.1 500 Problem at server\r\n\r\n');
          socket.destroy();
        }
      } else {
        logger.info(
          `⚡️[websocket server]: websocket connection request denied to unauthorised client`
        );
        socket.write(
          'HTTP/1.1 403 Unauthorised - invalid URL; no gameId\r\n\r\n'
        );
        socket.destroy();
      }
    } else {
      logger.info(
        `⚡️[websocket server]: websocket connection request denied to unauthorised client`
      );
      socket.write('HTTP/1.1 403 Unauthorised - invalid URL\r\n\r\n');
      socket.destroy();
    }
  });

  // args set in handleUpgrade above: wss.emit('connection', ws, req, decoded._id, gameId, decoded.exp)
  wss.on(
    'connection',
    async (
      // ws: ExtWebSocket,
      ws: CustomWebSocket,
      req: IncomingMessage,
      userId: string,
      gameId: string,
      expTime: number
    ) => {
      numberOfClients++;
      ws.wsId = nanoid();
      ws.userId = userId;
      ws.gameId = gameId;
      ws.expTime = expTime * 1000;
      console.log(
        `New client at wsId: ${ws.wsId} / userId: ${ws.userId} has joined`
      );
      console.log(`${numberOfClients} client(s) connected`);

      // function heartbeat() {
      //   this.isAlive = true;
      // }
      ws.isAlive = true;
      ws.on('error', console.error);
      // ws.on('pong', heartbeat);
      ws.on('pong', () => {
        console.log(
          `incoming pong from wsId: ${ws.wsId} / userId: ${ws.userId}`
        );
        ws.isAlive = true;
      });

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

      wss.clients.forEach((client) => {
        console.log(`client.wsId = ${client.wsId}`);
        console.log(`client.userId = ${client.userId}`);
      });

      ws.on('message', (data) => {
        console.log(`incoming msg: ${data.toString()}`);
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
        if (gameId && ws.wsId) {
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
          `client at wsId: ${ws.wsId} / userId: ${ws.userId} has left`
        );
        console.log(`${numberOfClients} client(s) connected`);
      });
      // ws.send('Welcome'); // commenting out for now because it results in error on client console.
    }
  );

  const interval = setInterval(function ping() {
    wss.clients.forEach(function each(ws) {
      if (ws.isAlive === false || Date.now() > ws.expTime) {
        console.log(`closing wsId: ${ws.wsId} / userId: ${ws.userId}`);
        return ws.terminate();
      }

      ws.isAlive = false;
      ws.send(JSON.stringify({ action: 'ping', userId: ws.userId }));
      console.log(`sending ping to wsId: ${ws.wsId} / useId: ${ws.userId}`);
      ws.ping();
    });
  }, 10000);

  wss.on('close', function close() {
    clearInterval(interval);
  });
};
