import { z } from '../zod-config';
// import {
//   objectIdSchema,
//   playerDetailSchema,
//   positionStatusSchema,
//   messageSchema,
//   gamestatusSchema,
// } from '.';
import { objectIdSchema } from './objectIdStringSchema';
import { playerDetailSchema } from './userAndPlayerSchemas';
import { positionStatusSchema } from './constantEnumSchemas';
import { messageSchema } from './msgReply';
import { gamestatusSchema } from './constantEnumSchemas';

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
