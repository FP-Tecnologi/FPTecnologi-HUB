import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { normalizarCelular } from '../cotizador/cotizador.service.js';
import { CrearPresupuestoDto } from './dto/crear-presupuesto.dto.js';

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
  constructor(private readonly prisma: PrismaService) {}

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
