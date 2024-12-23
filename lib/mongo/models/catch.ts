import mongoose, { Schema, Document } from 'mongoose';
import { ICatch } from '@lib/types/catch';

interface ICatchModel extends Document, Omit<ICatch, 'id'> {}

const CatchSchema: Schema<ICatchModel> = new Schema({
  species: { type: String, required: true },
  date: { type: String, required: true },
  length: { type: Number, required: false },
  weight: { type: Number, required: false },
  lure: { type: String, required: false },
  location: {
    bodyOfWater: { type: String, required: true, default: 'Nerkoonjärvi' },
    spot: { type: String, required: false },
    coordinates: { type: String, required: false },
  },
  time: { type: String, required: true },
  caughtBy: {
    name: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  images: [
    {
      url: { type: String, required: true },
      description: { type: String, required: false },
    },
  ],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  createdAt: { type: Date, default: Date.now },
});

const Catch = mongoose.models.Catch || mongoose.model<ICatchModel>('Catch', CatchSchema);

export default Catch;