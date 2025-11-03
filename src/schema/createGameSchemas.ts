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
import { POSITION_STATUS, GAMESTATUS } from '../model/game.model';
import mongoose from 'mongoose';

const objectIdStringSchema = z
  .string()
  .regex(/^[0-9A-Fa-f]+$/, 'Invalid hexadecimal string')
  .length(24)
  .refine(
    (val) => {
      return (
        mongoose.isObjectIdOrHexString(val) &&
        new mongoose.Types.ObjectId(val).toString() === val
      );
    },
    {
      message: 'Invalid MongoDB ObjectId string',
    }
  );

export const positionStatusSchema = z.enum(POSITION_STATUS);

export const gamestatusSchema = z.enum(GAMESTATUS);

const userDocumentSchema = z.object({
  _id: objectIdStringSchema,
  userName: z.string(),
});

const messageSchema = z.object({
  message: z.string(),
  userId: z.string(),
  userName: z.string(),
});

const playerDetailSchema = z.object({
  user: z.union([objectIdStringSchema, userDocumentSchema]),
  color: positionStatusSchema,
});

export const createGameResponseSchema = z.object({
  _id: objectIdStringSchema,
  players: z.array(playerDetailSchema),
  gameNumber: z.number(),
  isMulti: z.boolean(),
  size: z.array(z.number()),
  status: gamestatusSchema,
  positions: z.array(
    z.object({
      status: positionStatusSchema,
    })
  ),
  selectedPositions: z.array(z.number()),
  messages: z.array(messageSchema),
  createdAt: z.date(),
  updatedAt: z.date(),
});

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

export const createGameSchema = object({
  body: createGamePayload,
}).openapi('CreateGameSchema');

export type CreateGameInput = z.infer<typeof createGameSchema>;
export type CreateGameResponse = z.infer<typeof createGameResponseSchema>;
