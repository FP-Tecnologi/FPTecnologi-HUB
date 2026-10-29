import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { createVerify, generateKeyPairSync } from 'node:crypto';
import { cabecerasFirmadas, clavePem, digest } from './bbva.firma.js';
import { BbvaService } from './bbva.service.js';
import type { ConsultarOfertasDto } from './bbva.dto.js';

const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const pem = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();

describe('firma BBVA API Connect', () => {
  it('digest coincide con los ejemplos de la documentación', () => {
    expect(digest('{"hello": "world"}')).toBe('SHA-512=WZDPaVn/7XgHaAy8pmojAkGWoRx2UFChF41A2svX+TaPm+AbwAgBWnrIiYllu7BNNyealdVLvRwEmTHWXvJwew==');
    expect(digest('')).toBe('SHA-512=z4PhNX7vuL3xVChQ1m2AB9Yg5AULVxXcg/SpIdNs6c5H0NE8XYXysP+DGNKHfuwvY7kxvUdBeoGlODJ6+SfaPg==');
  });

  it('acepta la clave en base64 (como la manda BBVA) o en PEM', () => {
    expect(clavePem(Buffer.from(pem).toString('base64'))).toBe(pem.trim());
    expect(clavePem(pem)).toBe(pem.trim());
  });

  it('firma la cadena (request-target) host date digest y se verifica con la pública', () => {
    const ahora = new Date('2026-10-29T15:00:00Z');
    const h = cabecerasFirmadas({ metodo: 'POST', path: '/pe/cards-offer/v1/prospect-customer', host: 'sbx.pe.bbvaapimarket.com', body: '{}', clave: pem, ahora });
    expect(h.Date).toBe('Thu, 29 Oct 2026 15:00:00 GMT');
    const firma = h.Signature.match(/signature="([^"]+)"/)![1];
    expect(h.Signature).toContain('headers="(request-target) host date digest"');
    const cadena = `(request-target):post /pe/cards-offer/v1/prospect-customer\nhost:sbx.pe.bbvaapimarket.com\ndate:${h.Date}\ndigest:${h.Digest}`;
    expect(createVerify('RSA-SHA512').update(cadena).verify(publicKey, firma, 'base64')).toBe(true);
  });
});

const dto: ConsultarOfertasDto = { dni: '06681016', nacimiento: '2001-12-08', celular: '969505789', operador: 'M', email: 'Ana@Correo.com', aceptaDatos: true };

function setup(respuestas: Array<{ status: number; json: unknown }>) {
  const fetchMock = vi.fn(async (url: string) => {
    if (url.endsWith('/auth/oauth/v2/token')) return new Response(JSON.stringify({ access_token: 't1', expires_in: 3600 }), { status: 200 });
    const r = respuestas.shift()!;
    return new Response(JSON.stringify(r.json), { status: r.status });
  });
  vi.stubGlobal('fetch', fetchMock);
  const create = vi.fn(async ({ data }) => ({ id: '11111111-1111-4111-8111-111111111111', ...data }));
  const update = vi.fn();
  const prisma = { contactoWeb: { create, update, findFirst: vi.fn(async () => ({ mensaje: 'Consulta' })) } };
  return { service: new BbvaService(prisma as never), fetchMock, create, update };
}

describe('BbvaService', () => {
  beforeAll(() => {
    process.env.BBVA_CLIENT_ID = 'id';
    process.env.BBVA_CLIENT_SECRET = 'secret';
    process.env.BBVA_PRIVATE_KEY = Buffer.from(pem).toString('base64');
  });
  afterEach(() => vi.unstubAllGlobals());

  const ok = {
    data: {
      participant: { firstname: 'AMPARO' },
      offers: [{ id: 2282, grantedAmount: { amount: 66500, currency: 'PEN' }, interestRate: { percent: 86.99 }, product: { title: { id: 'F7', name: 'Visa Cero BBVA' } }, images: [{ id: 'FRONT', url: 'https://x/front.svg' }] }],
      link: { href: 'https://tarjetas.bbva.pe/' },
    },
  };

  it('consulta, resume las ofertas y guarda el lead sin la fecha de nacimiento', async () => {
    const { service, fetchMock, create } = setup([{ status: 200, json: ok }]);
    const r = await service.consultar('m1', dto, '1.1.1.1');
    expect(r.nombre).toBe('Amparo');
    expect(r.ofertas).toEqual([{ id: 2282, tarjeta: 'Visa Cero BBVA', codigo: 'F7', linea: 66500, moneda: 'PEN', tea: 86.99, imagen: 'https://x/front.svg' }]);
    const [, init] = fetchMock.mock.calls[1] as unknown as [string, RequestInit];
    const headers = init.headers as Record<string, string>;
    expect(headers.Authorization).toBe('Bearer t1');
    expect(headers.Digest).toBe(digest(init.body as string));
    expect(JSON.parse(init.body as string).participant.contactDetails[1].contact.address).toBe('ana@correo.com');
    const data = create.mock.calls[0][0].data;
    expect(data).toMatchObject({ marcaId: 'm1', tipo: 'TARJETA_BBVA', nombre: 'Amparo', celular: '969505789' });
    expect(data.mensaje).toContain('Visa Cero BBVA');
    expect(data.mensaje).not.toContain('2001-12-08');
  });

  it('traduce el error funcional de BBVA', async () => {
    const { service } = setup([{ status: 400, json: { messages: [{ code: 'functionalError', message: 'INVALID CELL PHONE NUMBER' }] } }]);
    await expect(service.consultar('m1', dto, '1.1.1.2')).rejects.toThrow('Revisa tu número de celular.');
  });

  it('con 401 pide otro token y reintenta una vez', async () => {
    const { service, fetchMock } = setup([{ status: 401, json: {} }, { status: 200, json: ok }]);
    await service.consultar('m1', dto, '1.1.1.3');
    expect(fetchMock.mock.calls.filter(([u]) => String(u).endsWith('/token'))).toHaveLength(2);
  });

  it('solicitar anota la tarjeta elegida y devuelve el enlace de BBVA', async () => {
    const { service, update } = setup([{ status: 200, json: ok }]);
    const { consultaId } = await service.consultar('m1', dto, '1.1.1.4');
    const r = await service.solicitar('m1', { consultaId: consultaId!, ofertaId: 2282 });
    expect(r.enlace).toBe('https://tarjetas.bbva.pe/');
    expect(update.mock.calls[0][0].data.mensaje).toContain('Solicitó: Visa Cero BBVA');
  });

  it('limita las consultas por IP', async () => {
    const { service } = setup(Array.from({ length: 6 }, () => ({ status: 200, json: ok })));
    for (let i = 0; i < 5; i++) await service.consultar('m1', dto, '9.9.9.9');
    await expect(service.consultar('m1', dto, '9.9.9.9')).rejects.toThrow('Demasiadas consultas');
  });
});
