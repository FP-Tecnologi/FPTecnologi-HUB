import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';
import { normalizeEmail } from '../common/utils/normalize-email.js';
import { CreateRolDto } from './dto/create-rol.dto.js';
import { AsignarRolDto } from './dto/asignar-rol.dto.js';
import { CrearUsuarioDto } from './dto/crear-usuario.dto.js';

import { ActualizarMiembroDto } from './dto/actualizar-miembro.dto.js';

const SALT_ROUNDS = 10;
const ROL_CLIENTE = 'cliente';
const MIEMBRO_SELECT = {
  id: true, email: true, nombre: true, activo: true, telefono: true, cargo: true,
  totpEnabled: true, createdAt: true,
} as const;

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

  /** Equipo (usuarios + su rol) de una marca, sin clientes de ecommerce — pantalla de usuarios y roles. */
  equipoDeMarca(marcaId: string) {
    return this.prisma.usuarioMarcaRol.findMany({
      where: { marcaId, rol: { nombre: { not: ROL_CLIENTE } } },
      include: { usuario: { select: MIEMBRO_SELECT }, rol: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  /** Clientes registrados en las webs públicas de la marca. */
  clientesDeMarca(marcaId: string) {
    return this.prisma.usuarioMarcaRol.findMany({
      where: { marcaId, rol: { nombre: ROL_CLIENTE } },
      include: { usuario: { select: MIEMBRO_SELECT }, rol: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Cambia el rol (reemplaza los roles que tenía en ESTA marca) y/o activa o
   * desactiva la cuenta. `activo` es global del usuario, así que solo se
   * permite si pertenece únicamente a esta marca; si no, hay que quitarlo de
   * la marca. Un admin no puede quitarse a sí mismo (lockout).
   */
  async actualizarMiembro(marcaId: string, actorId: string, usuarioId: string, dto: ActualizarMiembroDto) {
    if (dto.rolId === undefined && dto.activo === undefined) {
      throw new BadRequestException('Nada que actualizar');
    }
    const actuales = await this.prisma.usuarioMarcaRol.findMany({ where: { marcaId, usuarioId } });
    if (!actuales.length) throw new NotFoundException('Ese usuario no pertenece a esta marca');
    if (usuarioId === actorId) {
      throw new BadRequestException('No puedes cambiar tu propio rol ni desactivarte');
    }

    if (dto.activo !== undefined) {
      const otras = await this.prisma.usuarioMarcaRol.count({ where: { usuarioId, marcaId: { not: marcaId } } });
      if (otras > 0 && !dto.activo) {
        throw new BadRequestException('Pertenece a otras marcas: quítalo de esta marca en lugar de desactivar su cuenta');
      }
      await this.prisma.usuario.update({ where: { id: usuarioId }, data: { activo: dto.activo } });
      if (!dto.activo) {
        await this.prisma.refreshToken.updateMany({ where: { usuarioId, revoked: false }, data: { revoked: true } });
      }
    }

    if (dto.rolId !== undefined) {
      const rol = await this.prisma.rol.findUnique({ where: { id: dto.rolId } });
      if (!rol) throw new BadRequestException('Rol no encontrado');
      await this.prisma.$transaction([
        this.prisma.usuarioMarcaRol.deleteMany({ where: { marcaId, usuarioId } }),
        this.prisma.usuarioMarcaRol.create({ data: { marcaId, usuarioId, rolId: dto.rolId } }),
      ]);
    }
    return { actualizado: true };
  }

  async quitarMiembro(marcaId: string, actorId: string, usuarioId: string) {
    if (usuarioId === actorId) throw new BadRequestException('No puedes quitarte a ti mismo de la marca');
    const { count } = await this.prisma.usuarioMarcaRol.deleteMany({ where: { marcaId, usuarioId } });
    if (!count) throw new NotFoundException('Ese usuario no pertenece a esta marca');
    return { quitado: true };
  }

  /** Marcas y roles asignados a un usuario — usado para construir el selector de marca activa. */
  marcasDeUsuario(usuarioId: string) {
    return this.prisma.usuarioMarcaRol.findMany({
      where: { usuarioId },
      include: { marca: true, rol: true },
    });
  }
}
