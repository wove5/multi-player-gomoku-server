import mongoose from 'mongoose';

export interface UserDocument {
  userName: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new mongoose.Schema(
  {
    // _id: mongoose.Types.ObjectId, // this could be needed to make typescript recognise the ref from game
    userName: { type: String, require: true, unique: true },
    password: { type: String, require: true },
    // The timestamps option tells Mongoose to assign createdAt and updatedAt fields to your schema. The type assigned is Date.
  },
  { timestamps: true }
);

export default mongoose.model<UserDocument>('User', userSchema);
