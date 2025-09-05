/*
  Warnings:

  - The `department` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."Department" ADD COLUMN     "ingoing" JSONB,
ADD COLUMN     "outgoing" JSONB,
ADD COLUMN     "promotion" TEXT,
ADD COLUMN     "transfer" TEXT;

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "department",
ADD COLUMN     "department" TEXT[];
