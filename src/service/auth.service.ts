import mongoose from 'mongoose';
import UserModel, { UserDocument } from '../model/user.model';
// import { RegisterInput } from '../schema';
import { RegisterInput } from '../schema/auth.schema';

export async function getUserByUsername(username: string) {
  return UserModel.findOne({ userName: username }).lean();
}

export async function getUserById(id: string) {
  return UserModel.findById(id).lean();
}

// export async function createUser(user: UserDocument) {
export async function createUser(input: RegisterInput['body']) {
  return UserModel.create(input);
  // return new UserModel();
}
