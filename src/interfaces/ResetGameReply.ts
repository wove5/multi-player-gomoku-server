import { ACTION, GAMESTATUS, POSITION_STATUS } from '../constants';
// import { GameDocument } from '../model/game.model';
// import { Game } from '../schema/gameSchema';
import { Message } from './MsgReply';
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

// export enum POSITION_STATUS {
//   BLACK = 'BLACK',
//   WHITE = 'WHITE',
//   NONE = 'NONE',
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

// export type Message = {
//   message: string;
//   userId: string;
//   userName: string;
// };

interface Game {
  _id: mongoose.Types.ObjectId;
  players: PlayerDetail[];
  gameNumber: number;
  isMulti: boolean;
  size: number[];
  status: GAMESTATUS;
  positions: Array<{
    _id: mongoose.Types.ObjectId;
    status: POSITION_STATUS;
  }>;
  selectedPositions: number[];
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ResetGameDBReply {
  action: ACTION.RESET;
  // result: {
  //   game: GameDocument;
  // };
  result: Game;
  // result: Game | null;
}

export interface ResetGameResponse {
  action: ACTION;
  result: {
    game: Game;
  };
}
