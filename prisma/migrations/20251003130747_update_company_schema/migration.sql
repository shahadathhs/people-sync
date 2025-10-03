/*
  Warnings:

  - You are about to drop the column `branchId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `companyId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `departmentId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `PrivateCall` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PrivateCallParticipant` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."PrivateCall" DROP CONSTRAINT "PrivateCall_conversationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PrivateCall" DROP CONSTRAINT "PrivateCall_initiatorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PrivateCallParticipant" DROP CONSTRAINT "PrivateCallParticipant_callId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PrivateCallParticipant" DROP CONSTRAINT "PrivateCallParticipant_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."users" DROP CONSTRAINT "users_branchId_fkey";

-- DropForeignKey
ALTER TABLE "public"."users" DROP CONSTRAINT "users_companyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."users" DROP CONSTRAINT "users_departmentId_fkey";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "branchId",
DROP COLUMN "companyId",
DROP COLUMN "departmentId";

-- DropTable
DROP TABLE "public"."PrivateCall";

-- DropTable
DROP TABLE "public"."PrivateCallParticipant";

-- CreateTable
CREATE TABLE "private_call" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "initiatorId" TEXT NOT NULL,
    "type" "CallType" NOT NULL,
    "status" "CallStatus" NOT NULL DEFAULT 'INITIATED',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "private_call_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "private_call_participant" (
    "id" TEXT NOT NULL,
    "callId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "CallParticipantStatus" NOT NULL DEFAULT 'JOINED',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),

    CONSTRAINT "private_call_participant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- AddForeignKey
ALTER TABLE "private_call" ADD CONSTRAINT "private_call_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "private_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "private_call" ADD CONSTRAINT "private_call_initiatorId_fkey" FOREIGN KEY ("initiatorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "private_call_participant" ADD CONSTRAINT "private_call_participant_callId_fkey" FOREIGN KEY ("callId") REFERENCES "private_call"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "private_call_participant" ADD CONSTRAINT "private_call_participant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
