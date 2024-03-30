/*
  Warnings:

  - Added the required column `payment` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Payment" AS ENUM ('UPON_RECEIPT', 'VNPAYMENT', 'MOMOPAYMENT');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "payment" "Payment" NOT NULL;
