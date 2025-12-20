import { ACTION } from '../constants';
// export enum ACTION {
//   JOIN = 'JOIN',
//   REENTER = 'REENTER',
//   RETRIEVE = 'RETRIEVE',
//   LEAVE = 'LEAVE',
//   DELETE = 'DELETE',
//   MOVE = 'MOVE',
//   REST = 'REST',
//   RESET = 'RESET',
//   MSG = 'MSG',
// }

export type Message = {
  message: string;
  userId: string;
  userName: string;
};
export interface MsgDBReply {
  action: ACTION.MSG;
  // messages: Message[];
  result: Message[];
  // result: Message[] | null;
}

export interface MsgResponse {
  messages: Message[];
}
