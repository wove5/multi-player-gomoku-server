// import { DocumentDefinition } from 'mongoose'; // mongoose ^6, it has its own types
import NextGameNumberModel, {
  NextGameNumberDocument,
} from '../model/nextGameNumber.model';
import GameModel, { GameDocument } from '../model/game.model';
import { POSITION_STATUS, GAMESTATUS, PLAYER, ACTION } from '../constants';
import { PositionInfo } from '../types/PositionInfo';

import mongoose from 'mongoose';
import { CreateGameInput, UpdateGameInput } from '../schema/game.schema';
import {
  CompletedGameData,
  NoDBReply,
  RetrieveGameDBReply,
  ReEnterGameDBReply,
} from '../interfaces';
import gameWon from '../util/gameWon';
import { UpdateGameDBReturnType } from '../types';
import logger from '../util/logger';

// mongoose.set('debug', true);

export interface UpdateResultDoc {
  ok: number;
  n: number;
  nModified: number;
}

// create & read queries made on the game model will populate players.user with userName 
// so that the players field is returned with useful info, not just _id

export async function getIncompleteGames(
  userId: string
): Promise<GameDocument[]> {
  return await GameModel.find({
    $or: [
      {
        'players.user': new mongoose.Types.ObjectId(userId),
        status: { $eq: 'ACTIVE' },
      },
      {
        isMulti: true,
        status: GAMESTATUS.ACTIVE,
        players: { $size: 1 },
        'players.user': { $ne: userId },
      },
    ],
  }).populate({path: 'players.user', select: '_id userName'}).exec();
  
  // return await GameModel.aggregate([
  //   {
  //     $match: {
  //       $or: [
  //         {
  //           'players.user': new mongoose.Types.ObjectId(userId),
  //           status: { $eq: 'ACTIVE' },
  //         },
  //         {
  //           isMulti: true,
  //           status: GAMESTATUS.ACTIVE,
  //           players: { $size: 1 },
  //           'players.user': { $ne: userId },
  //         },
  //       ],
  //     },
  //   },
  //   // TODO: creating the userDetail seems redundant and might not being used at client side; consider removing?
  //   {
  //     $lookup: {
  //       from: 'users',
  //       localField: 'players.user',
  //       foreignField: '_id',
  //       as: 'userDetail',
  //       pipeline: [
  //         {
  //           $project: {
  //             _id: 0,
  //             userId: '$_id',
  //             username: 1,
  //           },
  //         },
  //       ],
  //     },
  //   },
  //   {
  //     $project: {
  //       _id: 1,
  //       gameNumber: 1,
  //       size: 1,
  //       isMulti: 1,
  //       createdAt: 1,
  //       players: 1,
  //       userDetails: '$userDetail',
  //     },
  //   },
  // ]);
  // leaving all the above comment in because it might be useful in getCompletedGames
}

export async function getCompletedGames(
  userId: string
): Promise<CompletedGameData[]> {
  return await GameModel.aggregate([
    {
      $match: {
        'players.user': new mongoose.Types.ObjectId(userId),
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

export async function getIncompleteGame(
  id: string,
  userId: string
): Promise<ReEnterGameDBReply | NoDBReply> {
  const doc = await GameModel.findOne({
    _id: new mongoose.Types.ObjectId(id),
    'players.user': new mongoose.Types.ObjectId(userId),
    status: GAMESTATUS.ACTIVE,
  }).populate('players.user', 'userName').exec();

  if (doc) {
    return {
      action: ACTION.REENTER,
      game: doc,
    };
  } else {
    return { action: ACTION.REENTER, result: null };
  }
}

export async function getCompletedGame(
  id: string,
  userId: string
): Promise<RetrieveGameDBReply | NoDBReply> {
  const doc = await GameModel.findOne({
    _id: new mongoose.Types.ObjectId(id),
    'players.user': new mongoose.Types.ObjectId(userId),
    status: { $not: { $eq: GAMESTATUS.ACTIVE } },
  }).populate('players.user', 'userName').exec();

  if (doc) {
    return {
      action: ACTION.RETRIEVE,
      game: doc,
    };
  } else {
    return { action: ACTION.RETRIEVE, result: null };
  }
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

  const newGame = new GameModel({
    ...input,
    status: GAMESTATUS.ACTIVE,
    gameNumber: await getNextSequence('gameIdNumber'),
    positions: blankBoardPositions,
    selectedPositions: [],
    players: [
      {
        user: new mongoose.Types.ObjectId(userId),
        color: input.isMulti ? POSITION_STATUS.BLACK : POSITION_STATUS.NONE,
      },
    ],
  })

  await newGame.save();
  return await newGame.populate('players.user', 'userName');
  // could also do the following because the caller is handling promises
  // return newGame.populate('players.user', 'userName')
}

export async function updateGame(
  id: string,
  userId: string,
  input: UpdateGameInput['body']
): Promise<UpdateGameDBReturnType> {
  if ('id' in input) {
    const selContext = await GameModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
        },
      },
      {
        $project: {
          lastSelStatus: {
            $cond: [
              { $eq: [{ $size: '$selectedPositions' }, 0] },
              POSITION_STATUS.NONE,
              {
                $arrayElemAt: [
                  '$positions.status',
                  { $last: '$selectedPositions' },
                ],
              },
            ],
          },
          playerColor: {
            $arrayElemAt: [
              '$players.color',
              {
                $indexOfArray: [
                  '$players.user',
                  new mongoose.Types.ObjectId(userId),
                ],
              },
            ],
          },
          currentSelIndex: {
            $indexOfArray: [
              '$positions._id',
              new mongoose.Types.ObjectId(input.id),
            ],
          },
          isMulti: 1,
        },
      },
    ]);

    // block player's attempt to make move ahead of their turn
    if (
      selContext[0].isMulti &&
      (selContext[0].lastSelStatus === selContext[0].playerColor ||
        (selContext[0].lastSelStatus === POSITION_STATUS.NONE &&
          selContext[0].playerColor !== POSITION_STATUS.BLACK))
    )
      return {
        action: ACTION.MOVE,
        result: {
          status: GAMESTATUS.ACTIVE,
          player: selContext[0].lastSelStatus,
        },
      };

    // formal query to try and update the selected position
    const doc = await GameModel.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(id),
        players: {
          $elemMatch: {
            user: new mongoose.Types.ObjectId(userId),
          },
        },
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
    ).populate('players.user', 'userName').exec();

    // program will return here if no match for findOneAndUpdate'
    if (!doc) return { action: ACTION.MOVE, result: null };

    console.log('got through the move/update');

    // TODO: learn why debug emits no msg to terminal while info does.
    logger.debug(`doc.positions.length = ${doc.positions.length}`);
    logger.debug(
      `doc.selectedPositions.length = ${doc.selectedPositions.length}`
    );

    if (gameWon(doc.selectedPositions.slice(-1)[0], doc.positions, doc.size)) {
      console.log(
        'doc.selectedPositions.slice(-1)[0] = ',
        doc.selectedPositions.slice(-1)[0]
      );
      console.log(`doc.positions = ${doc.positions}`);
      console.log(`doc.size = ${doc.size}`);
      console.log(
        `gameWon(doc.selectedPositions.slice(-1)[0], doc.positions, doc.size): ${gameWon(
          doc.selectedPositions.slice(-1)[0],
          doc.positions,
          doc.size
        )}`
      );
      await GameModel.updateOne(
        {
          _id: new mongoose.Types.ObjectId(id),
        },
        { status: GAMESTATUS.WON }
      );
      return {
        action: ACTION.MOVE,
        result: {
          status: GAMESTATUS.WON,
          player:
            doc.positions[doc.selectedPositions.slice(-1)[0]].status ===
            POSITION_STATUS.BLACK
              ? PLAYER.BLACK
              : PLAYER.WHITE,
          selectedPosId: input.id,
          selectedPosIndex: selContext[0].currentSelIndex,
          players: doc.players,
        },
      };
    } else if (doc.positions.length === doc.selectedPositions.length) {
      await GameModel.updateOne(
        {
          _id: new mongoose.Types.ObjectId(id),
        },
        { status: GAMESTATUS.DRAWN }
      );
      return {
        action: ACTION.MOVE,
        result: {
          status: GAMESTATUS.DRAWN,
          player:
            doc.positions[doc.selectedPositions.slice(-1)[0]].status ===
            POSITION_STATUS.BLACK
              ? PLAYER.BLACK
              : PLAYER.WHITE,
          selectedPosId: input.id,
          selectedPosIndex: selContext[0].currentSelIndex,
          players: doc.players,
        },
      };
    } else {
      return {
        action: ACTION.MOVE,
        result: {
          status: GAMESTATUS.ACTIVE,
          player:
            doc.positions[doc.selectedPositions.slice(-1)[0]].status ===
            POSITION_STATUS.BLACK
              ? PLAYER.WHITE
              : PLAYER.BLACK,
          selectedPosId: input.id,
          selectedPosIndex: selContext[0].currentSelIndex,
          players: doc.players,
        },
      };
    }
  } else if ('action' in input) {
    if (input.action === 'JOIN') {
      // a player is joining
      const game = await GameModel.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(id),
          status: GAMESTATUS.ACTIVE,
          players: { $size: 1 },
          'players.user': { $ne: userId },
        },
        [
          {
            $set: {
              players: {
                $concatArrays: [
                  '$players',
                  [
                    {
                      user: new mongoose.Types.ObjectId(userId),
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
        ],
        { new: true }
      ).populate('players.user', 'userName').exec();

      if (game) {
        return {
          action: ACTION.JOIN,
          game,
        };
      } else {
        return { action: ACTION.JOIN, result: null };
      }
    } else if (input.action === 'LEAVE') {
      // a player is leaving
      const doc = await GameModel.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(id),
          status: GAMESTATUS.ACTIVE,
          'players.user': userId,
        },
        { $pull: { players: { user: userId } } }
      ).populate('players.user', 'userName').exec(); 
      // username of player leaving may be needed below, so "new" option is not used in this query

      if (doc) {
        if (doc.players.length === 1) {
          // no players left in game; delete game and short circuit out of here
          // a DeleteResult object is returned, i.e: isDeleteGameDBResult() captures return val. in handler
          //  NB: no. of players is really 0 in DB
          return await GameModel.deleteOne({
            _id: new mongoose.Types.ObjectId(id),
            status: GAMESTATUS.ACTIVE,
            players: { $size: 0 },
          });
        }
        // return the fact that a player remains in game; this is where the userName is needed for later
        // doc.players contains both the player that left and the one who remains
        return {
          action: ACTION.LEAVE,
          players: doc.players,
        };
      } else {
        return { action: ACTION.LEAVE, result: null };
      }
    } else {
      // player is taking rest
      const doc = await GameModel.findOne({
        _id: new mongoose.Types.ObjectId(id),
        status: GAMESTATUS.ACTIVE,
        'players.user': userId,
      }).populate('players.user', 'userName').exec();

      if (doc) {
        return { action: ACTION.REST, players: doc.players };
      } else {
        return { action: ACTION.REST, result: null };
      }
    }
  } else {
    // resetting game
    const doc = await GameModel.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(id),
        status: GAMESTATUS.ACTIVE,
        players: { $size: 1 },
        'players.user': userId,
      },
      {
        $set: { 'positions.$[].status': input.status, selectedPositions: [] },
      },
      { new: true }
    ).populate('players.user', 'userName').exec();

    if (doc) {
      return {
        action: ACTION.RESET,
        result: {
          game: doc,
        },
      };
    } else {
      return { action: ACTION.RESET, result: null };
    }
  }
}

// this is probably not getting used anymore and will likely get removed
export async function deleteGame(id: string, userId: string) {
  return GameModel.deleteOne({
    _id: new mongoose.Types.ObjectId(id),
    status: GAMESTATUS.ACTIVE,
    players: { $size: 1 },
    'players.user': userId,
  });
}
