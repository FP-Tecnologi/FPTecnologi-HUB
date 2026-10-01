-- Códigos de un solo uso para el acceso sin contraseña a "Mi cuenta" (web pública). Aditivo e idempotente.
CREATE TABLE IF NOT EXISTS "CodigoCuenta" (
    "id" TEXT NOT NULL,
    "marcaId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "codigoHash" TEXT NOT NULL,
    "intentos" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CodigoCuenta_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "CodigoCuenta_marcaId_email_createdAt_idx" ON "CodigoCuenta"("marcaId", "email", "createdAt");

DO $$ BEGIN
  ALTER TABLE "CodigoCuenta" ADD CONSTRAINT "CodigoCuenta_marcaId_fkey" FOREIGN KEY ("marcaId") REFERENCES "Marca"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
