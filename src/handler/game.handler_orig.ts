import { DeleteGameDBResult } from '../interfaces/JoinLeaveGameReply_orig';
import express, { NextFunction, Request, Response } from 'express';
import WebSocket from 'ws';
import { wss } from '../websocket';

import { validateSchema } from '../middleware/validateSchema';
import { validateUpdateGameBodyPayload } from '../middleware/validateUpdateGameBodyPayload';
import { validateUpdateGameSchema } from '../middleware/validateUpdateGameSchema';
import { validateResponseSchema } from '../middleware/validateResponseSchema';
import { deserializeUser } from '../middleware/deserializeUser';

import {
  deleteGameSchema,
  readGameSchema,
  ReadGameInput,
  assertUpdateGamePayloadShape,
  UpdateGameInput,
} from '../schema/updateGameSchemas';

import { createGameSchema, CreateGameInput } from '../schema/createGameSchemas';
import {
  completedGamesArraySchema,
  CompletedGamesArray,
} from '../schema/completedGamesSchema';
import {
  incompleteGamesArraySchema,
  IncompleteGamesArray,
} from '../schema/incompleteGamesSchema';
import { gameSchema, Game } from '../schema/gameSchema';

import {
  getIncompleteGames,
  getCompletedGames,
  createGame,
  updateGame,
  deleteGame,
  getIncompleteGame,
  getCompletedGame,
  UpdateResultDoc,
} from '../service/game.service_orig';
import { GameDocument } from '../model/game.model';
import {
  GameStatus,
  PlayerDetail,
  // UpdateGameDBReturnType,
  UpdateGameResponseType,
} from '../types';
import { UpdateGameDBReturnType } from '../types/UpdateGameDBReturnType_orig';
import { ACTION, PLAYER_STATE } from '../constants';
import {
  // JoinGameDBReply,
  // MoveDBReply,
  // LeaveGameDBReply,
  // NoDBReply,
  // ResetGameDBReply,
  TakeRestFromGameDBReply,
  // ReEnterGameDBReply,
  // RetrieveGameDBReply,
  MsgDBReply,
} from '../interfaces';
import logger from '../util/logger';
import {
  ReEnterGameDBReply,
  RetrieveGameDBReply,
} from '../interfaces/GetGameReply_orig';
import { NoDBReply } from '../interfaces/NoReply_orig';
import {
  JoinGameDBReply,
  LeaveGameDBReply,
} from '../interfaces/JoinLeaveGameReply_orig';
import { MoveDBReply } from '../interfaces/MoveReply_orig';
import { ResetGameDBReply } from '../interfaces/ResetGameReply_orig';

const gameHandler = express.Router();

gameHandler.use(deserializeUser);

// export interface TypedResponse<T extends Record<string, any>> extends Response {
//   locals: T;
// }

// interface TypedResponse<T> extends Response {
//   locals: { asyncData: T };
// }

interface TypedResponse<T, U = null> extends Response<U extends null ? T : U> {
  locals: { asyncData: T; processedData: U };
}

// Get incomplete games
gameHandler.get(
  '/',
  async (
    req: Request<{}, IncompleteGamesArray, {}, {}>,
    res: TypedResponse<IncompleteGamesArray>,
    next: NextFunction
  ) => {
    const userId = req.userId;
    // try {
    const result = await getIncompleteGames(userId);
    res.locals.asyncData = result;
    next();
    // array is returned, regardless of any games or not; in the latter case, result is []
    // return res.status(200).send(
    //   result.map((g) => ({
    //     _id: g._id,
    //     gameNumber: g.gameNumber,
    //     size: g.size,
    //     isMulti: g.isMulti,
    //     createdAt: g.createdAt,
    //     players: g.players,
    //   }))
    // );
    // // } catch (err: any) {
    // //   return res.status(500).send(err);
    // // }
  },
  validateResponseSchema(incompleteGamesArraySchema),
  (
    req: Request<{}, IncompleteGamesArray, {}, {}>,
    res: TypedResponse<IncompleteGamesArray>
  ) => {
    return res.status(200).send(res.locals.asyncData);
  }
);

// Get completed games
gameHandler.get(
  '/games',
  // async (req: Request, res: Response, next: NextFunction) => {
  async (
    // req: CustomRequest<CompletedGamesArray>,
    // res: TypedResponse<CompletedGamesArray>,
    req: Request<{}, CompletedGamesArray, {}, {}>,
    // res: TypedResponse<CompletedGamesArray, CompletedGames>,
    res: TypedResponse<CompletedGamesArray>,
    next: NextFunction
  ) => {
    const userId = req.userId;
    // try {
    const result = await getCompletedGames(userId);
    // req.asyncData = result;
    res.locals.asyncData = result;
    next();
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
    // return res.status(200).send(
    //   result.map((g) => ({
    //     _id: g._id,
    //     gameNumber: g.gameNumber,
    //     size: g.size,
    //     status: g.status,
    //     lastSelectedPosition: g.positions[g.selectedPositions.at(-1) ?? 0],
    //     createdAt: g.createdAt,
    //     updatedAt: g.updatedAt,
    //   }))
    // );
    // validateResponseSchema(completedGamesArraySchema);
    // return res.status(200).send(result);
    // } catch (err: any) {
    //   return res.status(500).send(err);
    // }
  },
  validateResponseSchema(completedGamesArraySchema),
  (
    // req: CustomRequest<CompletedGamesArray>,
    // res: TypedResponse<CompletedGamesArray>
    req: Request<{}, CompletedGamesArray, {}, {}>,
    res: TypedResponse<CompletedGamesArray>
    // res: TypedResponse<CompletedGamesArray, CompletedGames>
  ) => {
    // return res.status(200).send(req.asyncData);
    return res.status(200).send(res.locals.asyncData);
    // return res.status(200).send("Hi");
  }
);

// Create Game
gameHandler.post(
  '/',
  validateSchema(createGameSchema),
  async (
    // req: Request<{}, GameDocument, CreateGameInput['body']>,
    // res: TypedResponse<GameDocument>,
    req: Request<{}, Game, CreateGameInput['body']>,
    res: TypedResponse<Game>,
    next: NextFunction
  ) => {
    // try { // Express 5 auto fwd to global err handler
    // console.log(x); // eg: this will thow err if x undefined, and propogate to global err handler
    const userId = req.userId;
    const gameReqBody = req.body;
    const newGame = await createGame(gameReqBody, userId);
    res.locals.asyncData = newGame;
    // console.log({ ...res.locals });
    next();
  },
  validateResponseSchema(gameSchema),
  (
    req: Request<{}, Game, CreateGameInput['body']>,
    res: TypedResponse<Game>
  ) => {
    // console.log({ ...res.locals });
    return res.status(200).send(res.locals.asyncData);
    // } catch (err: any) {
    //   return res.status(500).send(err);
    // }
  }
);

// Read Incomplete Game
gameHandler.get(
  '/game/:id',
  validateSchema(readGameSchema),
  async (
    // req: Request<ReadGameInput['params'], GameDocument, {}>,
    // res: TypedResponse<GameDocument>,
    req: Request<ReadGameInput['params'], Game, {}>,
    res: TypedResponse<Game>,
    next: NextFunction
  ) => {
    // Express 5 automatically calls next() for route handlers returning Promises that reject or throw
    // try {
    const userId = req.userId;
    const gameId = req.params.id;

    // you must already be in the game that you are trying to GET, otherwise, no result.
    function isReEnterGameDBReply(res: any): res is ReEnterGameDBReply {
      return res.action === ACTION.REENTER && res.game;
    }
    function isNoDBReply(res: any): res is NoDBReply {
      return res.action === ACTION.REENTER && res.result === null;
    }

    // const result: JoinGameDBReply | NoDBReply = await getIncompleteGame(gameId, userId);
    const result: ReEnterGameDBReply | NoDBReply = await getIncompleteGame(
      gameId,
      userId
    );
    if (isReEnterGameDBReply(result)) {
      res.locals.asyncData = result.game;
      validateResponseSchema(gameSchema);
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
      next();
    } else if (isNoDBReply(result)) {
      logger.info(`⚡️[server]: Incomplete Game, gameId ${gameId}, not found.`);
      return res.sendStatus(404);
    } else {
      // throw new Error('Problem with server');
      // return res.sendStatus(400);
      return res.sendStatus(500);
    } // never throw errors intentionally. Errors are for exceptions.
    // } catch (err: any) {
    //   return res.status(500).send(err);
    // }
  },
  (
    req: Request<ReadGameInput['params'], Game, {}>,
    res: TypedResponse<Game>
  ) => {
    return res.status(200).send(res.locals.asyncData);
  }
);

// Read Completed Game
gameHandler.get(
  '/game-log/:id',
  validateSchema(readGameSchema),
  async (
    // req: Request<ReadGameInput['params'], GameDocument, {}>,
    // res: TypedResponse<GameDocument>
    req: Request<ReadGameInput['params'], Game, {}>,
    res: TypedResponse<Game>,
    next: NextFunction
  ) => {
    // try {
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
      res.locals.asyncData = result.game;
      validateResponseSchema(gameSchema);
      next();
    } else if (isNoDBReply(result)) {
      return res.sendStatus(404);
    } else {
      throw new Error('Problem with server');
    }
    // } catch (err: any) {
    //   return res.status(500).send(err);
    // }
  },
  (
    req: Request<ReadGameInput['params'], Game, {}>,
    res: TypedResponse<Game>
  ) => {
    return res.status(200).json(res.locals.asyncData);
  }
);

// Update Game
gameHandler.put(
  '/game/:id',
  validateUpdateGameBodyPayload(assertUpdateGamePayloadShape),
  validateUpdateGameSchema,
  async (
    req: Request<
      UpdateGameInput['params'],
      UpdateGameResponseType,
      UpdateGameInput['body']
    >,
    res: TypedResponse<UpdateGameResponseType>
  ) => {
    // try {
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
      const { action, ...messages } = result;
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
    // } catch (err: any) {
    //   console.log('server error');
    //   return res.status(500).send(err);
    // }
  }
);

// Delete Game
gameHandler.delete(
  '/game/:id',
  validateSchema(deleteGameSchema),
  async (req: Request, res: Response) => {
    // try {
    const userId = req.userId;
    const gameId = req.params.id;
    const deleted = await deleteGame(gameId, userId);
    if (deleted.acknowledged && deleted.deletedCount === 0)
      return res.sendStatus(404);
    res.sendStatus(200);
    // } catch (err: any) {
    //   return res.status(500).send(err);
    // }
  }
);

export default gameHandler;
