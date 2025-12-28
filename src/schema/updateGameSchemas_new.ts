import { error } from 'console';
import { z } from '../zod-config';
import mongoose from 'mongoose';
import { objectIdStringSchema } from './objectIdStringSchema';

const updateGameMove = z
  .object({
    action: z.literal('MOVE'),
    // input: z.object({
    //   id: z
    //     .string({
    //       error: (issue) =>
    //         issue.input === undefined
    //           ? 'board position id required: missing pos id'
    //           : `Invalid input type: expected string, received ${typeof issue.input}`,
    //     })
    //     .min(1, 'Position ObjectId is required')
    //     .refine(
    //       (val) =>
    //         mongoose.isObjectIdOrHexString(val) &&
    //         new mongoose.Types.ObjectId(val).toString() === val,
    //       { error: 'Invalid mongoDB ObjectId for position id' }
    //     ),
    // }),
    input: z.object({
      id: objectIdStringSchema('Position Id'),
    }),
  })
  .openapi('MoveRequest');
export type UpdateGameMove = z.infer<typeof updateGameMove>;

const updateGameChat = z
  .object({
    action: z.literal('MSG'),
    // input: z.object({
    //   msg: z.object({
    //     message: z.string().min(1, { error: 'Message text required' }),
    //     userId: z
    //       .string()
    //       .min(1, { error: 'userId of player required' })
    //       .refine(
    //         (val) =>
    //           mongoose.isObjectIdOrHexString(val) &&
    //           new mongoose.Types.ObjectId(val).toString() === val,
    //         { error: 'Invalid mongoDB ObjectId for userId' }
    //       ),
    //     userName: z.string().min(1, { error: 'userName of player required' }),
    //   }),
    // }),
    input: z.object({
      msg: z.object({
        message: z.string().min(1, { error: 'Message text required' }),
        userId: objectIdStringSchema('User Id'),
        userName: z.string().min(1, { error: 'userName of player required' }),
      }),
    }),
  })
  .openapi('MessageRequest');
export type UpdateGameChat = z.infer<typeof updateGameChat>;

const updateGameReset = z
  .object({
    action: z.literal('RESET'),
    // input: z.object({
    //   status: z.literal('NONE', { error: 'unknown status value' }),
    // }),
  })
  .openapi('ResetRequest');
export type UpdateGameReset = z.infer<typeof updateGameReset>;

const updateGameJoin = z
  .object({
    action: z.literal('JOIN'),
  })
  .openapi('JoinGameRequest');
export type UpdateGameJoin = z.infer<typeof updateGameJoin>;

const updateGameLeave = z
  .object({
    action: z.literal('LEAVE'),
  })
  .openapi('LeaveGameRequest');
export type UpdateGameLeave = z.infer<typeof updateGameLeave>;

const updateGameRest = z
  .object({
    action: z.literal('REST'),
  })
  .openapi('RestRequest');
export type UpdateGameRest = z.infer<typeof updateGameRest>;

export const updateGamePayloadGeneral = {
  body: z
    .discriminatedUnion(
      'action',
      [
        updateGameMove.describe('MOVE client request to server'),
        updateGameChat.describe('MSG client request to server'),
        updateGameReset.describe('RESET game client request to server'),
        updateGameJoin.describe('JOIN game client request to server'),
        updateGameLeave.describe('LEAVE game client request to server'),
        updateGameRest.describe('REST from game client request to server'),
      ],
      {
        error: (issue) => {
          if (
            typeof issue.input === 'object' &&
            issue.input !== null &&
            !('action' in issue.input)
          ) {
            return 'action key missing';
          }
          if (issue.code === 'invalid_union') {
            return `Invalid action type: expected one of ${'MOVE|MSG|RESET|JOIN|LEAVE|REST'}; received ${JSON.stringify(
              issue.input
            )}`;
          }
          return 'Unexpected validation error occurred.';
        },
      }
    )
    .openapi('UpdateGameRequest')
    .describe('Update game >> client request to server'),
};

export const readUpdateDeleteGameParams = {
  params: z.object({
    id: z
      .string()
      .min(1, 'Game id is required')
      .refine(
        (val) =>
          mongoose.isObjectIdOrHexString(val) &&
          new mongoose.Types.ObjectId(val).toString() === val,
        { error: 'Invalid mongoDB ObjectId for game id' }
      )
      .openapi({
        description: 'A 24 character hex string',
        example: '62261a65d66c6be0a63c051f',
      }),
  }),
};

export const readGameSchema = z.object({
  ...readUpdateDeleteGameParams,
});

export const updateGameGeneralSchema = z.object({
  ...readUpdateDeleteGameParams,
  ...updateGamePayloadGeneral,
});

export const deleteGameSchema = z.object({
  ...readUpdateDeleteGameParams,
});

export type ReadGameInput = z.infer<typeof readGameSchema>;
export type UpdateGameInput = z.infer<typeof updateGameGeneralSchema>;
export type DeleteGameInput = z.infer<typeof deleteGameSchema>;
