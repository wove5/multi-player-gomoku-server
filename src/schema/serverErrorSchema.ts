import z from 'zod';
export const serverErrorSchema = z.object({
  //   stack: z.string(), // something to consider
  message: z.string(),
});
