import { IUser, UserRole } from '@lib/types/user';
import mongoose, { Document, Schema } from 'mongoose';
import { capitalizeFirstLetter } from '@/lib/utils/utils';

interface IUserModel extends Document, Omit<IUser, 'id'> {}

const UserSchema = new Schema<IUserModel>({
  username: { type: String, required: true, unique: true, trim: true },
  firstName: { type: String, required: true, set: (value: string) => capitalizeFirstLetter(value), trim: true },
  lastName: { type: String, required: true, set: (value: string) => capitalizeFirstLetter(value), trim: true },
  email: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: UserRole, required: true, default: UserRole.CREATOR },
  profilePictureUrl: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.models.User || mongoose.model<IUserModel>('User', UserSchema);

export default User;
