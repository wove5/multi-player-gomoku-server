// import z, { discriminatedUnion } from 'zod';
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
import { discriminatedUnion } from 'zod';

export type UpdateGameDBReturnType =
  | JoinGameDBReply
  | MoveDBReply
  | TakeRestFromGameDBReply
  | LeaveGameDBReply
  | DeleteGameDBResult
  | ResetGameDBReply
  | MsgDBReply
  | NoDBReply;

// export type UpdateGameDBReturnSchema = z.ZodDiscriminatedUnion('action', [
//   z.object(typeof JoinGameDBReply)
// ])
