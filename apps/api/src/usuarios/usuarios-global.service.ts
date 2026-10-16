import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuthService } from '../auth/auth.service.js';
import { MailService } from '../mail/mail.service.js';
import { InvitacionesService } from '../invitaciones/invitaciones.service.js';
import { normalizeEmail } from '../common/utils/normalize-email.js';

const MAX = 300;

@Injectable()
export class UsuariosGlobalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auth: AuthService,
    private readonly mail: MailService,
    private readonly invitaciones: InvitacionesService,
  ) {}

  async listar(f: { q?: string; marcaId?: string; rolId?: string }) {
    const q = f.q?.trim();
    const usuarios = await this.prisma.usuario.findMany({
      where: {
        ...(q ? { OR: [{ email: { contains: q, mode: 'insensitive' as const } }, { nombre: { contains: q, mode: 'insensitive' as const } }] } : {}),
        ...(f.marcaId || f.rolId ? { marcas: { some: { ...(f.marcaId ? { marcaId: f.marcaId } : {}), ...(f.rolId ? { rolId: f.rolId } : {}) } } } : {}),
      },
      select: {
        id: true, email: true, nombre: true, cargo: true, telefono: true, dni: true, activo: true, totpEnabled: true, superAdmin: true, createdAt: true,
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

  /** Acciones sensibles sobre un super administrador (o dar/quitar el rol) piden el código de verificación de quien actúa. */
  private async exigir(actorId: string, usuarioId: string, codigo: string | undefined, siempre = false) {
    if (!siempre) {
      const t = await this.prisma.usuario.findUnique({ where: { id: usuarioId }, select: { superAdmin: true } });
      if (!t?.superAdmin) return;
    }
    await this.auth.confirmarAccion(actorId, codigo);
  }

  /** Edita los datos de la cuenta (nombre, correo, cargo, teléfono, DNI). Sobre un super administrador pide verificación. */
  async editar(actorId: string, id: string, d: { nombre?: string; email?: string; cargo?: string; telefono?: string; dni?: string }, codigo?: string) {
    const u = await this.prisma.usuario.findUnique({ where: { id }, select: { id: true, email: true } });
    if (!u) throw new NotFoundException('Usuario no encontrado');
    await this.exigir(actorId, id, codigo);
    const limpio = (x?: string) => (x === undefined ? undefined : x.trim() || null);
    const data: Record<string, string | null | undefined> = { nombre: limpio(d.nombre), cargo: limpio(d.cargo), telefono: limpio(d.telefono), dni: limpio(d.dni) };
    if (d.email !== undefined) {
      const email = normalizeEmail(d.email);
      if (email !== u.email) {
        if (await this.prisma.usuario.findUnique({ where: { email }, select: { id: true } })) throw new BadRequestException('Ese correo ya lo usa otra cuenta');
        data.email = email;
      }
    }
    await this.prisma.usuario.update({ where: { id }, data: Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined)) });
    // El correo es la identidad del acceso: si cambia, se cierran sus sesiones.
    if (data.email) await this.prisma.refreshToken.updateMany({ where: { usuarioId: id, revoked: false }, data: { revoked: true } });
    return { editado: true };
  }

  /**
   * Elimina la cuenta con sus accesos, tarjetas y avisos. Siempre pide verificación. No se elimina a sí mismo ni a un
   * super administrador (primero se le quita el rol). Si tiene historial (pedidos, chats atendidos) no se borra: se desactiva.
   */
  async eliminar(actorId: string, id: string, codigo?: string) {
    if (actorId === id) throw new BadRequestException('No puedes eliminar tu propia cuenta');
    const u = await this.prisma.usuario.findUnique({ where: { id }, select: { id: true, superAdmin: true, marcas: { select: { marcaId: true } } } });
    if (!u) throw new NotFoundException('Usuario no encontrado');
    if (u.superAdmin) throw new BadRequestException('Es super administrador: quítale primero ese rol desde Acciones');
    await this.exigir(actorId, id, codigo, true);
    const marcaIds = [...new Set(u.marcas.map((m) => m.marcaId))];
    try {
      await this.prisma.$transaction([
        ...marcaIds.map((marcaId) => this.prisma.tarjetaDigital.deleteMany({ where: { marcaId, usuarioId: id } })),
        this.prisma.usuarioMarcaRol.deleteMany({ where: { usuarioId: id } }),
        this.prisma.refreshToken.deleteMany({ where: { usuarioId: id } }),
        this.prisma.otpCode.deleteMany({ where: { usuarioId: id } }),
        this.prisma.totpBackupCode.deleteMany({ where: { usuarioId: id } }),
        this.prisma.dispositivoConfiable.deleteMany({ where: { usuarioId: id } }),
        this.prisma.notificacion.deleteMany({ where: { usuarioId: id } }),
        this.prisma.soporteTicket.deleteMany({ where: { usuarioId: id } }),
        this.prisma.usuario.delete({ where: { id } }),
      ]);
    } catch (e) {
      if ((e as { code?: string }).code === 'P2003') throw new BadRequestException('Tiene historial (pedidos o chats): desactiva la cuenta en lugar de eliminarla');
      throw e;
    }
    return { eliminado: true };
  }

  /**
   * Alta de un usuario con todos sus datos, su empresa y su rol. `acceso`:
   *  - invitacion: le llega un correo para crear su propia contraseña (los datos quedan cargados);
   *  - password: la cuenta se crea ya activa con la contraseña indicada (y, si se pide, se le envía un código para que la cambie).
   */
  async crearUsuario(actorEmail: string, d: { email: string; nombre?: string; cargo?: string; telefono?: string; dni?: string; marcaId: string; rolId: string; acceso: 'invitacion' | 'password'; password?: string; enviarCambio?: boolean }) {
    const email = normalizeEmail(d.email);
    const [marca, rol, existe] = await Promise.all([
      this.prisma.marca.findUnique({ where: { id: d.marcaId }, select: { id: true } }),
      this.prisma.rol.findUnique({ where: { id: d.rolId }, select: { id: true, nombre: true } }),
      this.prisma.usuario.findUnique({ where: { email }, select: { id: true } }),
    ]);
    if (!marca) throw new NotFoundException('Empresa no encontrada');
    if (!rol || rol.nombre === 'cliente') throw new BadRequestException('Rol no válido para el equipo');
    if (existe) throw new BadRequestException('Ese correo ya tiene cuenta: agrégale la empresa y el rol con «+ Rol» en la lista');
    const limpio = (x?: string) => x?.trim() || undefined;
    const datos = { nombre: limpio(d.nombre), cargo: limpio(d.cargo), telefono: limpio(d.telefono), dni: limpio(d.dni) };

    if (d.acceso === 'invitacion') {
      await this.invitaciones.crear(d.marcaId, { email, rolId: d.rolId }, actorEmail, datos);
      return { creado: false, invitado: true, email };
    }
    if (!d.password || d.password.length < 8) throw new BadRequestException('La contraseña debe tener al menos 8 caracteres');
    const u = await this.prisma.usuario.create({
      data: { email, passwordHash: await bcrypt.hash(d.password, 10), ...datos, bienvenidaVista: false, marcas: { create: { marcaId: d.marcaId, rolId: d.rolId } } },
      select: { id: true, email: true, nombre: true },
    });
    await this.mail.sendWelcome(u.email, u.nombre);
    if (d.enviarCambio) await this.auth.requestPasswordReset(u.email);
    return { creado: true, invitado: false, email };
  }

  async activar(actorId: string, id: string, activo: boolean, codigo?: string) {
    if (!activo) await this.exigir(actorId, id, codigo);
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
  async superAdmin(actorId: string, usuarioId: string, activar: boolean, codigo?: string) {
    await this.exigir(actorId, usuarioId, codigo, true);
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
    const objetivo = await this.prisma.usuario.findUnique({ where: { id: usuarioId }, select: { superAdmin: true } });
    const rolQuitado = await this.prisma.rol.findUnique({ where: { id: rolId }, select: { nombre: true } });
    if (objetivo?.superAdmin && rolQuitado?.nombre === 'admin') throw new BadRequestException('Es super administrador: quítale primero ese rol desde Acciones');
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
  async cambiarPassword(actorId: string, id: string, password: string, codigo?: string) {
    await this.exigir(actorId, id, codigo);
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
  async reset2fa(actorId: string, id: string, codigo?: string) {
    await this.exigir(actorId, id, codigo);
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
