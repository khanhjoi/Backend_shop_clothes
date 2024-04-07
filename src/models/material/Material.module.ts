import { Module } from '@nestjs/common';
import { PrismaModule } from '@prisma/prisma.module';
import { MaterialController } from './Material.Controller';
import { MaterialService } from './Material.service';

@Module({
  imports: [PrismaModule],
  providers: [MaterialService],
  controllers: [MaterialController],
  exports: [MaterialModule],
})
export class MaterialModule {}
