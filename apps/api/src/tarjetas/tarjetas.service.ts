import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as QRCode from 'qrcode';
import { PrismaService } from '../prisma/prisma.service.js';
import type { Prisma } from '../generated/prisma/client.js';
import type { GuardarTarjetaDto } from './tarjetas.dto.js';
import { faltantes, limpiarEnlaces, limpiarUrl, slugDe, SLUG_VALIDO, soloDigitos, vcard } from './tarjetas.modelo.js';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const texto = (t: string | undefined) => (t ?? '').trim() || null;

@Injectable()
export class TarjetasService {
  constructor(private readonly prisma: PrismaService) {}

  private urlDe(slug: string) {
    return `${(process.env.WEB_PUBLICA_URL ?? 'https://fptecnologi.com').replace(/\/$/, '')}/tarjeta/${slug}`;
  }

  /** Las tarjetas (versiones) de quien inició sesión, más sus datos para sugerir una al crearla. */
  async mias(marcaId: string, usuarioId: string) {
    const [tarjetas, usuario] = await Promise.all([
      this.prisma.tarjetaDigital.findMany({ where: { marcaId, usuarioId }, orderBy: { createdAt: 'asc' } }),
      this.prisma.usuario.findFirst({ where: { id: usuarioId }, select: { nombre: true, email: true, cargo: true, telefono: true } }),
    ]);
    return {
      tarjetas: await Promise.all(
        tarjetas.map(async (t) => ({ ...t, url: this.urlDe(t.slug), qr: await QRCode.toString(this.urlDe(t.slug), { type: 'svg', margin: 1 }), faltantes: faltantes(t) })),
      ),
      sugerido: { nombre: usuario?.nombre ?? '', email: usuario?.email ?? '', cargo: usuario?.cargo ?? '', telefono: usuario?.telefono ?? '' },
    };
  }

  /** Guarda una versión existente (con `id`), la primera si no hay id, o crea una nueva (`nueva`). El slug (enlace) es único por marca. */
  async guardarMia(marcaId: string, usuarioId: string, dto: GuardarTarjetaDto, opciones: { id?: string; nueva?: boolean; comoAdmin?: boolean } = {}) {
    let actual: { id: string; usuarioId: string; slug: string; etiqueta: string; estilo: string; vista: string } | null = null;
    if (!opciones.nueva) {
      // Quien administra edita la de cualquiera de la marca (por id); cada persona, solo las suyas.
      actual = await this.prisma.tarjetaDigital.findFirst({ where: { marcaId, ...(opciones.comoAdmin ? {} : { usuarioId }), ...(opciones.id ? { id: opciones.id } : {}) }, orderBy: { createdAt: 'asc' } });
      if (opciones.id && !actual) throw new NotFoundException('Tarjeta no encontrada');
      if (opciones.comoAdmin && actual) usuarioId = actual.usuarioId;
    }
    const pedido = dto.slug?.trim().toLowerCase();
    const base = pedido || actual?.slug || slugDe(dto.nombre);
    if (base.length < 3 || !SLUG_VALIDO.test(base)) throw new BadRequestException('El enlace debe tener al menos 3 letras o números (sin espacios ni tildes; solo guiones entre palabras).');
    const actualId = actual?.id;
    const enUso = (slug: string) => this.prisma.tarjetaDigital.findFirst({ where: { marcaId, slug, ...(actualId ? { NOT: { id: actualId } } : {}) }, select: { id: true } });
    let slug = base;
    if (await enUso(slug)) {
      // Una versión nueva sin enlace pedido toma «nombre-2», «nombre-3»…; si lo pidió a mano, se le avisa.
      if (pedido || actual) throw new BadRequestException('Ese enlace ya lo usa otra persona. Prueba con otro.');
      let n = 2;
      while (n < 50 && (await enUso(`${base}-${n}`))) n++;
      slug = `${base}-${n}`;
    }

    const email = texto(dto.email);
    if (email && !EMAIL.test(email)) throw new BadRequestException('El correo no es válido.');
    const url = (valor: string | undefined, campo: string, uploads = false) => {
      const v = limpiarUrl(valor, uploads);
      if (v === undefined) throw new BadRequestException(`${campo}: usa un enlace que empiece con https://`);
      return v;
    };
    const enlaces = dto.enlaces === undefined ? [] : limpiarEnlaces(dto.enlaces);
    if (!enlaces) throw new BadRequestException('Los enlaces extra necesitan título y un enlace https:// (máximo 12).');

    const data = {
      slug,
      etiqueta: (texto(dto.etiqueta) ?? actual?.etiqueta ?? 'Principal').slice(0, 40),
      nombre: dto.nombre.trim(),
      cargo: texto(dto.cargo),
      area: texto(dto.area),
      bio: texto(dto.bio),
      fotoUrl: url(dto.fotoUrl, 'Foto', true),
      telefono: texto(dto.telefono),
      whatsapp: soloDigitos(dto.whatsapp),
      email,
      linkedin: url(dto.linkedin, 'LinkedIn'),
      web: url(dto.web, 'Sitio web'),
      agendaUrl: url(dto.agendaUrl, 'Enlace para agendar'),
      enlaces: enlaces as unknown as Prisma.InputJsonValue,
      estilo: dto.estilo ?? actual?.estilo ?? 'clasico',
      vista: dto.vista ?? actual?.vista ?? 'perfil',
      activo: dto.activo ?? true,
    };
    // upsert "a mano": el tenant-guard no cubre upsert.
    let id: string | undefined = actualId;
    if (actualId) await this.prisma.tarjetaDigital.updateMany({ where: { id: actualId, marcaId }, data });
    else id = (await this.prisma.tarjetaDigital.create({ data: { ...data, marcaId, usuarioId } }))?.id;
    return { ...(await this.mias(marcaId, usuarioId)), guardadaId: id ?? null };
  }

  /** Quita una versión propia (siempre queda al menos una). */
  async eliminarMia(marcaId: string, usuarioId: string, id: string) {
    const total = await this.prisma.tarjetaDigital.count({ where: { marcaId, usuarioId } });
    if (total <= 1) throw new BadRequestException('Debes conservar al menos una tarjeta. Puedes editarla o desactivarla.');
    const r = await this.prisma.tarjetaDigital.deleteMany({ where: { id, marcaId, usuarioId } });
    if (r.count === 0) throw new NotFoundException('Tarjeta no encontrada');
    return this.mias(marcaId, usuarioId);
  }

  /** Dashboard (admin/marketing): el equipo con su tarjeta, qué le falta a cada una y quién aún no la creó. */
  async listar(marcaId: string) {
    const [tarjetas, equipo] = await Promise.all([
      this.prisma.tarjetaDigital.findMany({ where: { marcaId }, orderBy: { nombre: 'asc' } }),
      this.prisma.usuarioMarcaRol.findMany({ where: { marcaId }, include: { usuario: { select: { id: true, nombre: true, email: true } }, rol: { select: { nombre: true } } } }),
    ]);
    const duenos = new Map(equipo.map((e) => [e.usuarioId, e.usuario.nombre ?? e.usuario.email]));
    const conTarjeta = new Set(tarjetas.map((t) => t.usuarioId));
    const sinTarjeta = [...new Map(equipo.filter((e) => e.rol.nombre !== 'cliente' && !conTarjeta.has(e.usuarioId)).map((e) => [e.usuarioId, { usuarioId: e.usuarioId, nombre: e.usuario.nombre ?? e.usuario.email, email: e.usuario.email, rol: e.rol.nombre }])).values()];
    return {
      tarjetas: tarjetas.map((t) => ({ ...t, propietario: duenos.get(t.usuarioId) ?? null, faltantes: faltantes(t), url: this.urlDe(t.slug) })),
      sinTarjeta,
    };
  }

  /** Quien administra edita o crea la tarjeta de otra persona del equipo; devuelve el listado completo. */
  async guardarComoAdmin(marcaId: string, dto: GuardarTarjetaDto, destino: { id: string } | { usuarioId: string }) {
    if ('id' in destino) await this.guardarMia(marcaId, '', dto, { id: destino.id, comoAdmin: true });
    else {
      const miembro = await this.prisma.usuarioMarcaRol.findFirst({ where: { marcaId, usuarioId: destino.usuarioId }, select: { usuarioId: true } });
      if (!miembro) throw new NotFoundException('Esa persona no es del equipo');
      await this.guardarMia(marcaId, destino.usuarioId, dto, { nueva: true });
    }
    return this.listar(marcaId);
  }

  /** Mostrar u ocultar una tarjeta (p. ej. cuando alguien deja el equipo). */
  async activar(marcaId: string, id: string, activo: boolean) {
    const r = await this.prisma.tarjetaDigital.updateMany({ where: { id, marcaId }, data: { activo } });
    if (r.count === 0) throw new NotFoundException('Tarjeta no encontrada');
    return { id, activo };
  }

  // ---------------------------------------------------------------- web pública

  private async publica(marcaId: string, slug: string) {
    const t = await this.prisma.tarjetaDigital.findFirst({ where: { marcaId, slug: slug.toLowerCase(), activo: true } });
    if (!t) throw new NotFoundException('Tarjeta no encontrada');
    const marca = await this.prisma.marca.findFirst({ where: { id: marcaId }, select: { nombre: true } });
    return { t, empresa: marca?.nombre ?? 'FPTecnologi & System' };
  }

  async ver(marcaId: string, slug: string) {
    const { t, empresa } = await this.publica(marcaId, slug);
    // Contador de visitas: no debe frenar ni romper la página.
    void this.prisma.tarjetaDigital.updateMany({ where: { id: t.id, marcaId }, data: { vistas: { increment: 1 } } }).catch(() => undefined);
    const url = this.urlDe(t.slug);
    return {
      slug: t.slug, estilo: t.estilo, vista: t.vista, nombre: t.nombre, cargo: t.cargo, area: t.area, bio: t.bio, fotoUrl: t.fotoUrl, telefono: t.telefono, whatsapp: t.whatsapp,
      email: t.email, linkedin: t.linkedin, web: t.web, agendaUrl: t.agendaUrl, enlaces: t.enlaces, empresa, url,
      qr: await QRCode.toString(url, { type: 'svg', margin: 1 }),
    };
  }

  async vcard(marcaId: string, slug: string) {
    const { t, empresa } = await this.publica(marcaId, slug);
    return { nombre: `${t.slug}.vcf`, contenido: vcard({ nombre: t.nombre, cargo: t.cargo, empresa, telefono: t.telefono, whatsapp: t.whatsapp, email: t.email, web: t.web, linkedin: t.linkedin, urlTarjeta: this.urlDe(t.slug) }) };
  }
}
