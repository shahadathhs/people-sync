/*
  Warnings:

  - Added the required column `address` to the `branches` table without a default value. This is not possible if the table is not empty.
  - Added the required column `latitude` to the `branches` table without a default value. This is not possible if the table is not empty.
  - Added the required column `longitude` to the `branches` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "branches" ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "latitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "longitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "radiusMeters" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "timezone" TEXT NOT NULL DEFAULT 'UTC';
