-- CreateEnum
CREATE TYPE "AuctionStatus" AS ENUM ('LIVE', 'UPCOMING', 'ENDED');

-- AlterTable
ALTER TABLE "Auction" ALTER COLUMN "status" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Bid" ADD COLUMN     "status" "AuctionStatus" NOT NULL DEFAULT 'UPCOMING';

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "productCategories" "ProductAndServices"[];
