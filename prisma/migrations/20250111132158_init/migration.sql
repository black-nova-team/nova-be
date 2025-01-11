-- CreateTable
CREATE TABLE "Slack" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "inputText" TEXT NOT NULL,
    "manittoId" INTEGER,
    "correct" BOOLEAN NOT NULL,
    "createdAd" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Slack_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Slack" ADD CONSTRAINT "Slack_manittoId_fkey" FOREIGN KEY ("manittoId") REFERENCES "Slack"("id") ON DELETE SET NULL ON UPDATE CASCADE;
