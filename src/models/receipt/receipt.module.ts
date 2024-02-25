import { Module } from "@nestjs/common";
import { ReceiptController } from "./receipt.controller";
import { ReceiptService } from "./receipt.service";
import { PrismaModule } from "@prisma/prisma.module";
import { ProductsModule } from "models/products/products.module";
import { CategoryModule } from "models/category/category.module";
import { ImageModule } from "models/image/image.module";

@Module({
  // import module use 
  imports: [PrismaModule, ProductsModule, CategoryModule, ImageModule], 
  controllers: [ReceiptController],
  providers: [ReceiptService],
})
export class ReceiptModule {
}