import mongoose from 'mongoose';
// import { PlayerDetail, Message } from '../types';

export enum POSITION_STATUS {
  BLACK = 'BLACK',
  WHITE = 'WHITE',
  NONE = 'NONE',
}

export enum SELPOS_STATUS {
  BLACK = 'BLACK',
  WHITE = 'WHITE',
}

export enum GAMESTATUS {
  ACTIVE = 'ACTIVE',
  WON = 'WON',
  DRAWN = 'DRAWN',
}

type PlayerDetail = {
  user: mongoose.Types.ObjectId | UserDocument;
  color: POSITION_STATUS;
};

type Message = {
  message: string;
  userId: string;
  userName: string;
};

interface UserDocument {
  userName: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// export interface CompleteGameDocument extends Document {  // mongoose docs recommend not extending Document
export interface GameDocument {
  _id: mongoose.Types.ObjectId;
  players: PlayerDetail[];
  gameNumber: number;
  isMulti: boolean;
  size: number[];
  status: GAMESTATUS;
  positions: Array<{
    status: POSITION_STATUS;
  }>;
  selectedPositions: number[];
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

const gameSchema = new mongoose.Schema(
  {
    players: [
      {
        _id: false,
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        color: String,
      },
    ],
    gameNumber: Number,
    isMulti: Boolean,
    size: [Number],
    status: String,
    positions: [
      {
        status: String,
      },
    ],
    selectedPositions: [Number],
    messages: [
      {
        message: String,
        userId: String,
        userName: String,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<GameDocument>('Game', gameSchema);
