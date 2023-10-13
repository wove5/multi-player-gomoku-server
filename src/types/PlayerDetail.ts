import mongoose from 'mongoose';
import { PLAYER } from '../constants';

export type PlayerDetail = {
  userId: mongoose.Types.ObjectId;
  color: PLAYER;
  userName: string;
};
