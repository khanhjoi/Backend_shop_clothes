import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { OpenAI } from 'openai';
@Controller('')
export class AIController {
  constructor(
    private configService: ConfigService,
  ) {}

  @Get('/api/v1/dalle')
  getImageFromAI() {
    return 'hello';
  }

  @Post('/api/v1/dalle')
  async generateImage(
    @Body() req: any,
    @Res() res: Response,
  ) {
    try {
      const openai = new OpenAI({
        apiKey: this.configService.get(
          'OPEN_AI_KEY',
        ),
      }); // Use OpenAI

      const { prompt } = req;

      const response =
        await openai.images.generate({
          prompt,
          n: 1,
          size: '1024x1024',
          response_format: 'b64_json',
        });

      const image = response.data[0].b64_json;

      res
        .status(HttpStatus.OK)
        .json({ photo: image });
    } catch (error) {
      console.error(error);
      if (
        error.code ===
        'billing_hard_limit_reached'
      ) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({
            error:
              'Billing hard limit has been reached',
          });
      }
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
