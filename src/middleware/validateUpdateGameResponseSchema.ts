import { Request, Response, NextFunction } from 'express';
import { z } from '../zod-config';
// import { updateGameDBResponseSchema } from '../schema';
import {
  updateGameDbReplySchema,
  UpdateGameDbReply,
} from '../schema/updateGameDBResponseSchema';
import { error } from 'console';
import { ACTION } from '../constants';
import logger from '../util/logger';

// interface TypedResponse<T> extends Response {
//   locals: { asyncData: T };
// }
interface TypedResponse<T, U> extends Response {
  locals: { asyncData: T; processedData: U };
}

export const validateUpdateGameResponseSchema = (
  req: Request<{}, UpdateGameDbReply>,
  res: TypedResponse<UpdateGameDbReply, null>,
  next: NextFunction
) => {
  logger.info(`⚡️inside validateUpdateGameResponseSchema`);
  try {
    updateGameDbReplySchema.parse(res.locals.asyncData);
    if (
      res.locals.asyncData.result === null &&
      // REST DB replies can have result === Players|null
      // and will be passed through to next middleware,
      // so that 404 is not sent after a LEAVE action
      res.locals.asyncData.action !== ACTION.REST
    ) {
      throw new Error('update failed. Game not found');
    }
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

// export default validate;
