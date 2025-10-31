import z, {
  string,
  number,
  array,
  object,
  void as void_,
  boolean,
  record,
  ZodObject,
} from 'zod';
import mongoose from 'mongoose';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const createGamePayload = object({
  size: array(
    number()
      .min(5, { error: 'array elements must be number in the range 5..12' })
      .max(12, { error: 'array elements must be number in the range 5..12' }),
    {
      error: (issue) =>
        issue.input === undefined
          ? `Board size is required: array of number, 'size', is missing`
          : `Invalid input type: expected array of number, received ${typeof issue.input}`,
    }
  )
    .min(2, { error: 'input must be array of 2 numbers' })
    .max(2, { error: 'input must be array of 2 numbers' })
    .openapi({
      description:
        'Dimensions of game grid: must be numbers in the range 5..12',
    }),
  isMulti: boolean({
    error: (iss) =>
      iss.input === undefined
        ? `(multi/single)-player game mode required: missing boolean flag 'isMulti' `
        : `invalid input type: expected boolean, received ${typeof iss.input}`,
  }).openapi({
    description: 'Boolean flag indicates if game is multi-player or not',
  }), // example/s placed in registerPath() - they work better there.
});

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
        mongoose.Types.ObjectId.isValid(val) &&
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
          mongoose.Types.ObjectId.isValid(val) &&
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

export const createGameSchema = object({
  body: createGamePayload,
}).openapi('CreateGameSchema');

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

export type CreateGameInput = z.infer<typeof createGameSchema>;
export type ReadGameInput = z.infer<typeof readGameSchema>;
export type UpdateGameInput = z.infer<typeof updateGameGeneralSchema>;
export type DeleteGameInput = z.infer<typeof deleteGameSchema>;
