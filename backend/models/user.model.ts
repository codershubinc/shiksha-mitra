import mongoose, { Document, Schema } from 'mongoose';

export type UserRole = 'student' | 'teacher' | 'parent';

export interface IUser extends Document {
  id: string; // custom id like usr_xxx
  name: string;
  email: string;
  role: UserRole;
  grade?: string;
  rollNo?: string;
  streakDays: number;
  xp: number;
  avatarUrl: string;
  language: 'EN' | 'HI' | 'MR';
  createdAt: string;
  studentIds?: string[];
  parentIds?: string[];
}

const UserSchema: Schema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  role: { type: String, required: true, enum: ['student', 'teacher', 'parent'] },
  grade: { type: String },
  rollNo: { type: String },
  streakDays: { type: Number, default: 0 },
  xp: { type: Number, default: 0 },
  avatarUrl: { type: String },
  language: { type: String, enum: ['EN', 'HI', 'MR'], default: 'EN' },
  createdAt: { type: String, required: true },
  studentIds: [{ type: String }],
  parentIds: [{ type: String }],
});

export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

// Retain type alias for backward compatibility where User was just the object interface
export type User = Omit<IUser, keyof Document>;
