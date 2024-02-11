import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}
  async signup(dto: AuthDto) {
    // generate the password hash
    try {
      const hashPassword = await argon.hash(dto.password);

      // store new user in db
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hashPassword,
          role: dto.role,
        },
        // select: {
        //   // email: true, selete field to return data
        //   // password: true,
        // }
      });
      // return user
      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Creadetials taken');
        }
      }
    }
  }
  async signin(dto: AuthDto) {
    // find user
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });
    // throw error if user not exit
    if (!user) throw new ForbiddenException('Credentials incorrect');

    // compare password corect
    const passwordMatch = await argon.verify(user.password, dto.password);
    // throw error if password not exit
    if(!passwordMatch) throw new ForbiddenException('Credentials incorrect');

    // send bacck user
    return user;
  }
}
