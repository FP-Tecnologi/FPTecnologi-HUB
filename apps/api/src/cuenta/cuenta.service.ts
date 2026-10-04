import { HttpException, HttpStatus, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { createHmac, randomInt, timingSafeEqual } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import { MailService } from '../mail/mail.service.js';
import { normalizeEmail } from '../common/utils/normalize-email.js';

const CODIGO_MIN = 10;
const MAX_INTENTOS = 5;
const SESION_DIAS = 30;
const VENTANA_MS = 10 * 60_000;
const MAX_PEDIDOS_CODIGO = 4;
const pedidosCodigo = new Map<string, number[]>();

const b64 = (s: string) => Buffer.from(s).toString('base64url');

/**
 * "Mi cuenta" del cliente: acceso sin contraseña. Se pide un código al correo (solo sale si ese correo tiene
 * pedidos o cotizaciones en la marca) y, al verificarlo, se emite un token firmado de la forma
 * `<payload>.<firma>` con { correo, marca, vencimiento }. No crea usuarios ni da acceso al dashboard: el token
 * solo sirve para leer los pedidos y cotizaciones de ESE correo.
 */
@Injectable()
export class CuentaService {
  private readonly logger = new Logger(CuentaService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  // ------------------------------------------------------------------ token

  private firmar(payload: string) {
    return createHmac('sha256', process.env.JWT_ACCESS_SECRET ?? 'dev').update(`cuenta:${payload}`).digest('base64url');
  }

  emitirToken(email: string, marcaId: string, ahora = Date.now()) {
    const exp = ahora + SESION_DIAS * 24 * 60 * 60 * 1000;
    const payload = b64(JSON.stringify({ e: email, m: marcaId, x: exp }));
    return { token: `${payload}.${this.firmar(payload)}`, expiresAt: new Date(exp).toISOString() };
  }

  /** Devuelve el correo del token si la firma, la marca y el vencimiento son válidos. */
  leerToken(token: string | undefined, marcaId: string, ahora = Date.now()): string {
    const [payload, firma] = (token ?? '').split('.');
    if (!payload || !firma) throw new UnauthorizedException('Sesión no válida');
    const esperado = Buffer.from(this.firmar(payload));
    const recibido = Buffer.from(firma);
    if (esperado.length !== recibido.length || !timingSafeEqual(esperado, recibido)) throw new UnauthorizedException('Sesión no válida');
    try {
      const d = JSON.parse(Buffer.from(payload, 'base64url').toString()) as { e: string; m: string; x: number };
      if (d.m !== marcaId) throw new UnauthorizedException('Sesión no válida');
      if (d.x < ahora) throw new UnauthorizedException('Tu sesión venció. Vuelve a entrar.');
      return d.e;
    } catch (e) {
      if (e instanceof UnauthorizedException) throw e;
      throw new UnauthorizedException('Sesión no válida');
    }
  }

  // ------------------------------------------------------------------ código

  /** Siempre responde igual (no revela si el correo tiene compras); el código solo se envía si las tiene. */
  async pedirCodigo(marcaId: string, emailRaw: string, ip: string) {
    const email = normalizeEmail(emailRaw);
    this.limitar(`${marcaId}:${email}`);
    this.limitar(`${marcaId}:ip:${ip}`);

    const [pedidos, cotizaciones, socios] = await Promise.all([
      this.prisma.pedido.count({ where: { marcaId, email: { equals: email, mode: 'insensitive' } } }),
      this.prisma.cotizacion.count({ where: { marcaId, clienteEmail: { equals: email, mode: 'insensitive' } } }),
      this.prisma.socio.count({ where: { marcaId, email, activo: true } }), // los socios entran aunque aún no hayan comprado
    ]);
    if (pedidos + cotizaciones + socios > 0) {
      const codigo = String(randomInt(0, 1_000_000)).padStart(6, '0');
      await this.prisma.codigoCuenta.create({
        data: { marcaId, email, codigoHash: await bcrypt.hash(codigo, 10), expiresAt: new Date(Date.now() + CODIGO_MIN * 60_000) },
      });
      this.mail.sendCodigoCuenta(email, codigo, CODIGO_MIN).catch((e) => this.logger.error('No se pudo enviar el código de cuenta', e as Error));
    }
    return { enviado: true as const };
  }

  async verificar(marcaId: string, emailRaw: string, codigo: string) {
    const email = normalizeEmail(emailRaw);
    const fila = await this.prisma.codigoCuenta.findFirst({
      where: { marcaId, email, consumedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    const invalido = new UnauthorizedException('Código inválido o vencido');
    if (!fila || fila.expiresAt < new Date() || fila.intentos >= MAX_INTENTOS) throw invalido;
    if (!(await bcrypt.compare(codigo.trim(), fila.codigoHash))) {
      await this.prisma.codigoCuenta.updateMany({ where: { id: fila.id, marcaId }, data: { intentos: { increment: 1 } } });
      throw invalido;
    }
    await this.prisma.codigoCuenta.updateMany({ where: { id: fila.id, marcaId }, data: { consumedAt: new Date() } });
    return this.emitirToken(email, marcaId);
  }

  // ------------------------------------------------------------------ datos

  /** Todo lo del cliente (por su correo verificado): pedidos con su envío y cotizaciones ya enviadas. */
  async resumen(marcaId: string, token: string | undefined) {
    const email = this.leerToken(token, marcaId);
    const [pedidos, cotizaciones] = await Promise.all([
      this.prisma.pedido.findMany({
        where: { marcaId, email: { equals: email, mode: 'insensitive' } },
        select: {
          id: true, numeroPedido: true, nombre: true, celular: true, estado: true, estadoPago: true, metodoPago: true, subtotal: true, igv: true,
          envio: true, total: true, moneda: true, createdAt: true, direccion: true, distrito: true,
          envioProveedor: true, envioDepartamento: true, envioSede: true, envioPlazo: true, trackingCodigo: true,
          items: { select: { cantidad: true, subtotal: true, nombreSnapshot: true, skuSnapshot: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.cotizacion.findMany({
        where: { marcaId, clienteEmail: { equals: email, mode: 'insensitive' } },
        // Sin notas internas ni atendidoPor. La propuesta solo se muestra si el equipo ya la envió.
        select: {
          id: true, numero: true, estado: true, mensaje: true, propuesta: true, monto: true, moneda: true, validezHasta: true, enviadaAt: true,
          createdAt: true, servicio: { select: { nombre: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);
    const nombre = pedidos[0]?.nombre ?? (await this.nombreDeCotizacion(marcaId, email));
    const socio = (await this.prisma.socio.count({ where: { marcaId, email, activo: true } })) > 0;
    return {
      email,
      socio,
      nombre,
      celular: pedidos[0]?.celular ?? null,
      pedidos,
      cotizaciones: cotizaciones.map((c) => ({ ...c, propuesta: c.enviadaAt ? c.propuesta : null, monto: c.enviadaAt ? c.monto : null, validezHasta: c.enviadaAt ? c.validezHasta : null })),
    };
  }

  private async nombreDeCotizacion(marcaId: string, email: string) {
    const c = await this.prisma.cotizacion.findFirst({ where: { marcaId, clienteEmail: { equals: email, mode: 'insensitive' } }, select: { clienteNombre: true }, orderBy: { createdAt: 'desc' } });
    return c?.clienteNombre ?? null;
  }

  private limitar(clave: string) {
    const ahora = Date.now();
    const recientes = (pedidosCodigo.get(clave) ?? []).filter((t) => ahora - t < VENTANA_MS);
    if (recientes.length >= MAX_PEDIDOS_CODIGO) {
      throw new HttpException('Demasiados intentos. Espera unos minutos y vuelve a pedir el código.', HttpStatus.TOO_MANY_REQUESTS);
    }
    recientes.push(ahora);
    pedidosCodigo.set(clave, recientes);
    if (pedidosCodigo.size > 5000) for (const [k, v] of pedidosCodigo) if (!v.some((t) => ahora - t < VENTANA_MS)) pedidosCodigo.delete(k);
  }
}
