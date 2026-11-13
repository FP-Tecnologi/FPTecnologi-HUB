import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import nodemailer, { type Transporter } from 'nodemailer';
import type { AppConfig } from '../config/configuration.js';
import { PrismaService } from '../prisma/prisma.service.js';
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
  avisoEmail,
  hojaConsumidorEmail,
  hojaEquipoEmail,
  respuestaReclamoEmail,
  type HojaCorreo,
  type MarcaCorreo,
  tema,
} from './templates.js';

/** Archivo adjunto de un correo (ej. el PDF del presupuesto). */
export interface Adjunto {
  filename: string;
  content: Buffer;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly driver: 'smtp' | 'resend';
  private readonly fromEmail: string;
  private readonly resend?: Resend;
  private readonly smtpTransport?: Transporter;
  private readonly otpExpiresInMinutes: number;
  private readonly marcasCache = new Map<string, { marca: MarcaCorreo | undefined; vence: number }>();

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
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

  /** Marca que firma el correo (nombre, color, logo, contacto). Sin `marcaId` o si no existe: FPTecnologi. Caché de 60 s. */
  async marcaDe(marcaId?: string | null): Promise<MarcaCorreo | undefined> {
    if (!marcaId) return undefined;
    const hit = this.marcasCache.get(marcaId);
    if (hit && hit.vence > Date.now()) return hit.marca;
    let marca: MarcaCorreo | undefined;
    try {
      const m = await this.prisma.marca.findUnique({
        where: { id: marcaId },
        select: { nombre: true, colorPrimario: true, logo: true, contactoEmail: true },
      });
      if (m) marca = { nombre: m.nombre, color: m.colorPrimario, logo: m.logo, email: m.contactoEmail };
    } catch (error) {
      this.logger.warn(`No se pudo leer la marca ${marcaId} para el correo: ${(error as Error).message}`);
    }
    this.marcasCache.set(marcaId, { marca, vence: Date.now() + 60_000 });
    return marca;
  }

  /**
   * Marca de un usuario cuando el flujo no trae una (login, recuperar contraseña…): si pertenece a una sola, esa;
   * si a varias, la del sitio desde el que escribe (`origen` = cabecera Origin/Referer); si no, FPTecnologi.
   */
  async marcaDeUsuario(usuarioId: string, origen?: string | null): Promise<MarcaCorreo | undefined> {
    try {
      const filas = await this.prisma.usuarioMarcaRol.findMany({ where: { usuarioId }, select: { marcaId: true } });
      const ids = [...new Set(filas.map((f) => f.marcaId))];
      if (ids.length === 1) return this.marcaDe(ids[0]);
      let host = '';
      try {
        host = origen ? new URL(origen).hostname.replace(/^www\./, '') : '';
      } catch {
        /* origen inválido: se ignora */
      }
      if (host) {
        const sitio = await this.prisma.sitio.findFirst({
          where: { dominio: { in: [host, `www.${host}`] }, marcaId: { in: ids } },
          select: { marcaId: true },
        });
        if (sitio) return this.marcaDe(sitio.marcaId);
      }
    } catch (error) {
      this.logger.warn(`No se pudo resolver la marca del usuario ${usuarioId}: ${(error as Error).message}`);
    }
    return undefined;
  }

  async sendOtpCode(to: string, codigo: string, marca?: MarcaCorreo): Promise<void> {
    await this.send(to, otpCodeEmail(codigo, this.otpExpiresInMinutes, marca), marca);
  }

  async sendPasswordResetCode(to: string, codigo: string, marca?: MarcaCorreo): Promise<void> {
    await this.send(to, passwordResetCodeEmail(codigo, this.otpExpiresInMinutes, marca), marca);
  }

  async sendWelcome(to: string, nombre: string | null, marca?: MarcaCorreo): Promise<void> {
    await this.send(to, welcomeEmail(nombre, marca), marca);
  }

  async sendPasswordChanged(to: string, marca?: MarcaCorreo): Promise<void> {
    await this.send(to, passwordChangedEmail(marca), marca);
  }

  async sendPedidoConfirmado(to: string, pedidoId: string, marcaId?: string | null): Promise<void> {
    const marca = await this.marcaDe(marcaId);
    await this.send(to, pedidoConfirmadoEmail(pedidoId, marca), marca);
  }

  async sendChatNuevo(to: string, primerMensaje: string, url: string, marcaId?: string | null): Promise<void> {
    const marca = await this.marcaDe(marcaId);
    await this.send(to, chatNuevoEmail(primerMensaje, url, marca), marca);
  }

  async sendLeadNuevo(to: string, nombre: string, interes: string, url: string, marcaId?: string | null): Promise<void> {
    const marca = await this.marcaDe(marcaId);
    await this.send(to, leadNuevoEmail(nombre, interes, url, marca), marca);
  }

  async sendHojaConsumidor(to: string, h: HojaCorreo, marcaId?: string | null): Promise<void> {
    const marca = await this.marcaDe(marcaId);
    await this.send(to, hojaConsumidorEmail(h, marca), marca);
  }

  async sendHojaEquipo(to: string, h: HojaCorreo, url: string, marcaId?: string | null): Promise<void> {
    const marca = await this.marcaDe(marcaId);
    await this.send(to, hojaEquipoEmail(h, url, marca), marca);
  }

  async sendRespuestaReclamo(to: string, d: Parameters<typeof respuestaReclamoEmail>[0], marcaId?: string | null): Promise<void> {
    const marca = await this.marcaDe(marcaId);
    await this.send(to, respuestaReclamoEmail(d, marca), marca);
  }

  async sendContactoNuevo(to: string, titulo: string, nombre: string, mensaje: string, url: string, marcaId?: string | null): Promise<void> {
    const marca = await this.marcaDe(marcaId);
    await this.send(to, contactoNuevoEmail(titulo, nombre, mensaje, url, marca), marca);
  }

  async sendInvitacion(to: string, nombreMarca: string, rol: string, url: string, dias: number, marcaId?: string | null): Promise<void> {
    const marca = (await this.marcaDe(marcaId)) ?? { nombre: nombreMarca };
    await this.send(to, invitacionEmail(nombreMarca, rol, url, dias, marca), marca);
  }

  /** Aviso genérico por correo (no lanza si el envío falla: `send` solo registra el error). Con `d.marca` firma esa marca. */
  async sendAviso(to: string, d: Parameters<typeof avisoEmail>[0]): Promise<void> {
    await this.send(to, avisoEmail(d), d.marca);
  }

  async sendCodigoCuenta(to: string, codigo: string, minutos: number, marcaId?: string | null): Promise<void> {
    const marca = await this.marcaDe(marcaId);
    await this.send(to, codigoCuentaEmail(codigo, minutos, marca), marca);
  }

  async sendPedidoNuevoEquipo(to: string, datos: Parameters<typeof pedidoNuevoEquipoEmail>[0], marcaId?: string | null): Promise<void> {
    const marca = await this.marcaDe(marcaId);
    await this.send(to, pedidoNuevoEquipoEmail(datos, marca), marca);
  }

  /** Envía la cotización de un servicio al cliente. A diferencia de los avisos, el error SÍ se propaga (el equipo debe saber si no salió). */
  async sendCotizacionServicio(to: string, datos: CotizacionCorreo, adjuntos?: Adjunto[], marcaId?: string | null): Promise<void> {
    const marca = await this.marcaDe(marcaId);
    const { subject, html } = cotizacionServicioEmail(datos, marca);
    await this.sendConError(to, subject, html, adjuntos, marca);
  }

  /** Envía el presupuesto mayorista al cliente (enlace al documento). El error se propaga: el equipo debe saber si no salió. */
  async sendPresupuestoCliente(to: string, datos: Parameters<typeof presupuestoClienteEmail>[0], adjuntos?: Adjunto[], marcaId?: string | null): Promise<void> {
    const marca = await this.marcaDe(marcaId);
    const { subject, html } = presupuestoClienteEmail(datos, marca);
    await this.sendConError(to, subject, html, adjuntos, marca);
  }

  /** Remitente con el nombre de la marca: `"Fimav" <no-reply@…>` (la dirección es la configurada; solo cambia el nombre visible). */
  private remitente(marca?: MarcaCorreo): string {
    const direccion = /<([^>]+)>/.exec(this.fromEmail)?.[1] ?? this.fromEmail;
    const nombre = tema(marca).nombre.replace(/["<>\r\n]/g, '').trim();
    return nombre ? `"${nombre}" <${direccion}>` : this.fromEmail;
  }

  /** Envío cuyo error se propaga (el equipo debe saber si no salió); `adjuntos` = PDF generados en el servidor. */
  private async sendConError(to: string, subject: string, html: string, attachments?: Adjunto[], marca?: MarcaCorreo): Promise<void> {
    const from = this.remitente(marca);
    if (this.driver === 'resend') {
      // El SDK de Resend NO lanza: devuelve { error }. Sin esta revisión un dominio sin verificar o una API key mala pasa en silencio.
      const { error } = await this.resend!.emails.send({ from, to, subject, html, ...(attachments?.length ? { attachments } : {}) });
      if (error) throw new Error(`Resend: ${error.name} - ${error.message}`);
    } else {
      await this.smtpTransport!.sendMail({ from, to, subject, html, ...(attachments?.length ? { attachments } : {}) });
    }
  }

  private async send(to: string, { subject, html }: { subject: string; html: string }, marca?: MarcaCorreo): Promise<void> {
    const from = this.remitente(marca);
    try {
      if (this.driver === 'resend') {
        const { error } = await this.resend!.emails.send({ from, to, subject, html });
        if (error) throw new Error(`Resend: ${error.name} - ${error.message}`);
      } else {
        await this.smtpTransport!.sendMail({ from, to, subject, html });
      }
    } catch (error) {
      // No se interrumpe el flujo de negocio si el envío de correo falla;
      // se registra para poder reintentar/alertar.
      this.logger.error(`No se pudo enviar el correo a ${to}`, error as Error);
    }
  }
}
