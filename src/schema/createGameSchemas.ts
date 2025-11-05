import z, {
  string,
  number,
  array,
  object,
  void as void_,
  boolean,
  record,
  ZodObject,
} from 'zod';

export const createGamePayload = object({
  size: array(
    number()
      .min(5, { error: 'array elements must be number in the range 5..12' })
      .max(12, { error: 'array elements must be number in the range 5..12' }),
    {
      error: (issue) =>
        issue.input === undefined
          ? `Board size is required: array of number, 'size', is missing`
          : `Invalid input type: expected array of number, received ${typeof issue.input}`,
    }
  )
    .min(2, { error: 'input must be array of 2 numbers' })
    .max(2, { error: 'input must be array of 2 numbers' })
    .openapi({
      description:
        'Dimensions of game grid: must be numbers in the range 5..12',
    }),
  isMulti: boolean({
    error: (iss) =>
      iss.input === undefined
        ? `(multi/single)-player game mode required: missing boolean flag 'isMulti' `
        : `invalid input type: expected boolean, received ${typeof iss.input}`,
  }).openapi({
    description: 'Boolean flag indicates if game is multi-player or not',
  }), // example/s placed in registerPath() - they work better there.
});

export const createGameSchema = object({
  body: createGamePayload,
}).openapi('CreateGameSchema');

export type CreateGameInput = z.infer<typeof createGameSchema>;
// export type CreateGameResponse = z.infer<typeof createGameResponseSchema>;
