-- Estilo visual de la tarjeta digital. Aditivo e idempotente.
ALTER TABLE "TarjetaDigital" ADD COLUMN IF NOT EXISTS "estilo" TEXT NOT NULL DEFAULT 'clasico';
