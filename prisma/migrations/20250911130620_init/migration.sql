/*
  Warnings:

  - You are about to drop the column `hrId` on the `User` table. All the data in the column will be lost.
  - Added the required column `name` to the `Company` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Company" ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "hrId",
ADD COLUMN     "companyId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
