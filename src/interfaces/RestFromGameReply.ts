import { ACTION, PLAYER_STATE, POSITION_STATUS } from '../constants';
// import { PlayerDetail } from '../types';
import mongoose from 'mongoose';

// export enum ACTION {
//   JOIN = 'JOIN',
//   REENTER = 'REENTER',
//   RETRIEVE = 'RETRIEVE',
//   LEAVE = 'LEAVE',
//   DELETE = 'DELETE',
//   MOVE = 'MOVE',
//   REST = 'REST',
//   RESET = 'RESET',
//   MSG = 'MSG',
// }

// export enum POSITION_STATUS {
//   BLACK = 'BLACK',
//   WHITE = 'WHITE',
//   NONE = 'NONE',
// }

// export enum PLAYER_STATE {
//   RESTING = 'RESTING',
//   PLAYING = 'PLAYING',
// }

// export interface UserDocument {
//   _id: mongoose.Types.ObjectId;
//   userName: string;
//   password: string;
//   createdAt?: Date;
//   updatedAt?: Date;
// }

// export type PlayerDetail = {
//   user: mongoose.Types.ObjectId | UserDocument;
//   color: POSITION_STATUS;
// };
import { PlayerDetail } from './JoinLeaveGameReply';

export interface RestFromGameDBReply {
  playerState: PLAYER_STATE;
}

export interface TakeRestFromGameDBReply {
  action: ACTION.REST;
  // players: PlayerDetail[];
  result: PlayerDetail[];
  // result: PlayerDetail[] | null;
}
