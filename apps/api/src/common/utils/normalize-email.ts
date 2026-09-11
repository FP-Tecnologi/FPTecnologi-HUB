/**
 * Normaliza un email para compararlo/guardarlo: sin espacios alrededor y en
 * minúsculas. Los emails son case-insensitive por estándar (RFC 5321,
 * dominio siempre; parte local casi siempre) y PostgreSQL compara texto
 * byte por byte — sin esto, `Dev@x.com` y `dev@x.com` serían dos cuentas
 * distintas y el login fallaría según cómo se haya tecleado.
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
