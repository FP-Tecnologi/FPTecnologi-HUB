import { describe, expect, it, vi } from 'vitest';
import { PanelService } from './panel.service.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.js';

function crear() {
  const lista = (nombre: string) => vi.fn(async (marcaId: string) => [{ nombre, marcaId }]);
  const s = {
    pedidos: { findAll: lista('pedido') },
    cotizador: { list: lista('lead') },
    cotizaciones: { findAll: lista('cotizacion') },
    chat: { listConversaciones: lista('chat') },
    blog: { list: lista('blog') },
    productos: { findAll: lista('producto') },
    boletin: { list: lista('suscriptor') },
    contactos: { list: lista('contacto') },
    roles: { equipoDeMarca: lista('miembro') },
    visitas: { resumen: vi.fn(async (marcaId: string, dias: number) => ({ marcaId, dias })) },
  };
  const panel = new PanelService(
    s.pedidos as never, s.cotizador as never, s.cotizaciones as never, s.chat as never, s.blog as never,
    s.productos as never, s.boletin as never, s.contactos as never, s.roles as never, s.visitas as never,
  );
  return { panel, s };
}

const user: AuthenticatedUser = {
  sub: 'u1',
  email: 'u@x.com',
  marcas: [
    { marcaId: 'A', rol: 'admin' },
    { marcaId: 'B', rol: 'marketing' },
  ],
};

describe('PanelService', () => {
  it('solo carga los módulos que permite el rol de cada marca', async () => {
    const { panel, s } = crear();
    const [a, b] = await panel.resumen(user);
    expect(a!.marcaId).toBe('A');
    expect(a!.pedidos).toEqual([{ nombre: 'pedido', marcaId: 'A' }]);
    expect(a!.chat).not.toBeNull();
    expect(b!.marcaId).toBe('B');
    expect(b!.pedidos).toBeNull();
    expect(b!.leads).toBeNull();
    expect(b!.blog).toEqual([{ nombre: 'blog', marcaId: 'B' }]);
    expect(b!.equipo).not.toBeNull();
    expect(s.pedidos.findAll).toHaveBeenCalledTimes(1);
  });

  it('ignora marcas que el usuario no tiene', async () => {
    const { panel, s } = crear();
    const filas = await panel.resumen(user, ['B', 'OTRA']);
    expect(filas.map((f) => f.marcaId)).toEqual(['B']);
    expect(s.blog.list).not.toHaveBeenCalledWith('OTRA');
  });

  it('un módulo que falla queda en null sin tumbar el resto', async () => {
    const { panel, s } = crear();
    s.pedidos.findAll.mockRejectedValueOnce(new Error('db'));
    const [a] = await panel.resumen(user, ['A']);
    expect(a!.pedidos).toBeNull();
    expect(a!.productos).not.toBeNull();
  });

  it('visitas: omite marcas sin permiso y normaliza los días', async () => {
    const { panel } = crear();
    const res = await panel.visitasResumen({ ...user, marcas: [...user.marcas, { marcaId: 'C', rol: 'asesores' }] }, 45);
    expect(res.map((r) => r.marcaId)).toEqual(['A', 'B']);
    expect(res[0]!.resumen).toEqual({ marcaId: 'A', dias: 30 });
  });
});
