-- AlterTable
ALTER TABLE "Image" ADD COLUMN     "pollinationUrl" TEXT;

-- CreateTable
CREATE TABLE "RemixImage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "originalImageId" TEXT NOT NULL,
    "remixPrompt" TEXT NOT NULL,
    "originalPrompt" TEXT NOT NULL,
    "pollinationUrl" TEXT NOT NULL,
    "s3Url" TEXT NOT NULL,
    "seed" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RemixImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RemixImage_userId_idx" ON "RemixImage"("userId");

-- CreateIndex
CREATE INDEX "RemixImage_originalImageId_idx" ON "RemixImage"("originalImageId");

-- AddForeignKey
ALTER TABLE "RemixImage" ADD CONSTRAINT "RemixImage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RemixImage" ADD CONSTRAINT "RemixImage_originalImageId_fkey" FOREIGN KEY ("originalImageId") REFERENCES "Image"("id") ON DELETE CASCADE ON UPDATE CASCADE;
