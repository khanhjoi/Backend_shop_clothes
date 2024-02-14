import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserSerivce {
  constructor(private prisma: PrismaService) {}

  async findOne(email: string): Promise<User | undefined> {
    const user = await this.prisma.user.findFirst({
      where: { email: email },
    });
    return user;
  }
}