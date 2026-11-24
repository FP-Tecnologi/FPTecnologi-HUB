import { resolve } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { revisarAlmacenPrivado } from './assert-required-env.js';

describe('revisarAlmacenPrivado', () => {
  afterEach(() => vi.unstubAllEnvs());
  const revisar = (privado: string, entorno = 'production') => {
    vi.stubEnv('NODE_ENV', entorno);
    vi.stubEnv('UPLOADS_DIR', 'uploads');
    vi.stubEnv('UPLOADS_PRIVADO_DIR', privado);
    return revisarAlmacenPrivado();
  };

  it('avisa en producción si la carpeta privada se borraría al desplegar', () => {
    expect(revisar('')).toMatch('se perderán');
    expect(revisar('uploads-privado')).toMatch('se perderán');
    expect(revisar('../uploads-privado')).toMatch('se perderán');
    expect(revisar(resolve('uploads-privado'))).toMatch('se perderán');
  });

  it('no avisa con una ruta absoluta fuera de la app, ni fuera de producción', () => {
    expect(revisar(resolve('..', 'datos-privados'))).toBeNull();
    expect(revisar('uploads-privado', 'development')).toBeNull();
  });

  it('no arranca si la carpeta privada queda dentro de la pública', () => {
    expect(() => revisar(resolve('uploads', 'privado'))).toThrow('/uploads');
    expect(() => revisar('uploads', 'development')).toThrow('/uploads');
  });
});
