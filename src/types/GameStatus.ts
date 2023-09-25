import { GAMESTATUS, POSITION_STATUS } from '../constants';

export type GameStatus = {
  status: GAMESTATUS;
  player: POSITION_STATUS;
};
