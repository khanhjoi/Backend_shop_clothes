-- AlterTable
ALTER TABLE "Image" ADD COLUMN     "productOptionsColorId" INTEGER,
ADD COLUMN     "productOptionsProductId" INTEGER,
ADD COLUMN     "productOptionsSizeId" INTEGER;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_productOptionsProductId_productOptionsSizeId_product_fkey" FOREIGN KEY ("productOptionsProductId", "productOptionsSizeId", "productOptionsColorId") REFERENCES "ProductOptions"("productId", "sizeId", "colorId") ON DELETE SET NULL ON UPDATE CASCADE;
