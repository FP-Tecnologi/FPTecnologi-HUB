import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

export interface ClienteTienda {
  email: string;
  nombre: string;
  celular: string;
  documento: string | null;
  pedidos: number;
  gastado: number; // suma de pedidos no cancelados, en la moneda del pedido (USD)
  ultimoPedido: string; // ISO
  cotizaciones: number;
}

/**
 * Clientes de la tienda: no hay tabla propia, se derivan de los pedidos (invitados, agrupados por correo)
 * y de las solicitudes de cotización de servicios. Así nunca quedan desfasados de lo que realmente compraron.
 */
@Injectable()
export class ClientesTiendaService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(marcaId: string): Promise<ClienteTienda[]> {
    const [pedidos, cotizaciones] = await Promise.all([
      this.prisma.pedido.findMany({
        where: { marcaId },
        select: { email: true, nombre: true, celular: true, documento: true, total: true, estado: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 5000,
      }),
      this.prisma.cotizacion.groupBy({ by: ['clienteEmail'], where: { marcaId }, _count: { _all: true } }),
    ]);
    const cotPorEmail = new Map(cotizaciones.map((c) => [c.clienteEmail.toLowerCase(), c._count._all]));

    const porEmail = new Map<string, ClienteTienda>();
    // Más reciente primero: el primer pedido de cada correo aporta los datos de contacto vigentes.
    for (const p of pedidos) {
      const email = p.email.trim().toLowerCase();
      if (!email) continue;
      const c = porEmail.get(email) ?? {
        email,
        nombre: p.nombre,
        celular: p.celular,
        documento: p.documento,
        pedidos: 0,
        gastado: 0,
        ultimoPedido: p.createdAt.toISOString(),
        cotizaciones: cotPorEmail.get(email) ?? 0,
      };
      c.pedidos += 1;
      if (p.estado !== 'CANCELADO') c.gastado += Number(p.total);
      porEmail.set(email, c);
    }
    return [...porEmail.values()].map((c) => ({ ...c, gastado: Math.round(c.gastado * 100) / 100 }));
  }

  async detalle(marcaId: string, email: string) {
    const correo = email?.trim().toLowerCase();
    if (!correo) throw new BadRequestException('Falta el correo del cliente');
    const [pedidos, cotizaciones] = await Promise.all([
      this.prisma.pedido.findMany({
        where: { marcaId, email: { equals: correo, mode: 'insensitive' } },
        select: { id: true, numeroPedido: true, estado: true, estadoPago: true, total: true, moneda: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.cotizacion.findMany({
        where: { marcaId, clienteEmail: { equals: correo, mode: 'insensitive' } },
        select: { id: true, numero: true, estado: true, monto: true, moneda: true, createdAt: true, servicio: { select: { nombre: true } } },
        orderBy: { createdAt: 'desc' },
      }),
    ]);
    return { pedidos, cotizaciones };
  }
}
