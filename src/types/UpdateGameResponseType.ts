import {
  JoinGameResponse,
  MoveResponse,
  LeaveGameResponse,
  MsgResponse
} from '../interfaces';

export type UpdateGameResponseType =
  | JoinGameResponse
  | MoveResponse
  | LeaveGameResponse
  | MsgResponse;
