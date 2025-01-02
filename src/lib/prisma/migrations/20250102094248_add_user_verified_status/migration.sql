-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isVerifiedEmail" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isVerifiedPhone" BOOLEAN NOT NULL DEFAULT false;
