/*
  Warnings:

  - You are about to drop the column `youtubeAccountId` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `YoutubeAccount` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_youtubeAccountId_fkey";

-- DropIndex
DROP INDEX "User_youtubeAccountId_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "youtubeAccountId";

-- AlterTable
ALTER TABLE "YoutubeAccount" ADD COLUMN     "userId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "YoutubeAccount_userId_key" ON "YoutubeAccount"("userId");

-- AddForeignKey
ALTER TABLE "YoutubeAccount" ADD CONSTRAINT "YoutubeAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
