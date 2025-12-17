import { z } from '../zod-config';
// import { objectIdSchema, positionStatusSchema } from '.';
// import { objectIdSchema } from './objectIdStringSchema';
import { positionStatusSchema } from './constantEnumSchemas';
import { objectIdSchema } from './objectIdStringSchema';
// import { positionStatusSchema } from '.';

const userDocumentSchema = z.object({
  _id: objectIdSchema('User Id'),
  userName: z.string().openapi({ description: `Player's username` }),
  password: z.string(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const playerDetailSchema = z.object({
  user: z.union([
    objectIdSchema('User Id'),
    userDocumentSchema.pick({ _id: true, userName: true }),
  ]),
  color: positionStatusSchema,
});
export type PlayerDetail = z.infer<typeof playerDetailSchema>;
