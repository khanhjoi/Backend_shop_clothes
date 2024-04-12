import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { SendEmailDto } from './dto/mail.dto';
import Mail from 'nodemailer/lib/mailer';

@Injectable()
export class MailService {
  constructor(
    private readonly config: ConfigService,
  ) {}

  mailTransport() {
    const transporter =
      nodemailer.createTransport({
        service: 'gmail',
        host: this.config.get<string>(
          'MAIL_HOST',
        ),
        port: this.config.get<number>(
          'MAIL_PORT',
        ),
        secure: false, // Use `true` for port 465, `false` for all other ports
        auth: {
          user: this.config.get<string>(
            'MAIL_USER',
          ),
          pass: this.config.get<string>(
            'MAIL_PASSWORD',
          ),
        },
      });
    return transporter;
  }

  async sendMail(dto: SendEmailDto) {
    const {
      from,
      recipients,
      subject,
      html,
      text,
      placeholderReplacements,
    } = dto;
    const transport = this.mailTransport();

    const options: Mail.Options = {
      from: from ?? {
        name: this.config.get<string>('APP_NAME'),
        address: this.config.get<string>(
          'DEFAULT_EMAIL_FORM',
        ),
      },
      to: recipients,
      subject,
      html,
    };

    try {
      const result =
        await transport.sendMail(options);
      return result;
    } catch (error) {
      console.log(error);
    }
  }
}
