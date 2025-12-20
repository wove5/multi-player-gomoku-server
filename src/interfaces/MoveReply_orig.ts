import { PLAYER, ACTION, POSITION_STATUS } from './../constants/index';
import { GAMESTATUS } from '../constants';
import { PlayerDetail } from '../types';

export interface MoveDBReply {
  action: ACTION;
  result: {
    status: GAMESTATUS;
    player: PLAYER;
    selectedPosId?: string;
    selectedPosIndex?: number;
    players?: PlayerDetail[];
  };
}

export interface MoveResponse {
  status: GAMESTATUS;
  player: PLAYER;
}
