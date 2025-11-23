import { ServerError } from './../schema/serverErrorSchema';
//TODO: flesh this global error handler out
import { NextFunction, Request, Response } from 'express';

interface TypedResponse<T> extends Response<T> {
  locals: { asyncData: T };
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: TypedResponse<ServerError>,
  next: NextFunction
) => {
  console.log('Error', err.message);
  console.log(err.stack);

  // res.status(err.status || 500).json({
  res.status(500).json({
    // stack: err.stack, // an idea.
    message: err.message || 'Internal Server Error',
  });
};
