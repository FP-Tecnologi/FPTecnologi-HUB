/*
 * URL de la web pública de una marca, para la vista previa y los textos del CMS. En este orden:
 *   1. La variable de su web (se fija al compilar el dashboard): FPTecnologi NEXT_PUBLIC_WEB_PUBLICA_URL,
 *      Fimav NEXT_PUBLIC_WEB_FIMAV_URL, Quamtu NEXT_PUBLIC_WEB_QUAMTU_URL.
 *   2. El dominio principal de la marca (su primer Sitio en Administración → Marcas), con https.
 *   3. Con el dashboard en tu computadora, el puerto local de esa web (ver .claude/launch.json); en el servidor, su
 *      dominio público. Así un dashboard compilado sin la variable no queda apuntando a localhost.
 */
const WEBS: { clave: string; env: string | undefined; local: string; publica: string }[] = [
  { clave: 'fimav', env: process.env.NEXT_PUBLIC_WEB_FIMAV_URL, local: 'http://localhost:3005', publica: 'https://fimavperu.com' },
  { clave: 'quamtu', env: process.env.NEXT_PUBLIC_WEB_QUAMTU_URL, local: 'http://localhost:3004', publica: 'https://quamtu.com' },
];
const FPT = { env: process.env.NEXT_PUBLIC_WEB_PUBLICA_URL, local: 'http://localhost:3002', publica: 'https://fptecnologi.com' };
const enLocal = () => typeof window === 'undefined' || /^(localhost|127\.)/.test(window.location.hostname);

export function webDeMarca(nombre: string | null | undefined, dominio?: string | null): string {
  const n = (nombre ?? '').toLowerCase();
  const w = WEBS.find((x) => n.includes(x.clave)) ?? FPT;
  if (w.env) return w.env.replace(/\/$/, '');
  if (dominio) return `https://${dominio.replace(/^https?:\/\//, '').replace(/\/$/, '')}`;
  return enLocal() ? w.local : w.publica;
}

/** ¿El dashboard corre en un servidor pero la web apunta a localhost? (variable sin definir al compilar). */
export const apuntaALocal = (web: string) =>
  typeof window !== 'undefined' && !/^(localhost|127\.)/.test(window.location.hostname) && /\/\/(localhost|127\.)/.test(web);
