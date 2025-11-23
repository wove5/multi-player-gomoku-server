import { z } from 'zod';
import { POSITION_STATUS, GAMESTATUS } from '../constants';

import { objectIdSchema } from './objectIdStringSchema';

export const positionStatusSchema = z.enum(POSITION_STATUS);

export const gamestatusSchema = z.enum(GAMESTATUS);

const completedGameDataSchema = z.object({
  _id: objectIdSchema('Game Id'),
  gameNumber: z.int().positive(),
  size: z.array(z.int().gte(5).lte(12)).min(2).max(2).openapi({
    description:
      'Dimensions of the game board grid:\n\n must be numbers in the range 5..12',
  }),
  status: gamestatusSchema,
  lastSelectedPosition: z.object({
    _id: objectIdSchema('Position Id of last selected board position'),
    status: positionStatusSchema,
  }),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const completedGamesArraySchema = z.array(completedGameDataSchema);
export type CompletedGamesArray = z.infer<typeof completedGamesArraySchema>;
