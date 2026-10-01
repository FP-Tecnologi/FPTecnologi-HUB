import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { ActualizarTarifaDto, CrearTarifaDto } from './envios.dto.js';
import { agenciaPorId, agenciasCercanas, agenciasDeDepartamento, agenciasDeProvincia, departamentoDelDirectorio, etiquetaAgencia, provinciasConAgencias, type AgenciaShalom } from './agencias-shalom.js';
import { ShalomApiProvider } from './shalom-api.provider.js';
import { agenciaEnDistrito, codigoDistrito, distritosDe } from './ubigeo.js';
import { geocodificar } from './geocodificar.js';
import { distanciaKm } from './agencias-shalom.js';

export const PROVEEDOR_DEFECTO = 'SHALOM';

@Injectable()
export class EnviosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly vivas: ShalomApiProvider,
  ) {}

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

  /**
   * Provincias con agencias de un departamento: primero la API viva
   * (shalom-api.lat), si falla el directorio estático.
   */
  async provincias(departamento: string) {
    const vivas = await this.vivas.agenciasDeDepartamento(departamento);
    if (vivas) {
      const conteo = new Map<string, number>();
      for (const a of vivas) conteo.set(a.provincia, (conteo.get(a.provincia) ?? 0) + 1);
      return [...conteo.entries()]
        .map(([provincia, agencias]) => ({ provincia, agencias }))
        .sort((a, b) => a.provincia.localeCompare(b.provincia, 'es'));
    }
    return provinciasConAgencias(departamento);
  }

  /** Agencias de una provincia: primero la API viva, si falla el directorio estático. */
  async agencias(departamento: string, provincia: string): Promise<AgenciaShalom[]> {
    const canonico = departamentoDelDirectorio(departamento);
    const vivas = canonico ? await this.vivas.agenciasDeDepartamento(canonico) : null;
    if (vivas) {
      const n = provincia.trim().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
      const norm = (s: string) => s.trim().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
      return vivas.filter((a) => norm(a.provincia) === n);
    }
    return agenciasDeProvincia(departamento, provincia);
  }

  /** Más cercanas a un punto: primero la API viva, si falla el directorio estático. */
  async cercanas(lat: number, lng: number, limite = 5, departamentos?: string[]) {
    return (await this.vivas.cercanas(lat, lng, limite, departamentos)) ?? agenciasCercanas(lat, lng, limite, departamentos);
  }

  distritos(departamento: string, provincia: string) {
    return distritosDe(departamento, provincia);
  }

  /**
   * Agencias para un distrito de destino: primero las que están EN el distrito y luego las más cercanas
   * (dentro del mismo departamento, que es el de la tarifa). La ubicación del distrito se obtiene con
   * OpenStreetMap; si no se puede, se muestran las de la provincia.
   */
  async porDistrito(departamento: string, provincia: string, distrito: string, ip: string) {
    if (!distritosDe(departamento, provincia).some((d) => d.toLowerCase() === distrito.trim().toLowerCase())) {
      throw new BadRequestException('Distrito no válido para esa provincia');
    }
    const deProvincia = await this.agencias(departamento, provincia);
    const codigo = codigoDistrito(departamento, provincia, distrito);
    const enDistrito = deProvincia.filter((a) => agenciaEnDistrito(a, distrito, codigo));
    const ubic = await geocodificar(`${distrito}, ${provincia}, ${departamento}`, ip).catch(() => null);
    const cercanas = ubic ? await this.cercanas(ubic.lat, ubic.lng, 8, [departamento]) : [];
    const vistos = new Set(enDistrito.map((a) => a.id));
    const resto = (cercanas.length ? cercanas : deProvincia.filter((a) => !vistos.has(a.id))).filter((a) => !vistos.has(a.id));
    const agencias = [
      ...enDistrito.map((a) => ({
        ...a,
        enDistrito: true,
        ...(ubic && a.lat !== null && a.lng !== null ? { distanciaKm: Math.round(distanciaKm(ubic.lat, ubic.lng, a.lat, a.lng) * 10) / 10 } : {}),
      })),
      ...resto.slice(0, Math.max(0, 8 - enDistrito.length)).map((a) => ({ ...a, enDistrito: false })),
    ];
    return { distrito, ubicacionAproximada: ubic?.aproximada ?? null, agencias };
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
   * `sede` es el id de una agencia del directorio de Shalom: estático (`Dept|Prov|n`)
   * o vivo (`shalom:<ter_id>`, registrado al listar agencias). Si el departamento
   * tiene agencias, la sede es obligatoria y debe pertenecer a ese departamento.
   */
  async cotizar(marcaId: string, departamento: string, sede?: string) {
    const tarifa = await this.prisma.tarifaEnvio.findFirst({
      where: { marcaId, proveedor: PROVEEDOR_DEFECTO, departamento: departamentoDelDirectorio(departamento) ?? departamento.trim(), activo: true },
    });
    if (!tarifa) throw new BadRequestException('No hay envío disponible a ese departamento');

    let sedeEtiqueta: string | null = null;
    if (agenciasDeDepartamento(tarifa.departamento).length > 0) {
      const id = sede?.trim() ?? '';
      // Solo registro en memoria (sin red): el checkout listó las agencias antes de crear el pedido.
      const agencia = (id ? agenciaPorId(id) : undefined) ?? this.vivas.resolverViva(id);
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
