import z from 'zod';
import mongoose from 'mongoose';

export const objectIdStringSchema = z
  .string()
  .regex(/^[0-9A-Fa-f]+$/, 'Invalid hexadecimal string')
  .length(24)
  .refine(
    (val) => {
      return (
        mongoose.isObjectIdOrHexString(val) &&
        new mongoose.Types.ObjectId(val).toString() === val
      );
    },
    {
      message: 'Invalid MongoDB ObjectId string',
    }
  );
