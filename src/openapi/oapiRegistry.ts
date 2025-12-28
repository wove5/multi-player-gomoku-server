import dotenv from 'dotenv';
import {
  OpenAPIRegistry,
  OpenApiGeneratorV31,
} from '@asteasolutions/zod-to-openapi';
import { readUpdateDeleteGameParams } from '../schema/updateGameSchemas_new';
// import z from 'zod';
import { z } from '../zod-config';
import { createGamePayload } from '../schema/createGameSchemas';
import { updateGamePayloadGeneral } from '../schema/updateGameSchemas_new';
import {
  updateGameResponseSchema,
  updateGameDBReplySchema,
} from '../schema/updateGameResponseSchema';
import { updateGameDbReplySchema } from '../schema/updateGameDBResponseSchema';
// import {
//   joinGameResponseSchema,
//   leaveGameResponseSchema,
// } from '../schema/joinLeaveGameReplySchemas';
// import { moveResponseSchema } from '../schema/moveReplySchemas';
// import { resetGameResponseSchema } from '../schema/resetGameReply';
import {
  objectIdStringSchema,
  objectIdSchema,
  objectId,
} from '../schema/objectIdStringSchema';
// import { objectIdStringSchema, objectIdSchema, objectId } from '../schema';
import { joinGameDbReplySchema } from '../schema/joinLeaveGameReplySchemas';
import { moveDbReplySchema } from '../schema/moveReplySchemas';
import { resetGameDbReplySchema } from '../schema/resetGameReply';

import * as fs from 'fs';
import { serverErrorSchema } from '../schema/serverErrorSchema';
import { incompleteGamesArraySchema } from '../schema/incompleteGamesSchema';
import { completedGamesArraySchema } from '../schema/completedGamesSchema';
import { gameSchema } from '../schema/gameSchema';
import { authResponseSchema } from '../schema/userAuthDbReply';
import { registerSchema } from '../schema/auth.schema';

dotenv.config();
const port = process.env.PORT;

function isEmpty(obj: object) {
  for (const prop in obj) {
    return false;
  }
  return true;
}

let openApiSpec;

if (process.env.allowHost === undefined) {
  const registry = new OpenAPIRegistry();

  const IdSchema = registry.register(
    'ObjectIdStringSchema',
    objectIdStringSchema('Game Id | User Id | Position Id')
  );

  registry.register('ObjectIdSchema', objectId);

  const positionId = registry.register(
    'PositionIdSchema',
    objectIdStringSchema('Position Id').openapi({
      examples: ['656789abcdef1234567890ab'],
    })
  );

  const gameId = registry.registerParameter(
    'GameIdSchema',
    objectIdStringSchema('Game Id').openapi({
      param: {
        name: 'id',
        in: 'path',
      },
      examples: ['656789abcdef1234567890ab'],
    })
  );

  const GameSchema = registry.register('GameSchema', gameSchema);

  const IncompleteGamesArraySchema = registry.register(
    'IncompleteGamesArraySchema',
    incompleteGamesArraySchema
  );

  const CompletedGamesArraySchema = registry.register(
    'CompletedGamesArraySchema',
    completedGamesArraySchema
  );

  const ServerErrorSchema = registry.register(
    'ServerErrorSchema',
    serverErrorSchema
  );

  // const updateGameDBResponseSchema = z.discriminatedUnion('action', [
  // const updateGameResponseSchema = z.union([
  //   joinGameResponseSchema,
  //   moveResponseSchema,
  //   leaveGameResponseSchema,
  //   resetGameResponseSchema,
  // ]);

  // registry.register('JoinGameResponse', joinGameResponseSchema);
  // registry.register('LeaveGameResponse', leaveGameResponseSchema);
  // registry.register('MoveResponse', moveResponseSchema);
  // registry.register('ResetGameResponse', resetGameResponseSchema);

  const joinGameDbReply = registry.register(
    'JoinGameDbReply',
    joinGameDbReplySchema.describe('JOINING game DB reply to server')
  );
  const moveDbReply = registry.register(
    'MoveDbReply',
    moveDbReplySchema.describe('MOVE DB reply to server')
  );
  const resetGameDbReply = registry.register(
    'ResetGameDbReply',
    resetGameDbReplySchema.describe('RESET game DB reply to server')
  );

  const UpdateGameResponse = registry.register(
    'UpdateGameResponse',
    updateGameResponseSchema.describe(
      'Update game >> server response to client'
    )
    // updateGameResponseSchema.openapi({
    //   description: 'Update game: server response to client',
    // })
  );

  const UpdateGameDbReply = registry.register(
    'UpdateGameDbReply',
    updateGameDBReplySchema
  );

  const bearerAuth = registry.registerComponent(
    'securitySchemes',
    'bearerAuth',
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    }
  );

  registry.registerPath({
    method: 'post',
    tags: ['authentication'],
    path: '/auth/register',
    security: [],
    summary: 'Register for account',
    description: 'Register/ sign-up/ create account with username & password',
    request: {
      body: {
        content: {
          'application/json': {
            schema: registerSchema,
            examples: {
              eg1: {
                value: {
                  username: 'test1',
                  password: 'pass1',
                },
                description:
                  'if test values already exist try others eg 1..10... etc',
              },
              eg2: {
                value: {
                  username: 'test2',
                  password: 'pass2',
                },
                description:
                  'if test values already exist try others eg 1..10... etc',
              },
              eg3: {
                value: {
                  username: 'test3',
                  password: 'pass3',
                },
                description:
                  'if test values already exist try others eg 1..10... etc',
              },
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Account created',
        content: {
          'application/json': {
            schema: authResponseSchema,
          },
        },
      },
      409: {
        description: 'User already exists',
      },
      500: {
        description: 'Server error',
        content: {
          'application/json': {
            schema: ServerErrorSchema,
          },
        },
      },
    },
  });

  registry.registerPath({
    method: 'post',
    tags: ['authentication'],
    path: '/auth/login',
    security: [],
    summary: 'Sign in to account',
    description: 'Sign in to account with username & password',
    request: {
      body: {
        content: {
          'application/json': {
            schema: registerSchema,
            examples: {
              eg1: {
                value: {
                  username: 'test1',
                  password: 'pass1',
                },
              },
              eg2: {
                value: {
                  username: 'test2',
                  password: 'pass2',
                },
              },
              eg3: {
                value: {
                  username: 'test3',
                  password: 'pass3',
                },
              },
            },
          },
        },
      },
    },
    responses: {
      200: {
        description:
          'User signed into account & granted access via allocated json web token',
        content: {
          'application/json': {
            schema: authResponseSchema,
          },
        },
      },
      400: {
        description: 'Invalid credentials',
      },
      500: {
        description: 'Server error',
        content: {
          'application/json': {
            schema: ServerErrorSchema,
          },
        },
      },
    },
  });

  registry.registerPath({
    method: 'get',
    tags: ['games'],
    path: '/',
    summary: 'Retrieve incomplete Games',
    description: 'Retrieve all incomplete games',
    responses: {
      200: {
        description: 'Retrieved incomplete games',
        content: {
          'application/json': {
            schema: IncompleteGamesArraySchema,
          },
        },
      },
      500: {
        description: 'Server error',
        content: {
          'application/json': {
            schema: ServerErrorSchema,
          },
        },
      },
    },
  });

  registry.registerPath({
    method: 'get',
    tags: ['games'],
    path: '/games',
    summary: 'Retrieve completed Games',
    description: 'Retrieve all completed games',
    responses: {
      200: {
        description: 'Retrieved completed games',
        content: {
          'application/json': {
            schema: CompletedGamesArraySchema,
          },
        },
      },
      500: {
        description: 'Server error',
        content: {
          'application/json': {
            schema: ServerErrorSchema,
          },
        },
      },
    },
  });

  registry.registerPath({
    method: 'post',
    tags: ['game'],
    path: '/',
    summary: 'Create new Game',
    description: 'Create a new game',
    request: {
      body: {
        content: {
          'application/json': {
            schema: createGamePayload,
            examples: {
              eg1: {
                value: {
                  size: [5, 5],
                  isMulti: false,
                },
              },
              eg2: {
                value: {
                  size: [10, 10],
                  isMulti: true,
                },
              },
              eg3: {
                value: {
                  size: [7, 7],
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
            schema: GameSchema,
          },
        },
      },
      500: {
        description: 'Server error',
        content: {
          'application/json': {
            schema: ServerErrorSchema,
          },
        },
      },
    },
  });

  registry.registerPath({
    method: 'get',
    tags: ['game'],
    path: '/game/{id}',
    summary: 'Retrieve incomplete Game',
    description: 'Retrieve an incompleted game',
    request: {
      params: z.object({
        id: gameId,
      }),
    },
    responses: {
      200: {
        description: 'Game Object/document',
        content: {
          'application/json': {
            schema: GameSchema,
          },
        },
      },
      404: {
        description: 'Game not found in database',
      },
      500: {
        description: 'Server error',
        content: {
          'application/json': {
            schema: ServerErrorSchema,
          },
        },
      },
    },
  });

  registry.registerPath({
    method: 'get',
    tags: ['game'],
    path: '/game-log/{id}',
    summary: 'Retrieve completed Game',
    description: 'Retrieve a completed game',
    request: {
      params: z.object({
        id: objectIdSchema('The Game Id number'),
      }),
    },
    responses: {
      200: {
        description: 'Game Object/document',
        content: {
          'application/json': {
            schema: GameSchema,
          },
        },
      },
      404: {
        description: 'Game not found in database',
      },
      500: {
        description: 'Server error',
        content: {
          'application/json': {
            schema: ServerErrorSchema,
          },
        },
      },
    },
  });

  registry.registerPath({
    method: 'put',
    tags: ['game'],
    path: '/game/{id}',
    summary: 'Update game',
    description: 'Update a game',
    request: {
      params: z.object({ id: gameId }),
      body: {
        content: {
          'application/json': {
            schema: updateGamePayloadGeneral.body,
            examples: {
              move: {
                value: {
                  action: 'MOVE',
                  input: { id: '656789abcdef1234567890ab' },
                },
              },
              message: {
                value: {
                  action: 'MSG',
                  input: {
                    msg: {
                      message: 'Hello there',
                      userId: 'cdf1feeb098fa35becd6f14a',
                      userName: 'test1',
                    },
                  },
                },
              },
              reset: {
                value: {
                  action: 'RESET',
                },
              },
              join: {
                value: {
                  action: 'JOIN',
                },
              },
              leave: {
                value: {
                  action: 'LEAVE',
                },
              },
              rest: {
                value: {
                  action: 'REST',
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
        description: 'Custom Game update response object',
        content: {
          'application/json': {
            schema: UpdateGameResponse,
          },
        },
      },
      204: {
        description: 'REST|LEAVE|MSG responses have empty body',
      },
      404: {
        description: 'Game not found in database',
      },
      500: {
        description: 'Update failed',
        content: {
          'application/json': {
            schema: ServerErrorSchema,
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
    security: [
      {
        bearerAuth: [],
      },
    ],
    servers: [
      {
        // the custom dynamic route '/api/api-docs/swagger.json' will replace
        // localhost with whatever the client specifies as host in their http req.
        // and send a modified copy of swagger.json. In the case for the swagger ui,
        // it is based on the download-url-input that is controlled by the url field
        // value in swaggerUiBundle from swagger-initializer. So servers.url in the
        // oapi doc and swagger ui will reflect what is in download-url-input
        url: `http://localhost:${port}/api`,
      },
    ],
    tags: [
      { name: 'game', description: 'All operations concerning a game' },
      {
        name: 'games',
        description: 'Operations retrieving details of multiple games',
      },
    ],
  });

  if (!isEmpty(openApiSpec)) {
    fs.writeFileSync(
      `${__dirname}/swagger.json`,
      JSON.stringify(openApiSpec, null, 2),
      { encoding: 'utf-8' }
    );
  }
}

export const oaiSpec = openApiSpec;
