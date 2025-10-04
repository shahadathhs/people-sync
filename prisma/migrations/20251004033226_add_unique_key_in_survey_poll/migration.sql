/*
  Warnings:

  - A unique constraint covering the columns `[assignmentId,userId]` on the table `assignment_targets` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,pollId]` on the table `poll_responses` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,questionId]` on the table `survey_responses` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "assignment_targets_assignmentId_userId_key" ON "assignment_targets"("assignmentId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "poll_responses_userId_pollId_key" ON "poll_responses"("userId", "pollId");

-- CreateIndex
CREATE UNIQUE INDEX "survey_responses_userId_questionId_key" ON "survey_responses"("userId", "questionId");
