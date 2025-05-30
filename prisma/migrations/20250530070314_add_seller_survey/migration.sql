-- CreateEnum
CREATE TYPE "SellerEntity" AS ENUM ('INDIVIDUAL', 'ESTABLISHED', 'CHARITABLE');

-- CreateEnum
CREATE TYPE "SellerGoal" AS ENUM ('DISCOVER', 'PROFIT', 'NEWBUSINESS', 'EXPLORE');

-- CreateEnum
CREATE TYPE "ProductAndServices" AS ENUM ('ACCESSORIES', 'HOME', 'ELECTRONICS', 'FURNITURE', 'MUSIC', 'HEALTH', 'JEWELLERY', 'ANIMALS', 'CARS', 'FOOD', 'GIFTS');

-- CreateEnum
CREATE TYPE "HomeSupplies" AS ENUM ('KITCHEN', 'HOMEDECOR', 'FURNITURE', 'LIGHTING', 'CLEANING', 'GARDEN', 'BEDDING', 'STORAGE', 'TOOLSANDHARDWARE', 'ORGANIZATION', 'HOMESECURITY');

-- CreateTable
CREATE TABLE "SellerSurvery" (
    "id" TEXT NOT NULL,
    "entity" "SellerEntity" NOT NULL DEFAULT 'INDIVIDUAL',
    "hasProducts" BOOLEAN NOT NULL DEFAULT false,
    "hasExperience" BOOLEAN NOT NULL DEFAULT false,
    "goal" "SellerGoal" NOT NULL DEFAULT 'DISCOVER',
    "productAndServices" "ProductAndServices"[],
    "homeSupplies" "HomeSupplies"[],

    CONSTRAINT "SellerSurvery_pkey" PRIMARY KEY ("id")
);
