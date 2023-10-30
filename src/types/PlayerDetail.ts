import mongoose from 'mongoose';
import { PLAYER, POSITION_STATUS } from '../constants';

export type PlayerDetail = {
  userId: mongoose.Types.ObjectId;
  color: POSITION_STATUS;
  userName: string;
};
