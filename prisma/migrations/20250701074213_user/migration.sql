-- CreateTable
CREATE TABLE "SellerDetail" (
    "iban" TEXT,
    "cr" TEXT,
    "vat" TEXT,
    "userId" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "SellerDetail_userId_key" ON "SellerDetail"("userId");

-- AddForeignKey
ALTER TABLE "SellerDetail" ADD CONSTRAINT "SellerDetail_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
