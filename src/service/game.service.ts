import { PositionInfo } from './../types/PositionInfo';
// import { DocumentDefinition } from 'mongoose'; // mongoose ^6, it has its own types
import NextGameNumberModel, {
  NextGameNumberDocument,
} from '../model/nextGameNumber.model';
import GameModel, { GameDocument } from '../model/game.model';
import { POSITION_STATUS, GAMESTATUS, PLAYER } from '../constants';
import { PositionInfo } from '../types/PositionInfo';

import mongoose from 'mongoose';
import { CreateGameInput, UpdateGameInput } from '../schema/game.schema';
import { CompletedGameData, IncompleteGameData } from '../interfaces';
import gameWon from '../util/gameWon';
import { GameStatus } from '../types/GameStatus';
import logger from '../util/logger';

export interface UpdateResultDoc {
  ok: number;
  n: number;
  nModified: number;
}

export async function getIncompleteGames(
  userId: string
): Promise<IncompleteGameData[]> {
  return await GameModel.find({
    userId: new mongoose.Types.ObjectId(userId),
    status: { $eq: 'ACTIVE' },
  }).lean();
}

export async function getCompletedGames(
  userId: string
): Promise<CompletedGameData[]> {
  return await GameModel.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        status: { $ne: 'ACTIVE' },
      },
    },
    {
      $addFields: {
        lastSelectedPosition: {
          $let: {
            vars: {
              posNo: { $last: '$selectedPositions' },
            },
            in: { $arrayElemAt: ['$positions', '$$posNo'] },
          },
        },
      },
    },
  ]).sort({ updatedAt: -1 });
}

export async function getGameById(
  id: string,
  userId: string
): Promise<GameDocument | null> {
  return await GameModel.findOne({
    _id: new mongoose.Types.ObjectId(id),
    userId: new mongoose.Types.ObjectId(userId),
  }).lean();
}

async function getNextSequence(name: string) {
  var ret: NextGameNumberDocument = await NextGameNumberModel.findOneAndUpdate(
    { _id: name },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return ret.seq;
}

export async function createGame(
  input: CreateGameInput['body'],
  userId: string
) {
  const blankBoardPositions: Array<PositionInfo> = [
    ...Array(input.size[0] * input.size[1]),
  ].map((_) => ({ status: POSITION_STATUS.NONE }));

  return GameModel.create({
    ...input,
    status: GAMESTATUS.ACTIVE,
    gameNumber: await getNextSequence('gameIdNumber'),
    positions: blankBoardPositions,
    selectedPositions: [],
    players: [{ userId: userId, color: PLAYER.BLACK }],
  });
}

export async function updateGame(
  id: string,
  userId: string,
  input: UpdateGameInput['body']
): Promise<GameStatus | GameDocument | null> {
  if ('id' in input) {
    const selContext = await GameModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
          // userId: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $project: {
          lastSelStatus: {
            $arrayElemAt: [
              '$positions.status',
              { $last: '$selectedPositions' },
            ],
          },
          currentSelIndex: {
            $indexOfArray: [
              '$positions._id',
              new mongoose.Types.ObjectId(input.id),
            ],
          },
        },
      },
    ]);

    // formal query to try and update the selected position
    const doc = await GameModel.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(id),
        userId: new mongoose.Types.ObjectId(userId),
        positions: {
          $elemMatch: {
            _id: new mongoose.Types.ObjectId(input.id),
            status: 'NONE',
          },
        },
      },
      {
        'positions.$.status':
          selContext[0].lastSelStatus === 'BLACK' ? 'WHITE' : 'BLACK',
        $push: {
          selectedPositions: selContext[0].currentSelIndex,
        },
      },
      { new: true } // new option to true to return the document after update was applied.
    );
    // program will return here if no match for findOneAndUpdate'
    if (!doc) return null;

    // TODO: learn why debug emits no msg to terminal while info does.
    logger.debug(`doc.positions.length = ${doc.positions.length}`);
    logger.debug(
      `doc.selectedPositions.length = ${doc.selectedPositions.length}`
    );

    if (gameWon(selContext[0].currentSelIndex, doc.positions, doc.size)) {
      await GameModel.updateOne(
        {
          _id: new mongoose.Types.ObjectId(id),
        },
        { status: GAMESTATUS.WON }
      );
      return {
        status: GAMESTATUS.WON,
        player: doc.positions[doc.selectedPositions.slice(-1)[0]].status,
      };
    } else if (doc.positions.length === doc.selectedPositions.length) {
      await GameModel.updateOne(
        {
          _id: new mongoose.Types.ObjectId(id),
        },
        { status: GAMESTATUS.DRAWN }
      );
      return {
        status: GAMESTATUS.DRAWN,
        player: doc.positions[doc.selectedPositions.slice(-1)[0]].status,
      };
    } else {
      return {
        status: GAMESTATUS.ACTIVE,
        player: doc.positions[doc.selectedPositions.slice(-1)[0]].status,
      };
    }
  } else if ('action' in input) {
    if (input.action === 'JOIN') {
      // a player is joining
      const doc = await GameModel.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(id) },
        [
          {
            $set: {
              players: {
                $concatArrays: [
                  '$players',
                  [
                    {
                      userId: new mongoose.Types.ObjectId(userId),
                      color: {
                        $cond: [
                          { $eq: [{ $first: '$players.color' }, PLAYER.BLACK] },
                          PLAYER.WHITE,
                          PLAYER.BLACK,
                        ],
                      },
                    },
                  ],
                ],
              },
            },
          },
        ]
      );
      console.log(`doc = ${doc}`);
      if (doc) {
        console.log(`attempting to return a <GameStatus> object`);
        return {
          status: GAMESTATUS.ACTIVE,
          player:
            doc.selectedPositions.length === 0
              ? POSITION_STATUS.BLACK
              : doc.positions[doc.selectedPositions.slice(-1)[0]].status,
        };
      } else {
        return null;
      }
    } else {
      // a player is leaving
      const doc = await GameModel.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(id) },
        { $pull: { players: { userId: userId } } }
      );
      console.log(`doc = ${doc}`);
      if (doc) {
        console.log(`attempting to return a <GameStatus> object`);
        return {
          status: GAMESTATUS.ACTIVE,
          player:
            doc.selectedPositions.length === 0
              ? POSITION_STATUS.BLACK
              : doc.positions[doc.selectedPositions.slice(-1)[0]].status,
        };
      } else {
        return null;
      }
    }
  } else {
    const doc = await GameModel.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(id),
        // userId: new mongoose.Types.ObjectId(userId),
      },
      {
        $set: { 'positions.$[].status': input.status, selectedPositions: [] },
      },
      { new: true }
    );
    return doc;
  }
}

export async function deleteGame(id: string, userId: string) {
  return GameModel.deleteOne({
    _id: new mongoose.Types.ObjectId(id),
    // userId: new mongoose.Types.ObjectId(userId),
    status: GAMESTATUS.ACTIVE,
    players: { $size: 1 },
    'players.userId': userId,
  });
}
