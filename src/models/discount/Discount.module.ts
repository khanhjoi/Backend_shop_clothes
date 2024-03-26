import { Module } from "@nestjs/common";
import { PrismaModule } from "@prisma/prisma.module";
import { DiscountService } from "./Discount.service";
import { DiscountController } from "./Discount.controller";

@Module({
  imports: [PrismaModule],
  providers: [DiscountService],
  controllers: [DiscountController],
  exports: [DiscountService]
})
export class DiscountModule {

}