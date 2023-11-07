import express, { Request, Response } from 'express';
import WebSocket from 'ws';
import { wss } from '../websocket';

import validateSchema from '../middleware/validateSchema';
import { deserializeUser } from '../middleware/deserializeUser';

import {
  createGameSchema,
  deleteGameSchema,
  CreateGameInput,
  readGameSchema,
  ReadGameInput,
  updateGameGeneralSchema,
  UpdateGameInput,
} from '../schema/game.schema';

import {
  getIncompleteGames,
  getCompletedGames,
  createGame,
  updateGame,
  deleteGame,
  getGameById,
  UpdateResultDoc,
} from '../service/game.service';
import { GameDocument } from '../model/game.model';
import {
  GameStatus,
  PlayerDetail,
  UpdateGameDBReturnType,
  UpdateGameResponseType,
} from '../types';
import { ACTION, PLAYER_STATE } from '../constants';
import {
  JoinGameDBReply,
  MoveDBReply,
  LeaveGameDBReply,
  NoDBReply,
  ResetGameDBReply,
  TakeRestFromGameDBReply,
  ReadGameDBReply,
  ReadGameResponse,
} from '../interfaces';

const gameHandler = express.Router();

gameHandler.use(deserializeUser);

// Get incomplete games
gameHandler.get('/', async (req: Request, res: Response) => {
  const userId = req.userId;
  try {
    const result = await getIncompleteGames(userId);
    // array is returned, regardless of any games or not; in the latter case, result is []
    return res.status(200).send(
      result.map((g) => ({
        _id: g._id,
        gameNumber: g.gameNumber,
        size: g.size,
        isMulti: g.isMulti,
        createdAt: g.createdAt,
        players: g.players,
        users: g.userDetails,
      }))
    );
  } catch (err: any) {
    return res.status(500).send(err);
  }
});

// Get completed games
gameHandler.get('/games', async (req: Request, res: Response) => {
  const userId = req.userId;
  try {
    const result = await getCompletedGames(userId);
    // a bit more handling implemented here than in getIncompleteGames;
    if (result.length > 0) {
      return res.status(200).send(
        result.map((g) => ({
          _id: g._id,
          gameNumber: g.gameNumber,
          size: g.size,
          status: g.status,
          lastSelectedPosition: g.lastSelectedPosition,
          createdAt: g.createdAt,
          updatedAt: g.updatedAt,
        }))
      );
    } else {
      // set error message to 'Not Found', so client can use this.
      return res.status(404).send('Not Found');
      // return res.status(404).send(res.statusCode); // this gives a deprecation msg
    }
  } catch (err: any) {
    return res.status(500).send(err);
  }
});

// Create Game
gameHandler.post(
  '/',
  validateSchema(createGameSchema),
  async (
    req: Request<{}, CreateGameInput, CreateGameInput['body']>,
    res: Response<GameDocument>
  ) => {
    try {
      const userId = req.userId;
      const gameReqBody = req.body;
      const newGame = await createGame(gameReqBody, userId);
      return res.status(200).send(newGame);
    } catch (err: any) {
      return res.status(500).send(err);
    }
  }
);

// Read Incomplete Game
gameHandler.get(
  '/game/:id',
  validateSchema(readGameSchema),
  async (
    req: Request<ReadGameInput['params'], GameDocument, {}>,
    res: Response<GameDocument>
  ) => {
    try {
      const userId = req.userId;
      const gameId = req.params.id;

      // you must already be in the game that you are trying to GET, otherwise, no result.
      function isJoinGameDBReply(res: any): res is JoinGameDBReply {
        return res.action === ACTION.REENTER;
      }
      function isNoDBReply(res: any): res is NoDBReply {
        return res.result === null;
      }

      const result: JoinGameDBReply | NoDBReply = await getGameById(
        gameId,
        userId
      );
      // if (!result) return res.sendStatus(404);
      // const me: PlayerDetail | undefined = result.players.find(
      //   (p: PlayerDetail) => p.userId.toString() === req.userId
      // );
      // if (me === undefined) return res.sendStatus(404);
      if (isJoinGameDBReply(result)) {
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({
                updatedBy: req.userId,
                // notify opponent I have re-entered, by sending my details (name)
                // playerDetail: me,
                action: result.action,
                // notify opponent that requestor has joined
                players: result.game.players,
              })
            );
          }
        });
        return res.status(200).send(result.game);
      } else if (isNoDBReply(result)) {
        return res.sendStatus(404);
      } else {
        throw new Error('Problem with server');
      }

      // const myOpponent: PlayerDetail | undefined = result.players.find(
      //   (p: PlayerDetail) => p.userId.toString() !== req.userId
      // );
      // const game = result;
      // if (myOpponent === undefined) return res.sendStatus(404);
      // if (!game) return res.sendStatus(404);
      // return res.status(200).send({ game, userDetail: myOpponent });
    } catch (err: any) {
      return res.status(500).send(err);
    }
  }
);

// Read Completed Game
gameHandler.get(
  '/game-log/:id',
  validateSchema(readGameSchema),
  async (
    req: Request<ReadGameInput['params'], GameDocument, {}>,
    res: Response<GameDocument>
  ) => {
    try {
      const userId = req.userId;
      const gameId = req.params.id;

      const game = await getGameById(gameId, userId);
      if (!game) return res.sendStatus(404);
      return res.status(200).json(game[0]);
    } catch (err: any) {
      return res.status(500).send(err);
    }
  }
);

// Update Game
gameHandler.put(
  '/game/:id',
  validateSchema(updateGameGeneralSchema),
  async (
    req: Request<
      UpdateGameInput['params'],
      GameStatus | GameDocument,
      UpdateGameInput['body']
    >,
    res: Response<UpdateGameResponseType>
  ) => {
    try {
      const result: UpdateGameDBReturnType = await updateGame(
        req.params.id,
        req.userId,
        req.body
      );

      function isJoinGameDBReply(res: any): res is JoinGameDBReply {
        return res.action === ACTION.JOIN;
      }
      function isLeaveGameDBReply(res: any): res is LeaveGameDBReply {
        return res.action === ACTION.LEAVE;
      }
      function isMoveDBReply(res: any): res is MoveDBReply {
        return res.action === ACTION.MOVE;
      }
      function isResetGameDBReply(res: any): res is ResetGameDBReply {
        return res.action === ACTION.RESET;
      }
      function isTakeRestGameDBReply(res: any): res is TakeRestFromGameDBReply {
        // return res.playerState === PLAYER_STATE.RESTING;
        return res.action === ACTION.REST;
      }
      function isNoDBReply(res: any): res is NoDBReply {
        return res.result === null;
      }

      if (isJoinGameDBReply(result)) {
        // const me: PlayerDetail | undefined = result.game.players.find(
        //   (p) => p.userId.toString() === req.userId
        // );
        // if (me === undefined) return res.sendStatus(404);
        if (!result) return res.sendStatus(404);
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({
                updatedBy: req.userId,
                action: result.action,
                // notify opponent that requestor has joined
                players: result.game.players,
              })
            );
          }
        });

        // // send back game & userDetail of opponent in game just joined
        // const myOpponent: PlayerDetail | undefined = result.game.players.find(
        //   (p: PlayerDetail) => p.userId.toString() !== req.userId
        // );
        const game = result.game;
        // if (myOpponent === undefined) return res.sendStatus(404);
        // send game back to the requestor who has just joined
        if (!game) return res.sendStatus(404);
        // return res.status(200).send({ game, playerDetail: myOpponent });
        return res.status(200).send(game);
      } else if (isMoveDBReply(result)) {
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({
                updatedBy: req.userId,
                // notify opponent
                moveResult: result.result,
              })
            );
          }
        });
        return res
          .status(200)
          .send({ status: result.result.status, player: result.result.player });
      } else if (isLeaveGameDBReply(result)) {
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            console.log(`Are we sending out 'Left' msg?`);
            client.send(
              JSON.stringify({
                updatedBy: req.userId,
                action: result.action,
                // notify opponent I have left, by sending my details
                players: result.players,
              })
            );
          }
        });
        return res.status(200).send({ players: result.players });
      } else if (isTakeRestGameDBReply(result)) {
        wss.clients.forEach((client) => {
          // Clicking Leave in client browser triggers a LEAVE action to be
          // sent from server, then, in the useEffect cleanup fnc, restFromGame()
          // triggers a REST action to be sent from server, however, the player who
          // clicked Leave is no longer in the players of that game, which is
          // made explicit by the result of the DB query which finds no doc for this
          // game containing the player who left, returning an object with no players.
          // this works well for the client side browser in that it receive no redundant
          // ws message for the REST action.
          if ('players' in result) {
            if (client.readyState === WebSocket.OPEN) {
              console.log(`Are we sending out 'Resting msg?`);
              console.log(`result.action = ${result.action}`);
              client.send(
                JSON.stringify({
                  updatedBy: req.userId,
                  action: result.action,
                  players: result.players,
                })
              );
            }
          }
        });
        return res.status(200).send();
      } else if (isResetGameDBReply(result)) {
        return res.status(200).send(result.result.game);
        // do something
      } else if (isNoDBReply(result)) {
        return res.sendStatus(404);
      } else {
        throw new Error('Problem with server');
      }

      // return res.status(200).send(result);
    } catch (err: any) {
      console.log('server error');
      return res.status(500).send(err);
    }
  }
);

// Delete Game
gameHandler.delete(
  '/game/:id',
  validateSchema(deleteGameSchema),
  async (req: Request, res: Response) => {
    try {
      const userId = req.userId;
      const gameId = req.params.id;
      const deleted = await deleteGame(gameId, userId);
      if (deleted.acknowledged && deleted.deletedCount === 0)
        return res.sendStatus(404);
      res.sendStatus(200);
    } catch (err: any) {
      return res.status(500).send(err);
    }
  }
);

export default gameHandler;
