import { GameDocument } from '../model/game.model';
import { UserDetail } from '../types';

export interface ReadGameDBReply {
  game: GameDocument;
  // userDetails: UserDetail[];
}
