import type { Identity, MFASettings, User as PrismaUser } from "@prisma/client";

export type AuthUser = PrismaUser & {
  mfaSettings: Pick<MFASettings, "enabledTOTP" | "enabledEmail" | "enabledSMS"> | null;
  identities: Identity[];
};

export enum IdentityProvider {
  Google = "Google",
  Github = "Github",
}

export enum CredentialsType {
  Email = "Email",
  Phone = "Phone",
}

export enum SendVerificationType {
  Email = "Email",
  SMS = "SMS",
  TOTP = "TOTP",
}
