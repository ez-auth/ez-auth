import type { User as PrismaUser } from "@prisma/client";

export type UserWithoutPassword = Omit<PrismaUser, "password">;

export enum IdentityProvider {
  Google = "Google",
  Github = "Github",
}

export enum CredentialsType {
  Email = "Email",
  Phone = "Phone",
}
