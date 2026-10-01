import { BadRequestException, HttpException, HttpStatus, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { MailService } from '../mail/mail.service.js';
import { CreatePedidoDto } from './dto/create-pedido.dto.js';
import { UpdateEstadoPedidoDto } from './dto/update-estado-pedido.dto.js';
import { CrearPedidoPublicoDto } from './dto/crear-pedido-publico.dto.js';
import { normalizarCelular } from '../cotizador/cotizador.service.js';

// Roles del dashboard que reciben el aviso de pedido nuevo.
const ROLES_AVISO = ['admin', 'ventas'];

// IGV Perú 18% — los precios del catálogo son sin IGV y se suma aquí,
// en el servidor (nunca se confía en totales que mande el cliente).
const TASA_IGV = 0.18;

// Tope por IP+marca: el endpoint es público y el throttler global está
// deshabilitado (ver app.module). En memoria alcanza para frenar spam básico.
const VENTANA_MS = 10 * 60_000;
const MAX_POR_VENTANA = 5;
const intentos = new Map<string, number[]>();

const redondear = (n: number) => Math.round(n * 100) / 100;

@Injectable()
export class PedidosService {
  private readonly logger = new Logger(PedidosService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  async create(marcaId: string, dto: CreatePedidoDto) {
    const productoIds = dto.items.map((i) => i.productoId);
    const productos = await this.prisma.producto.findMany({
      where: { id: { in: productoIds }, marcaId },
    });
    if (productos.length !== productoIds.length) {
      throw new BadRequestException('Uno o más productos no pertenecen a esta marca');
    }

    const productosPorId = new Map(productos.map((p) => [p.id, p]));
    let total = 0;
    const itemsData = dto.items.map((item) => {
      const producto = productosPorId.get(item.productoId)!;
      const precioUnitario = Number(producto.precio);
      total += precioUnitario * item.cantidad;
      return {
        productoId: item.productoId,
        cantidad: item.cantidad,
        precioUnitario,
      };
    });

    return this.prisma.pedido.create({
      data: {
        marcaId,
        clienteId: dto.clienteId,
        total,
        items: { create: itemsData },
      },
      include: { items: true },
    });
  }

  /**
   * Checkout invitado fase 1 (sin pasarela). Precios y totales se calculan
   * server-side desde el catálogo; el stock se descuenta de forma atómica
   * dentro de la transacción para no sobrevender. Cada ítem guarda snapshot
   * (nombre/SKU/precio/IGV) para que la factura no cambie si el producto
   * cambia después. Queda PENDIENTE / pago POR_CONFIRMAR: la venta se
   * coordina por WhatsApp.
   */
  async crearPublico(marcaId: string, dto: CrearPedidoPublicoDto, ip: string) {
    // Honeypot: se responde "ok" sin guardar para no darle pistas al bot.
    if (dto.website) return { ok: true, numeroPedido: null as string | null, total: 0 };

    const marca = await this.prisma.marca.findUnique({ where: { id: marcaId } });
    if (!marca) throw new BadRequestException('Marca inválida');

    this.limitar(`${marcaId}:${ip}`);

    const celular = normalizarCelular(dto.celular);
    if (!celular) throw new BadRequestException('Ingresa un celular válido de 9 dígitos');

    const productoIds = [...new Set(dto.items.map((i) => i.productoId))];
    const productos = await this.prisma.producto.findMany({
      where: { id: { in: productoIds }, marcaId, activo: true },
    });
    if (productos.length !== productoIds.length) {
      throw new BadRequestException('Uno o más productos no están disponibles');
    }
    const porId = new Map(productos.map((p) => [p.id, p]));
    for (const item of dto.items) {
      const p = porId.get(item.productoId)!;
      if (p.stock < item.cantidad) {
        throw new BadRequestException(`Stock insuficiente para ${p.nombre} (quedan ${p.stock})`);
      }
    }

    // Totales server-side (nunca se confía en lo que mande el cliente).
    let subtotal = 0;
    let igv = 0;
    const itemsData = dto.items.map((item) => {
      const p = porId.get(item.productoId)!;
      const precioUnitario = redondear(Number(p.precio));
      const igvUnitario = redondear(precioUnitario * TASA_IGV);
      const sub = redondear((precioUnitario + igvUnitario) * item.cantidad);
      subtotal = redondear(subtotal + precioUnitario * item.cantidad);
      igv = redondear(igv + igvUnitario * item.cantidad);
      return {
        productoId: item.productoId,
        cantidad: item.cantidad,
        precioUnitario,
        nombreSnapshot: p.nombre,
        skuSnapshot: p.sku,
        igvUnitario,
        subtotal: sub,
      };
    });
    const total = redondear(subtotal + igv);

    // Sin transacción interactiva a propósito: el pooler :6543 de Supabase no
    // la soporta. El descuento es atómico y condicional (updateMany solo toca
    // la fila si queda stock), así no se sobrevende; si el create falla se
    // devuelve el stock descontado (compensación best-effort).
    const descontados: Array<{ productoId: string; cantidad: number }> = [];
    try {
      for (const item of dto.items) {
        const r = await this.prisma.producto.updateMany({
          where: { id: item.productoId, marcaId, stock: { gte: item.cantidad } },
          data: { stock: { decrement: item.cantidad } },
        });
        if (r.count === 0) {
          throw new BadRequestException(`Stock insuficiente para ${porId.get(item.productoId)!.nombre}`);
        }
        descontados.push(item);
      }
    } catch (e) {
      await this.devolverStock(marcaId, descontados);
      throw e;
    }

    // Correlativo humano único por marca, con reintento ante colisión.
    let numeroPedido = '';
    for (let intento = 0; intento < 3; intento++) {
      numeroPedido = `FP-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      try {
        await this.prisma.pedido.create({
          data: {
            marcaId,
            numeroPedido,
            nombre: dto.nombre.trim(),
            email: dto.email.trim().toLowerCase(),
            celular,
            documento: dto.documento?.trim() || null,
            direccion: dto.direccion?.trim() || null,
            distrito: dto.distrito?.trim() || null,
            notas: dto.notas?.trim() || null,
            metodoPago: dto.metodoPago?.trim() || null,
            estadoPago: 'POR_CONFIRMAR',
            subtotal,
            igv,
            envio: 0,
            descuento: 0,
            total,
            moneda: 'USD',
            items: { create: itemsData },
          },
        });
        break;
      } catch (e) {
        // P2002 = chocó el correlativo con otro pedido simultáneo: reintentar.
        if (e && typeof e === 'object' && (e as { code?: string }).code === 'P2002' && intento < 2) continue;
        await this.devolverStock(marcaId, descontados);
        throw e;
      }
    }

    this.avisarEquipo(marcaId, numeroPedido, dto.nombre.trim(), total).catch((e) =>
      this.logger.error('No se pudo avisar al equipo del pedido nuevo', e as Error),
    );
    this.mail.sendPedidoConfirmado(dto.email.trim().toLowerCase(), numeroPedido).catch((e) =>
      this.logger.error('No se pudo enviar la confirmación del pedido', e as Error),
    );
    return { ok: true as const, numeroPedido, total };
  }

  findAll(marcaId: string) {
    return this.prisma.pedido.findMany({
      where: { marcaId },
      include: { items: { include: { producto: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(marcaId: string, id: string) {
    const pedido = await this.prisma.pedido.findFirst({
      where: { id, marcaId },
      include: { items: { include: { producto: true } } },
    });
    if (!pedido) {
      throw new NotFoundException('Pedido no encontrado');
    }
    return pedido;
  }

  /**
   * Cambia estado y/o estado de pago. Cancelar un pedido devuelve el stock que
   * se descontó al comprar; un pedido cancelado no se puede reactivar (el stock
   * ya volvió al inventario y pudo venderse a otro).
   */
  async updateEstado(marcaId: string, id: string, dto: UpdateEstadoPedidoDto) {
    if (dto.estado === undefined && dto.estadoPago === undefined) {
      throw new BadRequestException('Indica el estado o el estado de pago');
    }
    const pedido = await this.prisma.pedido.findFirst({ where: { id, marcaId }, include: { items: true } });
    if (!pedido) throw new NotFoundException('Pedido no encontrado');

    const cancelando = dto.estado === 'CANCELADO' && pedido.estado !== 'CANCELADO';
    if (pedido.estado === 'CANCELADO' && dto.estado !== undefined && dto.estado !== 'CANCELADO') {
      throw new BadRequestException('Un pedido cancelado no se puede reactivar');
    }

    const actualizado = await this.prisma.pedido.update({
      where: { id, marcaId },
      data: {
        ...(dto.estado !== undefined ? { estado: dto.estado } : {}),
        ...(dto.estadoPago !== undefined ? { estadoPago: dto.estadoPago } : {}),
      },
    });
    if (cancelando) await this.devolverStock(marcaId, pedido.items.map((i) => ({ productoId: i.productoId, cantidad: i.cantidad })));
    return actualizado;
  }

  /** Devuelve stock descontado si el pedido no llegó a crearse (best-effort). */
  private async devolverStock(marcaId: string, items: Array<{ productoId: string; cantidad: number }>) {
    for (const item of items) {
      try {
        await this.prisma.producto.updateMany({
          where: { id: item.productoId, marcaId },
          data: { stock: { increment: item.cantidad } },
        });
      } catch (e) {
        this.logger.error(`No se pudo devolver stock de ${item.productoId}`, e as Error);
      }
    }
  }

  private limitar(clave: string) {
    const ahora = Date.now();
    const recientes = (intentos.get(clave) ?? []).filter((t) => ahora - t < VENTANA_MS);
    if (recientes.length >= MAX_POR_VENTANA) {
      throw new HttpException('Demasiadas solicitudes seguidas. Intenta de nuevo en unos minutos.', HttpStatus.TOO_MANY_REQUESTS);
    }
    recientes.push(ahora);
    intentos.set(clave, recientes);
    if (intentos.size > 5000) for (const [k, v] of intentos) if (!v.some((t) => ahora - t < VENTANA_MS)) intentos.delete(k);
  }

  private async avisarEquipo(marcaId: string, numero: string, nombre: string, total: number) {
    const asignaciones = await this.prisma.usuarioMarcaRol.findMany({
      where: { marcaId, rol: { nombre: { in: ROLES_AVISO } } },
      include: { usuario: { select: { id: true, activo: true } } },
    });
    const ids = [...new Set(asignaciones.filter((a) => a.usuario.activo).map((a) => a.usuario.id))];
    if (ids.length === 0) return;
    await this.prisma.notificacion.createMany({
      data: ids.map((usuarioId) => ({
        marcaId,
        usuarioId,
        tipo: 'PEDIDO' as const,
        titulo: `Nuevo pedido ${numero}`,
        mensaje: `${nombre} compró por USD ${total.toFixed(2)} (pago por confirmar)`.slice(0, 140),
      })),
    });
  }
}
