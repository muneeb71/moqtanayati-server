-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "productId" TEXT;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
