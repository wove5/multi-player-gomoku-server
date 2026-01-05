import { createServer } from 'http';
import { startWebSocketServer } from './websocket';
import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';

import connectDB from './util/connectDB';
import logger from './util/logger';
import gameHandler from './handler/game.handler';
import authHandler from './handler/auth.handler';
import { GameConnections } from './types';
import { oaiSpec } from './openapi/oapiRegistry';
// import { z } from 'zod';
// import { z } from './zod-config';
// import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { errorHandler } from './middleware/errorHandler';
import fs from 'fs';
// import path from 'path';
import path from 'path';

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
  const os = require('os');
  const interfaces = os.networkInterfaces();
  let localIpAddr = '';
  for (const iface in interfaces) {
    for (const alias of interfaces[iface]) {
      if (alias.family === 'IPv4' && !alias.internal) {
        localIpAddr = alias.address;
        break;
      }
    }
    if (localIpAddr) break;
  }
  console.log(`localIpAddr = ${localIpAddr}`);

  // extendZodWithOpenApi(z);
  // serving the src/openapi directory at the root application url
  app.use(express.static(path.join(__dirname, 'openapi')));
  // // the next e.g. works too. Just need to adust the href in
  // // swagger-initializer to be /static/swagger-custom.css
  // // Also, the specified local path to dir openapi could be
  // // any other dir where swagger-custom.css is stored.
  // // Here the src/openapi is served at the path '/static'
  // app.use('/static', express.static(path.join(__dirname, 'openapi')));

  // app.use('/static/swagger-custom.css', (req, res, next) => {
  //   res.set('Content-Type', 'text/css');
  //   // next();
  //   res.send(fs.readFileSync(`${__dirname}/static/swagger-custom.css`));
  // });
  // app.use('/static', express.static(path.join(__dirname, 'static')));
  // app.use(express.static('public'));
  // swaggerUi.setup(oaiSpec, {
  //   customCssUrl: '/static/swagger-custom.css',
  // });

  // const options = {
  //   customCss: '.swagger-ui .responses-table td { padding: 15px 0 !important;}',
  // };
  // // This combination works
  // app.use('/api/api-docs', swaggerUi.serve, swaggerUi.setup(oaiSpec, options)); //{
  // // but not when using customCssUrl options
  // const options = {
  //   customCssUrl: '../src/static/swagger-custom.css',
  // };

  // swaggerUi.setup(oaiSpec, options);
  swaggerUi.setup(oaiSpec); // below comment is wrong - this is needed
  // because any later changes in oapiRegistry are not updated in UI
  // // calling swaggerUi.setup from swagger-ui-express seems unecessary
  // // as such, it seems redundant to use swagger-ui-express, since
  // // swagger-initializer is being used to serve the swagger doc
  const swaggerUiAsset = require('swagger-ui-dist');
  const swaggerUiAssetPath = swaggerUiAsset.getAbsoluteFSPath();
  console.log('__dirname = ', __dirname);
  console.log(path.join(__dirname, 'static'));
  console.log('swaggerUiAssetPath = ', swaggerUiAssetPath);
  const customSwaggerInitializer = fs
    .readFileSync(`${__dirname}/openapi/swagger-initializer.js`)
    .toString()
    .replace(
      // inject the actual network ip addr of server into swagger-initializer
      // for swagger ui validator badge to use, as it will not work using localhost
      `let devServerHostIp = ''`,
      `let devServerHostIp = '${localIpAddr}'`
    );
  // intercept the request for swagger-initializer.js
  app.get('/api/api-docs/swagger-initializer.js', (req, res) => {
    res.set('Content-Type', 'text/javascript');
    res.send(customSwaggerInitializer);
  });
  // app.use('/api/api-docs', swaggerUi.serve, swaggerUi.setup(oaiSpec, options)); //{
  // // above works
  // app.use(
  //   '/api/api-docs',
  //   swaggerUi.serve,
  //   swaggerUi.setup(oaiSpec, {
  //     customCssUrl: '/swagger-custom.css',
  //     // customJs: customSwaggerInitializer,
  //   })
  // );

  // either:
  const swaggerDocument = require('./openapi/swagger.json');
  app.get('/api/api-docs/swagger.json', (req, res) => {
    // res.json(swaggerDocument);

    // Clone the document to avoid modifying the original object globally
    const dynamicDocument = JSON.parse(JSON.stringify(swaggerDocument));

    // Get the host from the request headers
    const host = req.headers.host;
    const protocol = req.protocol; // 'http' or 'https'
    console.log(`host = ${host}`); // could be network ip or localhost

    // Update the server URL
    if (host) {
      dynamicDocument.servers = [
        {
          url: `${protocol}://${host}/api`,
          // description: 'Current dynamic server',
        },
      ];
    }

    res.json(dynamicDocument);
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
