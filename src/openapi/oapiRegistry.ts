import { Message } from './../types/Message';
import {
  OpenAPIRegistry,
  OpenApiGeneratorV31,
} from '@asteasolutions/zod-to-openapi';
import { readUpdateDeleteGameParams } from '../schema/updateGameSchemas';

import {
  createGamePayload,
  createGameResponseSchema,
  gamestatusSchema,
} from '../schema/createGameSchemas';

import * as fs from 'fs';
import { serverErrorSchema } from '../schema/serverErrorSchema';

function isEmpty(obj: object) {
  for (const prop in obj) {
    return false;
  }
  return true;
}

let openApiSpec;

if (process.env.allowHost === undefined) {
  const registry = new OpenAPIRegistry();

  registry.registerPath({
    method: 'post',
    tags: ['game'],
    path: '/',
    description: 'Create a new game',
    summary: 'Create Game',
    request: {
      body: {
        content: {
          'application/json': {
            schema: createGamePayload,
            examples: {
              eg1: {
                value: {
                  size: '[5, 5]',
                  isMulti: false,
                },
              },
              eg2: {
                value: {
                  size: '[10, 10]',
                  isMulti: true,
                },
              },
              eg3: {
                value: {
                  size: '[7, 7]',
                  isMulti: false,
                },
              },
            },
          },
        },
        required: true,
      },
    },
    responses: {
      200: {
        description: 'Game created',
        content: {
          'application/json': {
            schema: createGameResponseSchema,
          },
        },
      },
      500: {
        description: 'Server error',
        content: {
          'application/json': {
            schema: serverErrorSchema,
          },
        },
      },
    },
  });

  const generator = new OpenApiGeneratorV31(registry.definitions);

  openApiSpec = generator.generateDocument({
    openapi: '3.1.0',
    info: {
      version: '1.0.0',
      title: 'Gomoku Game API',
      description: 'Open API documentation for Gomoku Game',
    },
    servers: [
      {
        url: 'http://localhost:8080/api/api-docs',
      },
    ],
    tags: [{ name: 'game', description: 'All operations concerning a game' }],
  });

  if (!isEmpty(openApiSpec)) {
    fs.writeFileSync(
      `${__dirname}/openapi-docs.json`,
      JSON.stringify(openApiSpec, null, 2),
      { encoding: 'utf-8' }
    );
  }
}

export const oaiSpec = openApiSpec;
