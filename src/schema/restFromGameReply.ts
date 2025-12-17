import { z } from '../zod-config';
// import { actionSchema, playerDetailSchema } from '.';
import { actionSchema } from './constantEnumSchemas';
import { playerDetailSchema } from './userAndPlayerSchemas';

// export const takeRestFromGameDbReplySchema = z.object({
//   action: actionSchema,
//   players: z.array(playerDetailSchema),
// });

export const takeRestFromGameDbReplySchema = z.object({
  action: actionSchema,
  result: z.array(playerDetailSchema),
});
