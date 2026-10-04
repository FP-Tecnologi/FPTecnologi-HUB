import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as bcrypt from 'bcrypt';
import { CuentaService } from './cuenta.service.js';

function setup(over: Record<string, unknown> = {}) {
  const prisma = {
    pedido: { count: vi.fn(async () => 1), findMany: vi.fn(async () => []) },
    cotizacion: { count: vi.fn(async () => 0), findMany: vi.fn(async () => []), findFirst: vi.fn(async () => null) },
    socio: { count: vi.fn(async () => 0) },
    codigoCuenta: { create: vi.fn(async (_a: unknown) => ({})), findFirst: vi.fn(async () => null), updateMany: vi.fn(async (_a: unknown) => ({ count: 1 })) },
    ...over,
  };
  const mail = { sendCodigoCuenta: vi.fn(async (_to: string, _c: string, _m: number) => {}) };
  return { service: new CuentaService(prisma as never, mail as never), prisma, mail };
}

describe('token de sesión', () => {
  const { service } = setup();
  it('round-trip, y rechaza marca distinta, vencido o alterado', () => {
    const { token } = service.emitirToken('ana@x.com', 'm1');
    expect(service.leerToken(token, 'm1')).toBe('ana@x.com');
    expect(() => service.leerToken(token, 'otra')).toThrow('Sesión');
    expect(() => service.leerToken(token, 'm1', Date.now() + 31 * 86_400_000)).toThrow('venció');
    expect(() => service.leerToken(`${token}x`, 'm1')).toThrow('Sesión');
    const [p, f] = token.split('.');
    const otro = Buffer.from(JSON.stringify({ e: 'jefe@x.com', m: 'm1', x: Date.now() + 1e9 })).toString('base64url');
    expect(() => service.leerToken(`${otro}.${f}`, 'm1')).toThrow('Sesión'); // cambiar el correo invalida la firma
    expect(() => service.leerToken(undefined, 'm1')).toThrow('Sesión');
    void p;
  });
});

describe('pedirCodigo', () => {
  it('envía el código solo si el correo tiene pedidos o cotizaciones', async () => {
    const { service, prisma, mail } = setup();
    await service.pedirCodigo('m1', ' ANA@x.com ', '1.1.1.1');
    expect(prisma.codigoCuenta.create).toHaveBeenCalled();
    expect(mail.sendCodigoCuenta).toHaveBeenCalledWith('ana@x.com', expect.stringMatching(/^\d{6}$/), 10);
  });

  it('con un correo sin compras responde igual pero no guarda ni envía nada', async () => {
    const { service, prisma, mail } = setup({ pedido: { count: vi.fn(async () => 0), findMany: vi.fn() } });
    const r = await service.pedirCodigo('m1', 'nadie@x.com', '1.1.1.2');
    expect(r).toEqual({ enviado: true });
    expect(prisma.codigoCuenta.create).not.toHaveBeenCalled();
    expect(mail.sendCodigoCuenta).not.toHaveBeenCalled();
  });

  it('limita los pedidos de código por correo', async () => {
    const { service } = setup();
    for (let i = 0; i < 4; i++) await service.pedirCodigo('m1', 'spam@x.com', `9.9.9.${i}`);
    await expect(service.pedirCodigo('m1', 'spam@x.com', '9.9.9.9')).rejects.toThrow('Demasiados');
  });
});

describe('verificar', () => {
  let hash: string;
  beforeEach(async () => { hash = await bcrypt.hash('123456', 4); });

  it('código correcto: consume el código y emite el token', async () => {
    const fila = { id: 'c1', codigoHash: hash, intentos: 0, expiresAt: new Date(Date.now() + 60_000) };
    const { service, prisma } = setup({ codigoCuenta: { create: vi.fn(), findFirst: vi.fn(async () => fila), updateMany: vi.fn(async (_a: unknown) => ({ count: 1 })) } });
    const r = await service.verificar('m1', 'Ana@X.com', '123456');
    expect(service.leerToken(r.token, 'm1')).toBe('ana@x.com');
    expect((prisma.codigoCuenta.updateMany.mock.calls as unknown as [{ data: { consumedAt?: Date } }][])[0][0].data.consumedAt).toBeInstanceOf(Date);
  });

  it('código incorrecto suma un intento; vencido o agotado se rechaza', async () => {
    const buena = { id: 'c1', codigoHash: hash, intentos: 0, expiresAt: new Date(Date.now() + 60_000) };
    const a = setup({ codigoCuenta: { create: vi.fn(), findFirst: vi.fn(async () => buena), updateMany: vi.fn(async (_a: unknown) => ({ count: 1 })) } });
    await expect(a.service.verificar('m1', 'a@x.com', '000000')).rejects.toThrow('inválido');
    expect((a.prisma.codigoCuenta.updateMany.mock.calls as unknown as [{ data: { intentos: unknown } }][])[0][0].data.intentos).toEqual({ increment: 1 });
    const vencido = setup({ codigoCuenta: { create: vi.fn(), findFirst: vi.fn(async () => ({ ...buena, expiresAt: new Date(0) })), updateMany: vi.fn() } });
    await expect(vencido.service.verificar('m1', 'a@x.com', '123456')).rejects.toThrow('vencido');
    const agotado = setup({ codigoCuenta: { create: vi.fn(), findFirst: vi.fn(async () => ({ ...buena, intentos: 5 })), updateMany: vi.fn() } });
    await expect(agotado.service.verificar('m1', 'a@x.com', '123456')).rejects.toThrow('inválido');
  });
});

describe('resumen', () => {
  it('oculta propuesta y monto de una cotización que aún no se envió', async () => {
    const { service } = setup({
      cotizacion: {
        count: vi.fn(), findFirst: vi.fn(async () => null),
        findMany: vi.fn(async () => [
          { id: '1', propuesta: 'borrador interno', monto: 100, validezHasta: new Date(), enviadaAt: null },
          { id: '2', propuesta: 'propuesta final', monto: 200, validezHasta: new Date(), enviadaAt: new Date() },
        ]),
      },
    });
    const { token } = service.emitirToken('ana@x.com', 'm1');
    const r = await service.resumen('m1', token);
    expect(r.cotizaciones[0]).toMatchObject({ propuesta: null, monto: null, validezHasta: null });
    expect(r.cotizaciones[1]).toMatchObject({ propuesta: 'propuesta final', monto: 200 });
  });
});
