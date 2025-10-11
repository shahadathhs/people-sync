-- CreateEnum
CREATE TYPE "PayInterval" AS ENUM ('HOURLY', 'DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "BreakTime" AS ENUM ('NONE', 'FIFTEEN_MINUTES', 'THIRTY_MINUTES', 'ONE_HOUR');

-- CreateEnum
CREATE TYPE "OffDay" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('USD', 'AUD', 'JPY', 'CAD', 'BDT', 'GBP', 'EUR');

-- CreateTable
CREATE TABLE "payrolls" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dailyWorkHour" INTEGER NOT NULL DEFAULT 8,
    "breakTime" "BreakTime" NOT NULL DEFAULT 'NONE',
    "offDays" "OffDay"[] DEFAULT ARRAY['SATURDAY', 'SUNDAY']::"OffDay"[],
    "currency" "Currency" NOT NULL DEFAULT 'USD',
    "payRate" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "payRateType" "PayInterval" NOT NULL DEFAULT 'MONTHLY',
    "overTimePayRate" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "overTimePayRateType" "PayInterval" NOT NULL DEFAULT 'MONTHLY',
    "paymentPeriod" "PayInterval" NOT NULL DEFAULT 'MONTHLY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payrolls_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payrolls_userId_key" ON "payrolls"("userId");

-- AddForeignKey
ALTER TABLE "payrolls" ADD CONSTRAINT "payrolls_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
