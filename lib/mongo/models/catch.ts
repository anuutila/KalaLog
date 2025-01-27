import mongoose, { Schema, Document } from 'mongoose';
import { ICatch } from '@lib/types/catch';
import { capitalizeFirstLetter } from '@/lib/utils/utils';

export interface ICatchModel extends Document, Omit<ICatch, 'id'> {}

export const CatchSchema: Schema<ICatchModel> = new Schema({
  species: { type: String, required: true, set: (value: string) => capitalizeFirstLetter(value) },
  date: { type: String, required: true },
  length: { type: Number, required: false, default: null },
  weight: { type: Number, required: false, default: null },
  lure: { type: String, required: false, default: null, set: (value: string | null) => (value === "" ? null : capitalizeFirstLetter(value)) },
  location: {
    bodyOfWater: { type: String, required: true, default: 'Nerkoonjärvi', set: (value: string) => capitalizeFirstLetter(value) },
    spot: { type: String, required: false, default: null, set: (value: string | null) => (value === "" ? null : capitalizeFirstLetter(value)) },
    coordinates: { type: String, required: false, default: null, set: (value: string | null) => (value === "" ? null : value) },
  },
  time: { type: String, required: true },
  caughtBy: {
    name: { type: String, required: true, set: (value: string) => capitalizeFirstLetter(value) },
    username: { type: String, required: false, default: null, set: (value: string | null) => (value === "" ? null : value) },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, required: false },
  },
  images: [
    {
      publicId: { type: String, required: false, default: null },
      description: { type: String, required: false, default: null, set: (value: string | null) => (value === "" ? null : capitalizeFirstLetter(value)) },
    },
  ],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false, default: null },
  createdAt: { type: Date, default: Date.now },
  catchNumber: { type: Number, required: true, unique: true },
  comment: { type: String, required: false, default: null, set: (value: string | null) => (value === "" ? null : capitalizeFirstLetter(value)) }
});

const Catch = mongoose.models.Catch || mongoose.model<ICatchModel>('Catch', CatchSchema);

export default Catch;