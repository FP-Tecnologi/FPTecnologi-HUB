import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { esImagenExterna, localizarEnValor, localizarImagen } from './imagenes-externas.js';
import { localizarData } from '../prisma/imagenes-externas.extension.js';

const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0x0d, 0x49, 0x48, 0x44, 0x52]);
let dir: string;
const fetchOk = () => vi.fn(async () => new Response(PNG, { status: 200, headers: { 'content-type': 'image/png' } })) as unknown as typeof fetch;

beforeAll(() => {
  dir = mkdtempSync(join(tmpdir(), 'externas-'));
  process.env.UPLOADS_DIR = dir;
  process.env.PUBLIC_API_URL = 'https://api.fptecnologi.com';
});
afterAll(() => {
  rmSync(dir, { recursive: true, force: true });
  delete process.env.UPLOADS_DIR;
  delete process.env.PUBLIC_API_URL;
});
beforeEach(() => vi.restoreAllMocks());

describe('esImagenExterna', () => {
  it('detecta imágenes de otras webs y del WordPress viejo', () => {
    expect(esImagenExterna('https://www.dell.com/logo.png')).toBe(true);
    expect(esImagenExterna('https://cdn.marca.com/foto.JPG?v=2')).toBe(true);
    expect(esImagenExterna('https://fptecnologi.com/wp-content/uploads/2025/06/x.png')).toBe(true);
  });
  it('deja lo que ya es nuestro, lo que no es imagen y los hosts internos', () => {
    expect(esImagenExterna('https://api.fptecnologi.com/uploads/m/x.png')).toBe(false);
    expect(esImagenExterna('https://fptecnologi.com/images/productos/x.png')).toBe(false);
    expect(esImagenExterna('https://www.fimavperu.com/logo.png')).toBe(false);
    expect(esImagenExterna('/images/x.png')).toBe(false);
    expect(esImagenExterna('https://www.dell.com/productos')).toBe(false);
    expect(esImagenExterna('https://otra.com/logo.svg')).toBe(false);
    expect(esImagenExterna('http://localhost:3001/x.png')).toBe(false);
    expect(esImagenExterna('http://169.254.169.254/latest/x.png')).toBe(false);
    expect(esImagenExterna('http://192.168.1.10/x.png')).toBe(false);
  });
});

describe('localizarImagen', () => {
  it('descarga una vez, guarda en uploads/externas y devuelve la URL propia', async () => {
    const f = fetchOk();
    const url = 'https://marca.com/a.png';
    const propia = await localizarImagen(url, f);
    expect(propia).toMatch(/^https:\/\/api\.fptecnologi\.com\/uploads\/externas\/[0-9a-f]{32}\.png$/);
    expect(readdirSync(join(dir, 'externas'))).toContain(propia.split('/').pop());
    expect(await localizarImagen(url, f)).toBe(propia);
    expect(f).toHaveBeenCalledTimes(1);
  });
  it('si falla o no es una imagen real, deja la URL original', async () => {
    const html = vi.fn(async () => new Response('<html>', { status: 200 })) as unknown as typeof fetch;
    expect(await localizarImagen('https://marca.com/falsa.png', html)).toBe('https://marca.com/falsa.png');
    const caida = vi.fn(async () => new Response('', { status: 404 })) as unknown as typeof fetch;
    expect(await localizarImagen('https://marca.com/borrada.jpg', caida)).toBe('https://marca.com/borrada.jpg');
  });
});

describe('localizarEnValor / localizarData', () => {
  it('cambia URLs dentro de arreglos y JSON, sin tocar lo demás', async () => {
    const f = fetchOk();
    const r = (await localizarEnValor({ titulo: 'Hola', slides: [{ img: 'https://banco.com/s.webp', texto: 'x' }] }, f)) as { titulo: string; slides: { img: string; texto: string }[] };
    expect(r.titulo).toBe('Hola');
    expect(r.slides[0]!.img).toMatch(/\/uploads\/externas\//);
    expect(r.slides[0]!.texto).toBe('x');
  });
  it('en un guardado solo mira campos de imagen y JSON, no textos sueltos', async () => {
    vi.stubGlobal('fetch', fetchOk());
    const data = (await localizarData({ nombre: 'https://otra.com/no-tocar.png', imagenes: ['https://otra.com/p1.png', '/images/local.png'], stock: 3 })) as { nombre: string; imagenes: string[]; stock: number };
    expect(data.nombre).toBe('https://otra.com/no-tocar.png');
    expect(data.imagenes[0]).toMatch(/\/uploads\/externas\//);
    expect(data.imagenes[1]).toBe('/images/local.png');
    expect(data.stock).toBe(3);
    vi.unstubAllGlobals();
  });
  it('sin imágenes externas devuelve los mismos valores', async () => {
    const d = { nombre: 'A', precio: 10, imagenes: ['/uploads/m/a.png'] };
    expect(await localizarData(d)).toEqual(d);
  });
});
