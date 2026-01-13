import { Request, Response, NextFunction } from 'express';
import { ZodObject } from 'zod';
import logger from '../util/logger';

export const validateSchema =
  (schema: ZodObject) => (req: Request, res: Response, next: NextFunction) => {
    // console.log(`req.body = ${req.body}`);
    // logger.info(`⚡️[server]: req.body = ${req.body}`);
    // console.table(req.body);
    try {
      schema.parse({
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

// export default validate;
