/*
  Warnings:

  - The values [PasswordRecovery] on the enum `VerificationType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "VerificationType_new" AS ENUM ('Email', 'Phone', 'PasswordRecoveryByEmail', 'PasswordRecoveryByPhone', 'EmailChange', 'PhoneChange');
ALTER TABLE "Verification" ALTER COLUMN "type" TYPE "VerificationType_new" USING ("type"::text::"VerificationType_new");
ALTER TYPE "VerificationType" RENAME TO "VerificationType_old";
ALTER TYPE "VerificationType_new" RENAME TO "VerificationType";
DROP TYPE "VerificationType_old";
COMMIT;
