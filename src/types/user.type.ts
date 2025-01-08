import type { MFASettings, OAuthConnection, User as PrismaUser } from "@prisma/client";

export type AuthUser = PrismaUser & {
  mfaSettings: Pick<MFASettings, "enabledTOTP" | "enabledEmail" | "enabledSMS"> | null;
  oAuthConnections: OAuthConnection[];
};

export enum OAuthProvider {
  Google = "Google",
  Github = "Github",
}

export enum CredentialsType {
  Email = "Email",
  Phone = "Phone",
}
