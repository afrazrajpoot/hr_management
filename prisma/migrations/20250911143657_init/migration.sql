/*
  Warnings:

  - You are about to drop the column `name` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `companyId` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."User" DROP CONSTRAINT "User_companyId_fkey";

-- AlterTable
ALTER TABLE "public"."Company" DROP COLUMN "name",
ADD COLUMN     "hrId" TEXT[];

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "companyId";
