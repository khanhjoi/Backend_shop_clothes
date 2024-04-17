import { Controller, Post } from '@nestjs/common';
import { MailService } from './mail.service';
import { SendEmailDto } from './dto/mail.dto';

@Controller('/mailer')
export class MailController {
  constructor(private mailService: MailService) {}

  @Post('/send-email')
  async sendMail(dto: SendEmailDto) {
    return await this.mailService.sendMail(dto);
  }
}
