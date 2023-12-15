-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL,
    "youtubePlaylistId" TEXT,
    "notionMainDbId" TEXT,
    "notionSnapshotDbId" TEXT,
    "userId" TEXT,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Settings_youtubePlaylistId_key" ON "Settings"("youtubePlaylistId");

-- CreateIndex
CREATE UNIQUE INDEX "Settings_notionMainDbId_key" ON "Settings"("notionMainDbId");

-- CreateIndex
CREATE UNIQUE INDEX "Settings_notionSnapshotDbId_key" ON "Settings"("notionSnapshotDbId");

-- CreateIndex
CREATE UNIQUE INDEX "Settings_userId_key" ON "Settings"("userId");

-- AddForeignKey
ALTER TABLE "Settings" ADD CONSTRAINT "Settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
