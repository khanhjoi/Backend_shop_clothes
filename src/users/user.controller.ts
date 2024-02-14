import {
  Controller,
  Get,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@prisma/client';
import { Request } from 'express';
import { GetUser } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';

@Controller('/users')
export class UserController {
  @UseGuards(JwtGuard)
  @Get('/profile')
  getProfile(@GetUser() user : User){
    return user;
  }
}
