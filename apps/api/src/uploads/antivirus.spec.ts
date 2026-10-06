import { describe, expect, it } from 'vitest';
import { escaneoBasico } from './antivirus.js';

const EICAR = String.raw`X5O!P%@AP[4\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*`;

describe('escaneoBasico', () => {
  it('deja pasar un PNG y un PDF normales', () => {
    expect(escaneoBasico(Buffer.from('89504e470d0a1a0a0000000d49484452', 'hex'))).toBeNull();
    expect(escaneoBasico(Buffer.from('%PDF-1.7\n1 0 obj\n<< /Type /Catalog >>\nendobj'))).toBeNull();
  });
  it('rechaza ejecutables, EICAR, PDF con JavaScript, macros y ZIP con .exe', () => {
    expect(escaneoBasico(Buffer.from('MZ\x90\x00\x03'))).toMatch(/ejecutable/);
    expect(escaneoBasico(Buffer.from(EICAR))).toMatch(/EICAR/);
    expect(escaneoBasico(Buffer.from('%PDF-1.4\n<< /S /JavaScript /JS (app.alert(1)) >>'))).toMatch(/PDF/);
    expect(escaneoBasico(Buffer.from('PK\x03\x04....word/vbaProject.bin'))).toMatch(/macros/);
    expect(escaneoBasico(Buffer.from('PK\x03\x04....instalador.exePK\x01\x02'))).toMatch(/ejecutables/);
  });
  it('un ZIP de imágenes pasa', () => {
    expect(escaneoBasico(Buffer.from('PK\x03\x04....logo.pngPK\x01\x02....banner.jpgPK\x05\x06'))).toBeNull();
  });
});
