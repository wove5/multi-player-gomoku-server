import { GameDocument } from '../model/game.model';
import { ACTION } from '../constants';
import { Game } from '../schema/gameSchema';

export interface RetrieveGameDBReply {
  action: ACTION;
  game: Game;
}

export interface RetrieveGameResponse {
  game: Game;
}

export interface ReEnterGameDBReply {
  action: ACTION;
  game: Game;
}

export interface ReEnterGameResponse {
  game: Game;
}
