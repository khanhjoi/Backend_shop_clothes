/*
  Warnings:

  - You are about to drop the column `categorory` on the `ReceiptDetail` table. All the data in the column will be lost.
  - Added the required column `category` to the `ReceiptDetail` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ReceiptDetail" DROP COLUMN "categorory",
ADD COLUMN     "category" TEXT NOT NULL;
