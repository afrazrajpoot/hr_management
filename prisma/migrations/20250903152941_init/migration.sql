/*
  Warnings:

  - Added the required column `userId` to the `Department` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Department" ADD COLUMN     "userId" TEXT NOT NULL;
