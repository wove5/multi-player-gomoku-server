import {
  JoinGameResponse,
  // MoveDBReply,
  MoveResponse,
  LeaveGameResponse,
  // ResetGameDBReply,
  // NoDBReply,
} from '../interfaces';

export type UpdateGameResponseType =
  | JoinGameResponse
  | MoveResponse
  | LeaveGameResponse;
// | MoveDBReply
// | LeaveGameResponse;
// | ResetGameDBReply
// | NoDBReply;
