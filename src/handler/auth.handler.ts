import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { validateAuthBodyPayload } from '../middleware/validateAuthBodyPayload';
import { createUser, getUserByUsername } from '../service/auth.service';
import {
  LoginInput,
  RegisterInput,
  registerSchema,
  loginSchema,
  authPayloadSchema,
} from '../schema/auth.schema';
import { signJwt } from '../util/jwt';
// import { AuthResponse } from '../types';
import { AuthResponse } from '../schema/userAuthDbReply';

// interface TypedResponse<T, U> extends Response {
//   locals: { asyncData: T; processedData: U };
// }
interface TypedResponse<T, U = null> extends Response<U extends null ? T : U> {
  locals: { asyncData: T; processedData: U };
}

const authHandler = express.Router();

authHandler.post(
  '/register',
  validateAuthBodyPayload(authPayloadSchema),
  // validateSchema(registerSchema),
  async (
    req: Request<{}, AuthResponse, RegisterInput['body']>,
    res: TypedResponse<AuthResponse, null>
  ) => {
    // try {
    const { username, password } = req.body;

    // check if user already exist
    // Validate if user exist in our database
    const existingUser = await getUserByUsername(username);

    if (existingUser) {
      return res.status(409).send();
      // TODO: expand the errorHandler middleware to accept different
      // TODO: client errors and do a throw() here with a messge prop
      // .send({ message: 'User Already Exists. Please Login' });
    }

    //Encrypt user password
    const encryptedPassword = await bcrypt.hash(password, 10);

    // Create user in our database
    const newUser = await createUser({
      userName: username,
      password: encryptedPassword,
    });

    // Create token
    const token = signJwt({ username, _id: newUser._id });

    // return new user with token
    res.status(200).json({ _id: newUser._id, token });
    // } catch (err: any) {
    //   return res.status(500).send(err.message);
    // }
  }
);

authHandler.post(
  '/login',
  validateAuthBodyPayload(authPayloadSchema),
  // validateSchema(loginSchema),
  async (
    req: Request<{}, AuthResponse, LoginInput['body']>,
    res: TypedResponse<AuthResponse, null>
  ) => {
    // try {
    // Get user input
    const { username, password } = req.body;

    // Validate if user exist in our database
    const user = await getUserByUsername(username);
    if (user && (await bcrypt.compare(password, user.password))) {
      // Create token
      const token = signJwt({ username, _id: user._id });

      res.locals.asyncData = { _id: user._id, token };
      // user
      return res.status(200).json({ _id: user._id, token });
      // return res.status(200).json('hi');
    }
    // return res.status(400).send({ message: 'Invalid Credentials' });
    // TODO: expand the errorHandler middleware to accept different
    // TODO: client errors and do a throw() here with a messge prop
    return res.status(400).send();
    // } catch (err: any) {
    //   return res.status(500).send(err.message);
    // }
  }
);

export default authHandler;
