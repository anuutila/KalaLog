import mongoose, { Schema, Document, Types } from "mongoose";

interface ITier {
  tier: number;
  dateUnlocked?: Date | null;
  bonus?: boolean;
}

interface IAchievementDocument extends Document {
  userId: Types.ObjectId;
  key: string;
  progress: number;
  totalXP: number;
  unlocked: boolean;
  isOneTime: boolean;
  // Fields for tiered achievements (isOneTime === false)
  currentTier?: number;
  tiers?: ITier[];
  // Field for one-time achievements (isOneTime === true)
  dateUnlocked?: Date | null;
}

const TierSchema = new Schema<ITier>(
  {
    tier: { type: Number, required: true, min: 1 },
    dateUnlocked: { type: Date, default: null },
    bonus: { type: Boolean, default: false },
  },
  { _id: false }
);

const AchievementSchema = new Schema<IAchievementDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    key: { type: String, required: true },
    progress: { type: Number, required: true, default: 0 },
    totalXP: { type: Number, required: true, default: 0 },
    unlocked: { type: Boolean, required: true, default: false },
    isOneTime: { type: Boolean, required: true },
    // Tiered achievement fields (for isOneTime: false)
    currentTier: { type: Number, min: 0 },
    tiers: { type: [TierSchema], default: [] },
    // One-time achievement field (for isOneTime: true)
    dateUnlocked: { type: Date, default: null },
  },
  {
    timestamps: true, // adds createdAt and updatedAt fields
  }
);
// Create an index for efficient querying
AchievementSchema.index({ userId: 1, key: 1 }, { unique: true });

const Achievement = mongoose.models.Achievement || mongoose.model<IAchievementDocument>('Achievement', AchievementSchema);

export default Achievement;