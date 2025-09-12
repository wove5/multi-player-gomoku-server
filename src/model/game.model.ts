import mongoose from 'mongoose';
import { PlayerDetail } from '../types';
import { Message } from '../types/Message';

enum POSITION_STATUS {
  BLACK = 'BLACK',
  WHITE = 'WHITE',
  NONE = 'NONE',
}

enum SELPOS_STATUS {
  BLACK = 'BLACK',
  WHITE = 'WHITE',
}

enum GAMESTATUS {
  ACTIVE = 'ACTIVE',
  WON = 'WON',
  DRAWN = 'DRAWN',
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
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model<GameDocument>('Game', gameSchema);
