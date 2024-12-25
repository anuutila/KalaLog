import mongoose, { Schema, Document } from 'mongoose';
import { IUser, UserRole } from '@lib/types/user';
import { capitalizeFirstLetter } from '@/lib/utils/utils';

interface IUserModel extends Document, Omit<IUser, 'id'> {}

const UserSchema: Schema<IUserModel> = new Schema({
  username: { type: String, required: true, unique: true },
  firstName: { type: String, required: true, set: (value: string) => capitalizeFirstLetter(value) },
  lastName: { type: String, required: true, set: (value: string) => capitalizeFirstLetter(value) },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: UserRole, default: UserRole.VIEWER },
  profilePictureUrl: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.models.User || mongoose.model<IUserModel>('User', UserSchema);

export default User;