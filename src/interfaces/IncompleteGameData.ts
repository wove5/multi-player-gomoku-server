import mongoose from 'mongoose';
import { PlayerDetail, UserDetail } from '../types';
export interface IncompleteGameData {
  _id: mongoose.Types.ObjectId;
  gameNumber: number;
  size: number[];
  isMulti: boolean;
  createdAt: Date;
  players: PlayerDetail[];
}
