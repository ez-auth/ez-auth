import { z } from "zod";

import { logger } from "@/lib/logger";

const envSchema = z.object({
  // App
  ISSUER: z.string().default("EzAuth"),

  // Server
  API_HOST: z.string().default("localhost"),
  API_PORT: z.coerce.number().default(25000),
  API_URL: z.string().url().default("http://localhost:25000"),

  // Client
  CLIENT_REDIRECT_URL: z.string().url().default("http://localhost:3000/oauth"),

  // Database
  DATABASE_URL: z.string(),

  // JWT
  JWT_SECRET: z.string(),
  JWT_EXPIRY: z.coerce.number().default(3600),

  // Mailer
  MAILER_ENABLED: z.coerce.boolean().default(true),
  MAILER_PROVIDER: z.enum(["SMTP", "Mailgun"]).optional(),
  MAILER_SENDER_NAME: z.string().default("EzAuth"),

  // Mailgun
  MAILGUN_API_KEY: z.string().optional(),
  MAILGUN_DOMAIN: z.string().optional(),

  // SMTP
  SMTP_SENDER_EMAIL: z.string().email().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),

  // SMS
  SMS_ENABLED: z.coerce.boolean().default(false),
  SMS_PROVIDER: z.enum(["Twilio"]).optional(),

  // Twilio
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),

  // Password
  PASSWORD_MIN_LENGTH: z.coerce.number().default(8),
  PASSWORD_MAX_LENGTH: z.coerce.number().default(32),
  CHANGE_PASSWORD_REQUIRES_MFA: z.coerce.boolean().default(false),

  // Session
  SESSION_EXPIRY: z.coerce.number().default(60 * 60 * 24 * 30),

  // Verification
  VERIFICATION_EXPIRY: z.coerce.number().default(60 * 60),
  VERIFICATION_RESEND_DELAY: z.coerce.number().default(60 * 3),
  VERIFICATION_CODE_LENGTH: z.coerce.number().default(6),

  // MFA
  MFA_EXPIRY: z.coerce.number().default(60 * 5),

  // Github
  GITHUB_ENABLED: z.coerce.boolean().default(false),
  GITHUB_CLIENT_ID: z.string().default(""),
  GITHUB_CLIENT_SECRET: z.string().default(""),

  // Google
  GOOGLE_ENABLED: z.coerce.boolean().default(false),
  GOOGLE_CLIENT_ID: z.string().default(""),
  GOOGLE_CLIENT_SECRET: z.string().default(""),
});

const parseConfig = () => {
  const parsed = envSchema.safeParse(Bun.env);

  if (!parsed.success) {
    logger.error(
      `❌ Invalid environment variables: \n${JSON.stringify(parsed.error.format(), null, 2)}`,
    );
    process.exit(1);
  }

  parsed.data.MAILER_ENABLED = !!parsed.data.MAILER_PROVIDER;
  parsed.data.SMS_ENABLED = !!parsed.data.SMS_PROVIDER;

  return parsed.data;
};

export type Config = z.infer<typeof envSchema>;

export const config: Config = parseConfig();
