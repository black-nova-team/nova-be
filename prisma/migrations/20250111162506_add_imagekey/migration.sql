/*
  Warnings:

  - Added the required column `imageKey` to the `Slack` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Slack" ADD COLUMN     "imageKey" TEXT NOT NULL;
