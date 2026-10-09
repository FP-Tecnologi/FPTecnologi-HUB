import { describe, expect, it } from 'vitest';
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

  it('catálogo: solo PDF real (por su firma) y hasta 50 MB', async () => {
    const s = new UploadsService();
    await expect(s.guardarCatalogo('m1', { buffer: png, size: png.length })).rejects.toThrow('PDF válido');
    await expect(s.guardarCatalogo('m1', undefined)).rejects.toThrow('Elige');
    await expect(s.guardarCatalogo('m1', { buffer: Buffer.from('%PDF-1.7'), size: 51 * 1024 * 1024 })).rejects.toThrow('50 MB');
  });
});
