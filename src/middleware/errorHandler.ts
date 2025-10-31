//TODO: flesh this global error handler out
import { NextFunction, Request, Response } from 'express';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log('Error', err.message);

  // res.status(err.status || 500).json({
  res.status(500).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
  });
};
