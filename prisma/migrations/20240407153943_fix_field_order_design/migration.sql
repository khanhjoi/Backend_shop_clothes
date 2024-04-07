/*
  Warnings:

  - You are about to drop the column `metarial` on the `OrderDesign` table. All the data in the column will be lost.
  - Added the required column `material` to the `OrderDesign` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OrderDesign" DROP COLUMN "metarial",
ADD COLUMN     "material" TEXT NOT NULL;
