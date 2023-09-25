import z, { string, number, array, object, TypeOf, void as void_ } from 'zod';

const createGamePayload = {
  body: object({
    size: array(
      number({
        required_error: 'Board size is required',
      })
        .gte(5)
        .lte(12)
    )
      .nonempty()
      .max(2),
  }),
};

const UpdateGameSelectPosition = object({
  id: string({ required_error: 'Position ObjectId is required' }),
});

const UpdateGameReset = object({
  status: z.literal('NONE'),
});

const updateGamePayloadGeneral = {
  body: z.union([UpdateGameSelectPosition, UpdateGameReset]),
};

const readUpdateDeleteGameParams = {
  params: object({
    id: string({
      required_error: 'Game id is required',
    }),
  }),
};

export const createGameSchema = object({
  ...createGamePayload,
});

export const readGameSchema = object({
  ...readUpdateDeleteGameParams,
});

export const updateGameGeneralSchema = object({
  ...readUpdateDeleteGameParams,
  ...updateGamePayloadGeneral,
});

export const deleteGameSchema = object({
  ...readUpdateDeleteGameParams,
});

export type CreateGameInput = TypeOf<typeof createGameSchema>;
export type ReadGameInput = TypeOf<typeof readGameSchema>;
export type UpdateGameInput = TypeOf<typeof updateGameGeneralSchema>;
export type DeleteGameInput = TypeOf<typeof deleteGameSchema>;
