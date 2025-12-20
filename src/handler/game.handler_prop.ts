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
  validateGetGameResponseSchema,
  validateUpdateGameResponseSchema,
} from '../middleware';

// import { deserializeUser } from '../middleware/deserializeUser';

import {
  deleteGameSchema,
  readGameSchema,
  ReadGameInput,
  // assertUpdateGamePayloadShape,
  UpdateGameInput,
  updateGameGeneralSchema,
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
} from '../service/game.service_prop';
import { GameDocument } from '../model/game.model';
import {
  GameStatus,
  PlayerDetail,
  UpdateGameDBReturnType,
  UpdateGameResponseType,
} from '../types';
import { ACTION, PLAYER_STATE, POSITION_STATUS } from '../constants';
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

// export interface TypedResponse<T extends Record<string, any>> extends Response {
//   locals: T;
// }

// interface TypedResponse<T, U> extends Response<T> {
//   locals: { asyncData: T; processedData: U };
// }
interface TypedResponse<T, U> extends Response<U extends null ? T : U> {
  locals: { asyncData: T; processedData: U };
}

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
    res: TypedResponse<IncompleteGamesArray, null>
  ) => {
    return res.status(200).send(res.locals.asyncData);
    // return res.status(200).send('Hello');
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
    res: TypedResponse<CompletedGamesArray, null>,
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
    res: TypedResponse<CompletedGamesArray, null>
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
    res: TypedResponse<Game, null>,
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
    res: TypedResponse<Game, null>
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
    res: TypedResponse<ReEnterGameDBReply | NoDBReply, Game>,
    next: NextFunction
  ) => {
    // Express 5 automatically calls next() for route handlers returning Promises that reject or throw
    // try {
    const userId = req.userId;
    const gameId = req.params.id;
    // const result: ReEnterGameDBReply | NoDBReply = await getIncompleteGame(
    res.locals.asyncData = await getIncompleteGame(gameId, userId);
    next();
  },
  // validateResponseSchema(gameSchema),
  // validateResponseSchema(reEnterGameDbReplySchema),
  validateGetGameResponseSchema,
  // (
  //   req: Request<ReadGameInput['params'], Game, {}>,
  //   res: TypedResponse<Game, Game>,
  //   next: NextFunction
  // ) => {
  //   res.locals.asyncData = res.locals.processedData;
  //   next()
  //   //   // validateSchema
  //   //   // const responseObject: Game = res.locals.processedData
  //   //   // // you must already be in the game that you are trying to GET, otherwise, no result.
  //   //   // function isReEnterGameDBReply(res: any): res is ReEnterGameDBReply {
  //   //   //   return res.action === ACTION.REENTER && res.game;
  //   //   // }
  //   //   // function isNoDBReply(res: any): res is NoDBReply {
  //   //   //   return res.action === ACTION.REENTER && res.result === null;
  //   //   // }

  //   //   // if (isReEnterGameDBReply(res.locals.asyncData)) {
  //   //     // res.locals.asyncData = result.game;
  //   //     // [...wss.clients]
  //   //     //   .filter(
  //   //     //     (client) =>
  //   //     //       client.gameId === req.params.id &&
  //   //     //       client.userId !== req.userId &&
  //   //     //       client.readyState === WebSocket.OPEN
  //   //     //   )
  //   //     //   .forEach((client) => {
  //   //     //     client.send(
  //   //     //       JSON.stringify({
  //   //     //         updatedBy: req.userId,
  //   //     //         // notify opponent I have re-entered, by sending my details (name)
  //   //     //         // playerDetail: me,
  //   //     //         action: res.locals.asyncData.,
  //   //     //         // notify opponent that requestor has joined
  //   //     //         players: res.locals.asyncData. result.game.players,
  //   //     //       })
  //   //     //     );
  //   //     //   });
  //   //     // next();
  //   //   // } else if (isNoDBReply(result)) {
  //   //   //   logger.info(`⚡️[server]: Incomplete Game, gameId ${gameId}, not found.`);
  //   //   //   return res.sendStatus(404);
  //   //   // } else {
  //   //   //   // throw new Error('Problem with server');
  //   //   //   // return res.sendStatus(400);
  //   //   //   return res.sendStatus(500);
  //   //   // } // never throw errors intentionally. Errors are for exceptions.
  //   //   // // } catch (err: any) {
  //   //   // //   return res.status(500).send(err);
  //   //   // // }
  // },
  (
    req: Request<ReadGameInput['params'], Game, {}>,
    // res: TypedResponse<Game, null>
    res: TypedResponse<ReEnterGameDBReply, Game>
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
            // notify opponent I have re-entered, by sending my details (name)
            // playerDetail: me,
            action: res.locals.asyncData.action,
            // notify opponent that requestor has joined
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
    // req: Request<ReadGameInput['params'], GameDocument, {}>,
    // res: TypedResponse<GameDocument>
    req: Request<ReadGameInput['params'], Game, {}>,
    res: TypedResponse<RetrieveGameDBReply | NoDBReply, Game>,
    next: NextFunction
  ) => {
    // try {
    const userId = req.userId;
    const gameId = req.params.id;
    res.locals.asyncData = await getIncompleteGame(gameId, userId);
    next();
  },
  // validateResponseSchema(gameSchema),
  // validateResponseSchema(reEnterGameDbReplySchema),
  validateGetGameResponseSchema,

  //   function isRetrieveGameDBReply(res: any): res is RetrieveGameDBReply {
  //     return res.action === ACTION.RETRIEVE && res.game;
  //   }
  //   function isNoDBReply(res: any): res is NoDBReply {
  //     return res.action === ACTION.RETRIEVE && res.result === null;
  //   }
  //   const result = await getCompletedGame(gameId, userId);

  //   if (isRetrieveGameDBReply(result)) {
  //     res.locals.asyncData = result.game;
  //     validateResponseSchema(gameSchema);
  //     next();
  //   } else if (isNoDBReply(result)) {
  //     return res.sendStatus(404);
  //   } else {
  //     throw new Error('Problem with server');
  //   }
  //   // } catch (err: any) {
  //   //   return res.status(500).send(err);
  //   // }
  // },
  (
    req: Request<ReadGameInput['params'], Game, {}>,
    res: TypedResponse<RetrieveGameDBReply | NoDBReply, Game>
  ) => {
    return res.status(200).json(res.locals.processedData);
  }
);

// // middleware updater functions
// function isJoinGameDBReply(
//   req: Request<
//     UpdateGameInput['params'],
//     UpdateGameDBReturnType,
//     UpdateGameInput['body']
//   >,
//   res: TypedResponse<JoinGameDBReply, null>,
//   next: NextFunction
// ) {
//   [...wss.clients]
//     .filter(
//       (client) =>
//         client.gameId === req.params.id &&
//         client.userId !== req.userId &&
//         client.readyState === WebSocket.OPEN
//     )
//     .forEach((client) => {
//       client.send(
//         JSON.stringify({
//           updatedBy: req.userId,
//           // action: result.action,
//           action: res.locals.asyncData.action,
//           // notify opponent that requestor has joined
//           // players: result.game.players,
//           players: res.locals.asyncData.result,
//         })
//       );
//     });

//   // const game = result.game;
//   const game = res.locals.asyncData.result;
//   if (!game) return res.sendStatus(404);
//   // send game back to the requestor who has just joined
//   // return res.status(200).send(game);
//   return res.status(200).send(res.locals.asyncData);
// }

// function isLeaveGameDBReply(
//   req: Request<
//     UpdateGameInput['params'],
//     UpdateGameDBReturnType,
//     UpdateGameInput['body']
//   >,
//   res: TypedResponse<LeaveGameDBReply, null>,
//   next: NextFunction
// ) {
//   [...wss.clients]
//     .filter(
//       (client) =>
//         client.gameId === req.params.id &&
//         client.userId !== req.userId &&
//         client.readyState === WebSocket.OPEN
//     )
//     .forEach((client) => {
//       client.send(
//         JSON.stringify({
//           updatedBy: req.userId,
//           action: res.locals.asyncData.action,
//           // notify opponent I have left, by sending my details
//           players: res.locals.asyncData.result,
//         })
//       );
//     });
//   return res.status(204).send();
//   // // response sent back to player that left - although they won't make use of it
//   // return res.status(200).send({ players: res.locals.asyncData.result });
// }

// function isDeleteGameDBResult(
//   req: Request<
//     UpdateGameInput['params'],
//     UpdateGameDBReturnType,
//     UpdateGameInput['body']
//   >,
//   res: TypedResponse<DeleteGameDBResult, null>,
//   next: NextFunction
// ) {
//   if (
//     res.locals.asyncData.result.acknowledged &&
//     res.locals.asyncData.result.deletedCount === 1
//   ) {
//     return res.status(204).send();
//   } else {
//     return res.sendStatus(404);
//   }
// }

// function isMoveDBReply(
//   req: Request<
//     UpdateGameInput['params'],
//     UpdateGameDBReturnType,
//     UpdateGameInput['body']
//   >,
//   res: TypedResponse<MoveDBReply, null>,
//   next: NextFunction
// ) {
//   if ('players' in res.locals.asyncData.result) {
//     [...wss.clients]
//       .filter(
//         (client) =>
//           client.gameId === req.params.id &&
//           client.userId !== req.userId &&
//           client.readyState === WebSocket.OPEN
//       )
//       .forEach((client) => {
//         client.send(
//           JSON.stringify({
//             updatedBy: req.userId,
//             // notify opponent
//             action: res.locals.asyncData.action,
//             selectedPosId: res.locals.asyncData.result.selectedPosId,
//             selectedPosIndex: res.locals.asyncData.result.selectedPosIndex,
//             status: res.locals.asyncData.result.status,
//             player: res.locals.asyncData.result.player,
//             players: res.locals.asyncData.result.players,
//           })
//         );
//       });
//   }
//   return res.status(200).send(res.locals.asyncData);
//   // return res.status(200).send({
//   //   status: res.locals.asyncData.result.status,
//   //   player: res.locals.asyncData.result.player,
//   // });
// }

// function isResetGameDBReply(
//   req: Request<
//     UpdateGameInput['params'],
//     UpdateGameDBReturnType,
//     UpdateGameInput['body']
//   >,
//   res: TypedResponse<ResetGameDBReply, null>,
//   next: NextFunction
// ) {
//   // return res.status(200).send(res.locals.asyncData.result);
//   return res.status(200).send(res.locals.asyncData);
// }

// function isTakeRestGameDBReply(
//   req: Request<
//     UpdateGameInput['params'],
//     UpdateGameDBReturnType,
//     UpdateGameInput['body']
//   >,
//   res: TypedResponse<TakeRestFromGameDBReply, null>,
//   next: NextFunction
// ) {
//   [...wss.clients]
//     .filter(
//       (client) =>
//         client.gameId === req.params.id &&
//         client.userId !== req.userId &&
//         client.readyState === WebSocket.OPEN
//     )
//     .forEach((client) => {
//       client.send(
//         JSON.stringify({
//           updatedBy: req.userId,
//           action: res.locals.asyncData.action,
//           players: res.locals.asyncData.result,
//         })
//       );
//     });
//   return res.status(204).send();
// }

// function isMsgDBReply(
//   req: Request<
//     UpdateGameInput['params'],
//     UpdateGameDBReturnType,
//     UpdateGameInput['body']
//   >,
//   res: TypedResponse<MsgDBReply, null>,
//   next: NextFunction
// ) {
//   const { action, ...messages } = res.locals.asyncData;
//   if (!messages) return res.sendStatus(404);
//   // return res.status(200).send({messages: result.messages});
//   // return res.status(200).send(messages); // consider sending messages
//   return res.status(204).send();
// }

// Update Game
gameHandler.put(
  '/game/:id',
  // validateUpdateGameBodyPayload(assertUpdateGamePayloadShape),
  // validateUpdateGameSchema,
  validateSchema(updateGameGeneralSchema),
  async (
    req: Request<
      UpdateGameInput['params'],
      UpdateGameDBReturnType,
      UpdateGameInput['body']
    >,
    res: TypedResponse<UpdateGameDBReturnType, null>,
    next: NextFunction
  ) => {
    // const result: UpdateGameDBReturnType = await updateGame(
    res.locals.asyncData = await updateGame(
      // ?? fix the type here
      req.params.id,
      req.userId,
      req.body
    );
    next();
  },

  // validateUpdateGameResponseSchema(updateGameDBResponseSchema)
  // validateResponseSchema(updateGameDBResponseSchema);
  validateUpdateGameResponseSchema,

  (
    req: Request<
      UpdateGameInput['params'],
      UpdateGameDBReturnType,
      UpdateGameInput['body']
    >,
    // res: TypedResponse<UpdateGameResponseType>
    res: TypedResponse<Exclude<UpdateGameDBReturnType, NoDBReply>, null>,
    next: NextFunction
  ) => {
    function isJoinGameDBReply(res: any): res is JoinGameDBReply {
      return res.action === ACTION.JOIN && res.result !== null;
    }
    function isLeaveGameDBReply(res: any): res is LeaveGameDBReply {
      return res.action === ACTION.LEAVE;
    }
    function isDeleteGameDBResult(res: any): res is DeleteGameDBResult {
      // return 'acknowledged' in res;
      return res.action === ACTION.DELETE;
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

    // switch (res.locals.asyncData.action) {
    //   case ACTION.JOIN:
    //     isJoinGameDBReply;
    //     break;

    //   case ACTION.LEAVE:
    //     isLeaveGameDBReply;
    //     break;

    //   case ACTION.DELETE:
    //     isDeleteGameDBResult;
    //     break;

    //   case ACTION.MOVE:
    //     isMoveDBReply;
    //     break;

    //   case ACTION.RESET:
    //     isResetGameDBReply;
    //     break;

    //   case ACTION.REST:
    //     isTakeRestGameDBReply;
    //     break;

    //   case ACTION.MSG:
    //     isMsgDBReply;
    //     break;

    //   default:
    //     throw new Error('Problem with server');
    //     break;
    // }

    // if (isNoDBReply(res.locals.asyncData)) {
    //   return res.sendStatus(404); // because res.locals.asyncData.result === null
    // has already been screened for
    if (isJoinGameDBReply(res.locals.asyncData)) {
      // if (res.locals.asyncData.action === ACTION.JOIN) {
      // if (!result) return res.sendStatus(404); // this & below is pointless statement because
      // if (!res.locals.asyncData) return res.sendStatus(404); // a result has already been proven
      const result = res.locals.asyncData.result;
      // if (result === null) return res.sendStatus(404);
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
              action: 'MOVE',
              // notify opponent that requestor has joined
              // players: result.game.players,
              players: result.players,
            })
          );
        });

      // const game = result.game;
      const game = res.locals.asyncData.result;
      if (game === null) return res.sendStatus(404);
      // send game back to the requestor who has just joined
      // return res.status(200).send(game);
      return res.status(200).send(res.locals.asyncData);
    } else if (isMoveDBReply(res.locals.asyncData)) {
      // } else if (res.locals.asyncData.action === ACTION.MOVE) {
      const result = res.locals.asyncData.result;
      // if (result === null) return res.sendStatus(404);
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
                action: 'MOVE',
                selectedPosId: result.selectedPosId,
                selectedPosIndex: result.selectedPosIndex,
                status: result.status,
                player: result.player,
                players: result.players,
              })
            );
          });
      }
      return (
        res
          .status(200)
          // .send({ status: result.status, player: result.player });
          .send(res.locals.asyncData)
      );
    } else if (isLeaveGameDBReply(res.locals.asyncData)) {
      const result = res.locals.asyncData.result;
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
              action: 'LEAVE',
              // notify opponent I have left, by sending my details
              players: result,
            })
          );
        });
      // response sent back to player that left - although they won't make use of it
      // return res.status(200).send({ players: result.players });
      return res.status(204).send();
    } else if (isDeleteGameDBResult(res.locals.asyncData)) {
      const result = res.locals.asyncData.result;
      if (result.acknowledged && result.deletedCount === 1) {
        return res.status(204).send();
      } else {
        return res.sendStatus(404);
      }
    } else if (isTakeRestGameDBReply(res.locals.asyncData)) {
      // Clicking Leave in client browser triggers a LEAVE action to be
      // sent from server, then, in the useEffect cleanup fnc, restFromGame()
      // triggers a REST action to be sent from server, however, the player who
      // clicked Leave is no longer in the players of that game, which is
      // made explicit by the result of the DB query which finds no doc for this
      // game containing the player who left, returning an object with no players prop.
      // This works well for the client side browser in that it receives no redundant
      // ws message for the REST action.
      const result = res.locals.asyncData.result;
      if (result === null) return res.sendStatus(404);
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
                action: ACTION.REST,
                players: result,
              })
            );
          });
      }
      return res.status(204).send();
    } else if (isResetGameDBReply(res.locals.asyncData)) {
      return res.status(200).send(res.locals.asyncData);
      // do something?
    } else if (isMsgDBReply(res.locals.asyncData)) {
      const { action, ...messages } = res.locals.asyncData;
      if (!messages) return res.sendStatus(404);
      // return res.status(200).send({messages: result.messages});
      // return res.status(200).send(messages); // consider sending messages
      return res.status(204).send();
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
