-- Base de conocimiento del asistente: documentos troceados con búsqueda de texto completo (GIN). Idempotente.
DO $$ BEGIN CREATE TYPE "OrigenConocimiento" AS ENUM ('DOCUMENTO', 'MANUAL'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "ConocimientoDocumento" (
    "id" TEXT NOT NULL,
    "marcaId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "tamano" INTEGER NOT NULL,
    "fragmentos" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "subidoPor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ConocimientoDocumento_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ConocimientoFragmento" (
    "id" TEXT NOT NULL,
    "marcaId" TEXT NOT NULL,
    "documentoId" TEXT,
    "origen" "OrigenConocimiento" NOT NULL DEFAULT 'DOCUMENTO',
    "titulo" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "indice" TEXT NOT NULL,
    "busqueda" tsvector GENERATED ALWAYS AS (to_tsvector('spanish', "indice")) STORED,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ConocimientoFragmento_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ConocimientoPendiente" (
    "id" TEXT NOT NULL,
    "marcaId" TEXT NOT NULL,
    "pregunta" TEXT NOT NULL,
    "clave" TEXT NOT NULL,
    "veces" INTEGER NOT NULL DEFAULT 1,
    "resuelta" BOOLEAN NOT NULL DEFAULT false,
    "ultimaVez" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ConocimientoPendiente_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ConocimientoDocumento_marcaId_createdAt_idx" ON "ConocimientoDocumento"("marcaId", "createdAt");
CREATE INDEX IF NOT EXISTS "ConocimientoFragmento_marcaId_activo_origen_idx" ON "ConocimientoFragmento"("marcaId", "activo", "origen");
CREATE INDEX IF NOT EXISTS "ConocimientoFragmento_documentoId_idx" ON "ConocimientoFragmento"("documentoId");
CREATE INDEX IF NOT EXISTS "ConocimientoFragmento_busqueda_idx" ON "ConocimientoFragmento" USING GIN ("busqueda");
CREATE UNIQUE INDEX IF NOT EXISTS "ConocimientoPendiente_marcaId_clave_key" ON "ConocimientoPendiente"("marcaId", "clave");
CREATE INDEX IF NOT EXISTS "ConocimientoPendiente_marcaId_resuelta_veces_idx" ON "ConocimientoPendiente"("marcaId", "resuelta", "veces");

DO $$ BEGIN ALTER TABLE "ConocimientoDocumento" ADD CONSTRAINT "ConocimientoDocumento_marcaId_fkey" FOREIGN KEY ("marcaId") REFERENCES "Marca"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "ConocimientoFragmento" ADD CONSTRAINT "ConocimientoFragmento_marcaId_fkey" FOREIGN KEY ("marcaId") REFERENCES "Marca"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "ConocimientoFragmento" ADD CONSTRAINT "ConocimientoFragmento_documentoId_fkey" FOREIGN KEY ("documentoId") REFERENCES "ConocimientoDocumento"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "ConocimientoPendiente" ADD CONSTRAINT "ConocimientoPendiente_marcaId_fkey" FOREIGN KEY ("marcaId") REFERENCES "Marca"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
