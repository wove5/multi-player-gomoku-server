import mongoose from 'mongoose';
import { GAMESTATUS, POSITION_STATUS } from '../constants';

export interface CompletedGameData {
  _id: mongoose.Types.ObjectId;
  gameNumber: number;
  size: number[];
  status: GAMESTATUS;
  lastSelectedPosition: {
    status: POSITION_STATUS;
    _id: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
