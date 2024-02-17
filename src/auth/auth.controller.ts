import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { AuthDto } from './dto';
import { Tokens } from './types';
import { AuthGuard } from '@nestjs/passport';
import { GetCurrentUserId } from './decorator/get-current-userId.decorator';
import { GetCurrentUser } from './decorator/get-current-user.decorator';
import { RtGuard } from './guard/rt-jwt.guard';

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

  @HttpCode(HttpStatus.OK)
  @Post('/local/signin')
  signinLocal(@Body() dto: AuthDto) {
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
    @GetCurrentUser('refreshToken') refreshToken: string
  ) {
    return this.authService.refreshTokens(userId, refreshToken);
  }
}
