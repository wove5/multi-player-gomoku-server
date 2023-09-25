import mongoose from 'mongoose';

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
  userId: mongoose.Types.ObjectId; // this seems to fit better with mongoose 6.x and typing
  gameNumber: number;
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
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    gameNumber: Number,
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
