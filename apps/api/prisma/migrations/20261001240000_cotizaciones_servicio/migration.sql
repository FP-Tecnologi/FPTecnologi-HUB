-- Cotizaciones de servicios gestionables desde el dashboard (propuesta, envío por correo/WhatsApp e historial).
-- Aditivo e idempotente.
ALTER TABLE "Cotizacion" ADD COLUMN IF NOT EXISTS "numero" TEXT;
ALTER TABLE "Cotizacion" ADD COLUMN IF NOT EXISTS "clienteEmpresa" TEXT;
ALTER TABLE "Cotizacion" ADD COLUMN IF NOT EXISTS "origen" TEXT;
ALTER TABLE "Cotizacion" ADD COLUMN IF NOT EXISTS "propuesta" TEXT;
ALTER TABLE "Cotizacion" ADD COLUMN IF NOT EXISTS "monto" DECIMAL(65,30);
ALTER TABLE "Cotizacion" ADD COLUMN IF NOT EXISTS "moneda" TEXT NOT NULL DEFAULT 'USD';
ALTER TABLE "Cotizacion" ADD COLUMN IF NOT EXISTS "validezHasta" TIMESTAMP(3);
ALTER TABLE "Cotizacion" ADD COLUMN IF NOT EXISTS "notas" TEXT;
ALTER TABLE "Cotizacion" ADD COLUMN IF NOT EXISTS "atendidoPor" TEXT;
ALTER TABLE "Cotizacion" ADD COLUMN IF NOT EXISTS "enviadaAt" TIMESTAMP(3);

CREATE UNIQUE INDEX IF NOT EXISTS "Cotizacion_marcaId_numero_key" ON "Cotizacion"("marcaId", "numero");
CREATE INDEX IF NOT EXISTS "Cotizacion_marcaId_clienteEmail_idx" ON "Cotizacion"("marcaId", "clienteEmail");

CREATE TABLE IF NOT EXISTS "CotizacionEnvio" (
    "id" TEXT NOT NULL,
    "marcaId" TEXT NOT NULL,
    "cotizacionId" TEXT NOT NULL,
    "canal" TEXT NOT NULL,
    "destinatario" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "enviadoPor" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CotizacionEnvio_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "CotizacionEnvio_marcaId_cotizacionId_idx" ON "CotizacionEnvio"("marcaId", "cotizacionId");

DO $$ BEGIN
  ALTER TABLE "CotizacionEnvio" ADD CONSTRAINT "CotizacionEnvio_marcaId_fkey" FOREIGN KEY ("marcaId") REFERENCES "Marca"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "CotizacionEnvio" ADD CONSTRAINT "CotizacionEnvio_cotizacionId_fkey" FOREIGN KEY ("cotizacionId") REFERENCES "Cotizacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
