import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { ActualizarTarifaDto, CrearTarifaDto } from './envios.dto.js';
import { agenciaPorId, agenciasDeDepartamento, departamentoDelDirectorio, etiquetaAgencia } from './agencias-shalom.js';

export const PROVEEDOR_DEFECTO = 'SHALOM';

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
    }));
  }

  async crear(marcaId: string, dto: CrearTarifaDto) {
    // Se guarda el nombre del directorio de Shalom ("Junín", "Lambayeque"…): así coincide con las agencias.
    const departamento = departamentoDelDirectorio(dto.departamento) ?? dto.departamento.trim();
    if (!departamentoDelDirectorio(departamento)) {
      throw new BadRequestException('Departamento no válido: usa uno de los 25 departamentos del Perú (ej. Lambayeque, no Chiclayo)');
    }
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
        activo: dto.activo ?? true,
      },
    });
  }

  async actualizar(marcaId: string, id: string, dto: ActualizarTarifaDto) {
    const data: Record<string, unknown> = {};
    if (dto.costo !== undefined) data.costo = dto.costo;
    if (dto.plazoDias !== undefined) data.plazoDias = dto.plazoDias.trim() || null;
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
   * `sede` es el id de una agencia del directorio de Shalom (ver agencias-shalom.ts): si el
   * departamento tiene agencias, es obligatoria y debe pertenecer a ese departamento.
   */
  async cotizar(marcaId: string, departamento: string, sede?: string) {
    const tarifa = await this.prisma.tarifaEnvio.findFirst({
      where: { marcaId, proveedor: PROVEEDOR_DEFECTO, departamento: departamentoDelDirectorio(departamento) ?? departamento.trim(), activo: true },
    });
    if (!tarifa) throw new BadRequestException('No hay envío disponible a ese departamento');

    let sedeEtiqueta: string | null = null;
    if (agenciasDeDepartamento(tarifa.departamento).length > 0) {
      const agencia = sede ? agenciaPorId(sede.trim()) : undefined;
      const mismoDepartamento = agencia && agencia.departamento === departamentoDelDirectorio(tarifa.departamento);
      if (!agencia || !mismoDepartamento) {
        throw new BadRequestException('Elige una agencia Shalom de ese departamento');
      }
      sedeEtiqueta = etiquetaAgencia(agencia);
    }
    return {
      proveedor: tarifa.proveedor,
      departamento: tarifa.departamento,
      costo: Number(tarifa.costo),
      plazo: tarifa.plazoDias,
      sede: sedeEtiqueta,
    };
  }
}
