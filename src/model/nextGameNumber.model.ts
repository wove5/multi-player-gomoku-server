import mongoose, { Document, Model } from 'mongoose';

export interface NextGameNumberDocument extends Document {
  _id: string;
  seq: number;
}

const nextGameNumberSchema = new mongoose.Schema<
  NextGameNumberDocument,
  Model<NextGameNumberDocument>
>({
  _id: String,
  seq: Number,
});

export default mongoose.model<NextGameNumberDocument>(
  'NextGameNumber',
  nextGameNumberSchema
);
