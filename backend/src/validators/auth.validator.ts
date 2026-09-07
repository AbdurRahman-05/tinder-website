import { z } from 'zod';

// Helper to calculate exact age from birth date
export const calculateAge = (dob: Date): number => {
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
};

export const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address').toLowerCase().trim(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  dateOfBirth: z.string().refine((val) => {
    const dob = new Date(val);
    if (isNaN(dob.getTime())) return false;
    const age = calculateAge(dob);
    return age >= 18;
  }, 'You must be at least 18 years of age to register on PRISM.'),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: 'You must agree to the Terms of Service and Community Guidelines.' }),
  }),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
});

export const resetPasswordSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[0-9]/, 'Must contain number'),
});
