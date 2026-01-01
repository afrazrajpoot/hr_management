-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "autoLoginExpiry" TIMESTAMP(3),
ADD COLUMN     "autoLoginToken" TEXT;
