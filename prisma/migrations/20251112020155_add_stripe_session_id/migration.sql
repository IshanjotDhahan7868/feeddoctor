/*
  Warnings:

  - A unique constraint covering the columns `[stripeId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `stripeId` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "stripeId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Order_stripeId_key" ON "Order"("stripeId");
