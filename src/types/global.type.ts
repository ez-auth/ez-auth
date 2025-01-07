import "hono";

declare global {
  namespace PrismaJson {
    type VerificationData = {
      emailChange?: string;
      phoneChange?: string;
    };

    type UserMetadata = {
      role: "user" | "superadmin";
      [key: string]: any;
    };
  }
}
