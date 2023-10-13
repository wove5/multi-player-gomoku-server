import { ACTION, PLAYER_STATE } from '../constants';
import { PlayerDetail } from '../types';

export interface RestFromGameDBReply {
  playerState: PLAYER_STATE;
}

export interface TakeRestFromGameDBReply {
  action: ACTION;
  players: PlayerDetail[];
}
