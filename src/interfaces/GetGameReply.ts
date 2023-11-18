import { GameDocument } from '../model/game.model';
import { ACTION } from '../constants';

export interface RetrieveGameDBReply {
  action: ACTION;
  game: GameDocument;
}

export interface RetrieveGameResponse {
  game: GameDocument;
}

export interface ReEnterGameDBReply {
  action: ACTION;
  game: GameDocument;
}

export interface ReEnterGameResponse {
  game: GameDocument;
}
