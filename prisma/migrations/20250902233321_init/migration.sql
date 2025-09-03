/*
  Warnings:

  - Added the required column `hrId` to the `Department` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Department" ADD COLUMN     "hrId" TEXT NOT NULL;
