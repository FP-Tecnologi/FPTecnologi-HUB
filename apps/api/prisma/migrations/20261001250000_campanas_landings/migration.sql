-- Campañas y landing pages con formulario editable. Aditivo e idempotente.
DO $$ BEGIN CREATE TYPE "EstadoCampana" AS ENUM ('BORRADOR', 'ACTIVA', 'FINALIZADA'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "EstadoLanding" AS ENUM ('BORRADOR', 'PUBLICADA'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "Campana" (
    "id" TEXT NOT NULL,
    "marcaId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "objetivo" TEXT,
    "estado" "EstadoCampana" NOT NULL DEFAULT 'BORRADOR',
    "inicio" TIMESTAMP(3),
    "fin" TIMESTAMP(3),
    "presupuesto" DECIMAL(65,30),
    "moneda" TEXT NOT NULL DEFAULT 'PEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Campana_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Landing" (
    "id" TEXT NOT NULL,
    "marcaId" TEXT NOT NULL,
    "campanaId" TEXT,
    "slug" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "plantilla" TEXT NOT NULL,
    "estado" "EstadoLanding" NOT NULL DEFAULT 'BORRADOR',
    "contenido" JSONB NOT NULL,
    "formulario" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Landing_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "LandingRegistro" (
    "id" TEXT NOT NULL,
    "marcaId" TEXT NOT NULL,
    "landingId" TEXT NOT NULL,
    "datos" JSONB NOT NULL,
    "nombre" TEXT,
    "email" TEXT,
    "celular" TEXT,
    "origen" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LandingRegistro_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Campana_marcaId_estado_idx" ON "Campana"("marcaId", "estado");
CREATE UNIQUE INDEX IF NOT EXISTS "Landing_marcaId_slug_key" ON "Landing"("marcaId", "slug");
CREATE INDEX IF NOT EXISTS "Landing_marcaId_estado_idx" ON "Landing"("marcaId", "estado");
CREATE INDEX IF NOT EXISTS "LandingRegistro_marcaId_landingId_createdAt_idx" ON "LandingRegistro"("marcaId", "landingId", "createdAt");

DO $$ BEGIN ALTER TABLE "Campana" ADD CONSTRAINT "Campana_marcaId_fkey" FOREIGN KEY ("marcaId") REFERENCES "Marca"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "Landing" ADD CONSTRAINT "Landing_marcaId_fkey" FOREIGN KEY ("marcaId") REFERENCES "Marca"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "Landing" ADD CONSTRAINT "Landing_campanaId_fkey" FOREIGN KEY ("campanaId") REFERENCES "Campana"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "LandingRegistro" ADD CONSTRAINT "LandingRegistro_marcaId_fkey" FOREIGN KEY ("marcaId") REFERENCES "Marca"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "LandingRegistro" ADD CONSTRAINT "LandingRegistro_landingId_fkey" FOREIGN KEY ("landingId") REFERENCES "Landing"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
