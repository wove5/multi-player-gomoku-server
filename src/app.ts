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
import { SwaggerUIBundle } from 'swagger-ui-dist';

dotenv.config();
console.log(`process.env.allowHost = ${process.env.allowHost}`);

const swaggerUi =
  process.env.allowHost === undefined
    ? require('swagger-ui-express')
    : undefined;

// (async function setupSwagger() {
//   if (swaggerUi) {
//     import('swagger-ui-dist').then(({ SwaggerUIBundle }) => {
//       SwaggerUIBundle({
//         // dom_id: '#swagger-ui',
//         // url: 'http://localhost:8080/api/api-docs',
//         showCommonExtensions: true,
//         showExtensions: true,
//       });
//     });
//     // const swaggerUi = await require('swagger-ui-express');
//     // app.use('/api/api-docs', swaggerUi.serve);
//     // app.get('/api/api-docs', swaggerUi.setup(oaiSpec));
//   }
// })();

// const swaggerUiBundle =
//   process.env.allowHost === undefined
//   ? await import('../node_modules/swagger-ui-dist')

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
  // app.use('/api/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));
  const swaggerDocument = require('./openapi/openapi-docs.json');
  app.use('/api/api-docs', swaggerUi.serve);
  app.get(
    '/api/api-docs',
    // swaggerUi.setup(oaiSpec, {
    //   // swaggerUi.setup(swaggerDocument, {
    //   showCommonExtensions: true,
    //   showExtensions: true,
    // })
    swaggerUi.setup(oaiSpec)
  );
}

app.use('/api/auth', authHandler);
app.use('/api', gameHandler);

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
