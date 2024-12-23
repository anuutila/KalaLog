import mongoose, { Schema, Document } from 'mongoose';
import { ICatch } from '@lib/types/catch';

interface ICatchModel extends Document, Omit<ICatch, 'id'> {}

const CatchSchema: Schema<ICatchModel> = new Schema({
  species: { type: String, required: true },
  date: { type: String, required: true },
  length: { type: Number, required: false, default: null },
  weight: { type: Number, required: false, default: null },
  lure: { type: String, required: false, default: null, set: (value: string | null) => (value === "" ? null : value) },
  location: {
    bodyOfWater: { type: String, required: true, default: 'Nerkoonjärvi' },
    spot: { type: String, required: false, default: null, set: (value: string | null) => (value === "" ? null : value) },
    coordinates: { type: String, required: false, default: null, set: (value: string | null) => (value === "" ? null : value) },
  },
  time: { type: String, required: true },
  caughtBy: {
    name: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, required: false },
  },
  images: [
    {
      url: { type: String, required: false, default: null },
      description: { type: String, required: false, default: null, set: (value: string | null) => (value === "" ? null : value) },
    },
  ],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false, default: null },
  createdAt: { type: Date, default: Date.now },
});

const Catch = mongoose.models.Catch || mongoose.model<ICatchModel>('Catch', CatchSchema);

export default Catch;