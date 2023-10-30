import { ResetGameDBReply } from './ResetGameReply';
import { ACTION } from '../constants';
import { GameDocument } from '../model/game.model';

export interface ResetGameDBReply {
  action: ACTION;
  result: {
    game: GameDocument;
  };
}

export interface ResetGameResponse {
  action: ACTION;
  result: {
    game: GameDocument;
  };
}
