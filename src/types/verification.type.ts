import { VerificationType } from "@prisma/client";

export const EMAIL_BASE_TYPES: VerificationType[] = [
  "Email",
  "PasswordRecoveryByEmail",
  "EmailChange",
];

export const PHONE_BASE_TYPES: VerificationType[] = [
  "Phone",
  "PasswordRecoveryByPhone",
  "PhoneChange",
];

export type VerificationData = {
  emailChange?: string;
  phoneChange?: string;
};
