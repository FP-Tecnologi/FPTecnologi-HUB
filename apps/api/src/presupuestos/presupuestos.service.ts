import { BadRequestException, HttpException, HttpStatus, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { MailService } from '../mail/mail.service.js';
import { EstadoCotizacion } from '../generated/prisma/enums.js';
import { normalizarCelular } from '../cotizador/cotizador.service.js';
import { CrearPresupuestoDto } from './dto/crear-presupuesto.dto.js';
import { dineroPdf, empresaPdf, fechaPdf, generarPdf } from '../common/documento-pdf.js';

// Roles del dashboard que reciben el aviso de presupuesto nuevo.
const ROLES_AVISO = ['admin', 'comercial', 'ventas'];

// IGV Perú 18%: los precios del catálogo son sin IGV y se suma aquí, en el servidor.
const TASA_IGV = 0.18;
const VALIDEZ_DIAS = 7;

// Tope por IP+marca (endpoint público, throttler global deshabilitado).
const VENTANA_MS = 10 * 60_000;
const MAX_POR_VENTANA = 5;
const intentos = new Map<string, number[]>();

const redondear = (n: number) => Math.round(n * 100) / 100;

@Injectable()
export class PresupuestosService {
  private readonly logger = new Logger(PresupuestosService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  async crear(marcaId: string, dto: CrearPresupuestoDto, ip = '') {
    // Honeypot: se responde "ok" sin guardar para no darle pistas al bot.
    if (dto.website) return { ok: true as const, id: null as string | null, numero: null as string | null };
    this.limitar(`${marcaId}:${ip}`);

    let telefono: string | null = null;
    if (dto.clienteTelefono?.trim()) {
      telefono = normalizarCelular(dto.clienteTelefono);
      if (!telefono) throw new BadRequestException('Ingresa un celular válido de 9 dígitos');
    }

    // Un mismo SKU repetido se suma en una sola línea.
    const porSku = new Map<string, number>();
    for (const i of dto.items) porSku.set(i.sku, (porSku.get(i.sku) ?? 0) + i.cantidad);
    const productos = await this.prisma.producto.findMany({ where: { marcaId, activo: true, sku: { in: [...porSku.keys()] } } });
    if (productos.length !== porSku.size) throw new BadRequestException('Uno o más productos ya no están disponibles');

    // Precio aplicado: el de mayorista si el producto lo tiene; si no, el precio normal.
    let subtotal = 0;
    const items = productos.map((p) => {
      const cantidad = porSku.get(p.sku)!;
      const mayorista = p.precioMayorista != null;
      const precioUnitario = Number(mayorista ? p.precioMayorista : p.precio);
      const lineal = redondear(precioUnitario * cantidad);
      subtotal += lineal;
      return {
        productoId: p.id,
        sku: p.sku,
        nombre: p.nombre,
        cantidad,
        precioLista: Number(p.precio),
        precioUnitario,
        mayorista,
        subtotal: lineal,
      };
    });
    subtotal = redondear(subtotal);
    const igv = redondear(subtotal * TASA_IGV);
    const total = redondear(subtotal + igv);
    const validezHasta = new Date(Date.now() + VALIDEZ_DIAS * 24 * 60 * 60 * 1000);

    for (let intento = 0; intento < 3; intento++) {
      const numero = `COT-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      try {
        const p = await this.prisma.presupuesto.create({
          data: {
            marcaId,
            numero,
            clienteNombre: dto.clienteNombre.trim(),
            clienteDocumento: dto.clienteDocumento?.trim() || null,
            clienteEmail: dto.clienteEmail.trim().toLowerCase(),
            clienteTelefono: telefono,
            clienteDireccion: dto.clienteDireccion?.trim() || null,
            notas: dto.notas?.trim() || null,
            origen: dto.origen?.trim() || null,
            subtotal,
            igv,
            total,
            validezHasta,
            items: { create: items },
          },
        });
        // Avisos en segundo plano: un fallo de correo no debe impedir que el cliente vea su presupuesto.
        this.avisarEquipo(marcaId, p.id, p.clienteNombre, p.numero, total).catch((e) => this.logger.error('No se pudo avisar al equipo del presupuesto nuevo', e as Error));
        this.enviarAlCliente(marcaId, p).catch((e) => this.logger.error(`No se pudo enviar el presupuesto ${p.numero} al cliente`, e as Error));
        return { ok: true as const, id: p.id, numero: p.numero };
      } catch (e) {
        // P2002 = chocó el correlativo con otra solicitud simultánea: reintentar.
        if (e && typeof e === 'object' && (e as { code?: string }).code === 'P2002' && intento < 2) continue;
        throw e;
      }
    }
    throw new BadRequestException('No se pudo registrar el presupuesto');
  }

  /** Documento del presupuesto para la web pública (se accede por su id, que es un UUID no adivinable). */
  async verPublico(marcaId: string, id: string) {
    const p = await this.prisma.presupuesto.findFirst({
      where: { id, marcaId },
      include: { items: { orderBy: { nombre: 'asc' } } },
    });
    if (!p) throw new NotFoundException('Presupuesto no encontrado');
    return p;
  }

  // ---------------------------------------------------------------- dashboard

  findAll(marcaId: string) {
    return this.prisma.presupuesto.findMany({
      where: { marcaId },
      include: { _count: { select: { items: true } } },
      orderBy: { createdAt: 'desc' },
      take: 1000,
    });
  }

  async findOne(marcaId: string, id: string) {
    const p = await this.prisma.presupuesto.findFirst({ where: { id, marcaId }, include: { items: { orderBy: { nombre: 'asc' } } } });
    if (!p) throw new NotFoundException('Presupuesto no encontrado');
    return p;
  }

  async cambiarEstado(marcaId: string, id: string, estado: EstadoCotizacion) {
    await this.findOne(marcaId, id);
    await this.prisma.presupuesto.updateMany({ where: { id, marcaId }, data: { estado } });
    return this.findOne(marcaId, id);
  }

  /** Reenvía el presupuesto al correo del cliente (el error se informa al equipo). */
  async reenviar(marcaId: string, id: string) {
    const p = await this.findOne(marcaId, id);
    try {
      await this.enviarAlCliente(marcaId, p);
    } catch (e) {
      this.logger.error(`No se pudo enviar el presupuesto ${p.numero}`, e as Error);
      throw new BadRequestException('No se pudo enviar el correo. Revisa la configuración de correo e inténtalo de nuevo.');
    }
    if (p.estado === EstadoCotizacion.PENDIENTE) await this.prisma.presupuesto.updateMany({ where: { id, marcaId }, data: { estado: EstadoCotizacion.ENVIADA } });
    return { ok: true as const, destinatario: p.clienteEmail };
  }

  async eliminar(marcaId: string, id: string) {
    await this.findOne(marcaId, id);
    await this.prisma.presupuesto.deleteMany({ where: { id, marcaId } });
    return { eliminado: true };
  }

  /** PDF del presupuesto generado en el servidor (se descarga desde la web y va adjunto en el correo al cliente). */
  async pdf(marcaId: string, id: string) {
    const p = await this.verPublico(marcaId, id);
    const m = p.moneda;
    const buffer = await generarPdf({
      empresa: await empresaPdf(this.prisma, marcaId),
      tipo: 'Presupuesto',
      numero: p.numero,
      meta: [
        ['Cliente', p.clienteNombre],
        ['RUC / DNI', p.clienteDocumento ?? ''],
        ['Correo', p.clienteEmail],
        ['Teléfono', p.clienteTelefono ?? ''],
        ['Dirección', p.clienteDireccion ?? ''],
        ['Fecha', fechaPdf(p.createdAt)],
        ['Válido hasta', fechaPdf(p.validezHasta)],
      ].filter(([, v]) => v) as [string, string][],
      tabla: {
        columnas: ['Producto', 'Cant.', 'P. unit.', 'Subtotal'],
        anchos: [255, 50, 95, 95],
        filas: p.items.map((i) => [`${i.nombre}
SKU ${i.sku}${i.mayorista ? ' · precio mayorista' : ''}`, String(i.cantidad), dineroPdf(i.precioUnitario, m), dineroPdf(i.subtotal, m)]),
      },
      totales: [['Subtotal', dineroPdf(p.subtotal, m)], ['IGV (18 %)', dineroPdf(p.igv, m)], ['Total', dineroPdf(p.total, m)]],
      textos: [{ titulo: 'Notas del cliente', texto: p.notas ?? '' }],
      pie: 'Precios sin IGV en el catálogo; el IGV se suma en este documento. Vigente hasta la fecha indicada.',
    });
    return { buffer, nombre: `presupuesto-${p.numero}.pdf` };
  }

  private async enviarAlCliente(marcaId: string, p: { id: string; numero: string; clienteNombre: string; clienteEmail: string; total: unknown; validezHasta: Date }) {
    const web = process.env.WEB_PUBLICA_URL ?? 'https://fptecnologi.com';
    // El PDF es un extra: si no se puede generar, el correo sale igual con el enlace al documento.
    const adjunto = await this.pdf(marcaId, p.id).then((r) => [{ filename: r.nombre, content: r.buffer }]).catch((e) => { this.logger.error(`No se pudo generar el PDF del presupuesto ${p.numero}`, e as Error); return undefined; });
    return this.mail.sendPresupuestoCliente(p.clienteEmail, {
      numero: p.numero,
      cliente: p.clienteNombre,
      total: `US$ ${Number(p.total).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      validezHasta: p.validezHasta.toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' }),
      url: `${web}/presupuesto/${p.id}`,
    }, adjunto);
  }

  private async avisarEquipo(marcaId: string, id: string, cliente: string, numero: string, total: number) {
    const asignaciones = await this.prisma.usuarioMarcaRol.findMany({
      where: { marcaId, rol: { nombre: { in: ROLES_AVISO } } },
      include: { usuario: { select: { id: true, email: true, activo: true } } },
    });
    const usuarios = [...new Map(asignaciones.filter((a) => a.usuario.activo).map((a) => [a.usuario.id, a.usuario])).values()];
    if (usuarios.length === 0) return;
    const url = `${process.env.WEB_ORIGIN ?? 'http://localhost:3000'}/ecommerce/presupuestos?id=${id}`;
    await this.prisma.notificacion.createMany({
      data: usuarios.map((u) => ({
        marcaId,
        usuarioId: u.id,
        tipo: 'COTIZACION' as const,
        titulo: 'Nuevo presupuesto mayorista',
        mensaje: `${cliente} pidió el presupuesto ${numero} por US$ ${total.toFixed(2)}`.slice(0, 140),
      })),
    });
    await Promise.all(usuarios.map((u) => this.mail.sendLeadNuevo(u.email, cliente, `Presupuesto mayorista ${numero}`, url)));
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
}
