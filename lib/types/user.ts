import { z } from 'zod';

export enum UserRole {
  SUPERADMIN = 'superadmin',
  ADMIN = 'admin',
  EDITOR = 'editor',
  TRUSTED_CREATOR = 'trusted_creator',
  CREATOR = 'creator',
  VIEWER = 'viewer',
}

export const editorRoles = [
  UserRole.SUPERADMIN,
  UserRole.ADMIN,
  UserRole.EDITOR,
];

export const adminRoles = [
  UserRole.SUPERADMIN,
  UserRole.ADMIN,
];

export const creatorRoles = [
  UserRole.TRUSTED_CREATOR,
  UserRole.CREATOR,
];

export const allRoles = [
  UserRole.SUPERADMIN,
  UserRole.ADMIN,
  UserRole.EDITOR,
  UserRole.TRUSTED_CREATOR,
  UserRole.CREATOR,
  UserRole.VIEWER,
];

// Define the UserRole schema
export const UserRoleSchema = z.enum([
  UserRole.SUPERADMIN,
  UserRole.ADMIN,
  UserRole.EDITOR,
  UserRole.TRUSTED_CREATOR,
  UserRole.CREATOR,
  UserRole.VIEWER,
]);


// Define the IUser schema
export const IUserSchema = z.object({
  username: z
    .string()
    .min(2, "Username is required")
    .max(30, "Username cannot exceed 30 characters"),
  firstName: z
    .string()
    .min(2, "First name is required")
    .max(50, "First name cannot exceed 50 characters"),
  lastName: z
    .string()
    .min(2, "Last name is required")
    .max(50, "Last name cannot exceed 50 characters"),
  email: z
    .string()
    .email("Invalid email address")
    .max(100, "Email cannot exceed 100 characters"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .max(100, "Password cannot exceed 100 characters"),
  role: UserRoleSchema.optional(),
  profilePictureUrl: z
    .string()
    .url("Invalid URL")
    .max(200, "Profile picture URL cannot exceed 200 characters")
    .optional(),
  createdAt: z.date().optional(), // ISO date string for creation timestamp
  id: z.string().optional(),
});

// Infer the TypeScript type from the schema
export type IUser = z.infer<typeof IUserSchema>;
