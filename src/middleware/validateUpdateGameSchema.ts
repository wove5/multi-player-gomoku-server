import { Request, Response, NextFunction } from 'express';
import { ZodObject } from 'zod';
import { UpdateGameSchemas } from '../schema/game.schema';

const validate =
  (req: Request, res: Response, next: NextFunction) => {
    try {
      req.updateGameSchema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (e: any) {
      // return res.status(400).send(e.errors);
      // return res.status(400).send('Server Error');
      // return res.status(400).send(e.message);
      return res.status(400).send(e.issues);
    }
  };

export default validate;
