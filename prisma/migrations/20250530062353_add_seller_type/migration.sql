-- CreateEnum
CREATE TYPE "SellerType" AS ENUM ('INDIVIDUAL', 'BUSINESS', 'FAMILY');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "sellerType" "SellerType";
