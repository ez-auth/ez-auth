/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `MFAToken` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "MFAToken_userId_type_idx";

-- AlterTable
ALTER TABLE "MFAToken" DROP COLUMN "updatedAt",
ALTER COLUMN "token" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "MFAToken_userId_type_provider_idx" ON "MFAToken"("userId", "type", "provider");
