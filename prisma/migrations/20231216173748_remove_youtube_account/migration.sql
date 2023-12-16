/*
  Warnings:

  - You are about to drop the `YoutubeAccount` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "YoutubeAccount" DROP CONSTRAINT "YoutubeAccount_userId_fkey";

-- DropTable
DROP TABLE "YoutubeAccount";
