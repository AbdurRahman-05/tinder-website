import { z } from 'zod';
import { calculateAge } from './auth.validator';

export const INCLUSIVE_GENDERS = [
  'Woman',
  'Man',
  'Non-binary',
  'Trans woman',
  'Trans man',
  'Genderqueer',
  'Genderfluid',
  'Agender',
  'Other',
  'Prefer not to say',
] as const;

export const LOOKING_FOR_OPTIONS = [
  'Friendship',
  'Dating',
  'Relationship',
  'Community',
  'Networking',
  'Chatting',
  'Other',
] as const;

export const createProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name cannot exceed 50 characters').trim(),
  dateOfBirth: z.string().refine((val) => {
    const dob = new Date(val);
    if (isNaN(dob.getTime())) return false;
    return calculateAge(dob) >= 18;
  }, 'You must be at least 18 years old.'),
  gender: z.string().min(1, 'Please select a gender identity'),
  customGender: z.string().max(40).optional(),
  pronouns: z.string().max(30).optional(),
  lookingFor: z.array(z.string()).min(1, 'Select at least one "Looking For" category'),
  bio: z.string().min(10, 'Bio must be at least 10 characters').max(500, 'Bio cannot exceed 500 characters').trim(),
  location: z.string().max(100, 'Location is too long').optional(),
  whatsapp: z
    .string()
    .regex(/^$|^\+?[1-9]\d{6,14}$/, 'Please enter a valid international phone number with country code (e.g. +14155552671)')
    .optional()
    .nullable(),
  whatsappVisible: z.boolean().default(false),
  instagram: z
    .string()
    .regex(/^$|^[a-zA-Z0-9._]{1,30}$/, 'Invalid Instagram handle')
    .optional()
    .nullable(),
  instagramVisible: z.boolean().default(false),
  visibility: z.enum(['PUBLIC', 'HIDDEN']).default('PUBLIC'),
  photoUrl: z.string().url().optional(),
});

export const updateProfileSchema = createProfileSchema.partial();

export const profileSearchQuerySchema = z.object({
  q: z.string().optional(),
  gender: z.string().optional(),
  lookingFor: z.string().optional(), // can be comma-separated or single
  minAge: z.coerce.number().min(18).max(100).optional(),
  maxAge: z.coerce.number().min(18).max(100).optional(),
  location: z.string().optional(),
  isVerified: z.enum(['true', 'false']).optional(),
  sort: z.enum(['newest', 'updated', 'alphabetical']).default('newest'),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(60).default(20),
});
