import { DeleteGameDBResult } from './../interfaces/JoinLeaveGameReply';
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
  getIncompleteGame,
  getCompletedGame,
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
  ReEnterGameDBReply,
  RetrieveGameDBReply,
  MsgDBReply,
} from '../interfaces';
import logger from '../util/logger';

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
    // // a bit more handling implemented here than in getIncompleteGames;
    // if (result.length > 0) {
    //   return res.status(200).send(
    //     result.map((g) => ({
    //       _id: g._id,
    //       gameNumber: g.gameNumber,
    //       size: g.size,
    //       status: g.status,
    //       lastSelectedPosition: g.lastSelectedPosition,
    //       createdAt: g.createdAt,
    //       updatedAt: g.updatedAt,
    //     }))
    //   );
    // } else {
    //   // set error message to 'Not Found', so client can use this.
    //   return res.status(404).send('Not Found');
    //   // return res.status(404).send(res.statusCode); // this gives a deprecation msg
    // }
    // it is incorrect to send a 404 Not Found when db finds no documents;
    // just like in handler above for GET "/", a result should be sent out
    // regardless of any documents found or not. sending [] will lead to 
    // correct behaviour on the client, particularly in the Game page, as
    // described in commentary in the Games page in the client app.
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
      function isReEnterGameDBReply(res: any): res is ReEnterGameDBReply {
        return res.action === ACTION.REENTER && res.game;
      }
      function isNoDBReply(res: any): res is NoDBReply {
        return res.action === ACTION.REENTER && res.result === null;
      }

      const result: JoinGameDBReply | NoDBReply = await getIncompleteGame(
        gameId,
        userId
      );
      if (isReEnterGameDBReply(result)) {
        [...wss.clients]
          .filter(
            (client) =>
              client.gameId === req.params.id &&
              client.userId !== req.userId &&
              client.readyState === WebSocket.OPEN
          )
          .forEach((client) => {
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
          });
        return res.status(200).send(result.game);
      } else if (isNoDBReply(result)) {
        logger.info(
          `⚡️[server]: Incomplete Game, gameId ${gameId}, not found.`
        );
        return res.sendStatus(404);
      } else {
        throw new Error('Problem with server');
      }
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
      function isRetrieveGameDBReply(res: any): res is RetrieveGameDBReply {
        return res.action === ACTION.RETRIEVE && res.game;
      }
      function isNoDBReply(res: any): res is NoDBReply {
        return res.action === ACTION.RETRIEVE && res.result === null;
      }
      const result = await getCompletedGame(gameId, userId);

      if (isRetrieveGameDBReply(result)) {
        return res.status(200).json(result.game);
      } else if (isNoDBReply(result)) {
        return res.sendStatus(404);
      } else {
        throw new Error('Problem with server');
      }
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
      function isDeleteGameDBResult(res: any): res is DeleteGameDBResult {
        return 'acknowledged' in res;
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
      function isMsgDBReply(res: any): res is MsgDBReply {
        return res.action === ACTION.MSG;
      }
      function isNoDBReply(res: any): res is NoDBReply {
        return res.result === null;
      }

      if (isJoinGameDBReply(result)) {
        if (!result) return res.sendStatus(404);
        [...wss.clients]
          .filter(
            (client) =>
              client.gameId === req.params.id &&
              client.userId !== req.userId &&
              client.readyState === WebSocket.OPEN
          )
          .forEach((client) => {
            client.send(
              JSON.stringify({
                updatedBy: req.userId,
                action: result.action,
                // notify opponent that requestor has joined
                players: result.game.players,
              })
            );
          });

        const game = result.game;
        if (!game) return res.sendStatus(404);
        // send game back to the requestor who has just joined
        return res.status(200).send(game);
      } else if (isMoveDBReply(result)) {
        [...wss.clients]
          .filter(
            (client) =>
              client.gameId === req.params.id &&
              client.userId !== req.userId &&
              client.readyState === WebSocket.OPEN
          )
          .forEach((client) => {
            client.send(
              JSON.stringify({
                updatedBy: req.userId,
                // notify opponent
                action: result.action,
                selectedPosId: result.result.selectedPosId,
                selectedPosIndex: result.result.selectedPosIndex,
                status: result.result.status,
                player: result.result.player,
                players: result.result.players,
              })
            );
          });
        return res
          .status(200)
          .send({ status: result.result.status, player: result.result.player });
      } else if (isLeaveGameDBReply(result)) {
        [...wss.clients]
          .filter(
            (client) =>
              client.gameId === req.params.id &&
              client.userId !== req.userId &&
              client.readyState === WebSocket.OPEN
          )
          .forEach((client) => {
            client.send(
              JSON.stringify({
                updatedBy: req.userId,
                action: result.action,
                // notify opponent I have left, by sending my details
                players: result.players,
              })
            );
          });
        // response sent back to player that left - although they won't make use of it
        return res.status(200).send({ players: result.players });
      } else if (isDeleteGameDBResult(result)) {
        if (result.acknowledged && result.deletedCount === 1) {
          return res.status(204).send();
        } else {
          return res.sendStatus(404);
        }
      } else if (isTakeRestGameDBReply(result)) {
        // Clicking Leave in client browser triggers a LEAVE action to be
        // sent from server, then, in the useEffect cleanup fnc, restFromGame()
        // triggers a REST action to be sent from server, however, the player who
        // clicked Leave is no longer in the players of that game, which is
        // made explicit by the result of the DB query which finds no doc for this
        // game containing the player who left, returning an object with no players prop.
        // This works well for the client side browser in that it receives no redundant
        // ws message for the REST action.
        if ('players' in result) {
          [...wss.clients]
            .filter(
              (client) =>
                client.gameId === req.params.id &&
                client.userId !== req.userId &&
                client.readyState === WebSocket.OPEN
            )
            .forEach((client) => {
              client.send(
                JSON.stringify({
                  updatedBy: req.userId,
                  action: result.action,
                  players: result.players,
                })
              );
            });
        }
        return res.status(204).send();
      } else if (isResetGameDBReply(result)) {
        return res.status(200).send(result.result.game);
        // do something?
      } else if (isMsgDBReply(result)) {
        const {action, ...messages} = result;
        if (!messages) return res.sendStatus(404);
        // return res.status(200).send({messages: result.messages});
        // return res.status(200).send(messages); // consider sending messages
        return res.status(204).send();
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
