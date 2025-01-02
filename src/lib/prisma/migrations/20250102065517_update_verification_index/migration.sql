-- DropIndex
DROP INDEX "Verification_token_type_idx";

-- DropIndex
DROP INDEX "Verification_userId_idx";

-- CreateIndex
CREATE INDEX "Verification_token_type_userId_idx" ON "Verification"("token", "type", "userId");
