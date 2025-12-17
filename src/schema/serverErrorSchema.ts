import { z } from '../zod-config';
export const serverErrorSchema = z.object({
  //   stack: z.string(), // something to consider
  message: z.string(),
});

export type ServerError = z.infer<typeof serverErrorSchema>;
