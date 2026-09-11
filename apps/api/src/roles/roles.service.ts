import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';
import { normalizeEmail } from '../common/utils/normalize-email.js';
import { CreateRolDto } from './dto/create-rol.dto.js';
import { AsignarRolDto } from './dto/asignar-rol.dto.js';
import { CrearUsuarioDto } from './dto/crear-usuario.dto.js';

const SALT_ROUNDS = 10;

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Alta de un miembro del equipo: crea el usuario si el email es nuevo (con
   * la contraseña que puso el admin — no hay invitación por correo todavía)
   * o, si ya existe (persona que ya trabaja en otra marca), lo reutiliza
   * ignorando password/nombre — solo se agrega la asignación a esta marca.
   */
  async crearUsuarioEnMarca(marcaId: string, dto: CrearUsuarioDto) {
    const email = normalizeEmail(dto.email);
    let usuario = await this.prisma.usuario.findUnique({ where: { email } });
    let nuevo = false;

    if (!usuario) {
      const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
      usuario = await this.prisma.usuario.create({
        data: { email, passwordHash, nombre: dto.nombre },
      });
      nuevo = true;
    }

    await this.prisma.usuarioMarcaRol.upsert({
      where: { usuarioId_marcaId_rolId: { usuarioId: usuario.id, marcaId, rolId: dto.rolId } },
      create: { usuarioId: usuario.id, marcaId, rolId: dto.rolId },
      update: {},
    });

    return { id: usuario.id, email: usuario.email, nombre: usuario.nombre, nuevo };
  }

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
