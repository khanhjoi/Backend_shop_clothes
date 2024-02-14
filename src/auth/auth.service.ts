import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import e from 'express';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}
  async signup(dto: AuthDto) {
    // generate the password hash
    const hashPassword = await argon.hash(
      dto.password,
    );
    // save new user in database
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hashPassword,
        },
      });

      delete user.password;

      return user;
    } catch (error) {
      if (
        error instanceof
        PrismaClientKnownRequestError
      ) {
        if (error.code === 'P2002') {
          throw new ForbiddenException(
            'Credentials taken'
          )
        }
      }
    throw error;

    }
  }
  signin() {
    return 'I am signed';
  }
}
