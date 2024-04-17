import { Module } from "@nestjs/common";
import { OrderController } from "./orders.controller";
import { OrderService } from "./ordere.service";
import { PrismaModule } from "@prisma/prisma.module";
import { MailModule } from "mail/mail.module";

@Module({
  imports: [PrismaModule, MailModule],
  controllers: [OrderController],
  providers: [OrderService]
})
export class OrderModule {

}