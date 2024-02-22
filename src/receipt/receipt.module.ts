import { Module } from "@nestjs/common";
import { ReceiptController } from "./receipt.controller";
import { ReceiptService } from "./receipt.service";
import { PrismaModule } from "@prisma/prisma.module";
import { ProductsModule } from "products/products.module";
import { CategoryModule } from "category/category.module";
import { ImageModule } from "image/image.module";

@Module({
  // import module use 
  imports: [PrismaModule, ProductsModule, CategoryModule, ImageModule], 
  controllers: [ReceiptController],
  providers: [ReceiptService],
})
export class ReceiptModule {
}