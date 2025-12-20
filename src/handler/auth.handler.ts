import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { validateAuthBodyPayload } from '../middleware/validateAuthBodyPayload';
import { createUser, getUserByUsername } from '../service/auth.service';
import {
  LoginInput,
  RegisterInput,
  registerSchema,
  loginSchema,
  assertAuthPayloadShape,
} from '../schema/auth.schema';
import { signJwt } from '../util/jwt';
import { AuthResponse } from '../types';

interface TypedResponse<T, U> extends Response {
  locals: { asyncData: T; processedData: U };
}

const authHandler = express.Router();

authHandler.post(
  '/register',
  validateAuthBodyPayload(assertAuthPayloadShape),
  // validateSchema(registerSchema),
  async (
    req: Request<{}, AuthResponse, RegisterInput['body']>,
    res: TypedResponse<AuthResponse, null>
  ) => {
    try {
      const { username, password } = req.body;

      // check if user already exist
      // Validate if user exist in our database
      const existingUser = await getUserByUsername(username);

      if (existingUser) {
        return res
          .status(409)
          .send({ message: 'User Already Exists. Please Login' });
      }

      //Encrypt user password
      const encryptedPassword = await bcrypt.hash(password, 10);

      // Create user in our database
      const newUser = await createUser({
        username: username,
        password: encryptedPassword,
      });

      // Create token
      const token = signJwt({ username, _id: newUser._id });

      // return new user with token
      res.status(200).json({ _id: newUser._id, token });
    } catch (err: any) {
      return res.status(500).send(err.message);
    }
  }
);

authHandler.post(
  '/login',
  validateAuthBodyPayload(assertAuthPayloadShape),
  // validateSchema(loginSchema),
  async (
    req: Request<{}, AuthResponse, LoginInput['body']>,
    res: TypedResponse<AuthResponse, null>
  ) => {
    try {
      // Get user input
      const { username, password } = req.body;

      // Validate if user exist in our database
      const user = await getUserByUsername(username);
      if (user && (await bcrypt.compare(password, user.password))) {
        // Create token
        const token = signJwt({ username, _id: user._id });

        // user
        return res.status(200).json({ _id: user._id, token });
      }
      return res.status(400).send({ message: 'Invalid Credentials' });
    } catch (err: any) {
      return res.status(500).send(err.message);
    }
  }
);

export default authHandler;
