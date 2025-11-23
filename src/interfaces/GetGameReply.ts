import { GameDocument } from '../model/game.model';
import { ACTION } from '../constants';
import { GameSchema } from '../schema/gameSchema';

export interface RetrieveGameDBReply {
  action: ACTION;
  game: GameSchema;
}

export interface RetrieveGameResponse {
  game: GameSchema;
}

export interface ReEnterGameDBReply {
  action: ACTION;
  game: GameSchema;
}

export interface ReEnterGameResponse {
  game: GameSchema;
}
