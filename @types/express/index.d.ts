import { Express } from 'express';
import { z, ZodObject, ZodRawShape } from 'zod';
export {};

declare global {
  namespace Express {
    interface Request {
      userId: string;
      updateGameSchema: ZodObject;
      // updateGameSchema: ZodObject<ZodRawShape>;
      // asyncData: z.infer<typeof ZodObject<ZodRawShape>>;
      // allow asyncData to ingest data of any type, then
      // handlers & Response validator will confirm its type
      // asyncData: any;
      // asyncData: z.ZodType;
      // validatedData:
    }
    // this one does not work
    // interface Response {
    //   // locals: { asyncData: any }; // might investigate why
    //   //locals: Locals;
    // }
    // the following works
    interface Locals {
      asyncData: any;
    }
  }
}
