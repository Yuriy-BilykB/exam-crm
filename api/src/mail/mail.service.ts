import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import { AppConfigService } from '../config/app-config.service';

type Transporter = nodemailer.Transporter<SMTPTransport.SentMessageInfo>;

export type ActionMailType = 'activate' | 'recovery';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly from: string;
  private transporterPromise: Promise<Transporter | null> | null = null;

  constructor(private readonly config: AppConfigService) {
    this.from = config.mailFrom;
  }

  private getTransport(): Promise<Transporter | null> {
    if (!this.transporterPromise) {
      this.transporterPromise = this.createTransport();
    }
    return this.transporterPromise;
  }

  private async createTransport(): Promise<Transporter | null> {
    const host = this.config.smtpHost;

    if (host) {
      return nodemailer.createTransport({
        host,
        port: this.config.smtpPort,
        secure: this.config.smtpSecure,
        auth: this.config.smtpUser
          ? { user: this.config.smtpUser, pass: this.config.smtpPass }
          : undefined,
      });
    }

    if (this.config.isProduction) {
      this.logger.warn('SMTP not configured — emails will be skipped');
      return null;
    }

    try {
      const account = await nodemailer.createTestAccount();
      this.logger.warn(
        `SMTP not configured — using Ethereal test account <${account.user}>`,
      );
      return nodemailer.createTransport({
        host: account.smtp.host,
        port: account.smtp.port,
        secure: account.smtp.secure,
        auth: { user: account.user, pass: account.pass },
      });
    } catch (error) {
      this.logger.error(
        'Failed to create Ethereal test account',
        error as Error,
      );
      return null;
    }
  }

  async sendActionLink(
    to: string,
    link: string,
    type: ActionMailType,
  ): Promise<boolean> {
    const transporter = await this.getTransport();
    if (!transporter) return false;

    const subject =
      type === 'activate'
        ? 'Activate your CRM account'
        : 'Reset your CRM password';
    const action =
      type === 'activate' ? 'activate your account' : 'reset your password';

    try {
      const info = await transporter.sendMail({
        from: this.from,
        to,
        subject,
        html: `
          <p>Click the link below to ${action}. The link expires in 30 minutes.</p>
          <p><a href="${link}">${link}</a></p>
        `,
      });

      const preview = nodemailer.getTestMessageUrl(info);
      if (preview) this.logger.log(`Preview email: ${preview}`);

      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send ${type} email to ${to}`,
        error as Error,
      );
      return false;
    }
  }
}
