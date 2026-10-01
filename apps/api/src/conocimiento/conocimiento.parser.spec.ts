import { describe, expect, it } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { detectarTipo, filasASecciones, normalizar, procesarDocumento, seccionesDeTexto, terminosDe, trocear } from './conocimiento.parser.js';

describe('normalizar / terminosDe', () => {
  it('quita tildes y signos, y deja términos útiles sin palabras vacías', () => {
    expect(normalizar('¿Instalación de CÁMARAS, en Lima?')).toBe('instalacion de camaras en lima');
    expect(terminosDe('¿Hacen visitas técnicas a provincia?')).toEqual(['visitas', 'tecnicas', 'provincia']);
    expect(terminosDe('hola, gracias')).toEqual([]);
    expect(terminosDe('x'.repeat(5000)).length).toBeLessThanOrEqual(10);
  });

  it('los términos solo llevan letras y números (seguros para armar la consulta)', () => {
    for (const t of terminosDe("camaras'; DROP TABLE x; -- | & !")) expect(t).toMatch(/^[a-z0-9ñ]+$/);
  });
});

describe('secciones y fragmentos', () => {
  it('divide por títulos markdown y conserva el título en cada fragmento', () => {
    const s = seccionesDeTexto('# Garantía\nLa garantía es de 12 meses.\n\n# Envíos\nEnviamos por Shalom a todo el Perú.', 'doc');
    expect(s.map((x) => x.titulo)).toEqual(['Garantía', 'Envíos']);
    expect(trocear(s)[1]).toEqual({ titulo: 'Envíos', texto: 'Enviamos por Shalom a todo el Perú.' });
  });

  it('un texto largo se corta en fragmentos de ~900 caracteres sin perder contenido', () => {
    const parrafos = Array.from({ length: 30 }, (_, i) => `Párrafo ${i} ` + 'palabra '.repeat(40));
    const f = trocear([{ titulo: 'Largo', texto: parrafos.join('\n\n') }]);
    expect(f.length).toBeGreaterThan(5);
    expect(f.every((x) => x.texto.length <= 1300)).toBe(true);
    expect(f.map((x) => x.texto).join('\n')).toContain('Párrafo 29');
  });

  it('una hoja de cálculo se convierte en filas "Columna: valor" agrupadas', () => {
    const filas = [['Producto', 'Precio', 'Plazo'], ['Cámara IP', '120', '2 días'], ['NVR 8 canales', '300', '3 días']];
    const s = filasASecciones('Precios', filas);
    expect(s).toHaveLength(1);
    expect(s[0].texto).toBe('Producto: Cámara IP; Precio: 120; Plazo: 2 días\nProducto: NVR 8 canales; Precio: 300; Plazo: 3 días');
    expect(filasASecciones('Vacía', [[], ['', '']])).toEqual([]);
  });
});

describe('procesarDocumento', () => {
  it('lee texto y csv por su contenido', async () => {
    const txt = await procesarDocumento(Buffer.from('# Horario\nLunes a viernes de 9 a 18.'), 'politicas.md');
    expect(txt.tipo).toBe('md');
    expect(txt.fragmentos[0].titulo).toBe('Horario');
    const csv = await procesarDocumento(Buffer.from('Servicio;Costo\nVisita;Gratis\nSoporte;Mensual'), 'tarifas.csv');
    expect(csv.fragmentos[0].texto).toContain('Servicio: Visita; Costo: Gratis');
  });

  it('rechaza formatos no admitidos, binarios disfrazados, vacíos y archivos enormes', async () => {
    expect(() => detectarTipo(Buffer.from('MZ\0\0exe'), 'virus.txt')).toThrow(BadRequestException);
    expect(() => detectarTipo(Buffer.from('PK\x03\x04zip'), 'datos.zip')).toThrow('Formato');
    await expect(procesarDocumento(Buffer.from('   '), 'vacio.txt')).rejects.toThrow('texto');
    await expect(procesarDocumento(Buffer.alloc(11 * 1024 * 1024, 65), 'grande.txt')).rejects.toThrow('10 MB');
    await expect(procesarDocumento(Buffer.from('PK\x03\x04basura'), 'roto.docx')).rejects.toThrow('No se pudo leer');
  });
});
