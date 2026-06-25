import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';

type Transporter = nodemailer.Transporter<SMTPTransport.SentMessageInfo>;

export type ActionMailType = 'activate' | 'recovery';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly from = process.env.MAIL_FROM || 'CRM <no-reply@crm.local>';
  private transporterPromise: Promise<Transporter | null> | null = null;

  /** Lazily build and memoize the transport (Ethereal setup is async). */
  private getTransport(): Promise<Transporter | null> {
    if (!this.transporterPromise) {
      this.transporterPromise = this.createTransport();
    }
    return this.transporterPromise;
  }

  private async createTransport(): Promise<Transporter | null> {
    const host = process.env.SMTP_HOST;

    if (host) {
      return nodemailer.createTransport({
        host,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: process.env.SMTP_USER
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
          : undefined,
      });
    }

    // No SMTP configured: in dev, spin up a throwaway Ethereal account so the
    // email can be previewed in the browser (no signup, no real inbox). In
    // production we skip sending instead.
    if (process.env.NODE_ENV === 'production') {
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

  /**
   * Send the activation/recovery link to the manager.
   * Returns true if the email was sent, false if sending is off or failed —
   * the caller still has the link to copy/share manually.
   */
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

      // Ethereal returns a preview URL — open it to view the sent email.
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
