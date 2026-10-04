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
  chatNuevoEmail,
  leadNuevoEmail,
  contactoNuevoEmail,
  invitacionEmail,
  cotizacionServicioEmail,
  type CotizacionCorreo,
  pedidoNuevoEquipoEmail,
  presupuestoClienteEmail,
  codigoCuentaEmail,
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

  async sendChatNuevo(to: string, primerMensaje: string, url: string): Promise<void> {
    await this.send(to, chatNuevoEmail(primerMensaje, url));
  }

  async sendLeadNuevo(to: string, nombre: string, interes: string, url: string): Promise<void> {
    await this.send(to, leadNuevoEmail(nombre, interes, url));
  }

  async sendContactoNuevo(to: string, titulo: string, nombre: string, mensaje: string, url: string): Promise<void> {
    await this.send(to, contactoNuevoEmail(titulo, nombre, mensaje, url));
  }

  async sendInvitacion(to: string, marca: string, rol: string, url: string, dias: number): Promise<void> {
    await this.send(to, invitacionEmail(marca, rol, url, dias));
  }

  async sendCodigoCuenta(to: string, codigo: string, minutos: number): Promise<void> {
    await this.send(to, codigoCuentaEmail(codigo, minutos));
  }

  async sendPedidoNuevoEquipo(to: string, datos: Parameters<typeof pedidoNuevoEquipoEmail>[0]): Promise<void> {
    await this.send(to, pedidoNuevoEquipoEmail(datos));
  }

  /** Envía la cotización de un servicio al cliente. A diferencia de los avisos, el error SÍ se propaga (el equipo debe saber si no salió). */
  async sendCotizacionServicio(to: string, datos: CotizacionCorreo): Promise<void> {
    const { subject, html } = cotizacionServicioEmail(datos);
    if (this.driver === 'resend') {
      await this.resend!.emails.send({ from: this.fromEmail, to, subject, html });
    } else {
      await this.smtpTransport!.sendMail({ from: this.fromEmail, to, subject, html });
    }
  }

  /** Envía el presupuesto mayorista al cliente (enlace al documento). El error se propaga: el equipo debe saber si no salió. */
  async sendPresupuestoCliente(to: string, datos: Parameters<typeof presupuestoClienteEmail>[0]): Promise<void> {
    const { subject, html } = presupuestoClienteEmail(datos);
    if (this.driver === 'resend') {
      await this.resend!.emails.send({ from: this.fromEmail, to, subject, html });
    } else {
      await this.smtpTransport!.sendMail({ from: this.fromEmail, to, subject, html });
    }
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
