import { z } from "zod";

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  metadata: z.any().optional(),
  isAnonymous: z.boolean().optional(),
  bannedAt: z.string().datetime().optional(),
  bannedUntil: z.string().datetime().optional(),
  bannedReason: z.string().optional(),
  createdAt: z.string().datetime().optional(),
});

export const signInWithCredentialsResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  sessionId: z.string(),
});

export const generateSignInDataResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  sessionId: z.string(),
});

export const refreshTokenResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export const sessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  refreshToken: z.string(),
  deviceId: z.string(),
  ipAddress: z.string(),
  userAgent: z.string(),
  lastUsedAt: z.string().datetime(),
  expiresAt: z.string().datetime(),
  revokedAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
});

export const listSessionSchema = z.array(sessionSchema);

export const updateMFASettingsResponseSchema = z.object({
  totpSecret: z.string().optional(),
  backupKey: z.string().optional(),
});
