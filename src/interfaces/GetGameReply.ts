import { ACTION } from '../constants';
import { Game } from '../schema/gameSchema';

export interface RetrieveGameDBReply {
  action: ACTION;
  result: Game | null;
}

export interface RetrieveGameResponse {
  game: Game;
}

export interface ReEnterGameDBReply {
  action: ACTION;
  result: Game | null;
}

export interface ReEnterGameResponse {
  game: Game;
}

export interface ReEnterRetrieveGameDBReply {
  action: ACTION;
  result: Game;
}

export interface ReEnterRetrieveGameResponse {
  game: Game;
}
