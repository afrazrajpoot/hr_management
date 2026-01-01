/*
  Warnings:

  - You are about to drop the column `annualSalary` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `employer` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `autoLoginExpiry` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `autoLoginToken` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Employee" DROP COLUMN "annualSalary",
DROP COLUMN "employer";

-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "autoLoginExpiry",
DROP COLUMN "autoLoginToken",
ALTER COLUMN "firstName" DROP NOT NULL,
ALTER COLUMN "lastName" DROP NOT NULL,
ALTER COLUMN "email" DROP NOT NULL;
