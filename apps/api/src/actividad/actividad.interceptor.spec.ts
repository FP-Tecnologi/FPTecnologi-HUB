import { describe, expect, it } from 'vitest';
import { describirRuta, limpiarCambios } from './actividad.interceptor.js';

const ID = '3f2b8c1e-9a4d-4e6f-8b7a-1c2d3e4f5a6b';

describe('describirRuta', () => {
  it('crear, editar y eliminar según el método', () => {
    expect(describirRuta('POST', 'landings')).toMatchObject({ accion: 'landings.crear', entidad: 'landings', entidadId: null });
    expect(describirRuta('PATCH', `crm/oportunidades/${ID}`)).toMatchObject({ accion: 'crm/oportunidades.editar', entidadId: ID });
    expect(describirRuta('DELETE', `landings/${ID}`).accion).toBe('landings.eliminar');
  });
  it('una acción sobre un registro usa el último tramo como verbo', () => {
    expect(describirRuta('POST', `landings/${ID}/aprobar`)).toMatchObject({ accion: 'landings.aprobar', entidadId: ID });
  });
  it('un GET de exportación se llama exportar', () => {
    expect(describirRuta('GET', 'actividad/exportar').accion).toBe('actividad.exportar');
  });
});

describe('limpiarCambios', () => {
  it('oculta secretos y recorta textos largos', () => {
    const r = limpiarCambios({ nombre: 'Ana', password: 'x', nuevoToken: 'y', texto: 'a'.repeat(300) }) as Record<string, string>;
    expect(r.nombre).toBe('Ana');
    expect(r.password).toBe('[oculto]');
    expect(r.nuevoToken).toBe('[oculto]');
    expect(r.texto.length).toBe(201);
  });
});
