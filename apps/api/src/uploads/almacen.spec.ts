import { mkdtemp, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { AddressInfo } from 'node:net';
import express from 'express';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { guardarPublico, servirDesdeBase, usarBase } from './almacen.js';

describe('almacen', () => {
  const filas = new Map<string, Uint8Array>();
  let dir: string;
  beforeAll(async () => {
    dir = await mkdtemp(join(tmpdir(), 'subidas-'));
    process.env.UPLOADS_DIR = dir;
    usarBase({
      archivoSubido: {
        upsert: async (a: { create: { ruta: string; datos: Uint8Array } }) => filas.set(a.create.ruta, a.create.datos),
        findUnique: async (a: { where: { ruta: string } }) => (filas.has(a.where.ruta) ? { datos: filas.get(a.where.ruta) } : null),
      },
    } as never);
  });
  afterAll(async () => {
    usarBase(null);
    delete process.env.UPLOADS_DIR;
    await rm(dir, { recursive: true, force: true });
  });

  it('sigue sirviendo el archivo aunque el despliegue borre el disco', async () => {
    const app = express();
    app.use('/uploads', express.static(dir), servirDesdeBase(() => undefined));
    const server = app.listen(0);
    const url = `http://127.0.0.1:${(server.address() as AddressInfo).port}/uploads`;
    try {
      await guardarPublico('m1/foto.png', Buffer.from('bytes'));
      await rm(join(dir, 'm1'), { recursive: true });
      const res = await fetch(`${url}/m1/foto.png`);
      expect(res.status).toBe(200);
      expect(res.headers.get('content-type')).toBe('image/png');
      expect(await res.text()).toBe('bytes');
      expect(existsSync(join(dir, 'm1', 'foto.png'))).toBe(true);
      expect((await fetch(`${url}/m1/otra.png`)).status).toBe(404);
    } finally {
      server.close();
    }
  });
});
