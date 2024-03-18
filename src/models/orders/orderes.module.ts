import { Module } from "@nestjs/common";
import { OrderController } from "./orders.controller";
import { OrderService } from "./ordere.service";
import { PrismaModule } from "@prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [OrderController],
  providers: [OrderService]
})
export class OrderModule {

}