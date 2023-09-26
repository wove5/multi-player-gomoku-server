import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';

import connectDB from './util/connectDB';
import logger from './util/logger';
import gameHandler from './handler/game.handler';
import authHandler from './handler/auth.handler';

dotenv.config();

// connect to database
connectDB();

const app: Express = express();
const port = process.env.PORT;
app.use(
  cors({
    origin: process.env.allowHost || true,
  })
);
app.use(express.json());

app.get('/healthcheck', (req: Request, res: Response) => {
  res.status(200).send('OK: health check passed');
});

app.use('/api/auth', authHandler);
app.use('/api', gameHandler);

// only listen to request when DB connection is established
mongoose.connection.once('connected', () => {
  logger.info('⚡️[server]: Connected to MongoDB.');
  app.listen(port, () => {
    logger.info(`⚡️[server]: Server is running at http://localhost:${port}`);
  });
});
