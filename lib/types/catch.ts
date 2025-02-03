import { z } from 'zod';

export const ICatchSchema = z.object({
  species: z.string().min(1, "Species is required"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  length: z.number().positive("Length must be greater than 0").optional().nullable(),
  weight: z.number().positive("Weight must be greater than 0").optional().nullable(),
  lure: z.string().optional().nullable(),
  location: z.object({
    bodyOfWater: z.string().min(1, "Body of water is required"),
    spot: z.string().optional().nullable(),
    coordinates: z.string().optional().nullable(),
  }),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)"),
  caughtBy: z.object({
    name: z.string().min(1, "Name is required"),
    lastName: z.string().nullable().optional(),
    username: z.string().nullable().optional(),
    userId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid user ID").nullable().optional(),
  }),
  images: z
    .array(
      z.object({
        publicId: z.string().min(1, "Public ID is required"),
        description: z.string().optional().nullable(),
      })
    )
    .optional(),
  createdBy: z.string().regex(/^[a-f\d]{24}$/i, "Invalid user ID").nullable().optional(),
  createdAt: z.date().optional().nullable(),
  id: z.string().optional(),
  catchNumber: z.number().positive(),
  comment: z.string().optional().nullable(),
});

// Infer the TypeScript type from the Zod schema
export type ICatch = z.infer<typeof ICatchSchema>;
