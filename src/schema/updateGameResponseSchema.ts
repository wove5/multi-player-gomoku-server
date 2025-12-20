import { z } from '../zod-config';

// import {
//   joinGameDbReplySchema,
//   leaveGameDbReplySchema,
//   deleteGameDbResultSchema,
// } from './joinLeaveGameReplySchemas';
// import { moveDbReplySchema } from './moveReplySchemas';
// import { takeRestFromGameDbReplySchema } from './RestFromGameReply.zod';
// import { resetGameDbReplySchema } from './ResetGameReply.zod';
// import { msgDbReplySchema } from './msgReply';
// import { noDbReplySchema } from './noReply';

// // export const updateGameDBResponseSchema = z.discriminatedUnion('action', [
// export const updateGameDBResponseSchema = z.union([
//   joinGameDbReplySchema,
//   moveDbReplySchema,
//   takeRestFromGameDbReplySchema,
//   leaveGameDbReplySchema,
//   deleteGameDbResultSchema,
//   resetGameDbReplySchema,
//   msgDbReplySchema,
//   noDbReplySchema,
// ]);

import {
  joinGameResponseSchema,
  leaveGameResponseSchema,
  // deleteGameDbResultSchema,
} from './joinLeaveGameReplySchemas';
import { moveResponseSchema } from './moveReplySchemas';
// import { takeRestFromGameDbReplySchema } from './RestFromGameReply.zod';
import { resetGameResponseSchema } from './resetGameReply';
// import { msgDbReplySchema } from './msgReply';
// import { noDbReplySchema } from './noReply';

// export const updateGameDBResponseSchema = z.discriminatedUnion('action', [
// there is nothing to discriminate on here
export const updateGameResponseSchema = z
  .union([
    joinGameResponseSchema,
    moveResponseSchema,
    // takeRestFromGameDbReplySchema,
    // leaveGameResponseSchema, // this is also N/A
    // deleteGameDbResultSchema,
    resetGameResponseSchema,
    // msgDbReplySchema,
    // noDbReplySchema,
  ])
  .openapi({ description: 'Update Game >> server response to client' });

import { joinGameDbReplySchema } from './joinLeaveGameReplySchemas';
import { moveDbReplySchema } from './moveReplySchemas';
import { resetGameDbReplySchema } from './resetGameReply';

export const updateGameDBReplySchema = z
  .discriminatedUnion('action', [
    // export const updateGameDBResponseSchema = z.union([
    joinGameDbReplySchema,
    moveDbReplySchema,
    resetGameDbReplySchema,
  ])
  .openapi('UpdateGameDBReply', {
    description: 'Update Game >> DB reply to server',
  });
