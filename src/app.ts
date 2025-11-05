import { createServer } from 'http';
import { startWebSocketServer } from './websocket';
import express, { Express, Request, RequestHandler, Response } from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';

import connectDB from './util/connectDB';
import logger from './util/logger';
import gameHandler from './handler/game.handler';
import authHandler from './handler/auth.handler';
import { GameConnections } from './types';
import { oaiSpec } from './openapi/oapiRegistry';
import z from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { errorHandler } from './middleware/errorHandler';
import fs from 'fs';

dotenv.config();
console.log(`process.env.allowHost = ${process.env.allowHost}`);

const swaggerUi =
  process.env.allowHost === undefined
    ? require('swagger-ui-express')
    : undefined;

const gameConnections: GameConnections = {};

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

if (swaggerUi) {
  extendZodWithOpenApi(z);
  swaggerUi.setup(oaiSpec);
  const swaggerUiAsset = require('swagger-ui-dist');
  const swaggerUiAssetPath = swaggerUiAsset.getAbsoluteFSPath();
  console.log('__dirname = ', __dirname);
  console.log('swaggerUiAssetPath = ', swaggerUiAssetPath);
  const customSwaggerInitializer = fs.readFileSync(
    `${__dirname}/openapi/swagger-initializer.js`
  );
  // intercept the request for swagger-initializer.js
  app.get('/api/api-docs/swagger-initializer.js', (req, res) =>
    res.send(customSwaggerInitializer)
  );

  // either:
  const swaggerDocument = require('./openapi/swagger.json');
  app.get('/api/api-docs/swagger.json', (req, res) => {
    res.json(swaggerDocument);
  });
  // or:
  // app.use(
  //   '/api/api-docs/swagger.json',
  //   express.static(`${__dirname}/openapi/swagger.json`)
  // );

  app.use('/api/api-docs', express.static(swaggerUiAssetPath));
}

app.use('/api/auth', authHandler);
app.use('/api', gameHandler);

app.use(errorHandler);

// // something to consider including along with pm2
// process.on('uncaughtException', (err) => {
//   console.error('Uncaught Exception:', err.message);
//   process.exit(1);
// });

// process.on('unhandledRejection', (err: Error) => {
//   console.error('Unhandled Promise Rejection:', err.message);
//   process.exit(1);
// });

// create http server
export const server = createServer(app);

// only listen to request when DB connection is established
mongoose.connection.once('connected', () => {
  logger.info('⚡️[server]: Connected to MongoDB.');

  // this could be an alternative to the above createServer line
  // const server = app.listen(port, () => {
  //   logger.info(`⚡️[server]: Server is running at http://localhost:${port}`);
  // });

  // invoke websocket server on top of http server
  startWebSocketServer(server, gameConnections);

  // start express http express server
  // app.listen(port, () => {
  //   logger.info(`⚡️[server]: Server is running at http://localhost:${port}`);
  // });
  // could do the above or start the http server with the following
  server.listen(port, () => {
    console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
    console.log(
      `⚡️[Swagger UI]: available at https://localhost:${port}/api/api-docs`
    );
  });
});
