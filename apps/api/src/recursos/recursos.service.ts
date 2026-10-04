import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { PrismaService } from '../prisma/prisma.service.js';
import { CuentaService } from '../cuenta/cuenta.service.js';
import { normalizeEmail } from '../common/utils/normalize-email.js';
import { uploadsDir } from '../uploads/uploads.service.js';
import type { ActualizarRecursoDto, ActualizarSocioDto, CrearRecursoDto, CrearSocioDto } from './recursos.dto.js';

@Injectable()
export class RecursosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cuenta: CuentaService,
  ) {}

  // ------------------------------------------------------------------ público (socios)

  /** Solo un correo con sesión de «Mi cuenta» Y autorizado como socio activo ve el material. */
  async listarParaSocio(marcaId: string, token: string | undefined) {
    const email = this.cuenta.leerToken(token, marcaId);
    const socio = await this.prisma.socio.findFirst({ where: { marcaId, email, activo: true } });
    if (!socio) throw new ForbiddenException('Tu cuenta no tiene acceso a los recursos para socios.');
    const recursos = await this.prisma.recurso.findMany({
      where: { marcaId, visible: true },
      orderBy: [{ fabricante: 'asc' }, { orden: 'asc' }, { createdAt: 'desc' }],
      select: { id: true, titulo: true, descripcion: true, tipo: true, fabricante: true, categoria: true, archivoUrl: true, mime: true, bytes: true, createdAt: true },
    });
    return { socio: { nombre: socio.nombre, empresa: socio.empresa }, recursos };
  }

  // ---------------------------------------------------------------- dashboard: recursos

  listar(marcaId: string) {
    return this.prisma.recurso.findMany({ where: { marcaId }, orderBy: [{ fabricante: 'asc' }, { orden: 'asc' }, { createdAt: 'desc' }] });
  }

  async crear(marcaId: string, dto: CrearRecursoDto) {
    // El archivo debe haberse subido por POST /recursos/archivo a la carpeta de ESTA marca.
    if (!new RegExp(`/uploads/${marcaId}/recursos/[0-9a-f-]{36}\\.[a-z0-9]{2,5}$`).test(dto.archivoUrl)) throw new BadRequestException('Archivo no válido: súbelo primero.');
    return this.prisma.recurso.create({
      data: {
        marcaId,
        titulo: dto.titulo.trim(),
        descripcion: dto.descripcion?.trim() || null,
        tipo: dto.tipo,
        fabricante: dto.fabricante?.trim() || null,
        categoria: dto.categoria?.trim() || null,
        archivoUrl: dto.archivoUrl,
        mime: dto.mime ?? null,
        bytes: dto.bytes ?? 0,
        visible: dto.visible ?? true,
        orden: dto.orden ?? 0,
      },
    });
  }

  async actualizar(marcaId: string, id: string, dto: ActualizarRecursoDto) {
    await this.obtener(marcaId, id);
    return this.prisma.recurso.update({ where: { id, marcaId }, data: dto });
  }

  async eliminar(marcaId: string, id: string) {
    const r = await this.obtener(marcaId, id);
    await this.prisma.recurso.delete({ where: { id, marcaId } });
    // Borra también el archivo del disco (solo dentro de la carpeta de recursos de la marca).
    const m = r.archivoUrl.match(/\/uploads\/([0-9a-f-]{36})\/recursos\/([0-9a-f-]{36}\.[a-z0-9]{2,5})$/);
    if (m && m[1] === marcaId) await unlink(join(uploadsDir(), marcaId, 'recursos', m[2])).catch(() => undefined);
    return { ok: true as const };
  }

  private async obtener(marcaId: string, id: string) {
    const r = await this.prisma.recurso.findFirst({ where: { id, marcaId } });
    if (!r) throw new NotFoundException('Recurso no encontrado');
    return r;
  }

  // ---------------------------------------------------------------- dashboard: socios

  listarSocios(marcaId: string) {
    return this.prisma.socio.findMany({ where: { marcaId }, orderBy: { createdAt: 'desc' } });
  }

  async crearSocio(marcaId: string, dto: CrearSocioDto) {
    const email = normalizeEmail(dto.email);
    if (await this.prisma.socio.findFirst({ where: { marcaId, email } })) throw new ConflictException('Ese correo ya es socio.');
    return this.prisma.socio.create({ data: { marcaId, email, nombre: dto.nombre?.trim() || null, empresa: dto.empresa?.trim() || null, ruc: dto.ruc?.trim() || null } });
  }

  async actualizarSocio(marcaId: string, id: string, dto: ActualizarSocioDto) {
    if (!(await this.prisma.socio.findFirst({ where: { id, marcaId } }))) throw new NotFoundException('Socio no encontrado');
    return this.prisma.socio.update({ where: { id, marcaId }, data: dto });
  }

  async eliminarSocio(marcaId: string, id: string) {
    if (!(await this.prisma.socio.findFirst({ where: { id, marcaId } }))) throw new NotFoundException('Socio no encontrado');
    await this.prisma.socio.delete({ where: { id, marcaId } });
    return { ok: true as const };
  }
}
