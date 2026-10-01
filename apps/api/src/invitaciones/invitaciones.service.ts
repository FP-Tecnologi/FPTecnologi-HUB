import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import { MailService } from '../mail/mail.service.js';
import { normalizeEmail } from '../common/utils/normalize-email.js';
import { AceptarInvitacionDto, CrearInvitacionDto } from './invitaciones.dto.js';

const SALT_ROUNDS = 10;
const VIGENCIA_DIAS = 7;
const ROL_CLIENTE = 'cliente';

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

@Injectable()
export class InvitacionesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  pendientes(marcaId: string) {
    return this.prisma.invitacion.findMany({
      where: { marcaId, aceptadaAt: null },
      include: { rol: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Una sola invitación pendiente por correo+marca: invitar de nuevo reemplaza la anterior. */
  async crear(marcaId: string, dto: CrearInvitacionDto, invitadoPor?: string) {
    const email = normalizeEmail(dto.email);
    const rol = await this.prisma.rol.findUnique({ where: { id: dto.rolId } });
    if (!rol || rol.nombre === ROL_CLIENTE) {
      throw new BadRequestException('Rol no válido para el equipo');
    }
    const yaEsMiembro = await this.prisma.usuarioMarcaRol.findFirst({
      where: { marcaId, usuario: { email } },
    });
    if (yaEsMiembro) {
      throw new ConflictException('Ese correo ya pertenece al equipo de esta marca');
    }

    await this.prisma.invitacion.deleteMany({ where: { marcaId, email, aceptadaAt: null } });
    const inv = await this.emitir(marcaId, email, dto.rolId, invitadoPor);
    return { id: inv.id, email, rolId: dto.rolId, expiresAt: inv.expiresAt };
  }

  async reenviar(marcaId: string, id: string) {
    const inv = await this.prisma.invitacion.findFirst({ where: { id, marcaId, aceptadaAt: null } });
    if (!inv) throw new NotFoundException('Invitación no encontrada');
    await this.prisma.invitacion.deleteMany({ where: { id, marcaId } });
    const nueva = await this.emitir(marcaId, inv.email, inv.rolId, inv.invitadoPor ?? undefined);
    return { id: nueva.id, email: inv.email, expiresAt: nueva.expiresAt };
  }

  async revocar(marcaId: string, id: string) {
    const { count } = await this.prisma.invitacion.deleteMany({ where: { id, marcaId, aceptadaAt: null } });
    if (!count) throw new NotFoundException('Invitación no encontrada');
    return { revocada: true };
  }

  /** Datos para pintar la página de aceptación (sin login). */
  async info(token: string) {
    const inv = await this.vigente(token);
    const usuario = await this.prisma.usuario.findUnique({ where: { email: inv.email } });
    return { email: inv.email, marca: inv.marca.nombre, rol: inv.rol.nombre, cuentaExiste: !!usuario };
  }

  /** Cuenta nueva exige contraseña; cuenta existente solo suma la marca. El enlace llega al correo: eso prueba la identidad. */
  async aceptar(dto: AceptarInvitacionDto) {
    const inv = await this.vigente(dto.token);
    let usuario = await this.prisma.usuario.findUnique({ where: { email: inv.email } });

    if (!usuario) {
      if (!dto.password) throw new BadRequestException('Crea una contraseña para tu cuenta');
      usuario = await this.prisma.usuario.create({
        data: {
          email: inv.email,
          passwordHash: await bcrypt.hash(dto.password, SALT_ROUNDS),
          nombre: dto.nombre?.trim() || null,
          bienvenidaVista: false,
        },
      });
    }

    await this.prisma.usuarioMarcaRol.upsert({
      where: { usuarioId_marcaId_rolId: { usuarioId: usuario.id, marcaId: inv.marcaId, rolId: inv.rolId } },
      create: { usuarioId: usuario.id, marcaId: inv.marcaId, rolId: inv.rolId },
      update: {},
    });
    await this.prisma.invitacion.update({ where: { id: inv.id }, data: { aceptadaAt: new Date() } });
    return { email: usuario.email };
  }

  private async vigente(token: string) {
    const inv = await this.prisma.invitacion.findUnique({
      where: { tokenHash: hashToken(token) },
      include: { marca: true, rol: true },
    });
    if (!inv || inv.aceptadaAt || inv.expiresAt < new Date()) {
      throw new NotFoundException('La invitación no existe o ya venció');
    }
    return inv;
  }

  private async emitir(marcaId: string, email: string, rolId: string, invitadoPor?: string) {
    const token = randomBytes(32).toString('hex');
    const inv = await this.prisma.invitacion.create({
      data: {
        marcaId,
        rolId,
        email,
        invitadoPor,
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + VIGENCIA_DIAS * 24 * 60 * 60 * 1000),
      },
      include: { marca: true, rol: true },
    });
    const url = `${process.env.WEB_ORIGIN ?? 'http://localhost:3000'}/auth/invitacion?token=${token}`;
    await this.mail.sendInvitacion(email, inv.marca.nombre, inv.rol.nombre, url, VIGENCIA_DIAS);
    return inv;
  }
}
