import { DeleteGameDBResult } from '../interfaces/JoinLeaveGameReply';
import express, { NextFunction, Request, Response } from 'express';
import WebSocket from 'ws';
import { wss } from '../websocket';

// import validateSchema from '../middleware/validateSchema';
// import validateUpdateGameBodyPayload from '../middleware/validateUpdateGameBodyPayload';
// import validateUpdateGameSchema from '../middleware/validateUpdateGameSchema';
// import validateResponseSchema from '../middleware/validateResponseSchema';

import {
  deserializeUser,
  validateSchema,
  validateUpdateGameBodyPayload,
  validateUpdateGameSchema,
  validateResponseSchema,
  // validateGetGameResponseSchema,
  validateUpdateGameResponseSchema,
} from '../middleware';
import { validateGetGameResponseSchema } from '../middleware/validateGetGameResponseSchema_new';

// import { deserializeUser } from '../middleware/deserializeUser';

import {
  deleteGameSchema,
  readGameSchema,
  ReadGameInput,
  // assertUpdateGamePayloadShape,
  UpdateGameInput,
  updateGameGeneralSchema,
} from '../schema/updateGameSchemas_new';

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

// import {
//   deleteGameSchema,
//   readGameSchema,
//   ReadGameInput,
//   assertUpdateGamePayloadShape,
//   UpdateGameInput,
//   createGameSchema,
//   CreateGameInput,
//   completedGamesArraySchema,
//   CompletedGamesArray,
//   incompleteGamesArraySchema,
//   IncompleteGamesArray,
//   gameSchema,
//   Game,
//   updateGameDBResponseSchema,
// } from '../schema';

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
import { ACTION, PLAYER_STATE, POSITION_STATUS } from '../constants';
// import {
//   JoinGameDBReply,
//   MoveDBReply,
//   LeaveGameDBReply,
//   NoDBReply,
//   ResetGameDBReply,
//   TakeRestFromGameDBReply,
//   // ReEnterGameDBReply,
//   RetrieveGameDBReply,
//   MsgDBReply,
// } from '../interfaces';
import {
  ReEnterRetrieveGameDBReply,
  ReEnterGameDBReply,
} from '../interfaces/GetGameReply_new';
import logger from '../util/logger';

import {
  JoinGameDbReply,
  // RetrieveGameDbReply,
  LeaveGameDbReply,
  // DeleteGameDbReply,
  TakeRestDbReply,
  ResetGameDbReply,
  MsgDbReply,
  // NoDbReply,
  UpdateGameDbReply,
  MoveResponse,
  MoveDetails,
  MoveDbReply,
  // DeleteResult,
  Players,
  LeaveGameResult,
  DeleteGameResult,
  Message,
} from '../schema/updateGameDBResponseSchema';
import { PlayerDetail } from '../schema/userAndPlayerSchemas';
import { RetrieveGameDbReply } from '../schema/getGameReplySchema';
import { NoDbReply } from '../schema/noReply';
import { ServerError } from '../schema/serverErrorSchema';

const gameHandler = express.Router();

gameHandler.use(deserializeUser);

// type Exact<T, U = T> = T extends U
//   ? U extends T
//     ? { [K in keyof T]: T[K] }
//     : never
//   : never;

// type ForbiddenExtension<T, U> = T extends U ? Pick<T, keyof U> : U;

interface TypedResponse<T, U = null>
  extends Response<
    // U extends null ? T : T extends U ? Extract<T, { [K in keyof U]: U[K] }> : U
    // U extends null ? T : { [K in keyof U]: U[K] }
    U extends null ? T : U
  > {
  locals: { asyncData: T; processedData: U };
  // locals: { asyncData: T; processedData: null extends U ? T : U };
}

// interface TypedResponse<T, U> extends Response<U extends null ? T : U> {
//   locals: { asyncData: T; processedData: U };
//   send(body?: U extends null ? T : U): this;
// }

type DeepNonNullable<T> = T extends object
  ? {
      [P in keyof T]: DeepNonNullable<T[P]>;
    }
  : NonNullable<T>;

// Get incomplete games
gameHandler.get(
  '/',
  async (
    req: Request<{}, IncompleteGamesArray, {}, {}>,
    res: TypedResponse<IncompleteGamesArray, null>,
    next: NextFunction
  ) => {
    const userId = req.userId;
    // try {
    const result = await getIncompleteGames(userId);
    res.locals.asyncData = result;
    // array is returned, regardless of any games or not; in the latter case, result is []
    next();
  },
  validateResponseSchema(incompleteGamesArraySchema),
  (
    req: Request<{}, IncompleteGamesArray, {}, {}>,
    res: TypedResponse<IncompleteGamesArray, null>
  ) => {
    return res.status(200).send(res.locals.asyncData);
  }
);

// Get completed games
gameHandler.get(
  '/games',
  async (
    req: Request<{}, CompletedGamesArray, {}, {}>,
    res: TypedResponse<CompletedGamesArray, null>,
    next: NextFunction
  ) => {
    const userId = req.userId;
    const result = await getCompletedGames(userId);
    res.locals.asyncData = result;
    next();
  },
  validateResponseSchema(completedGamesArraySchema),
  (
    req: Request<{}, CompletedGamesArray, {}, {}>,
    res: TypedResponse<CompletedGamesArray, null>
  ) => {
    return res.status(200).send(res.locals.asyncData);
  }
);

// Create Game
gameHandler.post(
  '/',
  validateSchema(createGameSchema),
  async (
    req: Request<{}, Game, CreateGameInput['body']>,
    res: TypedResponse<Game, null>,
    next: NextFunction
  ) => {
    const userId = req.userId;
    const gameReqBody = req.body;
    const newGame = await createGame(gameReqBody, userId);
    res.locals.asyncData = newGame;
    next();
  },
  validateResponseSchema(gameSchema),
  (
    req: Request<{}, Game, CreateGameInput['body']>,
    res: TypedResponse<Game, null>
  ) => {
    return res.status(200).send(res.locals.asyncData);
  }
);

// Read Incomplete Game
gameHandler.get(
  '/game/:id',
  validateSchema(readGameSchema),
  async (
    req: Request<ReadGameInput['params'], Game, {}>,
    // res: TypedResponse<ReEnterRetrieveGameDBReply | NoDBReply, Game>,
    res: TypedResponse<RetrieveGameDbReply, Game>,
    next: NextFunction
  ) => {
    const userId = req.userId;
    const gameId = req.params.id;
    res.locals.asyncData = await getIncompleteGame(gameId, userId);
    next();
  },
  validateGetGameResponseSchema,
  (
    req: Request<ReadGameInput['params'], Game, {}>,
    // res: TypedResponse<ReEnterGameDBReply, Game>
    res: TypedResponse<RetrieveGameDbReply, Game>
  ) => {
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
            // action: res.locals.asyncData.action,
            // action: ACTION.RETRIEVE,
            action: ACTION.REENTER,
            // notify opponent I have joined or re-entered, by sending my details (name)
            players: res.locals.processedData.players,
          })
        );
      });
    return res.status(200).send(res.locals.processedData);
  }
);

// Read Completed Game
gameHandler.get(
  '/game-log/:id',
  validateSchema(readGameSchema),
  async (
    req: Request<ReadGameInput['params'], Game, {}>,
    // res: TypedResponse<ReEnterRetrieveGameDBReply | NoDBReply, Game>,
    res: TypedResponse<RetrieveGameDbReply, Game>,
    next: NextFunction
  ) => {
    // try {
    const userId = req.userId;
    const gameId = req.params.id;
    res.locals.asyncData = await getIncompleteGame(gameId, userId);
    next();
  },
  validateGetGameResponseSchema,

  (
    req: Request<ReadGameInput['params'], Game, {}>,
    res: TypedResponse<RetrieveGameDbReply, Game>
  ) => {
    return res.status(200).json(res.locals.processedData);
  }
);

// middleware updater functions
function isJoinGameDBReply(
  req: Request<
    UpdateGameInput['params'],
    // TypedResponse<NonNullable<JoinGameDbReply['result']>, null>,
    // TypedResponse<DeepNonNullable<JoinGameDbReply>>,
    TypedResponse<Omit<JoinGameDbReply, 'result'> & { result: Game }>,
    UpdateGameInput['body']
  >,
  // res: TypedResponse<JoinGameDbReply, null>,
  // res: TypedResponse<Exclude<JoinGameDbReply, NoDbReply>, null>,
  // res: TypedResponse<NonNullable<JoinGameDbReply['result']>, null>,
  res: TypedResponse<Omit<JoinGameDbReply, 'result'> & { result: Game }, Game>,
  // res: TypedResponse<Pick<JoinGameDbReply, 'result'>, null>,
  next: NextFunction
) {
  if (res.locals.asyncData.action === ACTION.JOIN) {
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
            // action: result.action,
            // action: res.locals.asyncData.action,
            action: 'JOIN',
            // notify opponent that requestor has joined
            // players: result.game.players,
            players: res.locals.asyncData.result.players,
          })
        );
      });

    // response is already screened for NoDbReply, so game is not null
    // // const game = result.game;
    // const game = res.locals.asyncData;
    // if (!game) return res.sendStatus(404); // or(game === null)
    // // send game back to the requestor who has just joined
    // // return res.status(200).send(game);
    //
    // return res.status(200).send(res.locals.asyncData);
    res.locals.processedData = res.locals.asyncData.result;
    return res.status(200).send(res.locals.processedData);
  }
  next();
} // make sure client end receives what it expects

function isLeaveGameDBReply(
  req: Request<
    UpdateGameInput['params'],
    // TypedResponse<NonNullable<LeaveGameDbReply['result']>, null>,
    UpdateGameInput['body']
  >,
  // res: TypedResponse<NonNullable<LeaveGameDbReply['result']>, null>,
  res: TypedResponse<
    //LeaveGameDbReply,
    // Omit<LeaveGameDbReply, 'result'> & {
    //   // result: UserDetail[] | DeleteResult;
    //   result: Players | DeleteResult;
    // },
    DeleteGameResult | LeaveGameResult,
    null
  >,
  next: NextFunction
) {
  const { action } = res.locals.asyncData;
  if (action === ACTION.LEAVE || action === ACTION.DELETE) {
    logger.info(`⚡️[server]: processing a LEAVE request`);
    const { action, result } = res.locals.asyncData;
    if (action === 'LEAVE') {
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
              // action: res.locals.asyncData.action,
              // action: 'LEAVE',
              action,
              // notify opponent I have left, by sending my details
              players: result,
            })
          );
        });
    }
    return res.status(204).send();
  }
  next();
  // // response sent back to player that left - although they won't make use of it
  // return res.status(200).send({ players: res.locals.asyncData.result });
}

function isMoveDBReply(
  req: Request<
    UpdateGameInput['params'],
    // TypedResponse<NonNullable<MoveDbReply['result']>, MoveResponse>,
    Omit<MoveDbReply, 'result'> & { result: MoveDetails | MoveResponse },
    UpdateGameInput['body']
  >,
  // res: TypedResponse<Exclude<MoveDbReply['result'], null>, MoveResponse>,
  // res: TypedResponse<MoveDetails, MoveResponse>,
  // TypedResponse<Exclude<UpdateGameDBReturnType, NoDbReply>, null>,
  // res: TypedResponse<NonNullable<MoveDbReply['result']>, MoveResponse>,
  res: TypedResponse<
    Omit<MoveDbReply, 'result'> & { result: MoveDetails | MoveResponse },
    MoveResponse
  >,
  next: NextFunction
) {
  if (res.locals.asyncData.action === ACTION.MOVE) {
    logger.info(
      `⚡️[server]: inside MOVE; res.locals.asyncData.action = ${res.locals.asyncData.action}`
    );

    const { result } = res.locals.asyncData;
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
              // notify opponent
              action: ACTION.MOVE,
              selectedPosId: result.selectedPosId,
              selectedPosIndex: result.selectedPosIndex,
              status: result.status,
              player: result.player,
              players: result.players,
            })
          );
        });
    }
    // return res.status(200).send(res.locals.asyncData);
    // return res.status(200).send({
    //   status: res.locals.asyncData.status,
    //   player: res.locals.asyncData.player,
    // });
    res.locals.processedData = {
      status: result.status,
      player: result.player,
    };
    logger.info(
      `⚡️[server]: res.locals.processedData.status = ${res.locals.processedData.status}`
    );
    return res.status(200).send(res.locals.processedData);
  }
  next();
}

function isResetGameDBReply(
  req: Request<
    UpdateGameInput['params'],
    TypedResponse<ResetGameDbReply, NonNullable<ResetGameDbReply['result']>>,
    UpdateGameInput['body']
  >,
  // res: TypedResponse<ResetGameDbReply, NonNullable<ResetGameDbReply['result']>>,
  res: TypedResponse<Omit<ResetGameDbReply, 'result'> & { result: Game }, Game>,
  next: NextFunction
) {
  if (res.locals.asyncData.action === ACTION.RESET) {
    // return res.status(200).send(res.locals.asyncData.result);
    // if (res.locals.asyncData.result !== null)
    res.locals.processedData = res.locals.asyncData.result;
    return res.status(200).send(res.locals.processedData);
  }
  next();
}

function isTakeRestGameDBReply(
  req: Request<
    UpdateGameInput['params'],
    TypedResponse<
      Omit<TakeRestDbReply, 'result'> & {
        result: NonNullable<TakeRestDbReply['result']>;
      },
      NonNullable<TakeRestDbReply['result']>
    >,
    // TypedResponse<NonNullable<TakeRestDbReply['result']>>,
    UpdateGameInput['body']
  >,
  // res: TypedResponse<TakeRestDbReply, null>,
  // res: TypedResponse<NonNullable<TakeRestDbReply['result']>>,
  // res: TypedResponse<TakeRestDbReply, NonNullable<TakeRestDbReply['result']>>,
  res: TypedResponse<
    Omit<TakeRestDbReply, 'result'> & { result: PlayerDetail[] },
    PlayerDetail[]
  >,
  next: NextFunction
) {
  if (res.locals.asyncData.action === ACTION.REST) {
    res.locals.processedData = res.locals.asyncData.result;
    if (res.locals.processedData)
      // when player clicks LEAVE the App follows up
      [...wss.clients] // with REST by design and result is null, so
        .filter(
          // so need to guard against that with conditional.
          (client) =>
            client.gameId === req.params.id &&
            client.userId !== req.userId &&
            client.readyState === WebSocket.OPEN
        )
        .forEach((client) => {
          client.send(
            JSON.stringify({
              updatedBy: req.userId,
              // action: res.locals.asyncData.action,
              action: ACTION.REST,
              players: res.locals.asyncData.result,
            })
          );
        });
    return res.status(204).send();
    // try something different by aligning more to the generic type of res
  }
  next();
}

function isMsgDBReply(
  req: Request<
    UpdateGameInput['params'],
    // UpdateGameDbReply,
    UpdateGameInput['body']
  >,
  // res: TypedResponse<MsgDbReply, null>,
  // res: TypedResponse<NonNullable<MsgDbReply>>,
  res: TypedResponse<Omit<MsgDbReply, 'result'> & { result: Message[] }>,
  next: NextFunction
) {
  if (res.locals.asyncData.action === ACTION.MSG) {
    const { action, ...messages } = res.locals.asyncData;
    if (!messages) return res.sendStatus(404);
    // return res.status(200).send({messages: result.messages});
    // return res.status(200).send(messages); // consider sending messages
    return res.status(204).send();
  }
  next();
}

function isUnhandled(
  req: Request<UpdateGameInput['params'], UpdateGameInput['body']>,
  res: TypedResponse<ServerError, null>,
  next: NextFunction
) {
  throw new Error('Problem with server');
}

// Update Game
gameHandler.put(
  '/game/:id',
  // validateUpdateGameBodyPayload(assertUpdateGamePayloadShape),
  // validateUpdateGameSchema,
  validateSchema(updateGameGeneralSchema),
  async (
    req: Request<
      UpdateGameInput['params'],
      // UpdateGameDBReturnType,
      UpdateGameDbReply,
      UpdateGameInput['body']
    >,
    res: TypedResponse<UpdateGameDbReply, null>,
    next: NextFunction
  ) => {
    // const result: UpdateGameDBReturnType = await updateGame(
    logger.info(`⚡️[server]: about to call updateGame`);
    res.locals.asyncData = await updateGame(
      // ?? fix the type here
      req.params.id,
      req.userId,
      req.body
    );
    logger.info(`⚡️[server]: finished call to updateGame`);
    logger.info(
      `⚡️[server]: res.locals.asyncData.action = ${res.locals.asyncData.action}`
    );
    next();
  },

  validateUpdateGameResponseSchema,

  // one of these middlewares will match and complete the req-res cycle
  isJoinGameDBReply,
  isLeaveGameDBReply,
  isMoveDBReply,
  isResetGameDBReply,
  isTakeRestGameDBReply,
  isMsgDBReply,
  // otherwise the req-res cycle is terminated through the default error handler
  isUnhandled
  // (
  //   req: Request<
  //     UpdateGameInput['params'],
  //     // UpdateGameDBReturnType,
  //     UpdateGameDbReply,
  //     UpdateGameInput['body']
  //   >,
  //   // res: TypedResponse<UpdateGameResponseType>
  //   // res: TypedResponse<Exclude<UpdateGameDBReturnType, NoDbReply>, null>,
  //   res: TypedResponse<Exclude<UpdateGameDbReply, NoDbReply>, null>,
  //   next: NextFunction
  // ) => {
  //   logger.info(
  //     `⚡️[server]: res.locals.asyncData.action = ${res.locals.asyncData.action}`
  //   );

  //   switch (res.locals.asyncData.action) {
  //     case ACTION.JOIN:
  //       isJoinGameDBReply;
  //       // return [
  //       //   isJoinGameDBReply,
  //       //   (req: Request, res: TypedResponse<null, Game>) => {
  //       //     return res.status(200).send(res.locals.processedData);
  //       //   },
  //       // ];

  //       break;

  //     case ACTION.LEAVE:
  //       isLeaveGameDBReply;
  //       // return [
  //       //   isLeaveGameDBReply,
  //       //   (req: Request, res: TypedResponse<undefined>) => {
  //       //     return res.status(204).send();
  //       //   },
  //       // ];
  //       break;

  //     case ACTION.MOVE:
  //       isMoveDBReply;
  //       // return [
  //       //   isMoveDBReply,
  //       //   (
  //       //     req: Request,
  //       //     res: TypedResponse<null, MoveResponse>
  //       //     // next: NextFunction
  //       //   ) => {
  //       //     logger.info(
  //       //       `⚡️[server]: res.locals.processedData.status = ${res.locals.processedData.status}`
  //       //     );
  //       //     //  2 generic types above
  //       //     // the following line can be incl. or optional ...
  //       //     // res.locals.asyncData = res.locals.processedData
  //       //     // but it would need to be incl. if statment below
  //       //     // was send(res.locals.asyncData)
  //       //     return res.status(200).send(res.locals.processedData);
  //       //   },
  //       // ];
  //       break;

  //     case ACTION.RESET:
  //       isResetGameDBReply;
  //       break;

  //     case ACTION.REST:
  //       isTakeRestGameDBReply;
  //       // return [
  //       //   isTakeRestGameDBReply,
  //       //   (req: Request, res: TypedResponse<undefined>) => {
  //       //     return res.status(204).send();
  //       //   },
  //       // ];
  //       break;

  //     case ACTION.MSG:
  //       isMsgDBReply;

  //       // return [
  //       //   isMsgDBReply,
  //       //   (req: Request, res: TypedResponse<undefined>) => {
  //       //     return res.status(204).send();
  //       //   },
  //       // ];
  //       break;

  //     default:
  //       throw new Error('Problem with server');
  //       break;
  //   }
  // }
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
