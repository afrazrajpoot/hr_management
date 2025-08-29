/*
  Warnings:

  - Added the required column `geniusFactorScore` to the `IndividualEmployeeReport` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."IndividualEmployeeReport" DROP COLUMN "geniusFactorScore",
ADD COLUMN     "geniusFactorScore" INTEGER NOT NULL;
