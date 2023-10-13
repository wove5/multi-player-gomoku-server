import {
  JoinGameDBReply,
  MoveDBReply,
  LeaveGameDBReply,
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
  | ResetGameDBReply
  | NoDBReply;
