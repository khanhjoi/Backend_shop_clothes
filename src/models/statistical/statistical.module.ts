import { Module } from '@nestjs/common';
import { PrismaModule } from '@prisma/prisma.module';
import { StatisticalController } from './statitiscal.controller';
import { StatisticalService } from './statistical.service';

@Module({
  imports: [PrismaModule],
  controllers: [StatisticalController],
  providers: [StatisticalService],
  exports: [StatisticalService],
})
export class StatisticalModule {}
