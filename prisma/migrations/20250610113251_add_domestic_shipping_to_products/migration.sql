/*
  Warnings:

  - Added the required column `localPickup` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "domesticShippingType" TEXT,
ADD COLUMN     "localPickup" BOOLEAN NOT NULL;
