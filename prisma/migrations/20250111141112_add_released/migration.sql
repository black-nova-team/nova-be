-- AlterTable
ALTER TABLE "Slack" ADD COLUMN     "released" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "correct" DROP NOT NULL;
