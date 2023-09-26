import jwt, { SignOptions } from 'jsonwebtoken';
import logger from './logger';

export const signJwt = (payload: Object, options: SignOptions = {}) => {
  const privateKey = process.env.accessTokenPrivateKey as string;
  logger.info(`⚡️[server]: privateKey is: ${privateKey}.`);
  logger.info(`⚡️[server]: payload = ${payload}`);
  return jwt.sign(payload, privateKey, {
    ...(options && options),
    algorithm: 'RS256',
    expiresIn: '5m',
  });
};

export const verifyJwt = <T>(token: string): T | null => {
  try {
    const publicKey = process.env.accessTokenPublicKey as string;
    return jwt.verify(token, publicKey) as T;
  } catch (error) {
    return null;
  }
};
