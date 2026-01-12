import { z } from '../zod-config';

// import {
//   joinGameDbReplySchema,
//   leaveGameDbReplySchema,
//   deleteGameDbResultSchema,
// } from './joinLeaveGameReplySchemas';
// import { moveDbReplySchema } from './moveReplySchemas';
// import { takeRestFromGameDbReplySchema } from './RestFromGameReply.zod';
// import { resetGameDbReplySchema } from './ResetGameReply.zod';
// import { msgDbReplySchema } from './msgReply';
// import { noDbReplySchema } from './noReply';

// // export const updateGameDBResponseSchema = z.discriminatedUnion('action', [
// export const updateGameDBResponseSchema = z.union([
//   joinGameDbReplySchema,
//   moveDbReplySchema,
//   takeRestFromGameDbReplySchema,
//   leaveGameDbReplySchema,
//   deleteGameDbResultSchema,
//   resetGameDbReplySchema,
//   msgDbReplySchema,
//   noDbReplySchema,
// ]);

import {
  joinGameResponseSchema,
  leaveGameResponseSchema,
  // deleteGameDbResultSchema,
} from './joinLeaveGameReplySchemas';
import { moveResponseSchema } from './moveReplySchemas';
// import { takeRestFromGameDbReplySchema } from './RestFromGameReply.zod';
import { resetGameResponseSchema } from './resetGameReply';
// import { msgDbReplySchema } from './msgReply';
// import { noDbReplySchema } from './noReply';

import { joinGameDbReplySchema } from './joinLeaveGameReplySchemas';
import { moveDbReplySchema } from './moveReplySchemas';
import { resetGameDbReplySchema } from './resetGameReply';
import { GAMESTATUS, PLAYER } from '../constants';
import { gameSchema } from './gameSchema';

export const exampleNewGame = {
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
};

export const exampleIncompleteGame = {
  _id: '68df110979fae18a8375b842',
  players: [
    {
      user: '3C921f99C235AAa6D90f05bd',
      color: 'BLACK',
    },
    {
      user: '694b3ad2af3822f29587731c',
      color: 'WHITE',
    },
  ],
  gameNumber: 1,
  isMulti: true,
  size: [5, 5],
  status: 'ACTIVE',
  positions: [
    { status: 'BLACK', _id: '69432dd0b8f2be9f32567665' },
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
  selectedPositions: [0],
  messages: [
    {
      message: 'Hi',
      userId: '3C921f99C235AAa6D90f05bd',
      userName: 'David',
    },
    {
      message: 'Hello',
      userId: '694b3ad2af3822f29587731c',
      userName: 'Max',
    },
  ],
  createdAt: '2026-01-11',
  updatedAt: '2026-01-11',
};

export const exampleGameWon = {
  _id: '68df110979fae18a8375b842',
  players: [
    {
      user: '3C921f99C235AAa6D90f05bd',
      color: 'BLACK',
    },
    {
      user: '694b3ad2af3822f29587731c',
      color: 'WHITE',
    },
  ],
  gameNumber: 1,
  isMulti: true,
  size: [5, 5],
  status: 'WON',
  positions: [
    { status: 'BLACK', _id: '69432dd0b8f2be9f32567665' },
    { status: 'BLACK', _id: '69432dd0b8f2be9f32567666' },
    { status: 'BLACK', _id: '69432dd0b8f2be9f32567667' },
    { status: 'BLACK', _id: '69432dd0b8f2be9f32567668' },
    { status: 'BLACK', _id: '69432dd0b8f2be9f32567669' },
    { status: 'WHITE', _id: '69432dd0b8f2be9f3256766a' },
    { status: 'WHITE', _id: '69432dd0b8f2be9f3256766b' },
    { status: 'WHITE', _id: '69432dd0b8f2be9f3256766c' },
    { status: 'WHITE', _id: '69432dd0b8f2be9f3256766d' },
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
};

export const exampleGameDrawn = {
  _id: '68df110979fae18a8375b842',
  players: [
    {
      user: '3C921f99C235AAa6D90f05bd',
      color: 'BLACK',
    },
    {
      user: '694b3ad2af3822f29587731c',
      color: 'WHITE',
    },
  ],
  gameNumber: 1,
  isMulti: true,
  size: [5, 5],
  status: 'DRAWN',
  positions: [
    { status: 'BLACK', _id: '69432dd0b8f2be9f32567665' },
    { status: 'WHITE', _id: '69432dd0b8f2be9f32567666' },
    { status: 'BLACK', _id: '69432dd0b8f2be9f32567667' },
    { status: 'WHITE', _id: '69432dd0b8f2be9f32567668' },
    { status: 'BLACK', _id: '69432dd0b8f2be9f32567669' },
    { status: 'WHITE', _id: '69432dd0b8f2be9f3256766a' },
    { status: 'BLACK', _id: '69432dd0b8f2be9f3256766b' },
    { status: 'WHITE', _id: '69432dd0b8f2be9f3256766c' },
    { status: 'BLACK', _id: '69432dd0b8f2be9f3256766d' },
    { status: 'WHITE', _id: '69432dd0b8f2be9f3256766e' },
    { status: 'BLACK', _id: '69432dd0b8f2be9f3256766f' },
    { status: 'WHITE', _id: '69432dd0b8f2be9f32567670' },
    { status: 'BLACK', _id: '69432dd0b8f2be9f32567671' },
    { status: 'WHITE', _id: '69432dd0b8f2be9f32567672' },
    { status: 'BLACK', _id: '69432dd0b8f2be9f32567673' },
    { status: 'WHITE', _id: '69432dd0b8f2be9f32567674' },
    { status: 'BLACK', _id: '69432dd0b8f2be9f32567675' },
    { status: 'WHITE', _id: '69432dd0b8f2be9f32567676' },
    { status: 'BLACK', _id: '69432dd0b8f2be9f32567677' },
    { status: 'WHITE', _id: '69432dd0b8f2be9f32567678' },
    { status: 'BLACK', _id: '69432dd0b8f2be9f32567679' },
    { status: 'WHITE', _id: '69432dd0b8f2be9f3256767a' },
    { status: 'BLACK', _id: '69432dd0b8f2be9f3256767b' },
    { status: 'WHITE', _id: '69432dd0b8f2be9f3256767c' },
    { status: 'BLACK', _id: '69432dd0b8f2be9f3256767d' },
  ],
  selectedPositions: [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    21, 22, 23, 24,
  ],
  messages: [],
  createdAt: '2026-01-11',
  updatedAt: '2026-01-11',
};

// export const updateGameDBResponseSchema = z.discriminatedUnion('action', [
// there is nothing to discriminate on here
export const updateGameResponseSchema = z
  .union([
    joinGameResponseSchema,
    moveResponseSchema,
    // takeRestFromGameDbReplySchema,
    // leaveGameResponseSchema, // this is also N/A
    // deleteGameDbResultSchema,
    resetGameResponseSchema,
    // msgDbReplySchema,
    // noDbReplySchema,
  ])
  .openapi({
    description: 'Update Game >> server response to client',
  });

export const updateGameDBReplySchema = z
  .discriminatedUnion('action', [
    // export const updateGameDBResponseSchema = z.union([
    joinGameDbReplySchema,
    moveDbReplySchema,
    resetGameDbReplySchema,
  ])
  .openapi('UpdateGameDBReply', {
    description: 'Update Game >> DB reply to server',
  });
