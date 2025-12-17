// import {
//   JoinGameResponse,
//   MoveResponse,
//   LeaveGameResponse,
//   MsgResponse
// } from '../interfaces';

import { JoinGameResponse } from '../interfaces/JoinLeaveGameReply_orig';
import { MoveResponse } from '../interfaces/MoveReply_orig';
import { LeaveGameResponse } from '../interfaces/JoinLeaveGameReply_orig';
import { MsgResponse } from '../interfaces/MsgReply_orig';

export type UpdateGameResponseType =
  | JoinGameResponse
  | MoveResponse
  | LeaveGameResponse
  | MsgResponse
  | {};
