import { Module } from '@nestjs/common';
import { AIService } from './AI.service';
import { AIController } from './AI.Controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [AIController],
  providers: [AIService],
  exports: [AIModule],
})
export class AIModule {}
