import mongoose, { Document, Schema } from 'mongoose';

export interface ISession extends Document {
  token: string;
  userId: string;
  expiresAt: number;
}

const SessionSchema: Schema = new Schema({
  token: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  expiresAt: { type: Number, required: true },
});

export const SessionModel = mongoose.models.Session || mongoose.model<ISession>('Session', SessionSchema);
