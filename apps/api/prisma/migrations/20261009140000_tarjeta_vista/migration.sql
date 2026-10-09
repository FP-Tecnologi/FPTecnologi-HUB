-- Diseño de la página de la tarjeta: perfil completo o estilo Linktree. Aditivo e idempotente.
ALTER TABLE "TarjetaDigital" ADD COLUMN IF NOT EXISTS "vista" TEXT NOT NULL DEFAULT 'perfil';
