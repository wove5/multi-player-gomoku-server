import { UserDetail } from '../types/UserDetail';
import { GameDocument } from '../model/game.model';
import { ACTION } from '../constants';
import { PlayerDetail } from '../types';

export interface JoinGameDBReply {
  action: ACTION;
  game: GameDocument;
}

export interface JoinGameResponse {
  game: GameDocument;
  // playerDetail: PlayerDetail;
}

export interface LeaveGameDBReply {
  action: ACTION;
  players: PlayerDetail[];
}

export interface LeaveGameResponse {
  // game: GameDocument;
  // userDetail: UserDetail;
  players: PlayerDetail[];
}
