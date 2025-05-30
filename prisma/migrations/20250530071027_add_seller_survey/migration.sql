/*
  Warnings:

  - You are about to drop the `SellerSurvery` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "SellerSurvery";

-- CreateTable
CREATE TABLE "SellerSurvey" (
    "id" TEXT NOT NULL,
    "entity" "SellerEntity" NOT NULL DEFAULT 'INDIVIDUAL',
    "hasProducts" BOOLEAN NOT NULL DEFAULT false,
    "hasExperience" BOOLEAN NOT NULL DEFAULT false,
    "goal" "SellerGoal" NOT NULL DEFAULT 'DISCOVER',
    "productAndServices" "ProductAndServices"[],
    "homeSupplies" "HomeSupplies"[],
    "userId" TEXT NOT NULL,

    CONSTRAINT "SellerSurvey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SellerSurvey_userId_key" ON "SellerSurvey"("userId");

-- AddForeignKey
ALTER TABLE "SellerSurvey" ADD CONSTRAINT "SellerSurvey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
