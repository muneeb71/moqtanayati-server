-- AlterTable
ALTER TABLE "Store" ADD COLUMN     "addressLocation" TEXT,
ADD COLUMN     "businessEmail" TEXT,
ADD COLUMN     "businessPhone" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "storeCategory" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "deviceToken" TEXT;
