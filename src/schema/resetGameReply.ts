import { ACTION } from '../constants';
import { z } from '../zod-config';
// import { actionSchema, gameSchema } from '.';
import { actionSchema } from './constantEnumSchemas';
import { gameSchema } from './gameSchema';

export const resetGameDbReplySchema = z
  .object({
    // action: actionSchema,
    action: z.literal('RESET'),
    result: gameSchema.describe('The Game object reset as a blank board'),
  })
  .openapi('ResetGameDbReply');

// export const resetGameResponseSchema = z.object({
//   action: actionSchema,
//   result: z.object({
//     game: gameSchema,
//   }),
// });

export const resetGameResponseSchema = z
  .object({
    game: gameSchema,
  })
  .openapi('ResetGameResponse', {
    description: 'RESET Game response: A new blank Game object',
  });
