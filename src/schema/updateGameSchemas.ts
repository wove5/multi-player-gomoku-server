import { z } from '../zod-config';
// import { string, object, record, ZodObject } from 'zod';
import mongoose from 'mongoose';
// import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

// extendZodWithOpenApi(z);

const UpdateGameSelectPosition = z.object({
  id: z
    .string({
      error: (issue) =>
        issue.input === undefined
          ? 'board position id required: missing pos id'
          : `Invalid input type: expected string, received ${typeof issue.input}`,
    })
    .min(1, 'Position ObjectId is required')
    .refine(
      (val) =>
        mongoose.isObjectIdOrHexString(val) &&
        new mongoose.Types.ObjectId(val).toString() === val,
      { error: 'Invalid mongoDB ObjectId for position id' }
    ),
});

const UpdateGameChat = z.object({
  msg: z.object({
    message: z.string().min(1, { error: 'Message text required' }),
    userId: z
      .string()
      .min(1, { error: 'userId of player required' })
      .refine(
        (val) =>
          mongoose.isObjectIdOrHexString(val) &&
          new mongoose.Types.ObjectId(val).toString() === val,
        { error: 'Invalid mongoDB ObjectId for userId' }
      ),
    userName: z.string().min(1, { error: 'userName of player required' }),
  }),
});

const UpdateGameReset = z.object({
  status: z.literal('NONE', { error: 'unknown status value' }),
});

const UpdateGameJoinLeave = z.object({
  action: z.union([z.literal('JOIN'), z.literal('LEAVE'), z.literal('REST')], {
    error: 'unknown action value',
  }),
});

const updateGamePayloadGeneral = {
  body: z.union([
    UpdateGameSelectPosition,
    UpdateGameReset,
    UpdateGameJoinLeave,
    UpdateGameChat,
  ]),
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

export const assertUpdateGamePayloadShape = z
  .record(z.string(), z.any())
  .refine(
    (val) => {
      const keys = Object.keys(val);
      return keys.length === 1;
    },
    {
      error: 'Body must contain exactly one key-value pair.',
      path: ['body'],
    }
  )
  .refine(
    (val) => ['id', 'msg', 'status', 'action'].includes(Object.keys(val)[0]),
    {
      error: (iss) =>
        `'${
          typeof iss.input === 'object' &&
          iss.input !== null &&
          !Array.isArray(iss.input)
            ? Object.keys(iss.input)[0] + "' is n"
            : 'N'
        }ot a valid key. ` +
        'Key in body payload object has to be one of: id|msg|status|action',
      path: ['body'],
    }
  );

export const updateGameGeneralSchema = z.object({
  ...readUpdateDeleteGameParams,
  ...updateGamePayloadGeneral,
});

export const UpdateGameSelectPositionSchema = z.object({
  ...readUpdateDeleteGameParams,
  ...{ body: UpdateGameSelectPosition },
});

export const UpdateGameResetSchema = z.object({
  ...readUpdateDeleteGameParams,
  ...{ body: UpdateGameReset },
});

export const UpdateGameJoinLeaveSchema = z.object({
  ...readUpdateDeleteGameParams,
  ...{ body: UpdateGameJoinLeave },
});

export const UpdateGameChatSchema = z.object({
  ...readUpdateDeleteGameParams,
  ...{ body: UpdateGameChat },
});

// this one is not a schema, it's a specially created object used to access a schema
export const UpdateGameSchemas: Record<string, z.ZodObject> = {
  id: UpdateGameSelectPositionSchema,
  msg: UpdateGameChatSchema,
  status: UpdateGameResetSchema,
  action: UpdateGameJoinLeaveSchema,
};

export const deleteGameSchema = z.object({
  ...readUpdateDeleteGameParams,
});

export type ReadGameInput = z.infer<typeof readGameSchema>;
export type UpdateGameInput = z.infer<typeof updateGameGeneralSchema>;
export type DeleteGameInput = z.infer<typeof deleteGameSchema>;
