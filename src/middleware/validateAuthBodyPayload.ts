import { Request, Response, NextFunction } from 'express';
import { ZodRecord } from 'zod';
// import { UpdateGameSchemas } from '../schema/updateGameSchemas';

export const validateAuthBodyPayload =
  (schema: ZodRecord) => (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        ...req.body,
      });
      next();
    } catch (e: any) {
      // return res.status(400).send(e.errors);
      // return res.status(400).send('Server Error');
      // return res.status(400).send(e.message);
      return res.status(400).send(e.issues);
    }
  };

// export default validate;
