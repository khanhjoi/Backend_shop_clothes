import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { AuthDto, AuthDtoSignIn } from './dto';
import { Tokens } from './types';
import { AuthGuard } from '@nestjs/passport';
import { GetCurrentUserId } from './decorator/get-current-userId.decorator';
import { GetCurrentUser } from './decorator/get-current-user.decorator';
import { RtGuard } from './guard/rt-jwt.guard';
import { JwtGuard } from './guard';
import { GetUser } from './decorator';
import { UserToken } from 'models/users/dto/UserTokenDto';

@Controller('/auth')
export class AuthController {
  /**
   * ---------------------Knowledge ----------------------
   * the parameter private in constructor is just sort temp
   * to create a constructor function
   * instead of creating
   *   authService: AuthService;
   *   constructor() {
   *    this.authService = new AuthService
   *   }
   */
  constructor(private authService: AuthService) {}

  /**
   * example to basic using pipe -> use class
   * @param email
   * @param password
   * @returns
   * 
   * instead of : 
   *   @Post('/signup')
    signUp(
     @Body('email') email: string,
      @Body('password', ParseIntPipe)
      password: string,) {
      console.log({ email, password });
      return this.authService.signup();
    }
   */
  @HttpCode(HttpStatus.CREATED) // this edit for code
  @Post('/local/signup')
  async signupLocal(
    @Body() dto: AuthDto,
  ): Promise<Tokens> {
    return this.authService.signupLocal(dto);
  }

  @HttpCode(HttpStatus.CREATED) // this edit for code
  @Post('/local/signup')
  async signupLocalAdmin(
    @Body() dto: AuthDto,
  ): Promise<Tokens> {
    return this.authService.signupLocal(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('/local/signin')
  signinLocal(@Body() dto: AuthDtoSignIn) {
    return this.authService.signinLocal(dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/logout')
  @HttpCode(HttpStatus.OK)
  logout(@GetCurrentUserId() userId: number) {
    return this.authService.logout(userId);
  }

  @UseGuards(RtGuard)
  @HttpCode(HttpStatus.OK)
  @Post('/refresh')
  refreshTokens(
    @GetCurrentUserId() userId: number,
    @GetCurrentUser('refreshToken')
    refreshToken: string,
  ) {
    return this.authService.refreshTokens(
      userId,
      refreshToken,
    );
  }

  @HttpCode(HttpStatus.OK)
  @Post('/local/admin/signin')
  signinLocalAdmin(@Body() dto: AuthDtoSignIn) {
    return this.authService.signinLocalAdmin(dto);
  }

  @UseGuards(JwtGuard)
  @Post('/local/admin/signup')
  @HttpCode(HttpStatus.CREATED)
  getUsers(
    @GetUser() user: UserToken,
    @Body() dto: AuthDto,
  ): Promise<any | HttpException> {
    return this.authService.signupLocalAdmin(
      dto,
      user,
    );
  }
}
