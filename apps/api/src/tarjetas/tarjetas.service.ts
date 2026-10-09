import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as QRCode from 'qrcode';
import { PrismaService } from '../prisma/prisma.service.js';
import type { Prisma } from '../generated/prisma/client.js';
import type { GuardarTarjetaDto } from './tarjetas.dto.js';
import { limpiarEnlaces, limpiarUrl, slugDe, SLUG_VALIDO, soloDigitos, vcard } from './tarjetas.modelo.js';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const texto = (t: string | undefined) => (t ?? '').trim() || null;

@Injectable()
export class TarjetasService {
  constructor(private readonly prisma: PrismaService) {}

  private urlDe(slug: string) {
    return `${(process.env.WEB_PUBLICA_URL ?? 'https://fptecnologi.com').replace(/\/$/, '')}/tarjeta/${slug}`;
  }

  /** La tarjeta de quien inició sesión (o sus datos para sugerir una al crearla). */
  async mia(marcaId: string, usuarioId: string) {
    const [tarjeta, usuario] = await Promise.all([
      this.prisma.tarjetaDigital.findFirst({ where: { marcaId, usuarioId } }),
      this.prisma.usuario.findFirst({ where: { id: usuarioId }, select: { nombre: true, email: true, cargo: true, telefono: true } }),
    ]);
    return {
      tarjeta,
      sugerido: { nombre: usuario?.nombre ?? '', email: usuario?.email ?? '', cargo: usuario?.cargo ?? '', telefono: usuario?.telefono ?? '' },
      url: tarjeta ? this.urlDe(tarjeta.slug) : null,
      qr: tarjeta ? await QRCode.toString(this.urlDe(tarjeta.slug), { type: 'svg', margin: 1 }) : null,
    };
  }

  /** Crea o actualiza la tarjeta de quien inició sesión. El slug (enlace) es único por marca. */
  async guardarMia(marcaId: string, usuarioId: string, dto: GuardarTarjetaDto) {
    const actual = await this.prisma.tarjetaDigital.findFirst({ where: { marcaId, usuarioId } });
    const slug = (dto.slug?.trim().toLowerCase() || actual?.slug || slugDe(dto.nombre));
    if (slug.length < 3 || !SLUG_VALIDO.test(slug)) throw new BadRequestException('El enlace debe tener al menos 3 letras o números (sin espacios ni tildes; solo guiones entre palabras).');
    const ocupado = await this.prisma.tarjetaDigital.findFirst({ where: { marcaId, slug, NOT: { usuarioId } }, select: { id: true } });
    if (ocupado) throw new BadRequestException('Ese enlace ya lo usa otra persona. Prueba con otro.');

    const email = texto(dto.email);
    if (email && !EMAIL.test(email)) throw new BadRequestException('El correo no es válido.');
    const url = (valor: string | undefined, campo: string, uploads = false) => {
      const v = limpiarUrl(valor, uploads);
      if (v === undefined) throw new BadRequestException(`${campo}: usa un enlace que empiece con https://`);
      return v;
    };
    const enlaces = dto.enlaces === undefined ? [] : limpiarEnlaces(dto.enlaces);
    if (!enlaces) throw new BadRequestException('Los enlaces extra necesitan título y un enlace https:// (máximo 8).');

    const data = {
      slug,
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
      activo: dto.activo ?? true,
    };
    // upsert "a mano": el tenant-guard no cubre upsert.
    if (actual) await this.prisma.tarjetaDigital.updateMany({ where: { id: actual.id, marcaId }, data });
    else await this.prisma.tarjetaDigital.create({ data: { ...data, marcaId, usuarioId } });
    return this.mia(marcaId, usuarioId);
  }

  /** Dashboard (admin/marketing): todas las tarjetas del equipo. */
  async listar(marcaId: string) {
    const filas = await this.prisma.tarjetaDigital.findMany({ where: { marcaId }, orderBy: { nombre: 'asc' }, select: { id: true, slug: true, nombre: true, cargo: true, area: true, activo: true, vistas: true, fotoUrl: true } });
    return filas.map((f) => ({ ...f, url: this.urlDe(f.slug) }));
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
      slug: t.slug, nombre: t.nombre, cargo: t.cargo, area: t.area, bio: t.bio, fotoUrl: t.fotoUrl, telefono: t.telefono, whatsapp: t.whatsapp,
      email: t.email, linkedin: t.linkedin, web: t.web, agendaUrl: t.agendaUrl, enlaces: t.enlaces, empresa, url,
      qr: await QRCode.toString(url, { type: 'svg', margin: 1 }),
    };
  }

  async vcard(marcaId: string, slug: string) {
    const { t, empresa } = await this.publica(marcaId, slug);
    return { nombre: `${t.slug}.vcf`, contenido: vcard({ nombre: t.nombre, cargo: t.cargo, empresa, telefono: t.telefono, whatsapp: t.whatsapp, email: t.email, web: t.web, linkedin: t.linkedin, urlTarjeta: this.urlDe(t.slug) }) };
  }
}
