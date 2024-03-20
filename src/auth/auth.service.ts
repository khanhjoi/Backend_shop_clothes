import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthDto, AuthDtoSignIn } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
// import { PrismaService } from '../prisma/prisma.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../models/users/user.service';
import { Tokens } from './types';
import { UserToken } from 'models/users/dto/UserTokenDto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private user: UserService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signupLocal(
    dto: AuthDto,
  ): Promise<Tokens> {
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
            lastName: dto.lastName,
            firstName: dto.firstName,
            phone: dto.phone,
            password: hashPassword,
            role: dto.role ? dto.role : undefined,
          },
        });

      // create shopping cart
      const cart =
        await this.prisma.shoppingCart.create({
          data: {
            userId: newUser.id,
          },
        });

      // Generate access token
      const token = await this.signToken(
        newUser.id,
        newUser.email,
        newUser.role,
      );

      // Update user with access token

      await this.updateFreshToken(
        newUser.id,
        token.refresh_token,
      );

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

  async signinLocal(dto: AuthDtoSignIn) {
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
      user.role,
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

    // update refresh token
    await this.updateFreshToken(
      user.id,
      token.refresh_token,
    );
    // send bacck user
    return token;
  }

  async signupLocalAdmin(
    dto: AuthDto,
    user: UserToken,
  ) {
    try {
      if (user.role !== 'ADMIN')
        throw new Error(
          'Không có quyền để thêm người dùng',
        );

      const hashPassword = await argon.hash(
        dto.password,
      );

      const checkUser =
        await this.prisma.user.findFirst({
          where: {
            email: dto.email,
          },
        });

      if (checkUser)
        throw new Error('Email đã tồn tại lấy!');

      // Store new user in db
      const newUser =
        await this.prisma.user.create({
          data: {
            email: dto.email,
            lastName: dto.lastName,
            firstName: dto.firstName,
            phone: dto.phone,
            password: hashPassword,
            role: dto.role ? dto.role : undefined,
          },
        });

      // create shopping cart
      const cart =
        await this.prisma.shoppingCart.create({
          data: {
            userId: newUser.id,
          },
        });

      // Generate access token
      const token = await this.signToken(
        newUser.id,
        newUser.email,
        newUser.role,
      );

      // Update user with access token

      await this.updateFreshToken(
        newUser.id,
        token.refresh_token,
      );

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
      throw new InternalServerErrorException(
        error.message,
      );
    }
  }

  async signinLocalAdmin(dto: AuthDtoSignIn) {
    // find user
    const user = await this.user.findOne(
      dto.email,
    );
    // throw error if user not exit
    if (!user)
      throw new ForbiddenException(
        'Credentials incorrect',
      );

    if (
      user.role === 'ADMIN' ||
      user.role === 'STAFF'
    ) {
      const token = await this.signToken(
        user.id,
        user.email,
        user.role,
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

      // update refresh token
      await this.updateFreshToken(
        user.id,
        token.refresh_token,
      );
      // send bacck user
      return token;
    } else {
      throw new ForbiddenException(
        'Người dùng không có quyền truy cập',
      );
    }
  }

  async logout(userId: number): Promise<boolean> {
    await this.prisma.user.updateMany({
      where: {
        id: userId,
        refresh_token: {
          not: null,
        },
      },
      data: {
        refresh_token: null,
      },
    });
    return true;
  }

  async refreshTokens(
    userId: number,
    rt: string,
  ): Promise<Tokens> {
    const user =
      await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

    if (!user || !user.refresh_token)
      throw new ForbiddenException(
        'Access Denied',
      );

    const rtMatch = await argon.verify(
      user.refresh_token,
      rt,
    );

    if (!rtMatch) {
      throw new ForbiddenException(
        'Access Denied',
      );
    }

    const token = await this.signToken(
      user.id,
      user.email,
      user.role,
    );
    await this.updateFreshToken(
      user.id,
      token.refresh_token,
    );

    return token;
  }

  // update refresh token
  async updateFreshToken(
    userId: number,
    rt: string,
  ) {
    const hash = await argon.hash(rt);
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        refresh_token: hash,
      },
    });
  }

  // create token
  async signToken(
    userId: number,
    email: string,
    role: string,
  ) {
    const payload = {
      sub: userId,
      email,
      role: role,
    };
    const accessSecret = this.config.get(
      'JWT_ACCESS_SECRET',
    );
    const refreshSecret = this.config.get(
      'JWT_REFRESH_SECRET',
    );

    const [access_token, refresh_token] =
      await Promise.all([
        this.jwt.signAsync(payload, {
          secret: accessSecret,
          expiresIn: '2h',
        }),
        this.jwt.signAsync(payload, {
          secret: refreshSecret,
          expiresIn: '2days',
        }),
      ]);

    return {
      access_token: access_token,
      refresh_token: refresh_token,
    };
  }
}
