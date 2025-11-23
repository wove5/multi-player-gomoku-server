import { objectIdSchema, objectIdStringSchema } from './objectIdStringSchema';
import z from 'zod';
import { POSITION_STATUS, GAMESTATUS } from '../constants';

export const positionStatusSchema = z.enum(POSITION_STATUS);

export const gamestatusSchema = z.enum(GAMESTATUS);

// TODO: develop new dedicated schema for User with all fields as like GameSchema
// TODO: then use Pick and Omit zod utilities to keep _id & userName here
const userDocumentSchema = z.object({
  _id: objectIdSchema('Player Id'),
  userName: z.string().openapi({ description: `Player's username` }),
});

const messageSchema = z.object({
  message: z.string(),
  userId: objectIdStringSchema,
  userName: z.string(),
});

const playerDetailSchema = z.object({
  user: z.union([objectIdSchema('Player Id'), userDocumentSchema]),
  color: positionStatusSchema,
});

export const gameSchema = z.object({
  _id: objectIdSchema('Game Id'),
  players: z.array(playerDetailSchema),
  gameNumber: z.int().positive(),
  isMulti: z.boolean(),
  size: z.array(z.int().gte(5).lte(12)).min(2).max(2).openapi({
    description:
      'Dimensions of the game board grid:\n\n must be numbers in the range 5..12',
  }),
  status: gamestatusSchema,
  positions: z.array(
    z.object({
      _id: objectIdSchema('Game board Position Id'),
      status: positionStatusSchema,
    })
  ),
  selectedPositions: z.array(z.number()),
  messages: z.array(messageSchema),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Game = z.infer<typeof gameSchema>;
