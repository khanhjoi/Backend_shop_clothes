import { Module } from '@nestjs/common';
import { UserSerivce } from './user.service';
import { UserController } from './user.controller';

@Module({
  imports: [UserModule],
  controllers: [UserController],
  providers: [UserSerivce],
  exports: [UserSerivce],
})
export class UserModule {}
