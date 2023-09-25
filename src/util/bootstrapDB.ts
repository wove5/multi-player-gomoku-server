import 'dotenv/config';
import connect from './connectDB';

import UserModel from '../model/user.model';
import users from '../data/user.json';

import GameModel from '../model/game.model';
import NextGameNumberModel from '../model/nextGameNumber.model';
import { NextGameNumberDocument } from '../model/nextGameNumber.model';
import games from '../data/mockGames.json';

// bootstrapDB.ts is based on an earlier schema version, and needs updating to work properly and be used again.
// Therefore, the following line has been cut from package.json scripts. It is here as a reference, should a dev want to revive it.
// "bootstrapdb": "ts-node src/util/bootstrapDB.ts",

async function getNextSequence(name: string) {
  var ret: NextGameNumberDocument | null =
    await NextGameNumberModel.findOneAndUpdate(
      { _id: name },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
  if (!ret) return;
  return ret.seq;
}

const run = async () => {
  try {
    await connect();

    await UserModel.deleteMany();
    await UserModel.insertMany(users);
    await NextGameNumberModel.deleteMany();
    await GameModel.deleteMany();
    await GameModel.insertMany([
      {
        userId: await UserModel.findOne({ username: 'le-kang' }, { _id: 1 }),
        gameNumber: await getNextSequence('gameIdNumber'),
        ...games[0],
      },
      {
        userId: await UserModel.findOne({ username: 'david' }, { _id: 1 }),
        gameNumber: await getNextSequence('gameIdNumber'),
        ...games[1],
      },
    ]);

    process.exit();
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

run();
