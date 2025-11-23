import { z } from 'zod';
import { POSITION_STATUS } from '../constants';
import { objectIdSchema, objectIdStringSchema } from './objectIdStringSchema';

const userDocumentSchema = z.object({
  _id: objectIdSchema('Player Id'),
  userName: z.string().openapi({ description: `Player's username` }),
  password: z.string(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
// // TODO: develop new dedicated schema for User with all fields as like GameSchema
// // TODO: then use Pick and Omit zod utilities to keep _id & userName here
// const userDocumentSchema = z.object({
//   _id: objectIdSchema('Player Id'),
//   userName: z.string().openapi({ description: `Player's username` }),
// });
// // The above TODO is now done

const positionStatusSchema = z.enum(POSITION_STATUS);

export const playerDetailSchema = z.object({
  user: z.union([
    objectIdSchema('Player Id'),
    userDocumentSchema.pick({ _id: true, userName: true }),
  ]),
  color: positionStatusSchema,
});

export const incompleteGameDataSchema = z.object({
  _id: objectIdSchema('Game Id'),
  gameNumber: z.int().positive(),
  size: z.array(z.int().gte(5).lte(12)).min(2).max(2).openapi({
    description:
      'Dimensions of the game board grid:\n\n must be numbers in the range 5..12',
  }),
  isMulti: z.boolean(),
  createdAt: z.date(),
  players: z.array(playerDetailSchema),
});

export const incompleteGamesArraySchema = z.array(incompleteGameDataSchema);
export type IncompleteGamesArray = z.infer<typeof incompleteGamesArraySchema>;
