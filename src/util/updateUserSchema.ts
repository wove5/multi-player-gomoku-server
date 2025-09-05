import 'dotenv/config';
import connect from './connectDB';
import UserModel from '../model/user.model';

console.log('Hi');

const run = async () => {
    try {
        await connect();
        const result = await UserModel.updateMany(
            { 'username' : { $exists: true } },
            {  
               $rename: { 'username' : 'userName'},
            }
        ).exec();
        console.log(`result.acknowledged: ${result.acknowledged}`)
        console.log(`result.matchedCount: ${result.matchedCount}`)
        console.log(`result.modifiedCount: ${result.modifiedCount}`)
        process.exit();
        
    } catch (error) {
        console.log('Error: ', error);
        process.exit(1);
    }
}

run();
