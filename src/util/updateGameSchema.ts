import 'dotenv/config';
import connect from './connectDB';
import GameModel from '../model/game.model';
import gameModel from '../model/game.model';

console.log('Hi');

const run = async () => {
    try {
        await connect();
        // orig. schema to new
        // this one fails to set the user field
        // const result = await GameModel.updateMany(
        //     {'players.userName': { $exists: true }},
        //     { 
        //         $set: { 'players.$[elem].user' : '$$elem.userId' },
        //         $unset: {
        //              'players.$[elem].userId' : '',
        //              'players.$[elem].userName' : ''
        //         }
        //     },
        //     {
        //         arrayFilters: [{ 'elem' : { $exists: true}}]
        //     }
        // ).exec();

        // following wont work in mongoose as contents are for a mongodb query
        // const result = GameModel.updateMany(
        // {}, // Filter for all documents
        // [
        //     {
        //     $set: {
        //         "players": {
        //         $map: {
        //             input: "$players",
        //             as: "player",
        //             in: {
        //             $mergeObjects: [
        //                 "$$player",
        //                 {
        //                 user: "$$player.userId" // New field name: old field value
        //                 }
        //             ]
        //             }
        //         }
        //         }
        //     }
        //     },
        //     {
        //         $unset:
        //         {
        //             "players.userId" : '', // Remove the old field after renaming
        //             "players.userName" : ''
        //         }
        //     }
        // ]
        // );        

        // new schema to orig.
        // const result = await GameModel.aggregate([
        //     { 
        //         $lookup: {
        //             from: 'users',
        //             localField: 'players.user',
        //             foreignField: '_id',
        //             as: 'playerDetails',                
        //         },
        //     },
        //     {
        //         $unwind: 'playerDetails'
        //     },
        //     // {
        //     //     $set: { 'players.userId' : '$playerDetails._id',
        //     //         'players.userName' : '$playerDetails.userName'  },
        //     // },
        //     {
        //         $addFields: {
        //              'players': {
        //                 $map: {
        //                     input: '$players',
        //                     as: 'player',
        //                     in: {
        //                         $mergeObjects: [
        //                             '$$player',
        //                             {
        //                                 $arrayElemAt: [
        //                                     '$playerDetails.userName',
        //                                        {
        //                                            $indexOfArray: [
        //                                                "$playerDetails._id",
        //                                                "$$player.user"
        //                                            ]
        //                                        }
        //                                 ]
        //                             }
        //                         ]
        //                     }
        //                 }
        //              }
        //         },
        //     }
        // ])
        // // MongoDB Compass AI generated
        // {
        //   players: {
        //     $map: {
        //       input: "$players",
        //       as: "player",
        //       in: {
        //         user: "$$player.user",
        //         color: "$$player.color",
        //         userName: {
        //           $arrayElemAt: [
        //             "$playerDetails.userName",
        //             {
        //               $indexOfArray: [
        //                 "$playerDetails._id",
        //                 "$$player.user"
        //               ]
        //             }
        //           ]
        //         }
        //       }
        //     }
        //   }
        // }

        // // This one works too; as opposed to attempt further above that is missing userName key & braces in tow
        // {
        //    'players': {
        //       $map: {
        //           input: '$players',
        //           as: 'player',
        //           in: {
        //               $mergeObjects: [
        //                   '$$player',
        //                 	{
        //                   	'userName':
        //                     {
        //                         $arrayElemAt: [
        //                             '$playerDetails.userName',
        //                                {
        //                                    $indexOfArray: [
        //                                        "$playerDetails._id",
        //                                        "$$player.user"
        //                                    ]
        //                                }
        //                         ]
        //                     }
        //                   } 
        //               ]
        //           }
        //       }
        //    }
        // }


        // const result = await gameModel.updateMany(
        //     {},
        //     [
        //         {
        //             $lookup: {
        //                 from: 'users',
        //                 localField: 'players.user',
        //                 foreignField: '_id',
        //                 as: 'playerDetails',                
        //             }, 
        //         },
        //         {
        //             $set: {
        //                 'players.userName': { $first: 'playerDetails.userName'},
        //                 'players.$[elem].userId' : '$$elem.user'
        //             }
        //         },
        //         {
        //             $unset: {
        //                 'players.$[elem].user' : ''
        //             }
        //         }
        //     ]
        // )
        // console.log(`result.acknowledged: ${result.acknowledged}`)
        // console.log(`result.matchedCount: ${result.matchedCount}`)
        // console.log(`result.modifiedCount: ${result.modifiedCount}`)
        process.exit();
        
    } catch (error) {
        console.log('Error: ', error);
        process.exit(1);
    }
}

run();
