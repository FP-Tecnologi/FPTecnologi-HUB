-- Envíos por courier: tarifario por departamento + datos de envío en el pedido. Aditivo e idempotente.
ALTER TABLE "Pedido" ADD COLUMN IF NOT EXISTS "envioProveedor" TEXT;
ALTER TABLE "Pedido" ADD COLUMN IF NOT EXISTS "envioDepartamento" TEXT;
ALTER TABLE "Pedido" ADD COLUMN IF NOT EXISTS "envioSede" TEXT;
ALTER TABLE "Pedido" ADD COLUMN IF NOT EXISTS "envioPlazo" TEXT;
ALTER TABLE "Pedido" ADD COLUMN IF NOT EXISTS "trackingCodigo" TEXT;

CREATE TABLE IF NOT EXISTS "TarifaEnvio" (
    "id" TEXT NOT NULL,
    "marcaId" TEXT NOT NULL,
    "proveedor" TEXT NOT NULL DEFAULT 'SHALOM',
    "departamento" TEXT NOT NULL,
    "costo" DECIMAL(65,30) NOT NULL,
    "plazoDias" TEXT,
    "sedes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TarifaEnvio_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "TarifaEnvio_marcaId_proveedor_departamento_key" ON "TarifaEnvio"("marcaId", "proveedor", "departamento");
CREATE INDEX IF NOT EXISTS "TarifaEnvio_marcaId_idx" ON "TarifaEnvio"("marcaId");

DO $$ BEGIN
  ALTER TABLE "TarifaEnvio" ADD CONSTRAINT "TarifaEnvio_marcaId_fkey" FOREIGN KEY ("marcaId") REFERENCES "Marca"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
