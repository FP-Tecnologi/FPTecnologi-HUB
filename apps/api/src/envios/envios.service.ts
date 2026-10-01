import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { ActualizarTarifaDto, CrearTarifaDto } from './envios.dto.js';

export const PROVEEDOR_DEFECTO = 'SHALOM';

const limpiarSedes = (sedes?: string[]) =>
  [...new Set((sedes ?? []).map((s) => s.trim()).filter(Boolean))];

@Injectable()
export class EnviosService {
  constructor(private readonly prisma: PrismaService) {}

  /** Tarifario completo (dashboard). */
  tarifas(marcaId: string) {
    return this.prisma.tarifaEnvio.findMany({ where: { marcaId }, orderBy: { departamento: 'asc' } });
  }

  /** Solo lo activo, para el checkout público. */
  async tarifasPublicas(marcaId: string) {
    const filas = await this.prisma.tarifaEnvio.findMany({
      where: { marcaId, activo: true },
      orderBy: { departamento: 'asc' },
    });
    return filas.map((t) => ({
      departamento: t.departamento,
      proveedor: t.proveedor,
      costo: Number(t.costo),
      plazoDias: t.plazoDias,
      sedes: t.sedes,
    }));
  }

  async crear(marcaId: string, dto: CrearTarifaDto) {
    const departamento = dto.departamento.trim();
    const existe = await this.prisma.tarifaEnvio.findFirst({
      where: { marcaId, proveedor: PROVEEDOR_DEFECTO, departamento },
    });
    if (existe) throw new ConflictException('Ya existe una tarifa para ese departamento');
    return this.prisma.tarifaEnvio.create({
      data: {
        marcaId,
        departamento,
        proveedor: PROVEEDOR_DEFECTO,
        costo: dto.costo,
        plazoDias: dto.plazoDias?.trim() || null,
        sedes: limpiarSedes(dto.sedes),
        activo: dto.activo ?? true,
      },
    });
  }

  async actualizar(marcaId: string, id: string, dto: ActualizarTarifaDto) {
    const data: Record<string, unknown> = {};
    if (dto.costo !== undefined) data.costo = dto.costo;
    if (dto.plazoDias !== undefined) data.plazoDias = dto.plazoDias.trim() || null;
    if (dto.sedes !== undefined) data.sedes = limpiarSedes(dto.sedes);
    if (dto.activo !== undefined) data.activo = dto.activo;
    const { count } = await this.prisma.tarifaEnvio.updateMany({ where: { id, marcaId }, data });
    if (!count) throw new NotFoundException('Tarifa no encontrada');
    return this.prisma.tarifaEnvio.findFirst({ where: { id, marcaId } });
  }

  async eliminar(marcaId: string, id: string) {
    const { count } = await this.prisma.tarifaEnvio.deleteMany({ where: { id, marcaId } });
    if (!count) throw new NotFoundException('Tarifa no encontrada');
    return { eliminada: true };
  }

  /**
   * Cotización server-side para un pedido: el costo NUNCA viene del cliente.
   * Si el departamento tiene sedes cargadas, la sede elegida debe ser una de ellas.
   */
  async cotizar(marcaId: string, departamento: string, sede?: string) {
    const tarifa = await this.prisma.tarifaEnvio.findFirst({
      where: { marcaId, proveedor: PROVEEDOR_DEFECTO, departamento: departamento.trim(), activo: true },
    });
    if (!tarifa) throw new BadRequestException('No hay envío disponible a ese departamento');
    const sedeElegida = sede?.trim() || null;
    if (tarifa.sedes.length > 0 && (!sedeElegida || !tarifa.sedes.includes(sedeElegida))) {
      throw new BadRequestException('Elige una agencia de la lista para ese departamento');
    }
    return {
      proveedor: tarifa.proveedor,
      departamento: tarifa.departamento,
      costo: Number(tarifa.costo),
      plazo: tarifa.plazoDias,
      sede: sedeElegida,
    };
  }
}
