/*
  Warnings:

  - You are about to drop the column `image` on the `User` table. All the data in the column will be lost.
  - The `emailVerified` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[youtubeAccountId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "image",
ADD COLUMN     "picture" TEXT,
ADD COLUMN     "youtubeAccountId" TEXT,
DROP COLUMN "emailVerified",
ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "YoutubeAccount" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" BOOLEAN NOT NULL,
    "picture" TEXT,

    CONSTRAINT "YoutubeAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "YoutubeAccount_email_key" ON "YoutubeAccount"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_youtubeAccountId_key" ON "User"("youtubeAccountId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_youtubeAccountId_fkey" FOREIGN KEY ("youtubeAccountId") REFERENCES "YoutubeAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;
