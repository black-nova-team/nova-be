/*
  Warnings:

  - You are about to drop the column `inputText` on the `Slack` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `Slack` table. All the data in the column will be lost.
  - Added the required column `hobby` to the `Slack` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mbti` to the `Slack` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Slack` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slackId` to the `Slack` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slackName` to the `Slack` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Slack" DROP COLUMN "inputText",
DROP COLUMN "username",
ADD COLUMN     "hobby" TEXT NOT NULL,
ADD COLUMN     "mbti" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "slackId" TEXT NOT NULL,
ADD COLUMN     "slackName" TEXT NOT NULL;
