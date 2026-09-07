import { z } from 'zod';

export const reportSchema = z.object({
  reason: z.enum([
    'SPAM',
    'FAKE_PROFILE',
    'HARASSMENT',
    'INAPPROPRIATE_CONTENT',
    'IMPERSONATION',
    'SCAM',
    'OFFENSIVE_CONTENT',
    'OTHER',
  ]),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
});
