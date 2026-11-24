import { isAbsolute, resolve, sep } from 'node:path';

const REQUIRED = ['DATABASE_URL', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'] as const;
const REQUIRED_IN_PRODUCTION = ['SWAGGER_USER', 'SWAGGER_PASSWORD'] as const;

/** ¿`dir` es `base` o está dentro de ella? */
const dentro = (dir: string, base: string) => (resolve(dir) + sep).startsWith(resolve(base) + sep);

/**
 * Almacén privado (recursos de socios y evidencias): nunca dentro de la carpeta pública (no arranca) y, en producción,
 * en una ruta absoluta fuera de la app, porque el despliegue borra esta carpeta (solo avisa, no tumba la API).
 */
export function revisarAlmacenPrivado(): string | null {
  const dir = process.env.UPLOADS_PRIVADO_DIR || 'uploads-privado';
  if (dentro(dir, process.env.UPLOADS_DIR || 'uploads')) throw new Error('UPLOADS_PRIVADO_DIR está dentro de UPLOADS_DIR: los archivos privados quedarían públicos en /uploads.');
  if (process.env.NODE_ENV !== 'production' || (isAbsolute(dir) && !dentro(dir, process.cwd()))) return null;
  return 'Los archivos privados se perderán en el próximo despliegue: pon en UPLOADS_PRIVADO_DIR una ruta absoluta fuera de la carpeta de la API.';
}

/**
 * Fails fast at boot instead of letting the app start with an empty or
 * still-placeholder secret (e.g. the "change-me-..." values from
 * .env.example, which are public since that file is committed).
 */
export function assertRequiredEnv(): void {
  const keys: readonly string[] =
    process.env.NODE_ENV === 'production' ? [...REQUIRED, ...REQUIRED_IN_PRODUCTION] : REQUIRED;

  const missing = keys.filter((key) => {
    const value = process.env[key];
    return !value || value.startsWith('change-me');
  });

  if (missing.length > 0) {
    throw new Error(
      `Faltan variables de entorno (o siguen con el valor de ejemplo): ${missing.join(', ')}. Revisa .env.`,
    );
  }

  const aviso = revisarAlmacenPrivado();
  if (aviso) console.warn(aviso);
}
