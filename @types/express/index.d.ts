import { ZodObject } from 'zod';
export {};

declare global {
  namespace Express {
    interface Request {
      userId: string;
      updateGameSchema: ZodObject;
    }
  }
}
