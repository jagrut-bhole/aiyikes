/*
  Warnings:

  - A unique constraint covering the columns `[seed]` on the table `Image` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `seed` to the `Image` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Model" AS ENUM ('flux', 'turbo', 'gptimage', 'nanobanana', 'seedream');

-- AlterTable
ALTER TABLE "Image" ADD COLUMN     "model" "Model" NOT NULL DEFAULT 'flux',
ADD COLUMN     "seed" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Image_seed_key" ON "Image"("seed");
