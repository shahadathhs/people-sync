/*
  Warnings:

  - You are about to drop the column `breakTime` on the `payrolls` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "payrolls" DROP COLUMN "breakTime",
ADD COLUMN     "breakTimeInMinutes" INTEGER NOT NULL DEFAULT 0;

-- DropEnum
DROP TYPE "public"."BreakTime";
