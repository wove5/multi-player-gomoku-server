// import { object, string, record } from 'zod';
import { z } from '../zod-config';

// export const assertAuthPayloadShape = z.record(
export const authPayloadSchema = z.record(
  z.enum(['username', 'password']),
  z.string().min(1, 'Cannot be empty string')
);
// Interesting. This covers all the validation items commented out below. It also covers
// invalid types - e.g. as in the long refine statement for assertUpdateGamePayloadShape

// const payload = {
//   body: z.object({
//     username: z.string(),
//     password: z.string(),
//   }),
//   // body: object({
//   //   username: string({
//   //     error: (issue) => issue.input === undefined
//   //     ? "username required"
//   //     : `Invalid input type: expected string, received ${typeof issue.input}`
//   //   })
//   //   .min(1,'Username is required'),
//   //   password: string({
//   //     error: (issue) => issue.input === undefined
//   //     ? "password required"
//   //     : `Invalid input type: expected string, received ${typeof issue.input}`
//   //   })
//   //   .min(1,'Password is required')
//   //   })
// };
// how about the following
const payload = {
  body: authPayloadSchema,
};

export const registerSchema = z.object({
  ...payload,
});

export const loginSchema = z.object({
  ...payload,
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
