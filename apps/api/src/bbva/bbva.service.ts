import { BadRequestException, HttpException, HttpStatus, Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { cabecerasFirmadas } from './bbva.firma.js';
import type { ConsultarOfertasDto, SolicitarTarjetaDto } from './bbva.dto.js';

const PATH_OFERTAS = '/pe/cards-offer/v1/prospect-customer';
const ENLACE_PUBLICO = 'https://tarjetas.bbva.pe/';

// Mensajes de BBVA (400 functionalError) → texto para el visitante.
const ERRORES: Record<string, string> = {
  'INVALID IDENTITY DOCUMENT NUMBER': 'Revisa tu número de DNI.',
  'INVALID IDENTITY DOCUMENT': 'Revisa tu número de DNI.',
  'INVALID DOCUMENT TYPE': 'Revisa tu número de DNI.',
  'INVALID CELL PHONE NUMBER': 'Revisa tu número de celular.',
  'INVALID OPERATOR': 'Elige tu operador de celular.',
  'INVALID EMAIL': 'Revisa tu correo electrónico.',
  'INCORRECT PERSONAL DATA': 'Los datos no coinciden. Revisa tu DNI y fecha de nacimiento.',
};

export interface Oferta { id: number; tarjeta: string; codigo: string; linea: number; moneda: string; tea: number; imagen: string | null }

interface RespuestaBbva {
  data?: {
    participant?: { firstname?: string };
    offers?: Array<{
      id: number;
      grantedAmount?: { amount: number; currency: string };
      interestRate?: { percent: number };
      product?: { title?: { id: string; name?: string } };
      images?: Array<{ id: string; url: string }>;
    }>;
    link?: { href?: string };
  };
  messages?: Array<{ code: string; message: string }>;
}

// Tope por IP: cada consulta toca el buró de BBVA, no se debe poder recorrer DNIs.
const VENTANA_MS = 10 * 60_000;
const MAX_POR_VENTANA = 5;

@Injectable()
export class BbvaService {
  private readonly logger = new Logger(BbvaService.name);
  private token: { valor: string; vence: number } | null = null;
  private readonly intentos = new Map<string, number[]>();
  // ponytail: ofertas de cada consulta en memoria 1 h (se pierden al reiniciar → «solicitar» cae al enlace público); a la base si hace falta.
  private readonly consultas = new Map<string, { ofertas: Oferta[]; enlace: string; vence: number }>();

  constructor(private readonly prisma: PrismaService) {}

  private get host() {
    return `${process.env.BBVA_ENTORNO === 'live' ? 'apis' : 'sbx'}.pe.bbvaapimarket.com`;
  }

  private credenciales() {
    const { BBVA_CLIENT_ID: id, BBVA_CLIENT_SECRET: secret, BBVA_PRIVATE_KEY: clave } = process.env;
    if (!id || !secret || !clave) throw new ServiceUnavailableException('La consulta de tarjetas BBVA aún no está disponible');
    return { id, secret, clave };
  }

  private async obtenerToken(): Promise<string> {
    if (this.token && this.token.vence > Date.now()) return this.token.valor;
    const { id, secret } = this.credenciales();
    const r = await fetch(`https://${this.host}/auth/oauth/v2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'client_credentials', client_id: id, client_secret: secret }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!r.ok) {
      this.logger.error(`BBVA token ${r.status}: ${await r.text().catch(() => '')}`);
      throw new ServiceUnavailableException('El servicio de BBVA no responde. Intenta en unos minutos.');
    }
    const j = (await r.json()) as { access_token: string; expires_in: number | string };
    // Se renueva un minuto antes de que venza.
    this.token = { valor: j.access_token, vence: Date.now() + (Number(j.expires_in) - 60) * 1000 };
    return j.access_token;
  }

  private firmar(body: string) {
    const { clave } = this.credenciales();
    try {
      return cabecerasFirmadas({ metodo: 'post', path: PATH_OFERTAS, host: this.host, body, clave });
    } catch (e) {
      // Clave mal cargada (cortada o con otro formato): al log solo el largo, nunca el valor; al visitante, mensaje normal.
      this.logger.error(`BBVA_PRIVATE_KEY no se pudo usar (largo ${clave.length}): ${(e as Error).message}`);
      throw new ServiceUnavailableException('El servicio de BBVA no responde. Intenta en unos minutos.');
    }
  }

  private async llamarOfertas(body: string, reintento = true): Promise<{ status: number; json: RespuestaBbva }> {
    const firma = this.firmar(body);
    const token = await this.obtenerToken();
    const r = await fetch(`https://${this.host}${PATH_OFERTAS}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Host: this.host,
        'Content-Type': 'application/json',
        ...firma,
      },
      body,
      signal: AbortSignal.timeout(20_000),
    });
    // Token revocado o vencido antes de tiempo: uno nuevo y un reintento.
    if (r.status === 401 && reintento) {
      this.token = null;
      return this.llamarOfertas(body, false);
    }
    return { status: r.status, json: (await r.json().catch(() => ({}))) as RespuestaBbva };
  }

  async consultar(marcaId: string, dto: ConsultarOfertasDto, ip: string) {
    if (dto.website) return { consultaId: null, nombre: null, ofertas: [], enlace: ENLACE_PUBLICO };
    this.limitar(ip);

    const body = JSON.stringify({
      participant: {
        identityDocument: { documentType: { id: 'DNI' }, documentNumber: dto.dni },
        birthDate: dto.nacimiento,
        contactDetails: [
          { contact: { contactType: 'MOBILE', mobileNumber: dto.celular, phoneCompany: { id: dto.operador } } },
          { contact: { contactType: 'EMAIL', address: dto.email.trim().toLowerCase() } },
        ],
      },
      // El plan de pruebas vigente (y producción) espera el texto "TC", no el objeto que describe el PDF.
      product: 'TC',
      terms: [{ id: 'DATA_PROTECTION_LAW', status: { id: 'ACCEPTED' } }],
    });

    const { status, json } = await this.llamarOfertas(body);
    if (status === 400) {
      const msg = json.messages?.[0]?.message ?? '';
      // Solo código y texto de BBVA (sin datos del visitante), para diagnosticar rechazos.
      this.logger.warn(`BBVA ofertas 400: ${JSON.stringify(json.messages?.map((m) => ({ code: m.code, message: m.message })) ?? json)}`);
      throw new BadRequestException(ERRORES[msg] ?? 'Revisa los datos ingresados.');
    }
    if (status !== 200) {
      this.logger.error(`BBVA ofertas ${status}: ${JSON.stringify(json.messages ?? json)}`);
      throw new ServiceUnavailableException('El servicio de BBVA no responde. Intenta en unos minutos.');
    }

    // Sin ofertas: se registra solo la forma de la respuesta (campos y tipos, ningún valor) por si BBVA cambia el formato.
    if (!json.data?.offers?.length) this.logger.log(`BBVA ofertas 200 sin ofertas, forma: ${JSON.stringify(forma(json))}`);

    const ofertas: Oferta[] = (json.data?.offers ?? []).map((o) => ({
      id: o.id,
      tarjeta: o.product?.title?.name ?? 'Tarjeta de crédito BBVA',
      codigo: o.product?.title?.id ?? '',
      linea: o.grantedAmount?.amount ?? 0,
      moneda: o.grantedAmount?.currency ?? 'PEN',
      tea: o.interestRate?.percent ?? 0,
      imagen: o.images?.find((i) => i.id === 'FRONT')?.url ?? o.images?.[0]?.url ?? null,
    }));
    const enlace = json.data?.link?.href || ENLACE_PUBLICO;
    const nombre = json.data?.participant?.firstname?.trim() || null;

    // Lead para el equipo: quién consultó y qué le ofrecieron (sin fecha de nacimiento).
    const resumen = ofertas.length
      ? ofertas.map((o) => `• ${o.tarjeta}: línea ${o.moneda} ${o.linea.toLocaleString('es-PE')} · TEA ${o.tea}%`).join('\n')
      : 'Sin ofertas disponibles.';
    const contacto = await this.prisma.contactoWeb.create({
      data: {
        marcaId,
        tipo: 'TARJETA_BBVA',
        nombre: nombre ? titulo(nombre) : `DNI ${dto.dni}`,
        email: dto.email.trim().toLowerCase(),
        celular: dto.celular,
        mensaje: `Consulta de tarjetas BBVA\nDNI: ${dto.dni}\n\nOfertas:\n${resumen}`,
        origen: dto.origen?.trim() || null,
      },
    });
    this.guardarConsulta(contacto.id, ofertas, enlace);
    return { consultaId: contacto.id, nombre: nombre ? titulo(nombre) : null, ofertas, enlace };
  }

  async solicitar(marcaId: string, dto: SolicitarTarjetaDto) {
    const c = this.consultas.get(dto.consultaId);
    const oferta = c?.ofertas.find((o) => o.id === dto.ofertaId);
    const contacto = await this.prisma.contactoWeb.findFirst({ where: { id: dto.consultaId, marcaId, tipo: 'TARJETA_BBVA' }, select: { mensaje: true } });
    if (contacto) {
      await this.prisma.contactoWeb.update({
        where: { id: dto.consultaId, marcaId },
        data: { mensaje: `${contacto.mensaje}\n\nSolicitó: ${oferta?.tarjeta ?? `oferta ${dto.ofertaId}`}`, estado: 'NUEVO' },
      });
    }
    return { enlace: c?.enlace ?? ENLACE_PUBLICO };
  }

  private guardarConsulta(id: string, ofertas: Oferta[], enlace: string) {
    const ahora = Date.now();
    this.consultas.set(id, { ofertas, enlace, vence: ahora + 3_600_000 });
    if (this.consultas.size > 2000) for (const [k, v] of this.consultas) if (v.vence < ahora) this.consultas.delete(k);
  }

  private limitar(ip: string) {
    const ahora = Date.now();
    const recientes = (this.intentos.get(ip) ?? []).filter((t) => ahora - t < VENTANA_MS);
    if (recientes.length >= MAX_POR_VENTANA) {
      throw new HttpException('Demasiadas consultas seguidas. Intenta de nuevo en unos minutos.', HttpStatus.TOO_MANY_REQUESTS);
    }
    recientes.push(ahora);
    this.intentos.set(ip, recientes);
    if (this.intentos.size > 5000) for (const [k, v] of this.intentos) if (!v.some((t) => ahora - t < VENTANA_MS)) this.intentos.delete(k);
  }
}

/** Estructura de un JSON sin sus valores: { data: { offers: [ { id: 'number' } ] } }. */
function forma(v: unknown): unknown {
  if (Array.isArray(v)) return v.length ? [forma(v[0]), `×${v.length}`] : [];
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, forma(x)]));
  return typeof v;
}

/** «AMPARO» → «Amparo». */
function titulo(s: string) {
  return s.toLowerCase().replace(/(^|\s)\p{L}/gu, (m) => m.toUpperCase());
}
