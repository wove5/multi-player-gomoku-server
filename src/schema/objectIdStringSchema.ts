import z from 'zod';
import mongoose, { Types } from 'mongoose';
import exp from 'constants';

export const objectIdStringSchema = z
  // export const objectIdSchema = z
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
  )
  .openapi({ description: 'MongoDB ObjectId as a string' });

// export const objectIdSchema = z.instanceof(Types.ObjectId).openapi({
//   type: 'string',
//   description: 'mongodb ObjectId = hexidecimal string of length 24 chars',
// })

// export const objectIdSchema = z
//   .custom<Types.ObjectId>((val) => mongoose.isValidObjectId(val), {
//     message: 'Invalid MongoDB ObjectId string',
//   })
//   .openapi({
//     type: 'string',
//     description: 'mongodb ObjectId = hexidecimal string of length 24 chars',
//   });

export const objectIdSchema = (extraDescription: string = '') => {
  return z
    .custom<Types.ObjectId>()
    .refine(
      // (val) => val instanceof mongoose.Types.ObjectId,
      (val) => mongoose.isValidObjectId(val),
      // (val) => {
      //   return (
      //     mongoose.isObjectIdOrHexString(val) &&
      //     new mongoose.Types.ObjectId(val.id) === val._id
      //   );
      // },
      {
        message: 'Invalid MongoDB ObjectId string',
      }
    )
    .openapi({
      type: 'string',
      description:
        (extraDescription ? `${extraDescription}:\n\n` : '') +
        'mongodb ObjectId = 24 character hexidecimal string',
    });
};

export const objectId = objectIdSchema('Game Id | Player Id | Position Id');
// export type ObjectIdSchema = z.infer<typeof objectIdSchema>;
