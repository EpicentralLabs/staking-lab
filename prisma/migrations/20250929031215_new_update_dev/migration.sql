-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "lastBalanceUpdate" INTEGER,
ADD COLUMN     "lastStakeTime" INTEGER,
ADD COLUMN     "lastUnstakeTime" INTEGER;
