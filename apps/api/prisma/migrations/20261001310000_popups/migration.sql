-- Popups de aviso de la web pública. Aditivo e idempotente.
DO $$ BEGIN CREATE TYPE "EstadoPopup" AS ENUM ('BORRADOR', 'ACTIVO', 'PAUSADO'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "Popup" (
    "id" TEXT NOT NULL,
    "marcaId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "plantilla" TEXT NOT NULL,
    "formato" TEXT NOT NULL DEFAULT 'modal',
    "estado" "EstadoPopup" NOT NULL DEFAULT 'BORRADOR',
    "contenido" JSONB NOT NULL,
    "productoId" TEXT,
    "prioridad" INTEGER NOT NULL DEFAULT 0,
    "disparador" TEXT NOT NULL DEFAULT 'retraso',
    "disparadorValor" INTEGER NOT NULL DEFAULT 5,
    "frecuencia" TEXT NOT NULL DEFAULT 'sesion',
    "frecuenciaValor" INTEGER NOT NULL DEFAULT 1,
    "paginas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "dispositivo" TEXT NOT NULL DEFAULT 'todos',
    "inicio" TIMESTAMP(3),
    "fin" TIMESTAMP(3),
    "vistas" INTEGER NOT NULL DEFAULT 0,
    "clics" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Popup_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Popup_marcaId_estado_idx" ON "Popup"("marcaId", "estado");

DO $$ BEGIN ALTER TABLE "Popup" ADD CONSTRAINT "Popup_marcaId_fkey" FOREIGN KEY ("marcaId") REFERENCES "Marca"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
