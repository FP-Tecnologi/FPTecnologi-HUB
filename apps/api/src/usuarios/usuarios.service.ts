import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';
import { normalizeEmail } from '../common/utils/normalize-email.js';
import { UpdatePerfilDto } from './dto/update-perfil.dto.js';

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * El propio usuario edita su perfil. El nombre se actualiza directo; el
   * correo (identidad de login) exige la contraseña actual y debe estar
   * libre. Devuelve el usuario actualizado para que el dashboard refresque
   * la sesión local (los JWT ya emitidos conservan el email anterior hasta
   * el próximo login — aceptado: no invalida sesiones ajenas).
   */
  async updatePerfil(usuarioId: string, dto: UpdatePerfilDto) {
    if (dto.nombre === undefined && dto.email === undefined) {
      throw new BadRequestException('Nada que actualizar: envía nombre y/o email');
    }

    const usuario = await this.prisma.usuario.findUnique({ where: { id: usuarioId } });
    if (!usuario || !usuario.activo) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const data: { nombre?: string; email?: string } = {};

    if (dto.nombre !== undefined) {
      const nombre = dto.nombre.trim();
      if (!nombre) {
        throw new BadRequestException('El nombre no puede quedar vacío');
      }
      data.nombre = nombre;
    }

    if (dto.email !== undefined) {
      const email = normalizeEmail(dto.email);
      if (email !== usuario.email) {
        if (!dto.currentPassword) {
          throw new BadRequestException('Para cambiar el correo confirma tu contraseña actual');
        }
        const passwordOk = await bcrypt.compare(dto.currentPassword, usuario.passwordHash);
        if (!passwordOk) {
          throw new UnauthorizedException('Contraseña actual incorrecta');
        }
        const taken = await this.prisma.usuario.findUnique({ where: { email } });
        if (taken && taken.id !== usuario.id) {
          throw new ConflictException('Ese correo ya está en uso');
        }
        data.email = email;
      }
    }

    const updated = await this.prisma.usuario.update({
      where: { id: usuario.id },
      data,
      select: { id: true, email: true, nombre: true },
    });
    return updated;
  }

  /**
   * Desbloqueo por admin: apaga el TOTP del usuario (secreto + códigos de
   * respaldo) y revoca sus sesiones, para que vuelva a entrar con
   * contraseña + OTP al correo. El controller exige rol admin en la marca
   * activa y aquí se verifica además que el objetivo pertenezca a esa
   * marca — un admin no puede resetear usuarios de otras marcas.
   */
  async reset2fa(marcaId: string, email: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { email: normalizeEmail(email) },
    });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }
    const asignacion = await this.prisma.usuarioMarcaRol.findFirst({
      where: { usuarioId: usuario.id, marcaId },
    });
    if (!asignacion) {
      throw new NotFoundException('Ese usuario no pertenece a esta marca');
    }

    await this.prisma.usuario.update({
      where: { id: usuario.id },
      data: { totpEnabled: false, totpSecret: null },
    });
    await this.prisma.totpBackupCode.deleteMany({ where: { usuarioId: usuario.id } });
    await this.prisma.refreshToken.updateMany({
      where: { usuarioId: usuario.id, revoked: false },
      data: { revoked: true },
    });
    return { reset: true, email: usuario.email };
  }
}
