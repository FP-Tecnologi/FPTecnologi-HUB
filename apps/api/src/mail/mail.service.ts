import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import nodemailer, { type Transporter } from 'nodemailer';
import type { AppConfig } from '../config/configuration.js';
import {
  otpCodeEmail,
  passwordResetCodeEmail,
  welcomeEmail,
  passwordChangedEmail,
  pedidoConfirmadoEmail,
} from './templates.js';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly driver: 'smtp' | 'resend';
  private readonly fromEmail: string;
  private readonly resend?: Resend;
  private readonly smtpTransport?: Transporter;
  private readonly otpExpiresInMinutes: number;

  constructor(private readonly configService: ConfigService) {
    const mailConfig = this.configService.get<AppConfig['mail']>('mail')!;
    this.driver = mailConfig.driver;
    this.fromEmail = mailConfig.fromEmail;
    this.otpExpiresInMinutes = this.configService.get<AppConfig['otp']>('otp')!.expiresInMinutes;

    if (this.driver === 'resend') {
      const resendConfig = this.configService.get<AppConfig['resend']>('resend')!;
      this.resend = new Resend(resendConfig.apiKey);
    } else {
      this.smtpTransport = nodemailer.createTransport({
        host: mailConfig.smtp.host,
        port: mailConfig.smtp.port,
        secure: mailConfig.smtp.secure,
        auth: { user: mailConfig.smtp.user, pass: mailConfig.smtp.pass },
      });
    }
  }

  async sendOtpCode(to: string, codigo: string): Promise<void> {
    await this.send(to, otpCodeEmail(codigo, this.otpExpiresInMinutes));
  }

  async sendPasswordResetCode(to: string, codigo: string): Promise<void> {
    await this.send(to, passwordResetCodeEmail(codigo, this.otpExpiresInMinutes));
  }

  async sendWelcome(to: string, nombre: string | null): Promise<void> {
    await this.send(to, welcomeEmail(nombre));
  }

  async sendPasswordChanged(to: string): Promise<void> {
    await this.send(to, passwordChangedEmail());
  }

  async sendPedidoConfirmado(to: string, pedidoId: string): Promise<void> {
    await this.send(to, pedidoConfirmadoEmail(pedidoId));
  }

  private async send(to: string, { subject, html }: { subject: string; html: string }): Promise<void> {
    try {
      if (this.driver === 'resend') {
        await this.resend!.emails.send({ from: this.fromEmail, to, subject, html });
      } else {
        await this.smtpTransport!.sendMail({ from: this.fromEmail, to, subject, html });
      }
    } catch (error) {
      // No se interrumpe el flujo de negocio si el envío de correo falla;
      // se registra para poder reintentar/alertar.
      this.logger.error(`No se pudo enviar el correo a ${to}`, error as Error);
    }
  }
}
