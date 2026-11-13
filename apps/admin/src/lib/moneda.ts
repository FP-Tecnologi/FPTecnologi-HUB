/** Formato único de dinero: miles con coma y siempre 2 decimales (1,234.50). */
export const numeroMoneda = (n: number | string | null | undefined): string =>
  Number(n ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const SIMBOLOS: Record<string, string> = { PEN: 'S/', USD: 'US$', EUR: '€' };

/** `S/ 1,234.50`, `US$ 99.00`. Acepta el código de moneda (PEN/USD) o el símbolo ya listo. */
export const moneda = (n: number | string | null | undefined, cod = 'PEN'): string =>
  `${SIMBOLOS[cod] ?? cod} ${numeroMoneda(n)}`;
