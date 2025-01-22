-- CreateEnum
CREATE TYPE "ClientApiKeyType" AS ENUM ('Public', 'Admin');

-- CreateTable
CREATE TABLE "ClientApiKey" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "type" "ClientApiKeyType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClientApiKey_key_key" ON "ClientApiKey"("key");
