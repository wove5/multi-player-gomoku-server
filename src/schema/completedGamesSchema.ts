import { z } from '../zod-config';
// import { objectIdSchema, positionStatusSchema, gamestatusSchema } from '.';
import { objectIdSchema } from './objectIdStringSchema';
import { positionStatusSchema, gamestatusSchema } from './constantEnumSchemas';
// import { positionStatusSchema, gamestatusSchema } from '.';
// import { objectIdSchema } from './objectIdStringSchema';

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
