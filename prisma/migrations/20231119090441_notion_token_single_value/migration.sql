/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `NotionToken` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "NotionToken_userId_key" ON "NotionToken"("userId");
