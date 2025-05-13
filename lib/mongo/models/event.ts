import mongoose, { Document, Schema, Types } from 'mongoose';
import { IEvent } from '@lib/types/event'; // Adjust path if needed
import { capitalizeFirstLetter } from '@/lib/utils/utils';

interface IEventModel extends Document, Omit<IEvent, 'id' | 'createdAt' | 'updatedAt' | 'participants' | 'createdBy'> {
  participants: Types.ObjectId[];
  createdBy: Types.ObjectId;
}

const EventSchema = new Schema<IEventModel>(
  {
    name: { type: String, required: true, trim: true, set: (value: string) => capitalizeFirstLetter(value) },
    startDate: { type: String, required: true }, // Store as YYYY-MM-DD string
    endDate: { type: String, required: true },   // Store as YYYY-MM-DD string
    participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    unregisteredParticipants: [{ type: String, default: [] }],
    bodiesOfWater: [{ type: String, required: true }],
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
        coverImage: { type: Boolean, default: false },
        publicAccess: { type: Boolean, default: false },
        signedUrl: { type: String, required: false, default: null, trim: true },
      },
    ],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
  }
);

// Add index for potentially faster date range queries
EventSchema.index({ startDate: 1, endDate: 1 });

const Event = mongoose.models.Event || mongoose.model<IEventModel>('Event', EventSchema);

export default Event;