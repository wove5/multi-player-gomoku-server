import { ACTION } from '../constants/index';
import { Message } from '../types/Message';

export interface MsgDBReply {
  action: ACTION;
  messages: Message[];
}

export interface MsgResponse {
  messages: Message[];
}
