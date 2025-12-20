// import {
//   JoinGameDBReply,
//   MoveDBReply,
//   LeaveGameDBReply,
//   DeleteGameDBResult,
//   ResetGameDBReply,
//   NoDBReply,
//   TakeRestFromGameDBReply,
//   MsgDBReply,
// } from '../interfaces';

import { JoinGameDBReply } from '../interfaces/JoinLeaveGameReply_orig';
import { MoveDBReply } from '../interfaces/MoveReply_orig';
import { TakeRestFromGameDBReply } from '../interfaces/RestFromGameReply_orig';
import { LeaveGameDBReply } from '../interfaces/JoinLeaveGameReply_orig';
import { DeleteGameDBResult } from '../interfaces/JoinLeaveGameReply_orig';
import { ResetGameDBReply } from '../interfaces/ResetGameReply_orig';
import { MsgDBReply } from '../interfaces/MsgReply_orig';
import { NoDBReply } from '../interfaces/NoReply_orig';

export type UpdateGameDBReturnType =
  | JoinGameDBReply
  | MoveDBReply
  | TakeRestFromGameDBReply
  | LeaveGameDBReply
  | DeleteGameDBResult
  | ResetGameDBReply
  | MsgDBReply
  | NoDBReply;
