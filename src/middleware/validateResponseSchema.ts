import { Request, Response, NextFunction } from 'express';
import { z } from '../zod-config';

// interface TypedResponse<T> extends Response {
//   locals: { asyncData: T };
// }
interface TypedResponse<T, U> extends Response {
  locals: { asyncData: T; processedData: U };
}

export const validateResponseSchema =
  <S extends z.ZodType, T extends z.infer<S>>(schema: S) =>
  (req: Request<{}, T>, res: TypedResponse<T, null>, next: NextFunction) => {
    try {
      schema.parse(res.locals.asyncData);
      next();
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res.status(500).send({
          error: err.issues,
          message: 'Validation failed',
        });
      }
      next(err);
    }
  };

// export default validate;
