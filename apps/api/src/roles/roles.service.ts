import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateRolDto } from './dto/create-rol.dto.js';
import { AsignarRolDto } from './dto/asignar-rol.dto.js';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  createRol(dto: CreateRolDto) {
    return this.prisma.rol.create({ data: dto });
  }

  findAllRoles() {
    return this.prisma.rol.findMany({ orderBy: { nombre: 'asc' } });
  }

  asignar(dto: AsignarRolDto) {
    return this.prisma.usuarioMarcaRol.upsert({
      where: {
        usuarioId_marcaId_rolId: {
          usuarioId: dto.usuarioId,
          marcaId: dto.marcaId,
          rolId: dto.rolId,
        },
      },
      create: dto,
      update: {},
    });
  }

  async quitarAsignacion(usuarioId: string, marcaId: string, rolId: string) {
    return this.prisma.usuarioMarcaRol.delete({
      where: { usuarioId_marcaId_rolId: { usuarioId, marcaId, rolId } },
    });
  }

  /** Equipo (usuarios + su rol) de una marca — usado por la pantalla de gestión de usuarios y roles. */
  equipoDeMarca(marcaId: string) {
    return this.prisma.usuarioMarcaRol.findMany({
      where: { marcaId },
      include: { usuario: { select: { id: true, email: true, nombre: true, activo: true } }, rol: true },
    });
  }

  /** Marcas y roles asignados a un usuario — usado para construir el selector de marca activa. */
  marcasDeUsuario(usuarioId: string) {
    return this.prisma.usuarioMarcaRol.findMany({
      where: { usuarioId },
      include: { marca: true, rol: true },
    });
  }
}
