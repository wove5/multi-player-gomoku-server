import mongoose from 'mongoose';
import { POSITION_STATUS } from '../constants';
import { UserDocument } from '../model/user.model';

export type PlayerDetail = {
  user: mongoose.Types.ObjectId | UserDocument;
  color: POSITION_STATUS;
};
