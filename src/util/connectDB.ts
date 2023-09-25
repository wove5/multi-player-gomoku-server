import mongoose from 'mongoose';
import logger from './logger';

const connectDB = async () => {
  const dbUri = process.env.dbURI || '';
  logger.info(`⚡️[server]: Connecting to DB...`);
  logger.info(`⚡️[server] dbURI = ${process.env.dbURI}`);
  try {
    await mongoose.connect(dbUri);
  } catch (error) {
    logger.error('⚡️[server]: Could not connect to db');
    logger.error(error);
    process.exit(1);
  }
};

export default connectDB;
