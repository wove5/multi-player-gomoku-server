import { GameDocument } from '../model/game.model';
import { PlayerDetail } from '../types';

export interface ReadGameResponse {
  game: GameDocument;
  // players: PlayerDetail[];
}
