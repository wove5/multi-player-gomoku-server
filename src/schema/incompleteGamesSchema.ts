import { z } from '../zod-config';
// import { playerDetailSchema, objectIdSchema } from '.';
// import { playerDetailSchema } from '.';
import { playerDetailSchema } from './userAndPlayerSchemas';
import { objectIdSchema } from './objectIdStringSchema';
// import { objectIdSchema } from '.';

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
