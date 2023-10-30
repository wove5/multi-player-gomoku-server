import { PLAYER, ACTION, POSITION_STATUS } from './../constants/index';
import { GAMESTATUS } from '../constants';

export interface MoveDBReply {
  action: ACTION;
  result: {
    status: GAMESTATUS;
    player: PLAYER;
  };
}

export interface MoveResponse {
  status: GAMESTATUS;
  player: PLAYER;
}
