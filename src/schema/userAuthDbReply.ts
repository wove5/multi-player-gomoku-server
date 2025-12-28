import { object } from 'zod';
// import mongoose from "mongoose";
import { z } from '../zod-config';
import { objectIdSchema } from './objectIdStringSchema';

export const authResponseSchema = z.object({
  _id: objectIdSchema('User Id'),
  token: z.string(),
});

export type AuthResponse = z.infer<typeof authResponseSchema>;
