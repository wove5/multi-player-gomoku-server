import mongoose from 'mongoose';
import { PLAYER } from '../constants';

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
  // userId: UserDocument['_id'];  // to use this, UserDocument interface will need an explicit _id property
  // _id: mongoose.Types.ObjectId;
  players: [
    { userId: mongoose.Types.ObjectId; color: PLAYER; userName: string }
  ];
  gameNumber: number;
  isMulti: boolean;
  size: number[];
  status: GAMESTATUS;
  positions: Array<{
    status: POSITION_STATUS;
  }>;
  selectedPositions: number[];
  createdAt: Date;
  updatedAt: Date;
}

const gameSchema = new mongoose.Schema(
  {
    // _id: mongoose.Types.ObjectId,
    players: [
      {
        _id: false,
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        color: String,
        userName: String,
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
  },
  { timestamps: true }
);

export default mongoose.model<GameDocument>('Game', gameSchema);
