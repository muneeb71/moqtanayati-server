/*
  Warnings:

  - A unique constraint covering the columns `[productId]` on the table `Auction` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Auction_productId_key" ON "Auction"("productId");
