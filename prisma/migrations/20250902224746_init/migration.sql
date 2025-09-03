/*
  Warnings:

  - You are about to drop the column `departmentId` on the `User` table. All the data in the column will be lost.
  - Added the required column `userId` to the `Department` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `name` on the `Department` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "public"."User" DROP CONSTRAINT "User_departmentId_fkey";

-- DropIndex
DROP INDEX "public"."Department_name_key";

-- AlterTable
ALTER TABLE "public"."Department" ADD COLUMN     "userId" TEXT NOT NULL,
DROP COLUMN "name",
ADD COLUMN     "name" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "departmentId",
ADD COLUMN     "department" TEXT;
