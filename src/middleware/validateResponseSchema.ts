import { Request, Response, NextFunction } from 'express';
import { z, ZodObject, ZodRawShape, ZodRecord } from 'zod';

// interface CustomRequest<T> extends Request {
//   asyncData: z.infer<T>;
// }

interface TypedResponse<T> extends Response {
  locals: { asyncData: T };
}

const validate =
  //   <S extends ZodObject<ZodRawShape>, T extends z.infer<S>>(schema: S) =>

  // <S extends ZodRecord, T extends z.infer<S>>(schema: S) =>

  // <S extends z.ZodType, T extends z.infer<S>>(schema: S) =>
  // (req: CustomRequest<T>, res: Response, next: NextFunction) => {
  // (schema: z.ZodType) => (req: Request, res: Response, next: NextFunction) => {


    <S extends z.ZodType, T extends z.infer<S>>(schema: S) =>
    (
      req: Request<{}, T>,
      // res: TypedResponse<T, { asyncData: T }>,
      res: TypedResponse<T>,
      next: NextFunction
    ) => {
      try {
        // //   schema.parse(req.asyncData: T);
        // const data: T = req.asyncData;
        // schema.parse(data);
        // const data: T = res.locals.asyncData;
        // schema.parse(data);
        // console.log({ ...res.locals });
        schema.parse(res.locals.asyncData);
        // req.asyncData = req.asyncData as T;
        next();
      } catch (err: any) {
        // if (err instanceof z.ZodError) {
        //   return res.status(500).send(err.issues);
        // }
        // next(err);
        return res.status(500).send(err.issues);
      }
    };

export default validate;
