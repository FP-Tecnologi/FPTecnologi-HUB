const REQUIRED = ['DATABASE_URL', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'] as const;

/**
 * Fails fast at boot instead of letting the app start with an empty or
 * still-placeholder secret (e.g. the "change-me-..." values from
 * .env.example, which are public since that file is committed).
 */
export function assertRequiredEnv(): void {
  const missing = REQUIRED.filter((key) => {
    const value = process.env[key];
    return !value || value.startsWith('change-me');
  });

  if (missing.length > 0) {
    throw new Error(
      `Faltan variables de entorno (o siguen con el valor de ejemplo): ${missing.join(', ')}. Revisa .env.`,
    );
  }
}
