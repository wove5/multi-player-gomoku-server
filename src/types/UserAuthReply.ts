import mongoose from "mongoose";

export type AuthResponse = { _id: mongoose.Types.ObjectId, token: string } | {message: string};
