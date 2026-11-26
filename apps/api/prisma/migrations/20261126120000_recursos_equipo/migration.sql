-- Biblioteca interna del equipo (logos, plantillas, documentos): compartida por todas las marcas.
CREATE TABLE IF NOT EXISTS "RecursoEquipo" (
  "id" TEXT NOT NULL,
  "titulo" TEXT NOT NULL,
  "descripcion" TEXT,
  "area" TEXT NOT NULL DEFAULT 'GENERAL',
  "categoria" TEXT NOT NULL DEFAULT 'OTROS',
  "variante" TEXT,
  "marcaRef" TEXT,
  "etiquetas" TEXT[],
  "nombreOriginal" TEXT NOT NULL,
  "ext" TEXT NOT NULL,
  "mime" TEXT NOT NULL,
  "bytes" INTEGER NOT NULL,
  "descargas" INTEGER NOT NULL DEFAULT 0,
  "subidoPorId" TEXT NOT NULL,
  "subidoPorNombre" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "RecursoEquipo_pkey" PRIMARY KEY ("id")
);
CREATE TABLE IF NOT EXISTS "RecursoEquipoArchivo" (
  "recursoId" TEXT NOT NULL,
  "datos" BYTEA NOT NULL,
  CONSTRAINT "RecursoEquipoArchivo_pkey" PRIMARY KEY ("recursoId"),
  CONSTRAINT "RecursoEquipoArchivo_recursoId_fkey" FOREIGN KEY ("recursoId") REFERENCES "RecursoEquipo"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "RecursoEquipo_area_categoria_idx" ON "RecursoEquipo"("area", "categoria");
CREATE INDEX IF NOT EXISTS "RecursoEquipo_marcaRef_idx" ON "RecursoEquipo"("marcaRef");
CREATE INDEX IF NOT EXISTS "RecursoEquipo_subidoPorId_idx" ON "RecursoEquipo"("subidoPorId");
-- Sin políticas: solo la API (dueña de las tablas) accede; la API pública de Supabase no.
ALTER TABLE "RecursoEquipo" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RecursoEquipoArchivo" ENABLE ROW LEVEL SECURITY;
