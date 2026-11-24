import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { AddressInfo } from 'node:net';
import express from 'express';
import { describe, expect, it, vi } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { tipoImagen, UploadsService } from './uploads.service.js';

const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0, 0, 0]);
const jpg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0x10, 0x4a, 0x46]);
const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');

describe('uploads', () => {
  it('detecta el formato real por los bytes', () => {
    expect(tipoImagen(png)?.ext).toBe('png');
    expect(tipoImagen(jpg)?.ext).toBe('jpg');
    expect(tipoImagen(Buffer.from('RIFF\0\0\0\0WEBPVP8 '))?.ext).toBe('webp');
  });

  it('rechaza SVG, texto y archivos vacíos o gigantes', async () => {
    const s = new UploadsService();
    expect(tipoImagen(svg)).toBeNull();
    await expect(s.guardarImagen('m1', { buffer: svg, size: svg.length })).rejects.toBeInstanceOf(BadRequestException);
    await expect(s.guardarImagen('m1', undefined)).rejects.toThrow('Elige');
    await expect(s.guardarImagen('m1', { buffer: png, size: 6 * 1024 * 1024 })).rejects.toThrow('5 MB');
  });

  it('un archivo privado sigue descargándose aunque el despliegue borre la carpeta de la app', async () => {
    const raiz = await mkdtemp(join(tmpdir(), 'privados-'));
    const appDir = join(raiz, 'app');
    await mkdir(appDir);
    const cwd = vi.spyOn(process, 'cwd').mockReturnValue(appDir);
    vi.stubEnv('UPLOADS_PRIVADO_DIR', join(raiz, 'datos-privados'));
    const web = express();
    web.get('/descarga', (req, res) => new UploadsService().enviar(res, String(req.query.clave)));
    const server = web.listen(0);
    try {
      const pdf = Buffer.from('%PDF-1.7 material para socios');
      const { clave } = await new UploadsService().guardarRecurso('11111111-1111-1111-1111-111111111111', { buffer: pdf, size: pdf.length });
      await rm(appDir, { recursive: true });
      const res = await fetch(`http://127.0.0.1:${(server.address() as AddressInfo).port}/descarga?clave=${clave}`);
      expect(res.status).toBe(200);
      expect(res.headers.get('content-disposition')).toMatch('attachment');
      expect(await res.text()).toBe(pdf.toString());
    } finally {
      server.close();
      cwd.mockRestore();
      vi.unstubAllEnvs();
      await rm(raiz, { recursive: true, force: true });
    }
  });

  it('catálogo: solo PDF real (por su firma) y hasta 50 MB', async () => {
    const s = new UploadsService();
    await expect(s.guardarCatalogo('m1', { buffer: png, size: png.length })).rejects.toThrow('PDF válido');
    await expect(s.guardarCatalogo('m1', undefined)).rejects.toThrow('Elige');
    await expect(s.guardarCatalogo('m1', { buffer: Buffer.from('%PDF-1.7'), size: 51 * 1024 * 1024 })).rejects.toThrow('50 MB');
  });
});
