/*
  Warnings:

  - The primary key for the `SystemSetting` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `SystemSetting` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "SystemSetting" DROP CONSTRAINT "SystemSetting_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" INTEGER NOT NULL DEFAULT 1,
ADD CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("id");
