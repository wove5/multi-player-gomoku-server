import z, { string, object, record, ZodObject } from 'zod';
import mongoose from 'mongoose';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

const UpdateGameSelectPosition = object({
  id: string({
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

const UpdateGameChat = object({
  msg: object({
    message: string().min(1, { error: 'Message text required' }),
    userId: string()
      .min(1, { error: 'userId of player required' })
      .refine(
        (val) =>
          mongoose.isObjectIdOrHexString(val) &&
          new mongoose.Types.ObjectId(val).toString() === val,
        { error: 'Invalid mongoDB ObjectId for userId' }
      ),
    userName: string().min(1, { error: 'userName of player required' }),
  }),
});

const UpdateGameReset = object({
  status: z.literal('NONE', { error: 'unknown status value' }),
});

const UpdateGameJoinLeave = object({
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
  params: object({
    id: string()
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

export const readGameSchema = object({
  ...readUpdateDeleteGameParams,
});

export const assertUpdateGamePayloadShape = record(z.string(), z.any())
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

export const updateGameGeneralSchema = object({
  ...readUpdateDeleteGameParams,
  ...updateGamePayloadGeneral,
});

export const UpdateGameSelectPositionSchema = object({
  ...readUpdateDeleteGameParams,
  ...{ body: UpdateGameSelectPosition },
});

export const UpdateGameResetSchema = object({
  ...readUpdateDeleteGameParams,
  ...{ body: UpdateGameReset },
});

export const UpdateGameJoinLeaveSchema = object({
  ...readUpdateDeleteGameParams,
  ...{ body: UpdateGameJoinLeave },
});

export const UpdateGameChatSchema = object({
  ...readUpdateDeleteGameParams,
  ...{ body: UpdateGameChat },
});

export const UpdateGameSchemas: Record<string, ZodObject> = {
  id: UpdateGameSelectPositionSchema,
  msg: UpdateGameChatSchema,
  status: UpdateGameResetSchema,
  action: UpdateGameJoinLeaveSchema,
};

export const deleteGameSchema = object({
  ...readUpdateDeleteGameParams,
});

export type ReadGameInput = z.infer<typeof readGameSchema>;
export type UpdateGameInput = z.infer<typeof updateGameGeneralSchema>;
export type DeleteGameInput = z.infer<typeof deleteGameSchema>;
