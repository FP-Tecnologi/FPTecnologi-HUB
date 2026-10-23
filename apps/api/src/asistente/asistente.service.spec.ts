import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ServiceUnavailableException } from '@nestjs/common';
import { AsistenteService, parsearFinal } from './asistente.service.js';
import { HERRAMIENTAS, puede } from './asistente.herramientas.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.js';

const usuario = (rol: string, sub = `u-${rol}-${Math.random()}`): AuthenticatedUser => ({ sub, email: 'a@b.pe', marcas: [{ marcaId: 'm1', rol }] });

function prismaFalso() {
  const modelo = () => ({
    findMany: vi.fn(async () => []),
    count: vi.fn(async () => 0),
    aggregate: vi.fn(async () => ({ _sum: { total: 0 }, _count: 0 })),
  });
  return {
    marca: { findUnique: vi.fn(async () => ({ nombre: 'FPTecnologi' })) },
    pedido: modelo(), producto: modelo(), cotizacion: modelo(), presupuesto: modelo(), leadCotizador: modelo(),
    ticket: modelo(), contactoWeb: modelo(), hojaReclamacion: modelo(), chatConversacion: modelo(),
  };
}

/** Respuestas del modelo en orden; guarda cada petición para revisarla. */
function groqFalso(respuestas: { content?: string | null; tool_calls?: unknown[] }[]) {
  const peticiones: { tools?: { function: { name: string } }[]; messages: { role: string; content: string | null }[] }[] = [];
  let i = 0;
  vi.stubGlobal('fetch', vi.fn(async (_url: string, init: { body: string }) => {
    peticiones.push(JSON.parse(init.body));
    const message = respuestas[Math.min(i++, respuestas.length - 1)];
    return new Response(JSON.stringify({ choices: [{ message }] }), { status: 200 });
  }));
  return peticiones;
}

const llamada = (name: string, args: unknown, id = 'c1') => ({ id, type: 'function', function: { name, arguments: JSON.stringify(args) } });
const setup = () => {
  const prisma = prismaFalso();
  const reportes = { ventas: vi.fn() };
  const conocimiento = { buscar: vi.fn(async () => []) };
  return { prisma, service: new AsistenteService(prisma as never, reportes as never, conocimiento as never) };
};

describe('AsistenteService', () => {
  beforeEach(() => { process.env.GROQ_API_KEY = 'k'; });
  afterEach(() => { vi.unstubAllGlobals(); delete process.env.GROQ_API_KEY; });

  it('sin GROQ_API_KEY responde 503', async () => {
    delete process.env.GROQ_API_KEY;
    await expect(setup().service.consultar('m1', usuario('admin'), [{ role: 'user', content: 'hola' }])).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('solo ofrece al modelo las herramientas del rol', async () => {
    const peticiones = groqFalso([{ content: '{"texto":"ok"}' }]);
    await setup().service.consultar('m1', usuario('marketing'), [{ role: 'user', content: 'ventas?' }]);
    const nombres = peticiones[0]!.tools!.map((t) => t.function.name);
    expect(nombres).toContain('resumen_negocio');
    expect(nombres).toContain('buscar_conocimiento');
    expect(nombres).not.toContain('buscar_pedidos');
    expect(nombres).not.toContain('buscar_leads');
  });

  it('no ejecuta una herramienta fuera del rol aunque el modelo la pida', async () => {
    groqFalso([{ content: null, tool_calls: [llamada('buscar_pedidos', {})] }, { content: '{"texto":"no tienes acceso"}' }]);
    const { prisma, service } = setup();
    const r = await service.consultar('m1', usuario('comercial'), [{ role: 'user', content: 'pedidos' }]);
    expect(prisma.pedido.findMany).not.toHaveBeenCalled();
    expect(r.texto).toBe('no tienes acceso');
  });

  it('ejecuta herramientas con el marcaId activo y devuelve la tabla real y el módulo', async () => {
    groqFalso([
      { content: null, tool_calls: [llamada('buscar_pedidos', { estado: 'PENDIENTE' })] },
      { content: '{"texto":"Tienes 1 pedido pendiente.","modulos":["ecommerce.pedidos","inventado.x"],"sugerencias":["¿Y los pagados?"]}' },
    ]);
    const { prisma, service } = setup();
    prisma.pedido.findMany.mockResolvedValueOnce([
      { numeroPedido: 'P-1', createdAt: new Date('2026-10-20T15:00:00Z'), nombre: 'Ana', estado: 'PENDIENTE', estadoPago: 'PENDIENTE', total: 118, moneda: 'USD' },
    ] as never);
    prisma.pedido.aggregate.mockResolvedValueOnce({ _sum: { total: 118 }, _count: 1 } as never);
    const r = await service.consultar('m1', usuario('ventas'), [{ role: 'user', content: 'pedidos pendientes' }]);
    const where = (prisma.pedido.findMany.mock.calls[0] as unknown as [{ where: Record<string, unknown> }])[0].where;
    expect(where.marcaId).toBe('m1');
    expect(where.estado).toBe('PENDIENTE');
    expect(r.tablas[0]!.filas[0]).toEqual(['P-1', '2026-10-20', 'Ana', 'PENDIENTE', 'PENDIENTE', 118]);
    expect(r.modulos).toEqual(['ecommerce.pedidos']);
    expect(r.sugerencias).toEqual(['¿Y los pagados?']);
  });

  it('un estado inválido vuelve al modelo como error, sin romper la respuesta', async () => {
    const peticiones = groqFalso([{ content: null, tool_calls: [llamada('buscar_pedidos', { estado: 'X' })] }, { content: '{"texto":"listo"}' }]);
    const r = await setup().service.consultar('m1', usuario('admin'), [{ role: 'user', content: 'pedidos' }]);
    expect(r.texto).toBe('listo');
    const tool = peticiones[1]!.messages.find((m) => m.role === 'tool');
    expect(tool?.content).toContain('Estado no válido');
  });

  it('corta el bucle de herramientas: la última vuelta va sin herramientas', async () => {
    const peticiones = groqFalso([{ content: null, tool_calls: [llamada('resumen_negocio', {})] }]);
    await setup().service.consultar('m1', usuario('admin'), [{ role: 'user', content: 'resumen' }]);
    expect(peticiones).toHaveLength(4);
    expect((peticiones[3] as unknown as { tool_choice: string }).tool_choice).toBe('none');
  });

  it('resumen_negocio de marketing no consulta pedidos ni leads', async () => {
    groqFalso([{ content: null, tool_calls: [llamada('resumen_negocio', {})] }, { content: '{"texto":"ok"}' }]);
    const { prisma, service } = setup();
    const r = await service.consultar('m1', usuario('marketing'), [{ role: 'user', content: 'resumen' }]);
    expect(prisma.pedido.aggregate).not.toHaveBeenCalled();
    expect(prisma.leadCotizador.count).not.toHaveBeenCalled();
    expect(r.metricas).toEqual([]);
  });

  it('limita las consultas por usuario', async () => {
    groqFalso([{ content: '{"texto":"ok"}' }]);
    const { service } = setup();
    const u = usuario('admin', 'fijo');
    for (let i = 0; i < 40; i++) await service.consultar('m1', u, [{ role: 'user', content: 'hola' }]);
    await expect(service.consultar('m1', u, [{ role: 'user', content: 'hola' }])).rejects.toMatchObject({ status: 429 });
  });
});

describe('parsearFinal', () => {
  it('lee el JSON aunque venga envuelto', () => {
    expect(parsearFinal('```json\n{"texto":"Hola","modulos":["a"],"sugerencias":[]}\n```')).toEqual({ texto: 'Hola', modulos: ['a'], sugerencias: [] });
  });
  it('si no es JSON usa el texto tal cual', () => {
    expect(parsearFinal('Solo texto').texto).toBe('Solo texto');
  });
});

describe('permisos de herramientas', () => {
  it('admin puede todas; cada rol solo las de su módulo', () => {
    expect(HERRAMIENTAS.every((h) => puede(h.roles, 'admin'))).toBe(true);
    const de = (rol: string) => HERRAMIENTAS.filter((h) => puede(h.roles, rol)).map((h) => h.nombre).sort();
    expect(de('comercial')).toEqual(['buscar_conocimiento', 'buscar_contactos', 'buscar_cotizaciones', 'buscar_leads', 'buscar_presupuestos', 'buscar_reclamos', 'buscar_tickets', 'resumen_negocio']);
    expect(de('asesores')).toEqual(['buscar_chats', 'buscar_conocimiento', 'resumen_negocio']);
  });
});

describe('AsistenteController', () => {
  it('solo el super administrador, y con acceso a la marca consultada', async () => {
    const { AsistenteController } = await import('./asistente.controller.js');
    const { SuperAdminGuard } = await import('../common/guards/super-admin.guard.js');
    const { MarcaRolGuard } = await import('../common/guards/marca-rol.guard.js');
    expect(Reflect.getMetadata('__guards__', AsistenteController)).toEqual([SuperAdminGuard, MarcaRolGuard]);
  });
});
