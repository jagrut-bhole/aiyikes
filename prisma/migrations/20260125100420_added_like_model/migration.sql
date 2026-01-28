/*
  Warnings:

  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_userId_fkey";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "emailVerified" DROP NOT NULL;

-- DropTable
DROP TABLE "Post";

-- CreateTable
CREATE TABLE "Image" (
    "id" TEXT NOT NULL,
    "s3Url" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "isRemixed" BOOLEAN NOT NULL DEFAULT false,
    "isShared" BOOLEAN NOT NULL DEFAULT false,
    "remixCount" INTEGER NOT NULL DEFAULT 0,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "errorMessage" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "originalImageId" TEXT,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImageLike" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImageLike_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Image_userId_idx" ON "Image"("userId");

-- CreateIndex
CREATE INDEX "Image_isShared_createdAt_idx" ON "Image"("isShared", "createdAt");

-- CreateIndex
CREATE INDEX "Image_originalImageId_idx" ON "Image"("originalImageId");

-- CreateIndex
CREATE INDEX "ImageLike_userId_idx" ON "ImageLike"("userId");

-- CreateIndex
CREATE INDEX "ImageLike_imageId_idx" ON "ImageLike"("imageId");

-- CreateIndex
CREATE UNIQUE INDEX "ImageLike_userId_imageId_key" ON "ImageLike"("userId", "imageId");

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_originalImageId_fkey" FOREIGN KEY ("originalImageId") REFERENCES "Image"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImageLike" ADD CONSTRAINT "ImageLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImageLike" ADD CONSTRAINT "ImageLike_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE CASCADE ON UPDATE CASCADE;
