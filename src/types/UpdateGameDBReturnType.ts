import {
  JoinGameDBReply,
  MoveDBReply,
  LeaveGameDBReply,
  DeleteGameDBResult,
  ResetGameDBReply,
  NoDBReply,
  TakeRestFromGameDBReply,
  MsgDBReply,
} from '../interfaces';

export type UpdateGameDBReturnType =
  | JoinGameDBReply
  | MoveDBReply
  | TakeRestFromGameDBReply
  | LeaveGameDBReply
  | DeleteGameDBResult
  | ResetGameDBReply
  | MsgDBReply
  | NoDBReply;
