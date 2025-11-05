import { objectIdStringSchema } from './objectIdStringSchema';
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

export const gameSchema = z.object({
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

export type GameSchema = z.infer<typeof gameSchema>;
