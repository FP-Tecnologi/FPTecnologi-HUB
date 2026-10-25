import { describe, expect, it } from 'vitest';
import { diaLima, dispositivoDe, esBot, inicioDiaLima, origenDe, rutaLimpia, visitanteDe } from './visitas.util.js';

const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148';
const ANDROID_TAB = 'Mozilla/5.0 (Linux; Android 13; SM-X200) AppleWebKit/537.36 Chrome/120 Safari/537.36';
const PC = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36';

describe('visitas.util', () => {
  it('reconoce bots y dispositivos', () => {
    expect(esBot('Googlebot/2.1')).toBe(true);
    expect(esBot('facebookexternalhit/1.1')).toBe(true);
    expect(esBot('')).toBe(true);
    expect(esBot(PC)).toBe(false);
    expect(dispositivoDe(IPHONE)).toBe('movil');
    expect(dispositivoDe(ANDROID_TAB)).toBe('tablet');
    expect(dispositivoDe(PC)).toBe('escritorio');
  });

  it('limpia la ruta y descarta internas o archivos', () => {
    expect(rutaLimpia('/tienda/?q=x#a')).toBe('/tienda');
    expect(rutaLimpia('/')).toBe('/');
    expect(rutaLimpia('/api/hub/visita')).toBeNull();
    expect(rutaLimpia('/_next/static/a.js')).toBeNull();
    expect(rutaLimpia('/logo.png')).toBeNull();
    expect(rutaLimpia('https://otra.com/')).toBeNull();
    expect(rutaLimpia('//otra.com')).toBeNull();
  });

  it('clasifica el origen', () => {
    expect(origenDe('', 'fimavperu.com')).toBe('directo');
    expect(origenDe('https://www.google.com.pe/', 'fimavperu.com')).toBe('google');
    expect(origenDe('https://l.facebook.com/l.php', 'fimavperu.com')).toBe('facebook');
    expect(origenDe('https://wa.me/', 'x.com')).toBe('whatsapp');
    expect(origenDe('https://fimavperu.com/catalogo', 'www.fimavperu.com')).toBe('interno');
    expect(origenDe('https://www.perucompras.gob.pe/x', 'fimavperu.com')).toBe('perucompras.gob.pe');
    expect(origenDe('https://www.google.com/', 'fimavperu.com', 'IG')).toBe('instagram');
    expect(origenDe('', 'fimavperu.com', 'mailing-octubre')).toBe('mailing-octubre');
  });

  it('visitante anónimo cambia cada día', () => {
    expect(visitanteDe('1.1.1.1', PC, '2026-10-23')).toBe(visitanteDe('1.1.1.1', PC, '2026-10-23'));
    expect(visitanteDe('1.1.1.1', PC, '2026-10-23')).not.toBe(visitanteDe('1.1.1.1', PC, '2026-10-24'));
    expect(visitanteDe('1.1.1.1', PC, '2026-10-23')).not.toContain('1.1.1.1');
  });

  it('días en hora de Lima', () => {
    const ahora = new Date('2026-10-23T03:00:00Z'); // 22 oct, 10 p. m. en Lima
    expect(diaLima(ahora)).toBe('2026-10-22');
    expect(inicioDiaLima(0, ahora).toISOString()).toBe('2026-10-22T05:00:00.000Z');
    expect(inicioDiaLima(6, ahora).toISOString()).toBe('2026-10-16T05:00:00.000Z');
  });
});
