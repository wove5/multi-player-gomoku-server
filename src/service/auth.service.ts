import mongoose from 'mongoose';
import UserModel, { UserDocument } from '../model/user.model';

export async function getUserByUsername(username: string) {
  return UserModel.findOne({ username }).lean();
}

export async function getUserById(id: string) {
  return UserModel.findById(id).lean();
}

export async function createUser(user: UserDocument) {
  return UserModel.create(user);
}
