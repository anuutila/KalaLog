import mongoose, { Schema, Document } from 'mongoose';
import { IUser, UserRole } from '@lib/types/user';
import { capitalizeFirstLetter } from '@/lib/utils/utils';

interface IUserModel extends Document, Omit<IUser, 'id'> {}

const UserSchema: Schema<IUserModel> = new Schema({
  username: { type: String, required: true, unique: true, trim: true },
  firstName: { type: String, required: true, set: (value: string) => capitalizeFirstLetter(value), trim: true },
  lastName: { type: String, required: true, set: (value: string) => capitalizeFirstLetter(value), trim: true },
  email: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: UserRole, default: UserRole.VIEWER },
  profilePictureUrl: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.models.User || mongoose.model<IUserModel>('User', UserSchema);

export default User;