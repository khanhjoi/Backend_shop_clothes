import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
// import { PrismaService } from '../prisma/prisma.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { UserSerivce } from '../users/user.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private user: UserSerivce,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}
  async signup(dto: AuthDto) {
    // generate the password hash
    try {
      const hashPassword = await argon.hash(
        dto.password,
      );

      // Store new user in db
      const newUser =
        await this.prisma.user.create({
          data: {
            email: dto.email,
            password: hashPassword,
            role: dto.role,
          },
        });

      // Generate access token
      const token = await this.signToken(
        newUser.id,
        newUser.email,
      );

      // Update user with access token
      await this.prisma.user.update({
        where: { id: newUser.id },
        data: {
          access_token: token.access_token,
        },
      });

      // Return the token
      return token;
    } catch (error) {
      if (
        error instanceof
        PrismaClientKnownRequestError
      ) {
        if (error.code === 'P2002') {
          throw new ForbiddenException(
            'Creadetials taken',
          );
        }
      }
    }
  }
  async signin(dto: AuthDto) {
    // find user
    const user = await this.user.findOne(
      dto.email,
    );
    // throw error if user not exit
    if (!user)
      throw new ForbiddenException(
        'Credentials incorrect',
      );

    const token = await this.signToken(
      user.id,
      user.email,
    );

    // compare password corect
    const passwordMatch = await argon.verify(
      user.password,
      dto.password,
    );
    // throw error if password not exit
    if (!passwordMatch)
      throw new ForbiddenException(
        'Credentials incorrect',
      );

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        access_token: token.access_token,
      },
    });

    // send bacck user
    return token;
  }

  async signToken(userId: number, email: string) {
    const payload = {
      sub: userId,
      email,
    };
    const secret = this.config.get('JWT_SECRET');
    const accesToken = await this.jwt.signAsync(
      payload,
      {
        secret: secret,
        expiresIn: '10m',
      },
    );
    return {
      access_token: accesToken,
    };
  }
}
