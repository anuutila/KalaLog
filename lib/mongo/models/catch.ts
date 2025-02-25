import { ICatch } from '@lib/types/catch';
import mongoose, { Document, Schema } from 'mongoose';
import { DEFAULT_BODY_OF_WATER } from '@/lib/constants/constants';
import { capitalizeFirstLetter } from '@/lib/utils/utils';

export interface ICatchModel extends Document, Omit<ICatch, 'id'> {}

export const CatchSchema = new Schema<ICatchModel>({
  species: { type: String, required: true, trim: true, set: (value: string) => capitalizeFirstLetter(value) },
  date: { type: String, required: true },
  length: { type: Number, required: false, default: null },
  weight: { type: Number, required: false, default: null },
  lure: {
    type: String,
    required: false,
    default: null,
    trim: true,
    set: (value: string | null) => (value === '' ? null : capitalizeFirstLetter(value)),
  },
  location: {
    bodyOfWater: {
      type: String,
      required: true,
      default: DEFAULT_BODY_OF_WATER,
      trim: true,
      set: (value: string) => capitalizeFirstLetter(value),
    },
    spot: {
      type: String,
      required: false,
      default: null,
      trim: true,
      set: (value: string | null) => (value === '' ? null : capitalizeFirstLetter(value)),
    },
    coordinates: {
      type: String,
      required: false,
      default: null,
      trim: true,
      set: (value: string | null) => (value === '' ? null : value),
    },
  },
  time: { type: String, required: true },
  caughtBy: {
    name: { type: String, required: true, trim: true, set: (value: string) => capitalizeFirstLetter(value) },
    lastName: {
      type: String,
      required: false,
      default: null,
      trim: true,
      set: (value: string | null) => (value === '' ? null : capitalizeFirstLetter(value)),
    },
    username: {
      type: String,
      required: false,
      default: null,
      trim: true,
      set: (value: string | null) => (value === '' ? null : value),
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, required: false },
  },
  images: [
    {
      publicId: { type: String, required: false, default: null, trim: true },
      description: {
        type: String,
        required: false,
        default: null,
        trim: true,
        set: (value: string | null) => (value === '' ? null : capitalizeFirstLetter(value)),
      },
    },
  ],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false, default: null },
  createdAt: { type: Date, default: Date.now },
  catchNumber: { type: Number, required: true, unique: true },
  comment: {
    type: String,
    required: false,
    default: null,
    trim: true,
    set: (value: string | null) => (value === '' ? null : capitalizeFirstLetter(value)),
  },
});

const Catch = mongoose.models.Catch || mongoose.model<ICatchModel>('Catch', CatchSchema);

export default Catch;
