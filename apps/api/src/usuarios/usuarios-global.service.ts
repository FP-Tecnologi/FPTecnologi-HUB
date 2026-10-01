import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

const MAX = 300;

@Injectable()
export class UsuariosGlobalService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(f: { q?: string; marcaId?: string; rolId?: string }) {
    const q = f.q?.trim();
    const usuarios = await this.prisma.usuario.findMany({
      where: {
        ...(q ? { OR: [{ email: { contains: q, mode: 'insensitive' as const } }, { nombre: { contains: q, mode: 'insensitive' as const } }] } : {}),
        ...(f.marcaId || f.rolId ? { marcas: { some: { ...(f.marcaId ? { marcaId: f.marcaId } : {}), ...(f.rolId ? { rolId: f.rolId } : {}) } } } : {}),
      },
      select: {
        id: true, email: true, nombre: true, cargo: true, activo: true, totpEnabled: true, createdAt: true,
        marcas: { select: { marcaId: true, rolId: true, marca: { select: { nombre: true } }, rol: { select: { nombre: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: MAX,
    });
    const [marcas, roles] = await Promise.all([
      this.prisma.marca.findMany({ select: { id: true, nombre: true }, orderBy: { nombre: 'asc' } }),
      this.prisma.rol.findMany({ select: { id: true, nombre: true }, orderBy: { nombre: 'asc' } }),
    ]);
    return { usuarios, marcas, roles };
  }

  async activar(id: string, activo: boolean) {
    const { count } = await this.prisma.usuario.updateMany({ where: { id }, data: { activo } });
    if (!count) throw new NotFoundException('Usuario no encontrado');
    return { activo };
  }

  async asignar(usuarioId: string, marcaId: string, rolId: string) {
    const [u, m, r] = await Promise.all([
      this.prisma.usuario.findUnique({ where: { id: usuarioId }, select: { id: true } }),
      this.prisma.marca.findUnique({ where: { id: marcaId }, select: { id: true } }),
      this.prisma.rol.findUnique({ where: { id: rolId }, select: { id: true } }),
    ]);
    if (!u || !m || !r) throw new NotFoundException('Usuario, marca o rol no encontrado');
    await this.prisma.usuarioMarcaRol.createMany({ data: [{ usuarioId, marcaId, rolId }], skipDuplicates: true });
    return { asignado: true };
  }

  /** Nadie se quita a sí mismo el rol admin (podría quedarse sin acceso a la administración global). */
  async quitar(actorId: string, usuarioId: string, marcaId: string, rolId: string) {
    if (actorId === usuarioId) {
      const rol = await this.prisma.rol.findUnique({ where: { id: rolId }, select: { nombre: true } });
      if (rol?.nombre === 'admin') throw new BadRequestException('No puedes quitarte tu propio rol admin');
    }
    const { count } = await this.prisma.usuarioMarcaRol.deleteMany({ where: { usuarioId, marcaId, rolId } });
    if (!count) throw new NotFoundException('Asignación no encontrada');
    return { quitado: true };
  }
}
