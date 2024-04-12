import { Controller, Post } from '@nestjs/common';
import { MailService } from './mail.service';
import { SendEmailDto } from './dto/mail.dto';

@Controller('/mailer')
export class MailController {
  constructor(private mailService: MailService) {}

  @Post('/send-email')
  async sendMail() {
    const dto: SendEmailDto = {
      from: {
        name: 'CMS',
        address: 'CMS@example.com',
      },
      recipients: [ {name: 'khanh', address: 'nguyenchikhanh1221@gmail.com'}],
      subject: 'Hãy xác nhận đơn hàng của bạn!!!',
      html: '<p>Hello khanh </p>'
    };
    return await this.mailService.sendMail(dto);
  }
}
