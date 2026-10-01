import { describe, expect, it } from 'vitest';
import { FORMULARIOS, limpiarContenido, limpiarFormulario, PLANTILLAS, resumenContacto, validarRegistro } from './landings.modelo.js';

const evento = FORMULARIOS.registro_evento.formulario;
const ok = { nombres: 'Juan', apellidos: 'Pérez', cargo: 'Gerencia', ruc: '20123456789', empresa: 'Minera SAC', rubro: 'Minería', telefono: '+51 987 654 321', email: 'JUAN@Minera.com', acepto: true };

describe('validarRegistro', () => {
  it('acepta un registro completo y normaliza celular y correo', () => {
    const d = validarRegistro(evento, ok);
    expect(d.telefono).toBe('987654321');
    expect(d.email).toBe('juan@minera.com');
    expect(resumenContacto(evento, d)).toEqual({ nombre: 'Juan Pérez', email: 'juan@minera.com', celular: '987654321' });
  });

  it('rechaza faltantes, opciones inventadas, documento inválido y sin aceptación', () => {
    expect(() => validarRegistro(evento, { ...ok, nombres: '' })).toThrow('Nombres');
    expect(() => validarRegistro(evento, { ...ok, cargo: 'Hacker' })).toThrow('opción válida');
    expect(() => validarRegistro(evento, { ...ok, ruc: '123' })).toThrow('RUC');
    expect(() => validarRegistro(evento, { ...ok, telefono: '12345' })).toThrow('celular');
    expect(() => validarRegistro(evento, { ...ok, acepto: false })).toThrow('aceptar');
  });

  it('ignora claves que no están en el formulario', () => {
    const d = validarRegistro(evento, { ...ok, admin: 'true' });
    expect(Object.keys(d)).not.toContain('admin');
  });
});

describe('limpiarFormulario / limpiarContenido', () => {
  it('normaliza ids, descarta tipos raros, selects sin opciones y duplicados', () => {
    const f = limpiarFormulario({
      pasos: ['Uno'],
      campos: [
        { id: 'Nombre Completo!', tipo: 'texto', etiqueta: 'Nombre', requerido: true },
        { id: 'nombrecompleto', tipo: 'texto', etiqueta: 'Repetido' },
        { id: 'x', tipo: 'script', etiqueta: 'Malo' },
        { id: 'sel', tipo: 'select', etiqueta: 'Sin opciones' },
      ],
    });
    expect(f.campos.map((c) => c.id)).toEqual(['nombrecompleto']);
    expect(() => limpiarFormulario({ campos: [] })).toThrow('al menos un campo');
  });

  it('recorta el contenido a la lista blanca y descarta URLs peligrosas', () => {
    const base = PLANTILLAS[0].contenido;
    const c = limpiarContenido({ titulo: 'Hola', imagenUrl: 'javascript:alert(1)', logoUrl: '/uploads/a.png', hack: 'x', tema: 'rojo', beneficios: [{ titulo: 'A', texto: 'b' }, { titulo: '' }] }, base);
    expect(c.titulo).toBe('Hola');
    expect(c.imagenUrl).toBe('');
    expect(c.logoUrl).toBe('/uploads/a.png');
    expect(c.tema).toBe(base.tema);
    expect(c.beneficios).toHaveLength(1);
    expect((c as unknown as Record<string, unknown>).hack).toBeUndefined();
  });
});
