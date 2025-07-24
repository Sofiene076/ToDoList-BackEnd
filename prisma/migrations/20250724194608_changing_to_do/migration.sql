/*
  Warnings:

  - You are about to drop the column `completed` on the `Todo` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Todo` table. All the data in the column will be lost.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Todo" DROP COLUMN "completed",
DROP COLUMN "description";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "name" SET NOT NULL;
