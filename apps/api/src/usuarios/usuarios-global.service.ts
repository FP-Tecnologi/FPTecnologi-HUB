import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuthService } from '../auth/auth.service.js';
import { MailService } from '../mail/mail.service.js';

const MAX = 300;

@Injectable()
export class UsuariosGlobalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auth: AuthService,
    private readonly mail: MailService,
  ) {}

  async listar(f: { q?: string; marcaId?: string; rolId?: string }) {
    const q = f.q?.trim();
    const usuarios = await this.prisma.usuario.findMany({
      where: {
        ...(q ? { OR: [{ email: { contains: q, mode: 'insensitive' as const } }, { nombre: { contains: q, mode: 'insensitive' as const } }] } : {}),
        ...(f.marcaId || f.rolId ? { marcas: { some: { ...(f.marcaId ? { marcaId: f.marcaId } : {}), ...(f.rolId ? { rolId: f.rolId } : {}) } } } : {}),
      },
      select: {
        id: true, email: true, nombre: true, cargo: true, activo: true, totpEnabled: true, superAdmin: true, createdAt: true,
        marcas: { select: { marcaId: true, rolId: true, marca: { select: { nombre: true } }, rol: { select: { nombre: true } } } },
      },
      // Los super administradores primero.
      orderBy: [{ superAdmin: 'desc' }, { createdAt: 'desc' }],
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

  /**
   * Hacer o quitar el rol de super administrador. Al hacerlo se le asigna además admin en todas las marcas (para que
   * pueda gestionarlas). Nadie se lo quita a sí mismo y siempre debe quedar al menos uno.
   */
  async superAdmin(actorId: string, usuarioId: string, activar: boolean) {
    const u = await this.prisma.usuario.findUnique({ where: { id: usuarioId }, select: { id: true, activo: true } });
    if (!u) throw new NotFoundException('Usuario no encontrado');
    if (!activar) {
      if (actorId === usuarioId) throw new BadRequestException('No puedes quitarte tu propio rol de super administrador');
      const otros = await this.prisma.usuario.count({ where: { superAdmin: true, activo: true, id: { not: usuarioId } } });
      if (otros === 0) throw new BadRequestException('Debe quedar al menos un super administrador');
    } else if (!u.activo) {
      throw new BadRequestException('Activa la cuenta antes de hacerla super administradora');
    }
    await this.prisma.usuario.update({ where: { id: usuarioId }, data: { superAdmin: activar } });
    if (activar) {
      const [marcas, admin] = await Promise.all([
        this.prisma.marca.findMany({ select: { id: true } }),
        this.prisma.rol.findUnique({ where: { nombre: 'admin' }, select: { id: true } }),
      ]);
      if (admin) await this.prisma.usuarioMarcaRol.createMany({ data: marcas.map((m) => ({ usuarioId, marcaId: m.id, rolId: admin.id })), skipDuplicates: true });
    }
    return { superAdmin: activar };
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

  private async usuario(id: string) {
    const u = await this.prisma.usuario.findUnique({ where: { id }, select: { id: true, email: true } });
    if (!u) throw new NotFoundException('Usuario no encontrado');
    return u;
  }

  /** Envía al correo del usuario el código para restablecer su contraseña (mismo flujo que «Olvidé mi contraseña»). */
  async enviarResetPassword(id: string) {
    const u = await this.usuario(id);
    await this.auth.requestPasswordReset(u.email);
    return { enviado: true, email: u.email };
  }

  /** Cambia la contraseña por una nueva y cierra todas sus sesiones y dispositivos confiables. */
  async cambiarPassword(id: string, password: string) {
    const u = await this.usuario(id);
    const passwordHash = await bcrypt.hash(password, 10);
    await this.prisma.$transaction([
      this.prisma.usuario.update({ where: { id }, data: { passwordHash } }),
      this.prisma.refreshToken.updateMany({ where: { usuarioId: id, revoked: false }, data: { revoked: true } }),
      this.prisma.dispositivoConfiable.updateMany({ where: { usuarioId: id, revoked: false }, data: { revoked: true } }),
    ]);
    await this.mail.sendPasswordChanged(u.email);
    return { cambiada: true };
  }

  /** Apaga el 2FA por app (secreto + códigos de respaldo) y cierra sesiones: vuelve a entrar con código al correo y puede activarlo de nuevo. */
  async reset2fa(id: string) {
    await this.usuario(id);
    await this.prisma.usuario.update({ where: { id }, data: { totpEnabled: false, totpSecret: null } });
    await this.prisma.totpBackupCode.deleteMany({ where: { usuarioId: id } });
    await this.prisma.refreshToken.updateMany({ where: { usuarioId: id, revoked: false }, data: { revoked: true } });
    return { reset: true };
  }

  /** Cierra todas las sesiones abiertas del usuario. */
  async cerrarSesiones(id: string) {
    await this.usuario(id);
    await this.prisma.refreshToken.updateMany({ where: { usuarioId: id, revoked: false }, data: { revoked: true } });
    return { cerradas: true };
  }
}
