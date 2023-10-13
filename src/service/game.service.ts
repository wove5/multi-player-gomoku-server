import { PlayerDetail } from './../types/PlayerDetail';
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
  IncompleteGameData,
  JoinGameDBReply,
  MoveDBReply,
  LeaveGameDBReply,
  ResetGameDBReply,
  NoDBReply,
  ReadGameDBReply,
} from '../interfaces';
import gameWon from '../util/gameWon';
// import { GameStatus } from '../types/GameStatus';
import { GameStatus, UserDetail, UpdateGameDBReturnType } from '../types';
import logger from '../util/logger';
import UserModel from '../model/user.model';

// mongoose.set('debug', true);

export interface UpdateResultDoc {
  ok: number;
  n: number;
  nModified: number;
}

export async function getIncompleteGames(userId: string) {
  // ): Promise<GameDocument[]> {
  // return await GameModel.find({
  return await GameModel.aggregate([
    {
      $match: {
        $or: [
          {
            'players.userId': new mongoose.Types.ObjectId(userId),
            status: { $eq: 'ACTIVE' },
          },
          {
            isMulti: true,
            status: GAMESTATUS.ACTIVE,
            players: { $size: 1 },
            'players.userId': { $ne: userId },
          },
        ],
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'players.userId',
        foreignField: '_id',
        as: 'userDetail',
        pipeline: [
          {
            $project: {
              _id: 0,
              userId: '$_id',
              username: 1,
            },
          },
        ],
      },
    },
    {
      $project: {
        _id: 1,
        gameNumber: 1,
        size: 1,
        isMulti: 1,
        createdAt: 1,
        players: 1,
        userDetails: '$userDetail',
      },
    },
  ]);
}

export async function getCompletedGames(
  userId: string
): Promise<CompletedGameData[]> {
  return await GameModel.aggregate([
    {
      $match: {
        // userId: new mongoose.Types.ObjectId(userId),
        'players.userId': new mongoose.Types.ObjectId(userId),
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
  // ): Promise<GameDocument | null> {
  //   return await GameModel.findOne({
  //     _id: new mongoose.Types.ObjectId(id),
  //     // 'players.userId': new mongoose.Types.ObjectId(userId),
  //   }).lean();
  // }
): Promise<JoinGameDBReply | NoDBReply> {
  const doc = await GameModel.findOne({
    // $match: {
    _id: new mongoose.Types.ObjectId(id),
    'players.userId': new mongoose.Types.ObjectId(userId),
    // players: {
    //   $elemMatch: {
    //     userId: new mongoose.Types.ObjectId(userId),
    //   },
    // },
    status: GAMESTATUS.ACTIVE,
    // },
  });

  // // how about just get all players userDetails, containing usernames, in one go
  // const userDetails = await GameModel.aggregate([
  //   {
  //     $match: {
  //       _id: new mongoose.Types.ObjectId(id),
  //     },
  //   },
  //   {
  //     $lookup: {
  //       from: 'users',
  //       localField: 'players.userId',
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
  //       userDetail: 1,
  //     },
  //   },
  // ]);
  // console.log(`doc found: ${doc}`);
  if (doc) {
    // console.log(`attempting to return a <GameStatus> object`);
    // return doc;
    return {
      action: ACTION.REENTER,
      game: doc,
    };
  } else {
    // return null;
    return { action: ACTION.REENTER, result: null };
  }
}

// if (doc) {
//   console.log(`attempting to return a <GameStatus> object`);
//   // return {
//   //   status: GAMESTATUS.ACTIVE,
//   //   player:
//   //     doc.selectedPositions.length === 0
//   //       ? POSITION_STATUS.BLACK
//   //       : doc.positions[doc.selectedPositions.slice(-1)[0]].status,
//   // };
//   return {
//     action: ACTION.JOIN,
//     game: doc,
//   };
// } else {
//   return { action: ACTION.JOIN, result: null };
// }

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

  const userDetail = await UserModel.findById(userId);

  return await GameModel.create({
    ...input,
    status: GAMESTATUS.ACTIVE,
    gameNumber: await getNextSequence('gameIdNumber'),
    positions: blankBoardPositions,
    selectedPositions: [],
    players: [
      {
        userId: new mongoose.Types.ObjectId(userId),
        color: PLAYER.BLACK,
        userName: userDetail?.username,
      },
    ],
  });
}

export async function updateGame(
  id: string,
  userId: string,
  input: UpdateGameInput['body']
): Promise<UpdateGameDBReturnType> {
  // | GameStatus
  // | GameDocument
  // JoinGameReply | MoveReply | LeaveGameReply | ResetGameReply | NoReply
  // | UserDetail
  // | null
  if ('id' in input) {
    // formal query to try and update the selected position
    // console.log('about to try and do a move/update');
    console.log(`gameId = ${id}`);
    // const doc = await GameModel.findOneAndUpdate(
    //   {
    //     _id: new mongoose.Types.ObjectId(id),
    //     // 'players.userId': new mongoose.Types.ObjectId(userId),
    //     positions: {
    //       $elemMatch: {
    //         _id: new mongoose.Types.ObjectId(input.id),
    //         status: 'NONE',
    //       },
    //     },
    //   },
    //   // [
    //   //   {
    //   //     $set: {
    //   //       players: {
    //   //         $concatArrays: [
    //   //           '$players',
    //   //           [
    //   //             {
    //   //               userId: new mongoose.Types.ObjectId(userId),
    //   //               color: {
    //   //                 $cond: [
    //   //                   { $eq: [{ $first: '$players.color' }, PLAYER.BLACK] },
    //   //                   PLAYER.WHITE,
    //   //                   PLAYER.BLACK,
    //   //                 ],
    //   //               },
    //   //               userName: 'david',
    //   //             },
    //   //           ],
    //   //         ],
    //   //       },
    //   //     },
    //   //   },
    //   // ],

    //   // [
    //   {
    //     $set: {
    //       // this one works when no brackets surround the { $set: }
    //       'positions.$.status': PLAYER.BLACK, //{
    //       //   $cond: [
    //       //     {
    //       //       $eq: [
    //       //         {
    //       //           $arrayElemAt: [
    //       //             '$positions.status',
    //       //             { $last: '$selectedPositions' },
    //       //           ],
    //       //         },
    //       //         PLAYER.BLACK,
    //       //         // PLAYER.BLACK,
    //       //       ],
    //       //     },
    //       //     PLAYER.WHITE,
    //       //     PLAYER.BLACK,
    //       //   ],
    //       // },
    //       //   },
    //       // },
    //       // // [
    //       // {
    //       //   $set: {
    //       // this one works only when brackets surround the { $set: }
    //       selectedPositions: {
    //         $concatArrays: [
    //           '$selectedPositions',
    //           // [77],
    //           [
    //             {
    //               $indexOfArray: [
    //                 '$positions._id',
    //                 new mongoose.Types.ObjectId(input.id),
    //               ],
    //             },
    //           ],
    //         ],
    //       },
    //     },
    //   },
    //   // ],
    //   // ],

    //   //   currentSelIndex: {
    //   //     $indexOfArray: [
    //   //       '$positions._id',
    //   //       new mongoose.Types.ObjectId(input.id),
    //   //     ],
    //   //   },
    //   // ],

    //   // $set: {
    //   //   players: {
    //   //     $concatArrays: [
    //   //       '$players',
    //   //       [
    //   //         {
    //   //           userId: new mongoose.Types.ObjectId(userId),
    //   //           color: {
    //   //             $cond: [
    //   //               { $eq: [{ $first: '$players.color' }, PLAYER.BLACK] },
    //   //               PLAYER.WHITE,
    //   //               PLAYER.BLACK,
    //   //             ],
    //   //           },
    //   //           userName: userDetail?.username,
    //   //         },
    //   //       ],
    //   //     ],
    //   //   },
    //   // },

    //   //       },
    //   //     },
    //   //   },
    //   // ],
    //   // {
    //   //   'positions.$.status':
    //   //     selContext[0].lastSelStatus === 'BLACK' ? 'WHITE' : 'BLACK',
    //   //   $push: {
    //   //     selectedPositions: selContext[0].currentSelIndex,
    //   //   },
    //   // },
    //   { new: true } // new option to true to return the document after update was applied.
    // );
    // console.log('got through the move/update');

    const selContext = await GameModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
        },
      },
      {
        $project: {
          // lastSelStatus: {
          //   $arrayElemAt: [
          //     '$positions.status',
          //     { $last: '$selectedPositions' },
          //   ],
          // },
          playerColor: {
            $arrayElemAt: [
              '$players.color',
              {
                $indexOfArray: [
                  '$players.userId',
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
        },
      },
    ]);

    // formal query to try and update the selected position
    // console.log('about to try and do a move/update');
    const doc = await GameModel.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(id),
        players: {
          $elemMatch: {
            userId: new mongoose.Types.ObjectId(userId),
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
          // selContext[0].lastSelStatus === 'BLACK' ? 'WHITE' : 'BLACK',
          selContext[0].playerColor,
        $push: {
          selectedPositions: selContext[0].currentSelIndex,
        },
      },
      { new: true } // new option to true to return the document after update was applied.
    );
    console.log('got through the move/update');
    // program will return here if no match for findOneAndUpdate'
    if (!doc) return { action: ACTION.MOVE, result: null };

    // TODO: learn why debug emits no msg to terminal while info does.
    logger.debug(`doc.positions.length = ${doc.positions.length}`);
    logger.debug(
      `doc.selectedPositions.length = ${doc.selectedPositions.length}`
    );

    // if (gameWon(selContext[0].currentSelIndex, doc.positions, doc.size)) {
    if (gameWon(doc.selectedPositions.slice(-1)[0], doc.positions, doc.size)) {
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
          player: doc.positions[doc.selectedPositions.slice(-1)[0]].status,
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
          player: doc.positions[doc.selectedPositions.slice(-1)[0]].status,
        },
      };
    } else {
      return {
        action: ACTION.MOVE,
        result: {
          status: GAMESTATUS.ACTIVE,
          player: doc.positions[doc.selectedPositions.slice(-1)[0]].status,
        },
      };
    }
  } else if ('action' in input) {
    if (input.action === 'JOIN') {
      // a player is joining
      const userDetail = await UserModel.findById(userId);
      const doc = await GameModel.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(id),
          status: GAMESTATUS.ACTIVE,
          players: { $size: 1 },
          'players.userId': { $ne: userId },
          // players: {
          //   $size: 1,
          //   $elemMatch: {
          //     userId: new mongoose.Types.ObjectId(userId),
          //   },
          // },
        },
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
                      userName: userDetail?.username,
                    },
                  ],
                ],
              },
            },
          },
        ],
        { new: true }
      );
      // console.log('Did I make it to here?');
      // // how about just get all players userDetails, containing usernames, in one go
      // const userDetails = await GameModel.aggregate([
      //   {
      //     $match: {
      //       _id: new mongoose.Types.ObjectId(id),
      //     },
      //   },
      //   {
      //     $lookup: {
      //       from: 'users',
      //       localField: 'players.userId',
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
      //   // {
      //   //   $project: {
      //   //     userDetail: 1,
      //   //   },
      //   // },
      // ]);
      // console.log(
      //   `Object.entries(userDetails[0]) = ${Object.entries(userDetails[0])}`
      // );
      // console.log(`userDetails.gameNumber = ${userDetails[0].gameNumber}`);
      // console.log('And what about here really??????');
      // const userPlayerInfo = await GameModel.aggregate([
      //   {
      //     $match: {
      //       _id: new mongoose.Types.ObjectId(id),
      //     },
      //   },
      //   {
      //     $lookup: {
      //       from: 'users',
      //       localField: 'players.userId',
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
      //     $set: {
      //       usersPlayers: {
      //         $concatArrays: ['$players', '$userDetail'],
      //       },
      //       // userDetail: 1,
      //       // players: 1,
      //     },
      //   },
      //   {
      //     $project: {
      //       _id: 0,
      //       usersPlayers: 1,
      //     },
      //   },
      //   {
      //     $group: {
      //       _id: '$userId',
      //       userName: { $first: '$username' },
      //       color: { $first: '$color' },
      //     },
      //   },
      // ]);

      // console.log(
      //   `Object.entries(userPlayerInfo[0]) = ${Object.entries(
      //     userPlayerInfo[0]
      //   )}`
      // );
      // // do we want the other user; ie, our opponent who is already in the game?
      // // we want to extract and send on our name to other player,
      // // and we'll need the opponent's
      // const otherUserId = doc?.players.find(
      //   (p) => p.userId.toString() !== userId
      // )?.userId;
      // const userDetail: UserDetail[] = await UserModel.aggregate([
      //   {
      //     $match: {
      //       _id: new mongoose.Types.ObjectId(otherUserId),
      //     },
      //   },
      //   {
      //     $project: {
      //       // _id: 0, // may or may not need this?
      //       userId: '$_id', //
      //       username: 1,
      //     },
      //   },
      // ]);

      // console.log(`doc = ${doc}`);
      if (doc) {
        console.log(`attempting to return a <GameStatus> object`);
        // return {
        //   status: GAMESTATUS.ACTIVE,
        //   player:
        //     doc.selectedPositions.length === 0
        //       ? POSITION_STATUS.BLACK
        //       : doc.positions[doc.selectedPositions.slice(-1)[0]].status,
        // };
        return {
          action: ACTION.JOIN,
          game: doc,
        };
      } else {
        return { action: ACTION.JOIN, result: null };
      }
      // } else {
    } else if (input.action === 'LEAVE') {
      // a player is leaving
      const doc = await GameModel.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(id),
          status: GAMESTATUS.ACTIVE,
          'players.userId': userId,
        },
        { $pull: { players: { userId: userId } } }
      ); // username of player leaving is needed below, so not using the new option here

      // const doc = await GameModel.aggregate([
      //   {
      //     $match: {
      //       _id: new mongoose.Types.ObjectId(id),
      //     },
      //   },
      //   {
      //     $lookup: {
      //       from: 'users',
      //       localField: 'players.userId',
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
      // ]);

      // const userDetail: UserDetail[] = await UserModel.aggregate([
      //   {
      //     $match: {
      //       _id: new mongoose.Types.ObjectId(userId),
      //     },
      //   },
      //   {
      //     $project: {
      //       // _id: 0,
      //       userId: '$_id',
      //       username: 1,
      //     },
      //   },
      // ]);

      //
      // const userLeaving = doc
      //   ? doc.players.find((p) => p.userId.toString() === userId)
      //   : null;

      // if (userLeaving) {
      //   return {
      //     action: ACTION.LEAVE,
      //     userLeaving: PlayerDetail,
      //   };
      if (doc) {
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
        'players.userId': userId,
      });

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
        'players.userId': userId,
      },
      {
        $set: { 'positions.$[].status': input.status, selectedPositions: [] },
      },
      { new: true }
    );

    // const userDetail = await UserModel.aggregate([
    //   {
    //     $match: {
    //       _id: new mongoose.Types.ObjectId(userId),
    //     },
    //   },
    //   {
    //     $project: {
    //       // _id: 0,
    //       userId: '$_id',
    //       username: 1,
    //     },
    //   },
    // ]);

    // return doc;
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

export async function deleteGame(id: string, userId: string) {
  return GameModel.deleteOne({
    _id: new mongoose.Types.ObjectId(id),
    status: GAMESTATUS.ACTIVE,
    players: { $size: 1 },
    'players.userId': userId,
  });
}
