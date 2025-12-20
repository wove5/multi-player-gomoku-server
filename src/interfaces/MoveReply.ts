import {
  PLAYER,
  ACTION,
  POSITION_STATUS,
  GAMESTATUS,
} from './../constants/index';
// import { ACTION } from '../constants';
// import { PLAYER } from './../constants/index';
// import { GAMESTATUS } from '../constants';
import mongoose from 'mongoose';
// import { PlayerDetail } from '../types';

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

// export enum GAMESTATUS {
//   ACTIVE = 'ACTIVE',
//   WON = 'WON',
//   DRAWN = 'DRAWN',
// }

// export enum POSITION_STATUS {
//   BLACK = 'BLACK',
//   WHITE = 'WHITE',
//   NONE = 'NONE',
// }

// export enum PLAYER {
//   BLACK = 'BLACK',
//   WHITE = 'WHITE',
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

export interface MoveDBReply {
  action: ACTION.MOVE;
  // result:
  //   | {
  //       status: GAMESTATUS;
  //       player: PLAYER;
  //       selectedPosId: string;
  //       selectedPosIndex: number;
  //       players: PlayerDetail[];
  //     }
  //   | MoveResponse;

  result:
    | {
        status: GAMESTATUS;
        player: PLAYER;
        selectedPosId: string;
        selectedPosIndex: number;
        players: PlayerDetail[];
      }
    | MoveResponse;
  // | null;
}

export interface MoveResponse {
  status: GAMESTATUS;
  player: PLAYER;
}
