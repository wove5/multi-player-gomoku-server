import express, { Request, Response } from 'express';
import WebSocket from 'ws';
import { wss } from '../websocket';

import validateSchema from '../middleware/validateSchema';
import { deserializeUser } from '../middleware/deserializeUser';

import {
  createGameSchema,
  deleteGameSchema,
  CreateGameInput,
  readGameSchema,
  ReadGameInput,
  updateGameGeneralSchema,
  UpdateGameInput,
} from '../schema/game.schema';

import {
  getIncompleteGames,
  getCompletedGames,
  createGame,
  updateGame,
  deleteGame,
  getGameById,
  UpdateResultDoc,
} from '../service/game.service';
import { GameDocument } from '../model/game.model';
import { GameStatus } from '../types/GameStatus';

const gameHandler = express.Router();

gameHandler.use(deserializeUser);

// Get incomplete games
gameHandler.get('/', async (req: Request, res: Response) => {
  const userId = req.userId;
  try {
    const result = await getIncompleteGames(userId);
    // array is returned, regardless of any games or not; in the latter case, result is []
    return res.status(200).send(
      result.map((g) => ({
        _id: g._id,
        gameNumber: g.gameNumber,
        size: g.size,
        isMulti: g.isMulti,
        createdAt: g.createdAt,
        players: g.players,
        users: g.userDetails,
      }))
    );
  } catch (err: any) {
    return res.status(500).send(err);
  }
});

// Get completed games
gameHandler.get('/games', async (req: Request, res: Response) => {
  const userId = req.userId;
  try {
    const result = await getCompletedGames(userId);
    // a bit more handling implemented here than in getIncompleteGames;
    if (result.length > 0) {
      return res.status(200).send(
        result.map((g) => ({
          _id: g._id,
          gameNumber: g.gameNumber,
          size: g.size,
          status: g.status,
          lastSelectedPosition: g.lastSelectedPosition,
          createdAt: g.createdAt,
          updatedAt: g.updatedAt,
        }))
      );
    } else {
      // set error message to 'Not Found', so client can use this.
      return res.status(404).send('Not Found');
      // return res.status(404).send(res.statusCode); // this gives a deprecation msg
    }
  } catch (err: any) {
    return res.status(500).send(err);
  }
});

// Create Game
gameHandler.post(
  '/',
  validateSchema(createGameSchema),
  async (
    req: Request<{}, CreateGameInput, CreateGameInput['body']>,
    res: Response<GameDocument>
  ) => {
    try {
      const userId = req.userId;
      const gameReqBody = req.body;
      const newGame = await createGame(gameReqBody, userId);
      return res.status(200).send(newGame);
    } catch (err: any) {
      return res.status(500).send(err);
    }
  }
);

// Read Incomplete Game
gameHandler.get(
  '/game/:id',
  validateSchema(readGameSchema),
  async (
    req: Request<ReadGameInput['params'], GameDocument, {}>,
    res: Response<GameDocument>
  ) => {
    try {
      const userId = req.userId;
      const gameId = req.params.id;

      const game = await getGameById(gameId, userId);
      if (!game) return res.sendStatus(404);
      return res.status(200).json(game[0]);
    } catch (err: any) {
      return res.status(500).send(err);
    }
  }
);

// Read Completed Game
gameHandler.get(
  '/game-log/:id',
  validateSchema(readGameSchema),
  async (
    req: Request<ReadGameInput['params'], GameDocument, {}>,
    res: Response<GameDocument>
  ) => {
    try {
      const userId = req.userId;
      const gameId = req.params.id;

      const game = await getGameById(gameId, userId);
      if (!game) return res.sendStatus(404);
      return res.status(200).json(game[0]);
    } catch (err: any) {
      return res.status(500).send(err);
    }
  }
);

// Update Game
gameHandler.put(
  '/game/:id',
  validateSchema(updateGameGeneralSchema),
  async (
    req: Request<
      UpdateGameInput['params'],
      GameStatus | GameDocument,
      UpdateGameInput['body']
    >,
    res: Response<GameStatus | GameDocument | null>
  ) => {
    try {
      const result = await updateGame(req.params.id, req.userId, req.body);
      if (!result) return res.sendStatus(404);
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(result));
        }
      });
      return res.status(200).send(result);
    } catch (err: any) {
      console.log('server error');
      return res.status(500).send(err);
    }
  }
);

// Delete Game
gameHandler.delete(
  '/game/:id',
  validateSchema(deleteGameSchema),
  async (req: Request, res: Response) => {
    try {
      const userId = req.userId;
      const gameId = req.params.id;
      const deleted = await deleteGame(gameId, userId);
      if (deleted.acknowledged && deleted.deletedCount === 0)
        return res.sendStatus(404);
      res.sendStatus(200);
    } catch (err: any) {
      return res.status(500).send(err);
    }
  }
);

export default gameHandler;
