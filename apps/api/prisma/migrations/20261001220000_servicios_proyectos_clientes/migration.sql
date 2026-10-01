-- Servicios gestionables desde el dashboard (contenido de la página pública)
-- + Proyectos y Clientes de referencia. Aditivo e idempotente (IF NOT EXISTS)
-- para poder aplicarlo a mano en Supabase.

ALTER TABLE "Servicio" ADD COLUMN IF NOT EXISTS "slug" TEXT;
ALTER TABLE "Servicio" ADD COLUMN IF NOT EXISTS "etiqueta" TEXT;
ALTER TABLE "Servicio" ADD COLUMN IF NOT EXISTS "icono" TEXT;
ALTER TABLE "Servicio" ADD COLUMN IF NOT EXISTS "imagenUrl" TEXT;
ALTER TABLE "Servicio" ADD COLUMN IF NOT EXISTS "intro" TEXT;
ALTER TABLE "Servicio" ADD COLUMN IF NOT EXISTS "incluye" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Servicio" ADD COLUMN IF NOT EXISTS "beneficios" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "Servicio" ADD COLUMN IF NOT EXISTS "sectores" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Servicio" ADD COLUMN IF NOT EXISTS "faqs" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "Servicio" ADD COLUMN IF NOT EXISTS "orden" INTEGER NOT NULL DEFAULT 0;
CREATE UNIQUE INDEX IF NOT EXISTS "Servicio_marcaId_slug_key" ON "Servicio"("marcaId", "slug");

CREATE TABLE IF NOT EXISTS "Proyecto" (
    "id" TEXT NOT NULL,
    "marcaId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "departamento" TEXT NOT NULL,
    "imagenUrl" TEXT,
    "cliente" TEXT NOT NULL,
    "anio" INTEGER NOT NULL,
    "descripcion" TEXT NOT NULL DEFAULT '',
    "alcance" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "esEjemplo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Proyecto_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Proyecto_marcaId_idx" ON "Proyecto"("marcaId");

CREATE TABLE IF NOT EXISTS "Cliente" (
    "id" TEXT NOT NULL,
    "marcaId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "sigla" TEXT NOT NULL,
    "logoUrl" TEXT,
    "sector" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "esEjemplo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Cliente_marcaId_idx" ON "Cliente"("marcaId");

DO $$ BEGIN
  ALTER TABLE "Proyecto" ADD CONSTRAINT "Proyecto_marcaId_fkey" FOREIGN KEY ("marcaId") REFERENCES "Marca"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "Cliente" ADD CONSTRAINT "Cliente_marcaId_fkey" FOREIGN KEY ("marcaId") REFERENCES "Marca"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
