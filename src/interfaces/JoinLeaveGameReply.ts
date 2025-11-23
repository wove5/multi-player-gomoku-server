import { UserDetail } from '../types/UserDetail';
import { GameDocument } from '../model/game.model';
import { ACTION } from '../constants';
import { PlayerDetail } from '../types';
import { GameSchema } from '../schema/gameSchema';

export interface JoinGameDBReply {
  action: ACTION;
  game: GameSchema;
}

export interface JoinGameResponse {
  game: GameSchema;
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
