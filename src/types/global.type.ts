import "hono";

declare global {
  namespace PrismaJson {
    type VerificationData = {
      emailChange?: string;
      phoneChange?: string;
    };
  }
}
