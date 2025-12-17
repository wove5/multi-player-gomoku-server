import { z } from '../zod-config';
import { ACTION, GAMESTATUS, POSITION_STATUS, PLAYER } from '../constants';

export const actionSchema = z.enum(ACTION);

export const gamestatusSchema = z.enum(GAMESTATUS);

export const positionStatusSchema = z.enum(POSITION_STATUS);

export const playerSchema = z.enum(PLAYER);
