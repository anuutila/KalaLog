import mongoose, { Document, Schema, Types } from 'mongoose';

interface IPushSubscriptionKeys {
  p256dh: string;
  auth: string;
}

interface IPushSubscriptionObject {
  endpoint: string;
  expirationTime?: number | null;
  keys: IPushSubscriptionKeys;
}

// Document in MongoDB
export interface IPushSubscriptionModel extends Document {
  userId: Types.ObjectId;
  subscriptionObject: IPushSubscriptionObject;
  createdAt: Date;
}

const PushSubscriptionKeysSchema = new Schema<IPushSubscriptionKeys>({
  p256dh: { type: String, required: true },
  auth: { type: String, required: true },
}, { _id: false });

const PushSubscriptionObjectSchema = new Schema<IPushSubscriptionObject>({
  endpoint: { type: String, required: true, unique: true },
  expirationTime: { type: Number, default: null },
  keys: { type: PushSubscriptionKeysSchema, required: true },
}, { _id: false });

const PushSubscriptionSchema = new Schema<IPushSubscriptionModel>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  subscriptionObject: { type: PushSubscriptionObjectSchema, required: true },
  createdAt: { type: Date, default: Date.now },
});

PushSubscriptionSchema.index({ userId: 1 });

const PushSubscription = mongoose.models.PushSubscription || mongoose.model<IPushSubscriptionModel>('PushSubscription', PushSubscriptionSchema);

export default PushSubscription;