import { UserDetail } from '../types/UserDetail';
// import { GameDocument } from '../model/game.model';
import { ACTION } from '../constants';
// import { PlayerDetail } from '../types';
// import { Message } from '../types';
import { Game } from '../schema/gameSchema';
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

// export enum GAMESTATUS {
//   ACTIVE = 'ACTIVE',
//   WON = 'WON',
//   DRAWN = 'DRAWN',
// }

export enum POSITION_STATUS {
  BLACK = 'BLACK',
  WHITE = 'WHITE',
  NONE = 'NONE',
}

export interface UserDocument {
  _id: mongoose.Types.ObjectId;
  userName: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type PlayerDetail = {
  user: mongoose.Types.ObjectId | UserDocument;
  color: POSITION_STATUS;
};

// type Message = {
//   message: string;
//   userId: string;
//   userName: string;
// };

// interface Game {
//   _id: mongoose.Types.ObjectId;
//   players: PlayerDetail[];
//   gameNumber: number;
//   isMulti: boolean;
//   size: number[];
//   status: GAMESTATUS;
//   positions: Array<{
//     _id: mongoose.Types.ObjectId;
//     status: POSITION_STATUS;
//   }>;
//   selectedPositions: number[];
//   messages: Message[];
//   createdAt: Date;
//   updatedAt: Date;
// }

// type Game = {
//   _id: mongoose.Types.ObjectId;
//   players: {
//     user:
//       | mongoose.Types.ObjectId
//       | {
//           _id: mongoose.Types.ObjectId;
//           userName: string;
//         };
//     color: POSITION_STATUS;
//   }[];
//   gameNumber: number;
//   isMulti: boolean;
//   size: number[];
//   status: GAMESTATUS;
//   positions: {
//     _id: mongoose.Types.ObjectId;
//     status: POSITION_STATUS;
//   }[];
//   selectedPositions: number[];
//   messages: {
//     message: string;
//     userId: string;
//     userName: string;
//   }[];
//   createdAt: Date;
//   updatedAt: Date;
// };

export interface JoinGameDBReply {
  action: ACTION.JOIN;
  // game: Game;
  result: Game;
  // result: Game | null;
}

export interface JoinGameResponse {
  game: Game;
  // playerDetail: PlayerDetail;
}

type DeleteResult = {
  acknowledged: boolean;
  deletedCount?: number;
};
export interface LeaveGameDBReply {
  action: ACTION.LEAVE;
  // players: PlayerDetail[];
  result: PlayerDetail[] | DeleteResult;
  // result: PlayerDetail[] | DeleteResult | null;
}

export interface LeaveGameResponse {
  // game: GameDocument;
  // userDetail: UserDetail;
  players: PlayerDetail[];
}

export interface DeleteGameDBResult {
  action: ACTION.DELETE;
  result: {
    acknowledged: boolean;
    deletedCount?: number;
  };
}
