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
  time: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)").optional(),
  caughtBy: z.object({
    name: z.string().min(1, "Name is required"),
    userId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid user ID").nullable().optional(),
  }),
  images: z
    .array(
      z.object({
        url: z.string().url("Invalid image URL"),
        description: z.string().optional().nullable(),
      })
    )
    .optional(),
  createdBy: z.string().optional().nullable(),
  createdAt: z.date().optional().nullable(),
  id: z.string().optional(),
});

// Infer the TypeScript type from the Zod schema
export type ICatch = z.infer<typeof ICatchSchema>;



// export interface ICatch {
//   species: string; // Fish species
//   length?: number; // Length of the fish
//   weight?: number; // Weight of the fish
//   lure?: string; // Lure used
//   date: string; // Date of the catch
//   time: string; // Time of the catch
//   location: {
//     bodyOfWater: string; // Lake, sea, or river name
//     spot?: string; // Specific spot on the body of water
//     coordinates?: string; // GPS coordinates
//   };
//   caughtBy: {
//     name: string; // First name of the person who caught the fish
//     userId?: string | null; // Links to a registered user if available
//   };
//   images?: {
//     url: string;
//     description?: string;
//   }[]; // Array for images
//   createdBy?: string; // ID of the user who created the entry
//   createdAt?: string; // Timestamp of entry creation
//   id?: string; // ID of the catch
// }