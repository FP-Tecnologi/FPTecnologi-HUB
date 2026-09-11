import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import type { AppConfig } from '../config/configuration.js';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly resend: Resend;
  private readonly fromEmail: string;

  constructor(private readonly configService: ConfigService) {
    const resendConfig = this.configService.get<AppConfig['resend']>('resend')!;
    this.resend = new Resend(resendConfig.apiKey);
    this.fromEmail = resendConfig.fromEmail;
  }

  async sendOtpCode(to: string, codigo: string): Promise<void> {
    await this.send({
      to,
      subject: 'Tu código de verificación',
      html: `<p>Tu código de verificación es <strong>${codigo}</strong>. Vence en pocos minutos.</p>`,
    });
  }

  async sendPasswordResetCode(to: string, codigo: string): Promise<void> {
    await this.send({
      to,
      subject: 'Recuperar contraseña',
      html: `<p>Tu código para restablecer la contraseña es <strong>${codigo}</strong>. Si no pediste esto, ignora este correo.</p>`,
    });
  }

  async sendPedidoConfirmado(to: string, pedidoId: string): Promise<void> {
    await this.send({
      to,
      subject: 'Confirmación de pedido',
      html: `<p>Tu pedido <strong>${pedidoId}</strong> fue recibido correctamente.</p>`,
    });
  }

  private async send(params: { to: string; subject: string; html: string }): Promise<void> {
    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: params.to,
        subject: params.subject,
        html: params.html,
      });
    } catch (error) {
      // No se interrumpe el flujo de negocio si el envío de correo falla;
      // se registra para poder reintentar/alertar.
      this.logger.error(`No se pudo enviar el correo a ${params.to}`, error as Error);
    }
  }
}
