//TODO: flesh this global error handler out
import { NextFunction, Request, Response } from 'express';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
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
