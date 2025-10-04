-- CreateEnum
CREATE TYPE "BadgeCategory" AS ENUM ('MILESTONE', 'GOOD_JOB', 'ANNIVERSARY', 'PROMOTION', 'ACHIEVEMENT', 'AWARD', 'RECOGNITION');

-- CreateEnum
CREATE TYPE "Reaction" AS ENUM ('LIKE', 'LOVE_FACE', 'SMILE_FACE', 'WOW_FACE', 'SAD_FACE', 'CELEBRATION');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "companyId" TEXT;

-- CreateTable
CREATE TABLE "badges" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" "BadgeCategory" NOT NULL,
    "companyId" TEXT NOT NULL,
    "iconImageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recognitions" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "shouldNotify" BOOLEAN NOT NULL DEFAULT true,
    "companyId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recognitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recognition_users" (
    "id" TEXT NOT NULL,
    "recognitionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recognition_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recognition_comments" (
    "id" TEXT NOT NULL,
    "comment" TEXT,
    "reaction" "Reaction",
    "recognitionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "parentCommentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recognition_comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "recognition_users_recognitionId_userId_key" ON "recognition_users"("recognitionId", "userId");

-- AddForeignKey
ALTER TABLE "badges" ADD CONSTRAINT "badges_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "badges" ADD CONSTRAINT "badges_iconImageId_fkey" FOREIGN KEY ("iconImageId") REFERENCES "file_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recognitions" ADD CONSTRAINT "recognitions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recognitions" ADD CONSTRAINT "recognitions_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "badges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recognition_users" ADD CONSTRAINT "recognition_users_recognitionId_fkey" FOREIGN KEY ("recognitionId") REFERENCES "recognitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recognition_users" ADD CONSTRAINT "recognition_users_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recognition_comments" ADD CONSTRAINT "recognition_comments_recognitionId_fkey" FOREIGN KEY ("recognitionId") REFERENCES "recognitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recognition_comments" ADD CONSTRAINT "recognition_comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recognition_comments" ADD CONSTRAINT "recognition_comments_parentCommentId_fkey" FOREIGN KEY ("parentCommentId") REFERENCES "recognition_comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
