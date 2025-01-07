import { config } from "@/config/config";
import { z } from "zod";

export const booleanStringSchema = z
  .preprocess((val) => val === "true", z.boolean())
  .default(false);

export const createPasswordSchema = ({
  minLength = 8,
  maxLength = 32,
  requireDigit = false,
  requireUppercase = false,
  requireLowercase = false,
  requireSymbol = false,
}: {
  minLength?: number;
  maxLength?: number;
  requireDigit?: boolean;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireSymbol?: boolean;
} = {}) => {
  let schema: z.ZodType<string> = z.string().min(minLength).max(maxLength);

  if (requireDigit) {
    schema = schema.refine((value) => /[0-9]/.test(value), {
      message: "Password must contain at least one digit",
    });
  }

  if (requireUppercase) {
    schema = schema.refine((value) => /[A-Z]/.test(value), {
      message: "Password must contain at least one uppercase letter",
    });
  }

  if (requireLowercase) {
    schema = schema.refine((value) => /[a-z]/.test(value), {
      message: "Password must contain at least one lowercase letter",
    });
  }

  if (requireSymbol) {
    schema = schema.refine((value) => /[\W_]/.test(value), {
      message: "Password must contain at least one symbol",
    });
  }

  return schema;
};
