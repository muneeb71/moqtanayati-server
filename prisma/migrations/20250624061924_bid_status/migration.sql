/*
  Warnings:

  - The `status` column on the `Auction` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `Bid` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "UserBidStatus" AS ENUM ('HIGHEST', 'WON', 'OUTBID', 'RETRACTED');

-- AlterTable
ALTER TABLE "Auction" DROP COLUMN "status",
ADD COLUMN     "status" "AuctionStatus" NOT NULL DEFAULT 'UPCOMING';

-- AlterTable
ALTER TABLE "Bid" DROP COLUMN "status",
ADD COLUMN     "status" "UserBidStatus" NOT NULL DEFAULT 'HIGHEST';
