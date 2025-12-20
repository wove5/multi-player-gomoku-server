import { NoDBReply } from './../interfaces/NoReply';
import { MsgDBReply } from './../interfaces/MsgReply';
import { z } from '../zod-config';
import { gameSchema } from './gameSchema';
import { playerDetailSchema } from './userAndPlayerSchemas';
import {
  gamestatusSchema,
  playerSchema,
  actionSchema,
} from './constantEnumSchemas';
import { objectIdStringSchema } from '../schema/objectIdStringSchema';
import { noDbReplySchema, NoDbReply } from './noReply';
import { ACTION } from '../constants';

// import { ACTION } from '../constants';

// import {
//   joinGameDbReplySchema,
//   moveDbReplySchema,
//   takeRestFromGameDbReplySchema,
//   leaveGameDbReplySchema,
//   deleteGameDbResultSchema,
//   resetGameDbReplySchema,
//   msgDbReplySchema,
//   noDbReplySchema,
// } from '.';
// import {
//   joinGameDbReplySchema,
//   leaveGameDbReplySchema,
//   deleteGameDbResultSchema,
// } from './joinLeaveGameReplySchemas';
// import { moveDbReplySchema, MoveResponse } from './moveReplySchemas';
// import { takeRestFromGameDbReplySchema } from './restFromGameReply';
// import { resetGameDbReplySchema } from './resetGameReply';
// import { msgDbReplySchema } from './msgReply';
// import { noDbReplySchema } from './noReply';

// export type UpdateGameDBReturnType =
//   | JoinGameDBReply
//   | MoveDBReply
//   | TakeRestFromGameDBReply
//   | LeaveGameDBReply
//   | DeleteGameDBResult
//   | ResetGameDBReply
//   | MsgDBReply
//   | NoDBReply;

const joinGameDbReplySchema = z
  .object({
    // action: actionSchema,
    action: z.literal('JOIN'),
    result: z.union([gameSchema.describe('The Game objective'), z.null()]),
  })
  .openapi('JoinGameResponse', { description: 'JOIN game response' });
export type JoinGameDbReply = z.infer<typeof joinGameDbReplySchema>;

const deleteResult = z.object({
  acknowledged: z.boolean(),
  deletedCount: z.number().int().nonnegative(),
});
// export type DeleteResult = z.infer<typeof deleteResult>;

const deleteGameDbReplySchema = z.object({
  // action: actionSchema,
  action: z.literal('DELETE'),
  result: deleteResult,
  // result: //z.union([
  //   z.object({
  //     acknowledged: z.boolean(),
  //     deletedCount: z.number().int().nonnegative(),
  //   }),
  //   // z.null(),
  // //]),
  // result: DeleteResultSchema,
});
export type DeleteGameResult = z.infer<typeof deleteGameDbReplySchema>;

const players = z.array(playerDetailSchema);
export type Players = z.infer<typeof players>;

const leaveGameResult = z.object({
  action: z.literal('LEAVE'),
  result: players,
});
export type LeaveGameResult = z.infer<typeof leaveGameResult>;

const leaveGameNullResult = z.object({
  result: z.union([players, z.null()]),
});

// const leaveGameResultSchema = z.object({
//   action: z.literal('LEAVE'),
//   // result: z.union([z.array(playerDetailSchema), deleteResultSchema, z.null()]),
//   // result: z.union([z.array(playerDetailSchema), z.null()]),
//   result: z.union([players, z.null()]),
// });
const leaveGameResultSchema = leaveGameResult.extend(leaveGameNullResult.shape);
export type LeaveGameDbResult = z.infer<typeof leaveGameResultSchema>;

const leaveGameDbReplySchema = //z.object({
  // action: actionSchema,
  // action: z.literal('LEAVE'),
  // result: z.union([z.array(playerDetailSchema), deleteResultSchema, z.null()]),
  z.discriminatedUnion('action', [
    leaveGameResultSchema,
    deleteGameDbReplySchema,
  ]);
// });
export type LeaveGameDbReply = z.infer<typeof leaveGameDbReplySchema>;

// export const updateGamePayloadGeneral = {
//   body: z.discriminatedUnion('action', [
//     updateGameMove,
//     updateGameChat,
//     updateGameReset,
//     updateGameJoin,
//     updateGameLeave,
//     updateGameRest,
//   ]),
// };

const moveDetailsSchema = z
  .object({
    status: gamestatusSchema,
    player: playerSchema,
    selectedPosId: z.string(),
    selectedPosIndex: z.number(),
    players: z.array(playerDetailSchema),
  })
  .describe('The Game details returned after move is made');
export type MoveDetails = z.infer<typeof moveDetailsSchema>;

const moveResponse = z.object({
  status: gamestatusSchema,
  player: playerSchema,
});
export type MoveResponse = z.infer<typeof moveResponse>;

const moveDbReplySchema = z
  .object({
    // action: actionSchema,
    action: z.literal('MOVE'),
    result: z.union([moveDetailsSchema, moveResponse, z.null()]),
  })
  .openapi('MoveResponse');
export type MoveDbReply = z.infer<typeof moveDbReplySchema>;

const takeRestDbReplySchema = z.object({
  action: z.literal('REST'),
  result: z.union([z.array(playerDetailSchema), z.null()]),
});
export type TakeRestDbReply = z.infer<typeof takeRestDbReplySchema>;

const resetGameDbReplySchema = z
  .object({
    action: z.literal('RESET'),
    result: z.union([
      gameSchema.describe('The Game object reset as a blank board'),
      z.null(),
    ]),
  })
  .openapi('ResetGameResponse');
export type ResetGameDbReply = z.infer<typeof resetGameDbReplySchema>;

const messageSchema = z.object({
  message: z.string(),
  userId: objectIdStringSchema('User Id'),
  userName: z.string(),
});
export type Message = z.infer<typeof messageSchema>;

const msgDbReplySchema = z.object({
  action: z.literal('MSG'),
  result: z.union([z.array(messageSchema), z.null()]),
});
export type MsgDbReply = z.infer<typeof msgDbReplySchema>;

// const noDbReplySchema = z.object({
//   action: actionSchema,
//   result: z.null(),
// });
// export type NoDbReply = z.infer<typeof noDbReplySchema>;

const defaultDbReply = z.object({
  action: z.literal('DEFAULT'),
  result: z.null(),
});
export type DefaultDbReply = z.infer<typeof defaultDbReply>;

export const updateGameDbReplySchema = z.discriminatedUnion('action', [
  // export const updateGameDBReplySchema = z.union([
  joinGameDbReplySchema,
  // retrieveGameDbReplySchema,
  moveDbReplySchema,
  takeRestDbReplySchema,
  leaveGameDbReplySchema,
  // deleteGameDbReplySchema,
  resetGameDbReplySchema,
  msgDbReplySchema,
  // noDbReplySchema,
  defaultDbReply,
]);
// export type UpdateGameDbReply = z.infer<typeof updateGameDbReplySchema>;
export type UpdateGameDbReply =
  | JoinGameDbReply
  | MoveDbReply
  | TakeRestDbReply
  | LeaveGameDbReply
  // | DeleteGameDbReply
  | ResetGameDbReply
  | MsgDbReply
  | NoDbReply
  | DefaultDbReply;
