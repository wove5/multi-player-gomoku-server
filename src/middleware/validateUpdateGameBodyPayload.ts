import { Request, Response, NextFunction } from 'express';
import { ZodObject, ZodRecord } from 'zod';
import { UpdateGameSchemas } from '../schema/game.schema';

const validate =
  (schema: ZodRecord) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        ...req.body,
      });
      // Inject updateGameSchema corresponding to the payload object key into request
      req.updateGameSchema = UpdateGameSchemas[`${Object.keys(req.body)[0].toString()}`]
      next();
    } catch (e: any) {
      // return res.status(400).send(e.errors);
      // return res.status(400).send('Server Error');
      // return res.status(400).send(e.message);
      return res.status(400).send(e.issues);
    }
  };

export default validate;
