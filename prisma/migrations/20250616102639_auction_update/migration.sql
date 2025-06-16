/*
  Warnings:

  - You are about to drop the column `autoAccept` on the `Auction` table. All the data in the column will be lost.
  - You are about to drop the column `buyItNow` on the `Auction` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Auction` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `Auction` table. All the data in the column will be lost.
  - You are about to drop the column `minimumOffer` on the `Auction` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `Auction` table. All the data in the column will be lost.
  - You are about to drop the column `startingBid` on the `Auction` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Auction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Auction" DROP COLUMN "autoAccept",
DROP COLUMN "buyItNow",
DROP COLUMN "description",
DROP COLUMN "endTime",
DROP COLUMN "minimumOffer",
DROP COLUMN "startTime",
DROP COLUMN "startingBid",
DROP COLUMN "title";
