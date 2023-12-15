/*
  Warnings:

  - You are about to drop the `Settings` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[youtubePlaylistId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[notionMainDbId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[notionSnapshotDbId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Settings" DROP CONSTRAINT "Settings_userId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "notionMainDbId" TEXT,
ADD COLUMN     "notionSnapshotDbId" TEXT,
ADD COLUMN     "youtubePlaylistId" TEXT;

-- DropTable
DROP TABLE "Settings";

-- CreateIndex
CREATE UNIQUE INDEX "User_youtubePlaylistId_key" ON "User"("youtubePlaylistId");

-- CreateIndex
CREATE UNIQUE INDEX "User_notionMainDbId_key" ON "User"("notionMainDbId");

-- CreateIndex
CREATE UNIQUE INDEX "User_notionSnapshotDbId_key" ON "User"("notionSnapshotDbId");
