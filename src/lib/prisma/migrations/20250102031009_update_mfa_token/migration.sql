/*
  Warnings:

  - Added the required column `type` to the `MFAToken` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `provider` on the `MFAToken` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "MFATokenType" AS ENUM ('ChangePassword');

-- AlterTable
ALTER TABLE "MFAToken" ADD COLUMN     "type" "MFATokenType" NOT NULL,
DROP COLUMN "provider",
ADD COLUMN     "provider" "MFAProvider" NOT NULL;

-- CreateIndex
CREATE INDEX "MFAToken_userId_provider_idx" ON "MFAToken"("userId", "provider");

-- CreateIndex
CREATE INDEX "MFAToken_userId_type_idx" ON "MFAToken"("userId", "type");
