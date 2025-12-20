import { UserDetail } from '../types/UserDetail';
import { GameDocument } from '../model/game.model';
import { ACTION } from '../constants';
import { PlayerDetail } from '../types';
import { Game } from '../schema/gameSchema';

export interface JoinGameDBReply {
  action: ACTION;
  game: Game;
}

export interface JoinGameResponse {
  game: Game;
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

export interface DeleteGameDBResult {
  acknowledged: boolean;
  deletedCount?: number;
}
