/*
  Warnings:

  - The values [turbo,seedream] on the enum `Model` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `isShared` on the `Image` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Model_new" AS ENUM ('flux', 'gptimage', 'nanobanana', 'seedance');
ALTER TABLE "public"."Image" ALTER COLUMN "model" DROP DEFAULT;
ALTER TABLE "Image" ALTER COLUMN "model" TYPE "Model_new" USING ("model"::text::"Model_new");
ALTER TYPE "Model" RENAME TO "Model_old";
ALTER TYPE "Model_new" RENAME TO "Model";
DROP TYPE "public"."Model_old";
ALTER TABLE "Image" ALTER COLUMN "model" SET DEFAULT 'flux';
COMMIT;

-- DropIndex
DROP INDEX "Image_isShared_createdAt_idx";

-- AlterTable
ALTER TABLE "Image" DROP COLUMN "isShared",
ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Image_isPublic_createdAt_idx" ON "Image"("isPublic", "createdAt");
