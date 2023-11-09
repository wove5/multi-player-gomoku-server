import mongoose, { Mongoose } from 'mongoose';
import {
  JoinGameDBReply,
  MoveDBReply,
  LeaveGameDBReply,
  DeleteGameDBResult,
  ResetGameDBReply,
  NoDBReply,
  RestFromGameDBReply,
  TakeRestFromGameDBReply,
} from '../interfaces';

export type UpdateGameDBReturnType =
  | JoinGameDBReply
  | MoveDBReply
  | TakeRestFromGameDBReply
  | LeaveGameDBReply
  | DeleteGameDBResult
  | ResetGameDBReply
  | NoDBReply;
