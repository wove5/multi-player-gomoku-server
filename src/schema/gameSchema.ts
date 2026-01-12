import { z } from '../zod-config';
// import {
//   objectIdSchema,
//   playerDetailSchema,
//   positionStatusSchema,
//   messageSchema,
//   gamestatusSchema,
// } from '.';
import { objectIdSchema } from './objectIdStringSchema';
import { playerDetailSchema } from './userAndPlayerSchemas';
import { positionStatusSchema } from './constantEnumSchemas';
import { messageSchema } from './msgReply';
import { gamestatusSchema } from './constantEnumSchemas';

export const gameSchema = z
  .object({
    _id: objectIdSchema('Game Id'),
    players: z.array(playerDetailSchema),
    gameNumber: z.int().positive(),
    isMulti: z.boolean(),
    size: z.array(z.int().gte(5).lte(12)).min(2).max(2).openapi({
      description:
        'Dimensions of the game board grid:\n\n must be numbers in the range 5..12',
    }),
    status: gamestatusSchema,
    positions: z.array(
      z.object({
        _id: objectIdSchema('Game board Position Id'),
        status: positionStatusSchema,
      })
    ),
    selectedPositions: z.array(z.number()),
    messages: z.array(messageSchema),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .openapi({
    example: {
      _id: '68df110979fae18a8375b842',
      players: [
        {
          user: '3C921f99C235AAa6D90f05bd',
          color: 'BLACK',
        },
      ],
      gameNumber: 1,
      isMulti: true,
      size: [5, 5],
      status: 'ACTIVE',
      positions: [
        { status: 'NONE', _id: '69432dd0b8f2be9f32567665' },
        { status: 'NONE', _id: '69432dd0b8f2be9f32567666' },
        { status: 'NONE', _id: '69432dd0b8f2be9f32567667' },
        { status: 'NONE', _id: '69432dd0b8f2be9f32567668' },
        { status: 'NONE', _id: '69432dd0b8f2be9f32567669' },
        { status: 'NONE', _id: '69432dd0b8f2be9f3256766a' },
        { status: 'NONE', _id: '69432dd0b8f2be9f3256766b' },
        { status: 'NONE', _id: '69432dd0b8f2be9f3256766c' },
        { status: 'NONE', _id: '69432dd0b8f2be9f3256766d' },
        { status: 'NONE', _id: '69432dd0b8f2be9f3256766e' },
        { status: 'NONE', _id: '69432dd0b8f2be9f3256766f' },
        { status: 'NONE', _id: '69432dd0b8f2be9f32567670' },
        { status: 'NONE', _id: '69432dd0b8f2be9f32567671' },
        { status: 'NONE', _id: '69432dd0b8f2be9f32567672' },
        { status: 'NONE', _id: '69432dd0b8f2be9f32567673' },
        { status: 'NONE', _id: '69432dd0b8f2be9f32567674' },
        { status: 'NONE', _id: '69432dd0b8f2be9f32567675' },
        { status: 'NONE', _id: '69432dd0b8f2be9f32567676' },
        { status: 'NONE', _id: '69432dd0b8f2be9f32567677' },
        { status: 'NONE', _id: '69432dd0b8f2be9f32567678' },
        { status: 'NONE', _id: '69432dd0b8f2be9f32567679' },
        { status: 'NONE', _id: '69432dd0b8f2be9f3256767a' },
        { status: 'NONE', _id: '69432dd0b8f2be9f3256767b' },
        { status: 'NONE', _id: '69432dd0b8f2be9f3256767c' },
        { status: 'NONE', _id: '69432dd0b8f2be9f3256767d' },
      ],
      selectedPositions: [],
      messages: [],
      createdAt: '2026-01-11',
      updatedAt: '2026-01-11',
    },
  });

export type Game = z.infer<typeof gameSchema>;
