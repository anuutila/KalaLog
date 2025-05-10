import { z } from 'zod';

const PopulatedUserSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid user ID'),
  username: z.string(),
  firstName: z.string(),
  lastName: z.string(),
}).nullable();

const BaseEventSchema = z.object({
  id: z.string(),
  name: z.string().min(3, 'Event name must be at least 3 characters long'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid start date format (YYYY-MM-DD)'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid end date format (YYYY-MM-DD)'),
  participants: z.array(PopulatedUserSchema),
  unregisteredParticipants: z.array(z.string().min(1, "Participant name cannot be empty")).optional(),
  bodiesOfWater: z.array(z.string().min(1, "Body of water name cannot be empty"))
    .min(1, "At least one body of water is required"),
  createdBy: PopulatedUserSchema,
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const IEventSchema = BaseEventSchema.refine(
  (data) => {
    if (!data || !data.endDate || !data.startDate) return true;
    return data.endDate >= data.startDate;
  }, {
  message: "End date cannot be earlier than start date",
  path: ["endDate"],
});

export type IPopulatedEventUserSchema = z.infer<typeof PopulatedUserSchema>;

// Infer the main TypeScript type from the final refined schema
export type IEvent = z.infer<typeof IEventSchema>;

// Create the specific Input Schema for the POST request body
export const CreateEventInputSchema = BaseEventSchema.omit({
  // Omit fields not expected in input or set by server
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  participants: true,
  unregisteredParticipants: true,
}).extend({
  participants: z.array(z.string().regex(/^[a-f\d]{24}$/i, 'Invalid user ID')),
  unregisteredParticipants: z.array(z.string().min(1, "Participant name cannot be empty")).optional()
}).refine(data => data.participants.length > 0 || (data.unregisteredParticipants && data.unregisteredParticipants.length > 0), {
  message: "At least one registered or unregistered participant is required",
  path: ["participants"],
});

// Infer the type for the input data structure
export type CreateEventData = z.infer<typeof CreateEventInputSchema>;

// Helper type for the shape returned directly by Mongoose populate
export type PopulatedUserDetails = {
  _id: { toString: () => string };
  username?: string;
  firstName?: string;
  lastName?: string;
} | null;

export type PopulatedEvent = {
  _id?: { toString: () => string };
  name?: string;
  startDate?: string;
  endDate?: string;
  participants?: PopulatedUserDetails[];
  unregisteredParticipants?: string[];
  createdBy?: PopulatedUserDetails;
  bodiesOfWater?: string[];
  createdAt?: Date;
  updatedAt?: Date;
};