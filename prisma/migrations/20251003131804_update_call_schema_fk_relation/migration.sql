-- DropForeignKey
ALTER TABLE "public"."private_call" DROP CONSTRAINT "private_call_initiatorId_fkey";

-- AddForeignKey
ALTER TABLE "private_call" ADD CONSTRAINT "private_call_initiatorId_fkey" FOREIGN KEY ("initiatorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
