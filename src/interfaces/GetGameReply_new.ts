import { ACTION } from '../constants';
import { Game } from '../schema/gameSchema';

export interface RetrieveGameDBReply {
  action: ACTION.RETRIEVE;
  result: Game;
}

export interface RetrieveGameResponse {
  game: Game;
}

export interface ReEnterGameDBReply {
  action: ACTION.REENTER;
  result: Game;
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
