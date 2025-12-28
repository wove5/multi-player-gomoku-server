import mongoose from 'mongoose';
import UserModel, { UserDocument } from '../model/user.model';
// import { RegisterInput } from '../schema';
import { RegisterInput } from '../schema/auth.schema';
import { CreateUserInput } from '../schema/userAndPlayerSchemas';

export async function getUserByUsername(username: string) {
  return UserModel.findOne({ userName: username }).lean();
}

export async function getUserById(id: string) {
  return UserModel.findById(id).lean();
}

// export async function createUser(input: UserDocument) {
// export async function createUser(input: RegisterInput['body']) {
export async function createUser(input: CreateUserInput) {
  return UserModel.create(input);
  // return new UserModel();
}
