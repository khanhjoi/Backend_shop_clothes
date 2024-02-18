import { Module } from "@nestjs/common";
import { ReceiptController } from "./receipt.controller";
import { ReceiptService } from "./receipt.service";
import { PrismaModule } from "@prisma/prisma.module";

@Module({
  // import module use 
  imports: [PrismaModule], 
  controllers: [ReceiptController],
  providers: [ReceiptService],
})
export class ReceiptModule {

}