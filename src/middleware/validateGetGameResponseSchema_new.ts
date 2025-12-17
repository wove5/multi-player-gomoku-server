import { Request, Response, NextFunction } from 'express';
import { z } from '../zod-config';
import { Game, gameSchema } from '../schema/gameSchema';
// import { reEnterRetrieveGameDBReplySchema } from '../schema/getGameReplySchema';
import {
  retrieveGameDbReplySchema,
  RetrieveGameDbReply,
} from '../schema/getGameReplySchema';

interface TypedResponse<T, U> extends Response {
  locals: { asyncData: T; processedData: U };
}

export const validateGetGameResponseSchema = (
  // req: Request<{}, z.infer<typeof reEnterRetrieveGameDBReplySchema>>,
  // res: TypedResponse<z.infer<typeof reEnterRetrieveGameDBReplySchema>, Game>,
  req: Request<{}, RetrieveGameDbReply>,
  res: TypedResponse<RetrieveGameDbReply, Game>,
  next: NextFunction
) => {
  try {
    retrieveGameDbReplySchema.parse(res.locals.asyncData);
    if (res.locals.asyncData.result === null) {
      throw new Error('update failed. Game not found');
    }
    res.locals.processedData = res.locals.asyncData.result;
    gameSchema.parse(res.locals.processedData); // could be unnecessary validating
    next();
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(500).send({
        error: err.issues,
        message: 'Validation failed',
      });
    }
    if (res.locals.asyncData.result === null) {
      return res.status(404).send(err.message);
    }
    next(err);
  }
};
